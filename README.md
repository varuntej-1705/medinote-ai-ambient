# MediNote AI – Ambient Clinical Note Generator

## Overview

MediNote AI is a healthcare AI web application that automatically generates structured clinical reports from doctor–patient conversations.
The system listens to or processes a consultation transcript and converts it into a detailed clinical report containing symptoms, possible diagnoses, risk alerts, and treatment suggestions.

The goal of this project is to reduce the time doctors spend writing documentation and provide a structured medical report instantly after a consultation.

---

## AI Tools & Credits

This project was developed with the assistance of several advanced AI tools:
- **ChatGPT (OpenAI)**: Assisted in initial architecture planning and complex problem-solving.
- **Claude (Anthropic)**: Provided deep technical reasoning, code refactoring, and structured medical logic.
- **Antigravity (Google DeepMind)**: The primary agentic assistant used for high-fidelity implementation, visual design, and end-to-end feature synchronization.
- **GitHub Copilot**: Real-time code suggestions and boilerplate generation.
- **OpenAI Whisper**: Used as the core transcription engine for clinical dialogues.

---

## 🛠️ Advanced Technical Information

### 🧠 Medical NLP Pipeline
The backend uses a multi-stage NLP pipeline to process unstructured dialogue:
1. **Entity Extraction**: Recognizes clinical entities (Symptoms, Diseases, Medications) using a pattern-matching engine cross-referenced with medical vocabularies.
2. **Contextual Mapping**: Logic in `note_generator.py` maps these entities into the standardized **SOAP (Subjective, Objective, Assessment, Plan)** format.
3. **Risk Scoring**: Real-time evaluation of entities to identify "Critical Signals" (e.g., matching 'Chest Pain' + 'Shortness of Breath' to high-risk cardiovascular alert).

### 📑 Premium Reporting Engine (jsPDF)
The premium reporting system uses a tiered canvas approach:
- **Multi-Canvas Synthesis**: Individual pages (6+) are generated with dedicated headers, footers, and page-tracking logic.
- **Dynamic Charting**: Visual insights are rendered as vector-based simulations for maximum clarity and small file size.
- **Signature & Verification**: Includes an AI-verified cryptographic hash simulation for clinical audit trails.

### 🌐 Global State & Data Consistency
Local database records are synchronized using a unified schema. This ensures that a patient record created in the **Record** page is immediately reflected in the **Analytics** and **Risk Intelligence** modules.

---

## Problem Statement

Doctors spend a significant amount of time manually writing consultation notes after interacting with patients.
This process is repetitive, time-consuming, and may lead to incomplete documentation.

Hospitals require structured reports that include patient details, symptoms, diagnoses, and recommendations. Creating these reports manually during busy clinical schedules can be inefficient.

---

## Solution

MediNote AI automatically converts doctor–patient conversations into a structured medical report using AI.

The system performs the following tasks:

1. Accepts a consultation conversation (audio or text).
2. Converts speech into text using a speech recognition model.
3. Extracts medical entities such as symptoms, diseases, and medications.
4. Analyzes the conversation to identify possible diagnoses and risks.
5. Generates a structured clinical report containing multiple sections.
6. Displays analytics dashboards showing trends and insights.

---

## Key Features

### Ambient Clinical Documentation
Automatically converts doctor–patient conversations into structured medical notes.

### Symptom Detection
Identifies symptoms mentioned during the consultation.

### Diagnosis Suggestions
Analyzes symptoms and generates possible medical conditions.

### Risk Detection
Detects warning signs such as chest pain or breathing difficulty and highlights them.

### Analytics Dashboard
Displays consultation insights including symptom trends, diagnosis distribution, and patient statistics.

### Clinical Report Generation
Creates a detailed multi-page consultation report including patient information, symptom analysis, and recommendations.

---

## Technology Stack

**Frontend**
- Next.js 15, React 19, TypeScript, TailwindCSS v4
- Framer Motion, Three.js (React Three Fiber)
- Chart libraries (Recharts) for analytics visualization

**Backend**
- Python, FastAPI
- AI models for speech recognition (Whisper) and medical text analysis

**Database**
- SQL database (SQLite/PostgreSQL) used to store patient records and consultations.

---

## 🚀 Deployment & Troubleshooting

### Deployment Targets
- **Frontend**: Optimized for **Vercel** or **Netlify**. Ensure `NEXT_PUBLIC_API_URL` is set to your backend endpoint.
- **Backend**: Optimized for **Render**, **Railway**, or **Heroku**. Use `Gunicorn` with `Uvicorn` workers for production.

### Environment Variables (.env)
| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Backend port | `8000` |
| `DATABASE_URL` | SQLite or PostgreSQL URI | `sqlite:///./medscribe.db` |
| `NLP_MODEL_VERSION` | Version of extraction logic | `v1.2-stable` |

---

## Project Structure

**frontend**
Contains the user interface including dashboard, consultation page, analytics page, and report viewer.

**backend**
Contains the API server responsible for processing audio, generating reports, and managing database operations.

**database**
Stores patient data, consultation transcripts, and generated clinical reports.

**reports**
Generated consultation reports and analysis results.

---
**MediNote AI v1.5** | Developed for Premium Clinical Environments.
