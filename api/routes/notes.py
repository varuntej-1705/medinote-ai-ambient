from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.connection import get_db
from models.schemas import ClinicalNote, Consultation
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/api/notes", tags=["notes"])


class NoteUpdate(BaseModel):
    subjective: Optional[str] = None
    objective: Optional[str] = None
    assessment: Optional[str] = None
    plan: Optional[str] = None


@router.get("/")
def list_notes(db: Session = Depends(get_db)):
    notes = db.query(ClinicalNote).order_by(ClinicalNote.created_at.desc()).all()
    results = []
    for n in notes:
        consultation = db.query(Consultation).filter(Consultation.id == n.consultation_id).first()
        results.append({
            "id": n.id,
            "consultation_id": n.consultation_id,
            "patient_name": consultation.patient_name if consultation else "Unknown",
            "subjective": n.subjective,
            "objective": n.objective,
            "assessment": n.assessment,
            "plan": n.plan,
            "extracted_symptoms": n.extracted_symptoms,
            "extracted_diseases": n.extracted_diseases,
            "extracted_medications": n.extracted_medications,
            "created_at": n.created_at.isoformat() if n.created_at else None
        })
    return results


@router.get("/{note_id}")
def get_note(note_id: int, db: Session = Depends(get_db)):
    note = db.query(ClinicalNote).filter(ClinicalNote.id == note_id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")

    consultation = db.query(Consultation).filter(Consultation.id == note.consultation_id).first()

    return {
        "id": note.id,
        "consultation_id": note.consultation_id,
        "patient_name": consultation.patient_name if consultation else "Unknown",
        "transcript": consultation.transcript if consultation else None,
        "subjective": note.subjective,
        "objective": note.objective,
        "assessment": note.assessment,
        "plan": note.plan,
        "extracted_symptoms": note.extracted_symptoms,
        "extracted_diseases": note.extracted_diseases,
        "extracted_medications": note.extracted_medications,
        "created_at": note.created_at.isoformat() if note.created_at else None
    }


@router.put("/{note_id}")
def update_note(note_id: int, data: NoteUpdate, db: Session = Depends(get_db)):
    note = db.query(ClinicalNote).filter(ClinicalNote.id == note_id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")

    if data.subjective is not None:
        note.subjective = data.subjective
    if data.objective is not None:
        note.objective = data.objective
    if data.assessment is not None:
        note.assessment = data.assessment
    if data.plan is not None:
        note.plan = data.plan

    db.commit()
    db.refresh(note)

    return {"message": "Note updated", "id": note.id}


@router.delete("/{note_id}")
def delete_note(note_id: int, db: Session = Depends(get_db)):
    note = db.query(ClinicalNote).filter(ClinicalNote.id == note_id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")

    db.delete(note)
    db.commit()
    return {"message": "Note deleted"}
