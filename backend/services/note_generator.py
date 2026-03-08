import logging
from typing import Dict, List

logger = logging.getLogger(__name__)


def generate_soap_note(transcript: str, entities: Dict) -> Dict[str, str]:
    """Generate a structured SOAP clinical note from transcript and extracted entities."""

    symptoms = entities.get("symptoms", [])
    diseases = entities.get("diseases", [])
    medications = entities.get("medications", [])
    vitals = entities.get("vitals", {})

    # Generate Subjective section
    subjective = _generate_subjective(transcript, symptoms)

    # Generate Objective section
    objective = _generate_objective(vitals, symptoms)

    # Generate Assessment section
    assessment = _generate_assessment(symptoms, diseases)

    # Generate Plan section
    plan = _generate_plan(medications, diseases, symptoms)

    return {
        "subjective": subjective,
        "objective": objective,
        "assessment": assessment,
        "plan": plan
    }


def _generate_subjective(transcript: str, symptoms: List[str]) -> str:
    """Generate the Subjective section of SOAP note."""
    lines = []
    lines.append("Chief Complaint:")

    if symptoms:
        primary = symptoms[0].title()
        lines.append(f"  Patient presents with {primary.lower()} as the primary concern.")
    else:
        lines.append("  Patient presents for evaluation.")

    lines.append("")
    lines.append("History of Present Illness:")

    if symptoms:
        symptom_text = ", ".join([s.title() for s in symptoms])
        lines.append(f"  Patient reports the following symptoms: {symptom_text}.")
    else:
        lines.append("  See transcript for detailed history.")

    # Extract patient statements
    patient_lines = []
    sentences = transcript.split(".")
    for sentence in sentences:
        if "patient:" in sentence.lower() or "i've been" in sentence.lower() or "i have" in sentence.lower():
            cleaned = sentence.strip()
            if cleaned:
                patient_lines.append(cleaned)

    if patient_lines:
        lines.append("")
        lines.append("Patient Reports:")
        for pl in patient_lines[:5]:
            lines.append(f"  - {pl.strip()}")

    return "\n".join(lines)


def _generate_objective(vitals: Dict, symptoms: List[str]) -> str:
    """Generate the Objective section of SOAP note."""
    lines = []
    lines.append("Vital Signs:")

    if vitals.get("blood_pressure"):
        lines.append(f"  Blood Pressure: {vitals['blood_pressure']} mmHg")
    if vitals.get("heart_rate"):
        lines.append(f"  Heart Rate: {vitals['heart_rate']} bpm")
    if vitals.get("temperature"):
        lines.append(f"  Temperature: {vitals['temperature']}°F")

    if not vitals:
        lines.append("  Vitals to be recorded.")

    lines.append("")
    lines.append("Physical Examination:")
    lines.append("  General: Patient appears in no acute distress.")

    if "headache" in [s.lower() for s in symptoms] or "headaches" in [s.lower() for s in symptoms]:
        lines.append("  Neurological: Alert and oriented. Cranial nerves intact.")
    if "chest pain" in [s.lower() for s in symptoms]:
        lines.append("  Cardiovascular: Heart sounds regular, no murmurs detected.")
    if "cough" in [s.lower() for s in symptoms] or "shortness of breath" in [s.lower() for s in symptoms]:
        lines.append("  Respiratory: Lung fields to be assessed. No audible wheezing at rest.")

    return "\n".join(lines)


def _generate_assessment(symptoms: List[str], diseases: List[str]) -> str:
    """Generate the Assessment section of SOAP note."""
    lines = []
    lines.append("Clinical Assessment:")

    if diseases:
        lines.append("")
        lines.append("Identified Conditions:")
        for i, disease in enumerate(diseases, 1):
            lines.append(f"  {i}. {disease.title()}")

    if symptoms:
        lines.append("")
        lines.append("Symptom Analysis:")
        for symptom in symptoms:
            lines.append(f"  - {symptom.title()}: Under evaluation")

    lines.append("")
    lines.append("Differential Diagnosis:")
    if "headache" in [s.lower() for s in symptoms] or "headaches" in [s.lower() for s in symptoms]:
        lines.append("  1. Tension-type headache")
        lines.append("  2. Migraine")
        lines.append("  3. Secondary headache due to hypertension")
    elif "chest pain" in [s.lower() for s in symptoms]:
        lines.append("  1. Angina pectoris")
        lines.append("  2. Musculoskeletal chest pain")
        lines.append("  3. GERD")
    else:
        lines.append("  Pending further evaluation and diagnostic workup.")

    return "\n".join(lines)


def _generate_plan(medications: List[str], diseases: List[str], symptoms: List[str]) -> str:
    """Generate the Plan section of SOAP note."""
    lines = []
    lines.append("Treatment Plan:")

    # Medications
    if medications:
        lines.append("")
        lines.append("Medications:")
        for med in medications:
            lines.append(f"  - Continue/Adjust {med.title()} as clinically indicated")

    # Diagnostics
    lines.append("")
    lines.append("Diagnostic Orders:")
    if any(s in [sym.lower() for sym in symptoms] for s in ["headache", "headaches", "dizziness", "blurred vision"]):
        lines.append("  - Complete Blood Count (CBC)")
        lines.append("  - Comprehensive Metabolic Panel (CMP)")
        lines.append("  - CT scan of the head (if symptoms persist)")
    elif any(s in [sym.lower() for sym in symptoms] for s in ["chest pain"]):
        lines.append("  - ECG / 12-lead EKG")
        lines.append("  - Troponin levels")
        lines.append("  - Chest X-ray")
    else:
        lines.append("  - Routine blood work as indicated")

    # Follow-up
    lines.append("")
    lines.append("Follow-up:")
    lines.append("  - Schedule follow-up appointment in 2 weeks")
    lines.append("  - Patient to monitor symptoms and report any worsening")
    lines.append("  - Return to ER if experiencing severe symptoms")

    # Patient Education
    lines.append("")
    lines.append("Patient Education:")
    lines.append("  - Discussed diagnosis and treatment plan with patient")
    lines.append("  - Medication side effects and compliance reviewed")
    lines.append("  - Lifestyle modification recommendations provided")

    return "\n".join(lines)
