from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from database.connection import get_db
from models.schemas import Consultation, ClinicalNote, RiskAlert
from services.whisper_service import save_and_transcribe, _mock_transcription
from services.nlp_service import extract_medical_entities, detect_risk_alerts
from services.note_generator import generate_soap_note
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/api/consultations", tags=["consultations"])


class ConsultationCreate(BaseModel):
    patient_name: Optional[str] = "Anonymous Patient"
    patient_age: Optional[int] = None
    patient_gender: Optional[str] = None


class TextInput(BaseModel):
    text: str
    patient_name: Optional[str] = "Anonymous Patient"
    patient_age: Optional[int] = None
    patient_gender: Optional[str] = None


@router.post("/")
async def create_consultation(data: ConsultationCreate, db: Session = Depends(get_db)):
    consultation = Consultation(
        patient_name=data.patient_name,
        patient_age=data.patient_age,
        patient_gender=data.patient_gender,
        status="in_progress"
    )
    db.add(consultation)
    db.commit()
    db.refresh(consultation)
    return {"id": consultation.id, "status": consultation.status}


@router.post("/upload-audio")
async def upload_audio(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """Upload audio file and transcribe it."""
    file_path, transcript = await save_and_transcribe(file)

    consultation = Consultation(
        audio_file_path=file_path,
        transcript=transcript,
        status="transcribed"
    )
    db.add(consultation)
    db.commit()
    db.refresh(consultation)

    return {
        "id": consultation.id,
        "transcript": transcript,
        "status": "transcribed"
    }


@router.post("/process-text")
async def process_text(data: TextInput, db: Session = Depends(get_db)):
    """Process text input directly (bypass audio)."""
    consultation = Consultation(
        patient_name=data.patient_name,
        patient_age=data.patient_age,
        patient_gender=data.patient_gender,
        transcript=data.text,
        status="transcribed"
    )
    db.add(consultation)
    db.commit()
    db.refresh(consultation)

    # Extract entities
    entities = extract_medical_entities(data.text)

    # Generate SOAP note
    soap = generate_soap_note(data.text, entities)

    # Save clinical note
    note = ClinicalNote(
        consultation_id=consultation.id,
        subjective=soap["subjective"],
        objective=soap["objective"],
        assessment=soap["assessment"],
        plan=soap["plan"],
        extracted_symptoms=entities["symptoms"],
        extracted_diseases=entities["diseases"],
        extracted_medications=entities["medications"]
    )
    db.add(note)

    # Detect and save risk alerts
    alerts = detect_risk_alerts(data.text, entities)
    for alert_data in alerts:
        alert = RiskAlert(
            consultation_id=consultation.id,
            **alert_data
        )
        db.add(alert)

    consultation.status = "completed"
    db.commit()
    db.refresh(note)

    return {
        "consultation_id": consultation.id,
        "note_id": note.id,
        "soap_note": soap,
        "entities": entities,
        "risk_alerts": alerts,
        "status": "completed"
    }


@router.post("/demo")
async def demo_consultation(db: Session = Depends(get_db)):
    """Create a demo consultation with mock data."""
    transcript = _mock_transcription()

    consultation = Consultation(
        patient_name="John Smith",
        patient_age=45,
        patient_gender="Male",
        transcript=transcript,
        status="transcribed"
    )
    db.add(consultation)
    db.commit()
    db.refresh(consultation)

    entities = extract_medical_entities(transcript)
    soap = generate_soap_note(transcript, entities)

    note = ClinicalNote(
        consultation_id=consultation.id,
        subjective=soap["subjective"],
        objective=soap["objective"],
        assessment=soap["assessment"],
        plan=soap["plan"],
        extracted_symptoms=entities["symptoms"],
        extracted_diseases=entities["diseases"],
        extracted_medications=entities["medications"]
    )
    db.add(note)

    alerts = detect_risk_alerts(transcript, entities)
    for alert_data in alerts:
        alert = RiskAlert(consultation_id=consultation.id, **alert_data)
        db.add(alert)

    consultation.status = "completed"
    db.commit()
    db.refresh(note)

    return {
        "consultation_id": consultation.id,
        "note_id": note.id,
        "transcript": transcript,
        "soap_note": soap,
        "entities": entities,
        "risk_alerts": alerts
    }


@router.get("/")
def list_consultations(db: Session = Depends(get_db)):
    consultations = db.query(Consultation).order_by(Consultation.created_at.desc()).all()
    return [{
        "id": c.id,
        "patient_name": c.patient_name,
        "patient_age": c.patient_age,
        "patient_gender": c.patient_gender,
        "status": c.status,
        "created_at": c.created_at.isoformat() if c.created_at else None
    } for c in consultations]


@router.get("/{consultation_id}")
def get_consultation(consultation_id: int, db: Session = Depends(get_db)):
    consultation = db.query(Consultation).filter(Consultation.id == consultation_id).first()
    if not consultation:
        raise HTTPException(status_code=404, detail="Consultation not found")

    notes = db.query(ClinicalNote).filter(ClinicalNote.consultation_id == consultation_id).all()
    alerts = db.query(RiskAlert).filter(RiskAlert.consultation_id == consultation_id).all()

    return {
        "id": consultation.id,
        "patient_name": consultation.patient_name,
        "patient_age": consultation.patient_age,
        "patient_gender": consultation.patient_gender,
        "transcript": consultation.transcript,
        "status": consultation.status,
        "created_at": consultation.created_at.isoformat() if consultation.created_at else None,
        "notes": [{
            "id": n.id,
            "subjective": n.subjective,
            "objective": n.objective,
            "assessment": n.assessment,
            "plan": n.plan,
            "extracted_symptoms": n.extracted_symptoms,
            "extracted_diseases": n.extracted_diseases,
            "extracted_medications": n.extracted_medications
        } for n in notes],
        "risk_alerts": [{
            "id": a.id,
            "alert_type": a.alert_type,
            "severity": a.severity,
            "title": a.title,
            "description": a.description,
            "recommendation": a.recommendation
        } for a in alerts]
    }
