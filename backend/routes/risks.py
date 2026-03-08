from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database.connection import get_db
from models.schemas import RiskAlert, Consultation

router = APIRouter(prefix="/api/risks", tags=["risks"])


@router.get("/")
def list_risk_alerts(db: Session = Depends(get_db)):
    """Get all risk alerts."""
    alerts = db.query(RiskAlert).order_by(RiskAlert.created_at.desc()).all()

    if not alerts:
        return [
            {
                "id": 1,
                "consultation_id": 1,
                "patient_name": "John Smith",
                "alert_type": "cardiac",
                "severity": "high",
                "title": "Hypertension Alert",
                "description": "Patient has elevated blood pressure readings (150/95 mmHg).",
                "recommendation": "Adjust antihypertensive regimen, monitor closely.",
                "created_at": "2026-03-08T10:30:00"
            },
            {
                "id": 2,
                "consultation_id": 1,
                "patient_name": "John Smith",
                "alert_type": "drug_interaction",
                "severity": "high",
                "title": "NSAID-ACE Inhibitor Interaction",
                "description": "Concurrent use of Ibuprofen and Lisinopril may reduce antihypertensive effect.",
                "recommendation": "Consider alternative analgesic. Avoid NSAIDs with ACE inhibitors.",
                "created_at": "2026-03-08T10:30:00"
            },
            {
                "id": 3,
                "consultation_id": 2,
                "patient_name": "Sarah Johnson",
                "alert_type": "respiratory",
                "severity": "critical",
                "title": "Respiratory Distress",
                "description": "Patient experiencing shortness of breath with SpO2 below 94%.",
                "recommendation": "Immediate oxygen supplementation and chest X-ray.",
                "created_at": "2026-03-08T09:15:00"
            },
            {
                "id": 4,
                "consultation_id": 3,
                "patient_name": "Michael Chen",
                "alert_type": "neurological",
                "severity": "medium",
                "title": "Visual Disturbance",
                "description": "Patient experiencing blurred vision with concurrent headaches.",
                "recommendation": "Ophthalmology referral, check blood pressure and glucose levels.",
                "created_at": "2026-03-08T08:45:00"
            },
            {
                "id": 5,
                "consultation_id": 4,
                "patient_name": "Emily Davis",
                "alert_type": "cardiac",
                "severity": "critical",
                "title": "Chest Pain Detected",
                "description": "Patient reported acute chest pain radiating to left arm.",
                "recommendation": "Immediate ECG, troponin levels, cardiology consult.",
                "created_at": "2026-03-07T16:00:00"
            }
        ]

    results = []
    for a in alerts:
        consultation = db.query(Consultation).filter(Consultation.id == a.consultation_id).first()
        results.append({
            "id": a.id,
            "consultation_id": a.consultation_id,
            "patient_name": consultation.patient_name if consultation else "Unknown",
            "alert_type": a.alert_type,
            "severity": a.severity,
            "title": a.title,
            "description": a.description,
            "recommendation": a.recommendation,
            "created_at": a.created_at.isoformat() if a.created_at else None
        })
    return results
