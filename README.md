# Explainable AI for Diabetic Retinopathy Screening in Rural India
### Smart India Hackathon (SIH 2026) — Problem Statement ID: 26038

An end-to-end clinical telemedicine system designed to screen, grade, and explain diabetic retinopathy (DR) severity from retinal fundus photographs. Powered by a local **MATLAB R2026a Sparse-BagNet** deep learning engine with **Gated Spatial Attention**, bridged via a **FastAPI** microservice, and delivered through a modern **Next.js 16** clinical review dashboard with **Human-in-the-Loop** physician sign-off.

---

## 1. System Architecture

```
                    ┌──────────────────────────────────────────────┐
                    │      Clinician / Primary Health Centre       │
                    │   Fundus Image Upload & Clinical Dashboard   │
                    └──────────────────────┬───────────────────────┘
                                           │
                                    HTTP POST (3000)
                                           ▼
                    ┌──────────────────────────────────────────────┐
                    │       Next.js 16 Telemedicine Dashboard      │
                    │   • 8-Stage Simulated Pipeline Scanning UI   │
                    │   • ICDR 5-Grade Severity Scale & Timeline   │
                    │   • Live MATLAB Evidence Overlay / Canvas    │
                    │   • Doctor Review Console (Approve/Override) │
                    │   • Digital Telemedicine Audit Sign-Off      │
                    └──────────────────────┬───────────────────────┘
                                           │
                                HTTP POST /predict (8000)
                                           ▼
                    ┌──────────────────────────────────────────────┐
                    │            FastAPI Python Backend            │
                    │   • Image Validation & Temp File Handling    │
                    │   • Local MATLAB R2026a Engine Invocation    │
                    │   • Output JSON Parsing & Base64 Encoding    │
                    └──────────────────────┬───────────────────────┘
                                           │
                               subprocess (matlab.exe -batch)
                                           ▼
                    ┌──────────────────────────────────────────────┐
                    │          Local MATLAB R2026a Engine          │
                    │   • Backbone CNN Feature Extraction (ONNX)   │
                    │   • 3,600 Spatial Patch Scoring (1x1 Conv)   │
                    │   • Gated Spatial Attention (Explainability) │
                    │   • Softmax Probabilities (5 DR Grades)      │
                    │   • Jet Colormap Evidence Blending (512x512) │
                    └──────────────────────────────────────────────┘
```

---

## 2. Directory Structure

```
.
├── backend/                             # Python FastAPI Backend
│   ├── main.py                          # FastAPI app (local MATLAB execution & /predict API)
│   ├── run_inference_json.m             # Headless MATLAB runner bridge script
│   ├── requirements.txt                 # Python dependencies (FastAPI, Uvicorn, Multipart)
│   └── venv/                            # Python virtual environment
│
├── DR-Screening-MATLAB-main/            # MATLAB Deep Learning Inference Engine
│   ├── evaluate_dr.m                    # Core inference, gated attention & heatmap synthesis
│   ├── exported_model/                  # Deep learning model artifacts
│   │   ├── backbone.onnx                # Sparse-BagNet ONNX backbone (~62 MB)
│   │   └── model_weights.mat            # Classification & gated attention weights (~32 MB)
│   ├── images/                          # Sample retinal fundus test images (PNG)
│   └── +backbone/                       # Generated MATLAB ONNX package layers
│
├── frontend/                            # Next.js 16 Telemedicine Dashboard
│   ├── src/
│   │   ├── app/                         # Next.js App Router (layout.tsx, page.tsx, globals.css)
│   │   ├── components/                  # Clinical UI Components
│   │   │   ├── UploadZone.tsx           # Drag-and-drop & synthetic patient canvas generator
│   │   │   ├── PipelineLoader.tsx       # 8-stage live pipeline loader & API coordinator
│   │   │   ├── ReportHeader.tsx         # Patient record & diagnosed DR severity card
│   │   │   ├── GradCAMViewer.tsx        # Live evidence overlay & 60x60 thermal canvas viewer
│   │   │   ├── LesionTable.tsx          # Lesion evidence & anatomical structural findings
│   │   │   ├── ClinicalReport.tsx       # ICDR scale stepper & 5-class probability breakdown
│   │   │   ├── DoctorReview.tsx         # Fullscreen physician review & override console
│   │   │   ├── DoctorLoginModal.tsx     # Clinician profile selector & PIN authentication
│   │   │   └── FinalDecision.tsx        # Audit sign-off certificate & case referral receipt
│   │   └── lib/
│   │       ├── api.ts                   # Backend fetch client (POST /predict, GET /health)
│   │       └── mockData.ts              # Report data types, clinical templates & prediction builder
│   ├── .env.local                       # Environment config (NEXT_PUBLIC_API_URL=http://localhost:8000)
│   ├── package.json                     # Frontend dependencies (Next.js 16, React 19, TypeScript)
│   └── pnpm-lock.yaml                   # Locked package dependencies
│
├── docs/                                # Project Presentation & Documentation
│   └── SIH2026 Presentation.pptx        # SIH 2026 submission presentation slide deck
│
└── start_servers.bat                    # One-click Windows launcher for both servers
```

---

## 3. Prerequisites

| Requirement | Version | Purpose |
|---|---|---|
| **Operating System** | Windows 10 / 11 | Required for local MATLAB batch execution |
| **MATLAB** | R2024a or newer (tested with R2026a) | Runs `evaluate_dr.m` Sparse-BagNet model |
| **MATLAB Add-On** | Deep Learning Toolbox Converter for ONNX | Required to import `backbone.onnx` |
| **Python** | 3.10 to 3.12 (tested with 3.12.3) | Runs the FastAPI microservice backend |
| **Node.js** | 20+ (tested with v23) | Runs the Next.js frontend |
| **pnpm** or **npm** | pnpm 10+ / npm 11+ | Package manager for frontend |

---

## 4. How to Run the Project

### Option A: One-Click Launcher (Recommended)
Double-click `start_servers.bat` in the repository root:
- Automatically starts the FastAPI backend on **http://localhost:8000**
- Automatically starts the Next.js clinical dashboard on **http://localhost:3000**

---

### Option B: From Inside VS Code (Terminal)

Open two integrated terminals in VS Code (**Ctrl + `**):

**Terminal 1 — Backend (FastAPI)**:
```powershell
cd backend
.\venv\Scripts\Activate.ps1
uvicorn main:app --port 8000
```

**Terminal 2 — Frontend (Next.js)**:
```powershell
cd frontend
pnpm run dev --port 3000
```

---

## 5. Live Service Endpoints

- **Clinical Review UI**: [http://localhost:3000](http://localhost:3000)
- **FastAPI Backend Root**: [http://localhost:8000](http://localhost:8000)
- **Backend Health Check**: [http://localhost:8000/health](http://localhost:8000/health)
- **Interactive API Docs (Swagger)**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 6. Clinical Telemedicine Workflow

1. **Patient Fundus Scan**:
   - Clinician uploads a retinal photograph (or clicks *"Load Sample Patient Scan"*).
2. **Automated MATLAB Inference**:
   - The image is processed through Sparse-BagNet backbone feature extraction ($60 \times 60 \times 2048$), followed by 1x1 conv classification and Gated Spatial Attention weighting.
   - Outputs: Predicted DR severity grade (0 to 4), probability distribution across all 5 ICDR classes, normalized attention weight matrix, and blended evidence heatmap overlay.
3. **Clinical Explainability**:
   - Clinicians can toggle between the **Blended Retinal Overlay** and the raw **$60 \times 60$ Thermal Spatial Attention Map**.
4. **Human-in-the-Loop Doctor Review**:
   - A qualified clinician reviews the AI findings, retains full legal autonomy to **Approve**, **Override** (reassign grade 0–4), or **Reject** the recommendation.
5. **Electronic Audit Sign-Off**:
   - Generates an immutable telemedicine sign-off receipt with official timestamp, reviewing doctor credentials, case referral tracking code, and print-ready clinical PDF format.

