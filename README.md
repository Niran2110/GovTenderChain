# GovTenderChain

> AI-assisted and blockchain-enabled public tender management system for transparent, secure, and efficient tender management.

## 📌 Overview

**GovTenderChain** is a full-stack public tender management system that combines the **MERN stack, Artificial Intelligence, Cloudinary, and Ethereum blockchain** to manage the complete tender lifecycle.

The system allows administrators to create and manage tenders, contractors to submit bids, AI to compare tender and bid documents, and blockchain to record tender awards and execute milestone payments on the Ethereum Sepolia test network.

### Main capabilities

- Admin tender creation and management
- Contractor registration and authentication
- Tender document upload
- Contractor bid submission
- AI-assisted technical document comparison
- Contractor eligibility checking
- Financial and technical bid evaluation
- Automated tender deadline processing
- Tender winner selection
- Blockchain recording of awarded tenders
- Milestone management
- Work-proof image upload
- AI-assisted image-quality screening
- Admin milestone verification
- Blockchain-based test payment

> **AI Note:** The current milestone image AI checks the quality and usability of the uploaded proof image. It does not claim to determine actual construction quality. Final milestone approval remains an administrator decision.

---

# 🚀 Features

## 👨‍💼 Admin

Administrators can:

- Create new tenders
- Upload tender documents
- Set tender budget
- Define minimum contractor turnover
- Define minimum experience requirements
- Configure contractor classes
- Create project milestones
- Define milestone payout amounts
- View contractor bids
- Award tenders
- Extend tender deadlines
- Review milestone proof
- Approve milestone payments
- Reject insufficient milestone proof

---

## 👷 Contractor

Contractors can:

- Register their company
- Provide GST and PAN information
- Provide turnover and experience information
- Register a Sepolia wallet address
- View available tenders
- Submit bids
- Upload bid documents
- Track bid status
- View awarded projects
- Upload milestone work proof
- Track milestone status
- Receive blockchain test payments after admin approval

---

# 🤖 Artificial Intelligence

GovTenderChain currently uses AI in two major areas.

## 1. Tender Document Comparison

The AI engine compares the government tender document with a contractor's submitted bid document.

### Workflow

```text
Government Tender PDF
        +
Contractor Bid PDF
        ↓
PDF Text Extraction
        ↓
TF-IDF Vectorization
        ↓
Cosine Similarity
        ↓
Technical Similarity Score
```

The resulting similarity score is used as the technical component of the tender evaluation.

### Technologies

- Python
- Flask
- PyPDF2
- Scikit-learn
- TF-IDF
- Cosine Similarity

---

# 📷 2. Milestone Image Screening

Contractors can upload images as proof of completed milestone work.

The image is stored using Cloudinary and sent to the AI engine.

The current lightweight AI analysis checks:

- Image validity
- Image resolution
- Image brightness
- Image sharpness

### Workflow

```text
Contractor Work Proof
        ↓
Cloudinary
        ↓
AI Engine
        ↓
Resolution Check
        ↓
Brightness Check
        ↓
Sharpness Check
        ↓
Image Quality Score
        ↓
Admin Review
```

### Important

The image quality score does **not** represent construction quality.

For example:

```text
Image Quality: 85%
```

means that the image is suitable for inspection.

It does not mean:

```text
Construction Quality: 85%
```

The final decision remains with the administrator.

---

# ⛓️ Blockchain Integration

GovTenderChain uses an Ethereum smart contract deployed on the **Sepolia test network**.

Blockchain functionality is used for:

- Recording tender winners
- Recording tender ID
- Recording contractor name
- Recording bid amount
- Maintaining blockchain transaction records
- Executing test ETH milestone payments

## Smart Contract

```text
TenderLedger.sol
```

## Network

```text
Ethereum Sepolia
```

## Chain ID

```text
11155111
```

## Contract Address

```text
0x0e60741Ac5b0EBb5e55f2eF0E4E191D9e77F4B7E
```

---

# 💰 Milestone Payment Workflow

The milestone payment workflow is:

```text
Contractor
    ↓
Uploads Work Proof
    ↓
Cloudinary
    ↓
AI Image Screening
    ↓
Milestone Status = Review
    ↓
Admin Reviews Work
    ↓
Admin Clicks Manual Approve
    ↓
Backend Blockchain Wallet
    ↓
Sepolia Transaction
    ↓
Contractor Wallet
    ↓
Transaction Hash Saved
```

### Security Design

AI does **not** directly control payment.

The AI provides analysis to assist the administrator.

The administrator must manually approve the milestone before the blockchain payment is executed.

---

# 🏆 Tender Selection Workflow

When a tender reaches its deadline, the backend scheduler processes the submitted bids.

## Step 1 — Contractor Eligibility

The system checks contractor information such as:

- Contractor class
- Turnover
- Years of experience

## Step 2 — Bid Amount

Bids exceeding the tender's allowed budget are excluded.

## Step 3 — Technical Score

The AI document comparison generates a technical similarity score.

## Step 4 — Composite Score

The current evaluation uses:

```text
70% Financial Score
30% Technical Score
```

The financial score rewards bids below the tender budget.

The technical score comes from the AI-assisted document comparison.

## Step 5 — Winner Selection

The highest eligible composite score is selected.

Bid statuses include:

```text
Pending
Awarded
Rejected
Disqualified
```

## Step 6 — Blockchain Record

The winning tender information is recorded on the Ethereum Sepolia blockchain.

---

# 🏗️ System Architecture

```text
                         ┌──────────────────────┐
                         │      Contractor      │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │   React Frontend     │
                         │       Vercel         │
                         └──────────┬───────────┘
                                    │
                                    │ REST API
                                    ▼
                         ┌──────────────────────┐
                         │ Node.js / Express    │
                         │       Backend        │
                         │       Render         │
                         └──────┬───────┬───────┘
                                │       │
                  ┌─────────────┘       └──────────────┐
                  ▼                                    ▼
         ┌────────────────┐                  ┌─────────────────┐
         │ MongoDB Atlas  │                  │   Cloudinary    │
         │ Application DB │                  │ PDFs / Images   │
         └────────────────┘                  └────────┬────────┘
                                                      │
                                                      ▼
                                             ┌─────────────────┐
                                             │ Python AI Engine│
                                             │ Flask / Render  │
                                             └─────────────────┘


                         ┌──────────────────────┐
                         │ Ethereum Sepolia     │
                         │ TenderLedger.sol     │
                         └──────────────────────┘
```

---

# 🛠️ Technology Stack

## Frontend

- React.js
- React Router
- Axios
- React Hook Form
- Zustand
- Ethers.js
- CSS

## Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcrypt
- Axios
- Multer
- Cloudinary
- node-cron
- Ethers.js

## AI Engine

- Python
- Flask
- PyPDF2
- Scikit-learn
- TF-IDF
- Cosine Similarity
- Pillow
- NumPy
- Requests
- Gunicorn

## Blockchain

- Solidity 0.8.24
- Hardhat
- Hardhat Ignition
- Ethers.js
- Ethereum Sepolia

## Deployment

- GitHub
- Vercel
- Render
- MongoDB Atlas
- Cloudinary

---

# 📁 Project Structure

```text
GovTenderChain/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── store/
│   │   ├── styles/
│   │   ├── api.js
│   │   └── App.js
│   ├── package.json
│   └── .env.example
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
├── ai-engine/
│   ├── app.py
│   ├── requirements.txt
│   └── .env.example
│
└── blockchain/
    ├── contracts/
    │   └── TenderLedger.sol
    ├── ignition/
    │   └── modules/
    ├── hardhat.config.js
    └── package.json
```

---

# ⚙️ Local Installation

## 1. Clone the Repository

```bash
git clone https://github.com/Niran2110/government-tender-management-system.git
cd GovTenderChain
```

> If you have already renamed the GitHub repository, use the new repository URL shown by GitHub.

---

# 💻 Frontend Setup

```bash
cd frontend
npm install
npm start
```

Frontend development server:

```text
http://localhost:3000
```

---

# 🖥️ Backend Setup

```bash
cd backend
npm install
npm start
```

Backend development server:

```text
http://localhost:5000
```

---

# 🤖 AI Engine Setup

```bash
cd ai-engine
pip install -r requirements.txt
python app.py
```

AI Engine:

```text
http://localhost:8000
```

---

# ⛓️ Blockchain Setup

```bash
cd blockchain
npm install
```

Compile the smart contract:

```bash
npx hardhat compile
```

Deploy to Sepolia:

```bash
npx hardhat ignition deploy ignition/modules/DeployLedger.js --network sepolia
```

---

# 🔐 Environment Variables

## Backend

Create:

```text
backend/.env
```

Example:

```env
MONGO_URI=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
AI_ENGINE_URL=
BLOCKCHAIN_RPC_URL=
BLOCKCHAIN_PRIVATE_KEY=
CONTRACT_ADDRESS=
FRONTEND_URL=
JWT_SECRET=
```

---

## Frontend

Create:

```text
frontend/.env
```

Example:

```env
REACT_APP_API_URL=
REACT_APP_CONTRACT_ADDRESS=
REACT_APP_BLOCKCHAIN_RPC_URL=
```

---

## Blockchain

Create:

```text
blockchain/.env
```

Example:

```env
SEPOLIA_RPC_URL=
PRIVATE_KEY=
```

> ⚠️ Never commit real `.env` files, private keys, API secrets, or database credentials to GitHub.

---

# 🔌 API Overview

## User APIs

```text
POST /api/users/register
POST /api/users/login
```

## Tender APIs

```text
GET    /api/tenders
GET    /api/tenders/:id
POST   /api/tenders
DELETE /api/tenders/:id
```

## Bid APIs

```text
GET  /api/tenders/mybids
POST /api/tenders/:id/bids
PUT  /api/tenders/:id/award
```

## Deadline API

```text
PUT /api/tenders/:id/extend
```

## Milestone APIs

```text
POST /api/tenders/:id/milestones/:milestoneId/proof

PUT /api/tenders/:id/milestones/:milestoneId/approve

PUT /api/tenders/:id/milestones/:milestoneId/reject
```

---

# 🤖 AI Engine APIs

## Compare Documents

```text
POST /compare-docs
```

Request:

```json
{
  "gov_doc_url": "CLOUDINARY_URL",
  "bid_doc_url": "CLOUDINARY_URL"
}
```

Response:

```json
{
  "score": 85.42,
  "message": "Document comparison successful"
}
```

---

## Analyze Work Image

```text
POST /analyze-work
```

Request:

```json
{
  "image_url": "CLOUDINARY_IMAGE_URL"
}
```

Example response:

```json
{
  "status": "Success",
  "detected_object": "Good Image",
  "quality_score": 86.5,
  "recommendation": "Review Required"
}
```

---

# 🔒 Security

The following values must remain private:

```text
MongoDB connection string
Cloudinary API secret
JWT secret
Blockchain private key
RPC provider API key
```

Public information such as the following can be shared:

```text
Smart Contract Address
Public Wallet Address
```

---

# ☁️ Deployment

## Frontend

Deployed using:

```text
Vercel
```

Production frontend:

```text
https://govtenderchain-mcn33ry18-nj-b7e9.vercel.app/
```

## Backend

Deployed using:

```text
Render
```

## AI Engine

Deployed using:

```text
Render
```

## Database

```text
MongoDB Atlas
```

## File Storage

```text
Cloudinary
```

## Blockchain

```text
Ethereum Sepolia
```

---

# ⚠️ Current Limitations

## AI Limitations

The current milestone image analyzer evaluates **image quality**, not actual construction quality.

A future construction-specific computer vision model can classify:

```text
Good Construction
Poor Construction
Incomplete Construction
Unsafe/Defective Work
```

## Blockchain Limitations

The current blockchain implementation uses the Ethereum Sepolia test network and therefore uses test ETH rather than real funds.

## AI Payment Limitation

AI does not independently release funds.

The administrator must manually approve a milestone before the backend blockchain wallet executes the test payment.

---

# 🔮 Future Improvements

- Construction-specific computer vision model
- Construction object detection
- OCR-based document verification
- Contractor fraud detection
- Digital signatures
- Multi-level tender approval
- On-chain document hashes
- IPFS document storage
- Advanced audit logs
- Email notifications
- SMS notifications
- Advanced analytics dashboard
- Custom production domain
- Automated security monitoring
- Improved AI-based construction inspection

---

# 📊 Project Status

| Component | Status |
|---|---|
| React Frontend | ✅ |
| Node.js Backend | ✅ |
| MongoDB | ✅ |
| Cloudinary | ✅ |
| AI Document Comparison | ✅ |
| AI Image Screening | ✅ |
| Tender Scheduler | ✅ |
| Tender Awarding | ✅ |
| Blockchain Recording | ✅ |
| Milestone Workflow | ✅ |
| Sepolia Payment | ✅ |
| Production Deployment | ✅ |

---

# 🎯 Complete Workflow

```text
                    GOVERNMENT TENDER
                           │
                           ▼
                  Admin Creates Tender
                           │
                           ▼
                Contractors View Tender
                           │
                           ▼
                    Submit Bid + PDF
                           │
                           ▼
                  AI Document Analysis
                           │
                           ▼
                Technical Similarity Score
                           │
                           ▼
                 Tender Deadline Reached
                           │
                           ▼
                Eligibility + Bid Scoring
                           │
                           ▼
                     Winner Selected
                           │
                           ▼
                  Blockchain Recording
                           │
                           ▼
                    Project Execution
                           │
                           ▼
                 Contractor Uploads Proof
                           │
                           ▼
                 Cloudinary + AI Screening
                           │
                           ▼
                     Admin Review
                           │
                           ▼
                    Manual Approval
                           │
                           ▼
                  Sepolia Blockchain
                           │
                           ▼
                  Contractor Payment
```

---

# 🏆 Why GovTenderChain?

GovTenderChain combines three major technologies:

### AI

Helps analyze tender/bid documents and screen uploaded milestone proof images.

### Blockchain

Provides an immutable record of tender awards and blockchain-based test payments.

### MERN

Provides the complete web application, authentication, tender management, bidding, and dashboard functionality.

---

# 📌 Project Purpose

GovTenderChain demonstrates how:

- Full-stack development
- Artificial intelligence
- Cloud storage
- Blockchain
- Database systems

can be combined to build a transparent public tender management platform.

---

# 👨‍💻 Author

## Niranjan Nivrutti Jagtap

**B.Tech Computer Science & Engineering**

### Project

**GovTenderChain**

> AI-assisted and blockchain-enabled Public Tender Management System

---

# 📄 License

This project is intended for educational, demonstration, and portfolio purposes.
