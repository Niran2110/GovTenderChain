import requests
import tempfile

import io
import requests

from flask import Flask, request, jsonify
import PyPDF2

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# --- COMPUTER VISION ---
from tensorflow.keras.applications.mobilenet_v2 import (
    MobileNetV2,
    preprocess_input,
    decode_predictions
)
from tensorflow.keras.preprocessing import image
import numpy as np


app = Flask(__name__)


# =========================================================
# 1. LOAD AI VISION MODEL
# =========================================================

print("Loading AI Vision Model... (This may take a few seconds)")

try:
    vision_model = MobileNetV2(weights="imagenet")
    print("AI Vision Model Loaded Successfully.")

except Exception as e:
    vision_model = None
    print(f"Could not load Vision Model: {e}")


# =========================================================
# HELPER: DOWNLOAD FILE FROM CLOUDINARY
# =========================================================

def download_file(url):
    """
    Downloads a file from Cloudinary and returns its content.
    """

    if not url:
        raise ValueError("File URL is missing")

    print(f"Downloading file from: {url}")

    response = requests.get(
        url,
        timeout=60,
        allow_redirects=True
    )

    print("HTTP status:", response.status_code)
    print("Content-Type:", response.headers.get("Content-Type"))
    print("Content-Length:", response.headers.get("Content-Length"))
    print("Final URL:", response.url)

    response.raise_for_status()

    file_bytes = response.content

    print("Downloaded bytes:", len(file_bytes))
    print("First 20 bytes:", file_bytes[:20])

    return file_bytes


# =========================================================
# 2. NLP: EXTRACT TEXT FROM PDF
# =========================================================

def extract_text_from_bytes(file_bytes):
    try:
        # Check whether the file is actually a PDF
        if not file_bytes.startswith(b"%PDF-"):
            print("ERROR: File is not a valid PDF")
            print("First bytes:", file_bytes[:50])
            return None

        reader = PyPDF2.PdfReader(io.BytesIO(file_bytes))

        text = ""

        for page in reader.pages:
            page_text = page.extract_text()

            if page_text:
                text += page_text + "\n"

        return text

    except Exception as e:
        print("Error reading PDF:", e)
        return None


# =========================================================
# 3. PDF COMPARISON
# =========================================================

@app.route("/compare-docs", methods=["POST"])
def compare_docs():

    print("\n--- DOCUMENT COMPARISON ---")

    data = request.json

    gov_doc_url = data.get("gov_doc_url")
    bid_doc_url = data.get("bid_doc_url")

    print("Government document URL:", gov_doc_url)
    print("Bid document URL:", bid_doc_url)

    try:
        gov_bytes = download_file(gov_doc_url)
        bid_bytes = download_file(bid_doc_url)

        gov_text = extract_text_from_bytes(gov_bytes)
        bid_text = extract_text_from_bytes(bid_bytes)

        if gov_text is None:
            return jsonify({
                "score": 0,
                "message": "Government document is not a valid PDF"
            }), 400

        if bid_text is None:
            return jsonify({
                "score": 0,
                "message": "Bid document is not a valid PDF"
            }), 400

        if not gov_text.strip() or not bid_text.strip():
            return jsonify({
                "score": 0,
                "message": "Could not extract text from PDF"
            }), 400

        documents = [gov_text, bid_text]

        vectorizer = TfidfVectorizer()
        tfidf_matrix = vectorizer.fit_transform(documents)

        similarity = cosine_similarity(
            tfidf_matrix[0:1],
            tfidf_matrix[1:2]
        )[0][0]

        score = round(similarity * 100, 2)

        print("Similarity Score:", score)

        return jsonify({
            "score": score,
            "message": "Document comparison successful"
        })

    except Exception as e:

        print("Comparison error:", e)

        return jsonify({
            "score": 0,
            "message": str(e)
        }), 500


# =========================================================
# 4. VISION: IMAGE ANALYSIS
# =========================================================

@app.route('/analyze-work', methods=['POST'])
def analyze_work():
    try:
        data = request.json

        image_url = data.get('image_url')

        if not image_url:
            return jsonify({
                "status": "Error",
                "detected_object": "No Image URL",
                "quality_score": 0
            }), 400

        print("\n--- 📸 NEW VISION ANALYSIS ---")
        print(f"Downloading image from: {image_url}")

        # Download Cloudinary image
        response = requests.get(
            image_url,
            timeout=30
        )

        response.raise_for_status()

        # Save temporarily
        with tempfile.NamedTemporaryFile(
            suffix=".jpg",
            delete=False
        ) as temp_file:

            temp_file.write(response.content)
            temp_image_path = temp_file.name

        print(f"Temporary image: {temp_image_path}")

        # Load image
        img = image.load_img(
            temp_image_path,
            target_size=(224, 224)
        )

        img_array = image.img_to_array(img)
        img_array = np.expand_dims(img_array, axis=0)
        img_array = preprocess_input(img_array)

        # AI prediction
        predictions = vision_model.predict(
            img_array,
            verbose=0
        )

        results = decode_predictions(
            predictions,
            top=1
        )[0]

        best_guess = results[0][1]

        confidence = round(
            float(results[0][2]) * 100,
            2
        )

        print(
            f"🤖 AI Saw: {best_guess} "
            f"with {confidence}% confidence"
        )

        # Delete temporary file
        try:
            os.remove(temp_image_path)
        except Exception:
            pass

        return jsonify({
            "status": "Success",
            "detected_object": best_guess.replace(
                '_',
                ' '
            ).title(),
            "quality_score": confidence
        })

    except Exception as e:

        print(
            f"❌ Vision AI Error: {type(e).__name__}: {e}"
        )

        return jsonify({
            "status": "Error",
            "detected_object": "Unreadable",
            "quality_score": 0,
            "error": str(e)
        }), 500


# =========================================================
# 5. HEALTH CHECK
# =========================================================

@app.route("/", methods=["GET"])
def health_check():

    return jsonify({
        "status": "AI Engine is running",
        "service": "Government Tender AI Engine"
    })


# =========================================================
# 6. RUN SERVER
# =========================================================

if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=8000,
        debug=True
    )