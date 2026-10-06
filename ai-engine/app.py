import os
import io
import requests

from flask import Flask, request, jsonify
from PIL import Image, ImageStat, ImageFilter

import PyPDF2
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


app = Flask(__name__)


# =========================================================
# 1. HELPER: DOWNLOAD FILE FROM CLOUDINARY
# =========================================================

def download_file(url):
    """
    Downloads a file from Cloudinary and returns its bytes.
    """

    if not url:
        raise ValueError("File URL is missing")

    print(f"Downloading file from: {url}")

    response = requests.get(
        url,
        timeout=30,
        allow_redirects=True
    )

    print("HTTP status:", response.status_code)
    print("Content-Type:", response.headers.get("Content-Type"))

    response.raise_for_status()

    return response.content


# =========================================================
# 2. NLP: EXTRACT TEXT FROM PDF
# =========================================================

def extract_text_from_bytes(file_bytes):

    try:

        # Check PDF signature
        if not file_bytes.startswith(b"%PDF-"):

            print("ERROR: File is not a valid PDF")

            return None

        reader = PyPDF2.PdfReader(
            io.BytesIO(file_bytes)
        )

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

    try:

        data = request.json

        gov_doc_url = data.get("gov_doc_url")
        bid_doc_url = data.get("bid_doc_url")

        print("Government document URL:", gov_doc_url)
        print("Bid document URL:", bid_doc_url)

        # Download PDFs
        gov_bytes = download_file(gov_doc_url)
        bid_bytes = download_file(bid_doc_url)

        # Extract text
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

        # TF-IDF comparison
        documents = [
            gov_text,
            bid_text
        ]

        vectorizer = TfidfVectorizer()

        tfidf_matrix = vectorizer.fit_transform(
            documents
        )

        similarity = cosine_similarity(
            tfidf_matrix[0:1],
            tfidf_matrix[1:2]
        )[0][0]

        score = round(
            similarity * 100,
            2
        )

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
# 4. IMAGE QUALITY ANALYSIS
# =========================================================

def analyze_image_quality(image_bytes):

    """
    Lightweight image-quality analysis.

    This does NOT claim that the construction work itself
    is good or bad.

    It checks whether the uploaded proof image is suitable
    for human/admin review.
    """

    try:

        # Open image directly from memory
        img = Image.open(
            io.BytesIO(image_bytes)
        )

        # Convert to RGB
        img = img.convert("RGB")

        width, height = img.size

        print(
            f"Image dimensions: {width} x {height}"
        )

        # -------------------------------------------------
        # Resolution check
        # -------------------------------------------------

        min_width = 300
        min_height = 300

        resolution_score = 100

        if width < min_width or height < min_height:

            resolution_score = 30

        elif width < 600 or height < 600:

            resolution_score = 60

        else:

            resolution_score = 100

        # -------------------------------------------------
        # Brightness check
        # -------------------------------------------------

        grayscale = img.convert("L")

        brightness = ImageStat.Stat(
            grayscale
        ).mean[0]

        print(
            f"Brightness: {round(brightness, 2)}"
        )

        if brightness < 35:

            brightness_score = 20

        elif brightness < 60:

            brightness_score = 60

        elif brightness > 240:

            brightness_score = 40

        elif brightness > 220:

            brightness_score = 70

        else:

            brightness_score = 100

        # -------------------------------------------------
        # Blur / sharpness check
        # -------------------------------------------------

        edges = grayscale.filter(
            ImageFilter.FIND_EDGES
        )

        edge_stat = ImageStat.Stat(
            edges
        )

        sharpness = edge_stat.var[0]

        print(
            f"Sharpness score: {round(sharpness, 2)}"
        )

        if sharpness < 20:

            sharpness_score = 30

        elif sharpness < 80:

            sharpness_score = 60

        else:

            sharpness_score = 100

        # -------------------------------------------------
        # Final image-quality score
        # -------------------------------------------------

        quality_score = round(
            (
                resolution_score * 0.4
                +
                brightness_score * 0.3
                +
                sharpness_score * 0.3
            ),
            2
        )

        # -------------------------------------------------
        # Determine recommendation
        # -------------------------------------------------

        if quality_score >= 75:

            recommendation = "Review Required"

            image_status = "Good Image"

        elif quality_score >= 50:

            recommendation = "Review Required"

            image_status = "Acceptable Image"

        else:

            recommendation = "Poor Image - Upload Clearer Proof"

            image_status = "Poor Image"

        return {
            "status": "Success",
            "detected_object": image_status,
            "quality_score": quality_score,
            "recommendation": recommendation,
            "image_width": width,
            "image_height": height,
            "brightness": round(brightness, 2),
            "sharpness": round(sharpness, 2)
        }

    except Exception as e:

        print(
            f"Image analysis error: {type(e).__name__}: {e}"
        )

        raise


# =========================================================
# 5. WORK PROOF IMAGE ANALYSIS
# =========================================================

@app.route("/analyze-work", methods=["POST"])
def analyze_work():

    try:

        data = request.json

        image_url = data.get("image_url")

        if not image_url:

            return jsonify({
                "status": "Error",
                "detected_object": "No Image URL",
                "quality_score": 0,
                "recommendation": "Upload an image"
            }), 400

        print(
            "\n--- 📸 NEW WORK PROOF ANALYSIS ---"
        )

        print(
            f"Image URL: {image_url}"
        )

        # Download Cloudinary image
        image_bytes = download_file(
            image_url
        )

        print(
            f"Downloaded image bytes: {len(image_bytes)}"
        )

        # Analyze image
        result = analyze_image_quality(
            image_bytes
        )

        print(
            f"Image Quality: {result['quality_score']}%"
        )

        print(
            f"Recommendation: {result['recommendation']}"
        )

        return jsonify(result)

    except Exception as e:

        print(
            f"❌ Vision AI Error: {type(e).__name__}: {e}"
        )

        return jsonify({

            "status": "Error",

            "detected_object": "Unreadable",

            "quality_score": 0,

            "recommendation": "Manual Review Required",

            "error": str(e)

        }), 500


# =========================================================
# 6. HEALTH CHECK
# =========================================================

@app.route("/", methods=["GET"])
def health_check():

    return jsonify({

        "status": "AI Engine is running",

        "service": "Government Tender AI Engine"

    })


# =========================================================
# 7. RUN SERVER
# =========================================================

if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=8000,
        debug=True
    )