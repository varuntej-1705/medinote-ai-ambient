import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, Float, ForeignKey, JSON
from sqlalchemy.orm import relationship
from database.connection import Base


class Consultation(Base):
    __tablename__ = "consultations"

    id = Column(Integer, primary_key=True, index=True)
    patient_name = Column(String(255), default="Anonymous Patient")
    patient_age = Column(Integer, nullable=True)
    patient_gender = Column(String(20), nullable=True)
    audio_file_path = Column(String(500), nullable=True)
    transcript = Column(Text, nullable=True)
    status = Column(String(50), default="in_progress")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    clinical_notes = relationship("ClinicalNote", back_populates="consultation")
    risk_alerts = relationship("RiskAlert", back_populates="consultation")


class ClinicalNote(Base):
    __tablename__ = "clinical_notes"

    id = Column(Integer, primary_key=True, index=True)
    consultation_id = Column(Integer, ForeignKey("consultations.id"))
    subjective = Column(Text, nullable=True)
    objective = Column(Text, nullable=True)
    assessment = Column(Text, nullable=True)
    plan = Column(Text, nullable=True)
    extracted_symptoms = Column(JSON, nullable=True)
    extracted_diseases = Column(JSON, nullable=True)
    extracted_medications = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    consultation = relationship("Consultation", back_populates="clinical_notes")


class RiskAlert(Base):
    __tablename__ = "risk_alerts"

    id = Column(Integer, primary_key=True, index=True)
    consultation_id = Column(Integer, ForeignKey("consultations.id"))
    alert_type = Column(String(100))
    severity = Column(String(20))  # low, medium, high, critical
    title = Column(String(255))
    description = Column(Text)
    recommendation = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    consultation = relationship("Consultation", back_populates="risk_alerts")
