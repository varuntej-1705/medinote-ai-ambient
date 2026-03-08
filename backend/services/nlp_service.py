import re
import logging
from typing import Dict, List

logger = logging.getLogger(__name__)

# Comprehensive medical knowledge base for entity extraction
SYMPTOM_PATTERNS = [
    "headache", "headaches", "migraine", "dizziness", "dizzy", "nausea",
    "vomiting", "fatigue", "fatigued", "fever", "chills", "cough",
    "shortness of breath", "chest pain", "abdominal pain", "back pain",
    "joint pain", "muscle pain", "sore throat", "runny nose", "congestion",
    "blurred vision", "weight loss", "weight gain", "insomnia", "anxiety",
    "depression", "palpitations", "swelling", "rash", "itching",
    "numbness", "tingling", "weakness", "tremor", "seizure",
    "difficulty breathing", "wheezing", "blood in urine", "blood in stool",
    "constipation", "diarrhea", "loss of appetite", "excessive thirst",
    "frequent urination", "night sweats", "memory loss", "confusion",
    "difficulty swallowing", "hoarseness", "ear pain", "hearing loss",
    "balance problems", "light sensitivity", "excessive sweating"
]

DISEASE_PATTERNS = [
    "hypertension", "diabetes", "asthma", "pneumonia", "bronchitis",
    "influenza", "flu", "covid", "migraine", "arthritis", "osteoporosis",
    "anemia", "thyroid", "hypothyroidism", "hyperthyroidism",
    "heart disease", "coronary artery disease", "stroke", "cancer",
    "kidney disease", "liver disease", "copd", "tuberculosis",
    "hepatitis", "malaria", "dengue", "high blood pressure",
    "elevated blood pressure", "high cholesterol", "obesity",
    "sleep apnea", "allergies", "eczema", "psoriasis", "gout",
    "fibromyalgia", "chronic fatigue syndrome", "ibs",
    "irritable bowel syndrome", "crohn's disease", "ulcerative colitis",
    "celiac disease", "multiple sclerosis", "parkinson's disease",
    "alzheimer's disease", "epilepsy", "lupus"
]

MEDICATION_PATTERNS = [
    "aspirin", "ibuprofen", "acetaminophen", "tylenol", "advil",
    "lisinopril", "metformin", "amlodipine", "metoprolol", "losartan",
    "atorvastatin", "omeprazole", "levothyroxine", "albuterol",
    "gabapentin", "prednisone", "amoxicillin", "azithromycin",
    "ciprofloxacin", "doxycycline", "fluoxetine", "sertraline",
    "escitalopram", "duloxetine", "tramadol", "hydrocodone",
    "oxycodone", "morphine", "warfarin", "clopidogrel", "insulin",
    "pantoprazole", "ranitidine", "cetirizine", "loratadine",
    "montelukast", "fluticasone", "benadryl", "nsaids", "naproxen",
    "diazepam", "lorazepam", "alprazolam", "zolpidem"
]

RISK_INDICATORS = {
    "chest pain": {"severity": "critical", "type": "cardiac", "title": "Chest Pain Detected",
                   "description": "Patient reported chest pain which may indicate cardiac issues.",
                   "recommendation": "Immediate cardiac workup recommended. Consider ECG, troponin levels, and cardiology consult."},
    "shortness of breath": {"severity": "high", "type": "respiratory", "title": "Respiratory Distress",
                            "description": "Patient experiencing shortness of breath.",
                            "recommendation": "Assess oxygen saturation, consider chest X-ray and pulmonary function tests."},
    "difficulty breathing": {"severity": "high", "type": "respiratory", "title": "Breathing Difficulty Alert",
                             "description": "Patient reports difficulty breathing.",
                             "recommendation": "Monitor SpO2, consider bronchodilator therapy and imaging."},
    "seizure": {"severity": "critical", "type": "neurological", "title": "Seizure Activity Reported",
                "description": "Patient has experienced seizure activity.",
                "recommendation": "Neurological evaluation, EEG, and anti-seizure medication consideration."},
    "blood in urine": {"severity": "high", "type": "renal", "title": "Hematuria Detected",
                       "description": "Patient reports blood in urine.",
                       "recommendation": "Urinalysis, renal function tests, and urology referral recommended."},
    "blood in stool": {"severity": "high", "type": "gastrointestinal", "title": "GI Bleeding Alert",
                       "description": "Patient reports blood in stool.",
                       "recommendation": "Consider endoscopy, CBC, and GI consultation."},
    "blurred vision": {"severity": "medium", "type": "neurological", "title": "Visual Disturbance",
                       "description": "Patient experiencing blurred vision.",
                       "recommendation": "Ophthalmology referral, check blood pressure and glucose levels."},
    "elevated blood pressure": {"severity": "high", "type": "cardiac", "title": "Hypertension Alert",
                                "description": "Patient has elevated blood pressure readings.",
                                "recommendation": "Review antihypertensive regimen, lifestyle modifications, and follow-up monitoring."},
    "high blood pressure": {"severity": "high", "type": "cardiac", "title": "Hypertension Alert",
                            "description": "Patient has high blood pressure.",
                            "recommendation": "Adjust medications, monitor closely, and assess for end-organ damage."},
    "palpitations": {"severity": "medium", "type": "cardiac", "title": "Cardiac Palpitations",
                     "description": "Patient reports heart palpitations.",
                     "recommendation": "Consider Holter monitor, ECG, and thyroid function tests."},
    "confusion": {"severity": "high", "type": "neurological", "title": "Altered Mental Status",
                  "description": "Patient showing signs of confusion.",
                  "recommendation": "Evaluate for metabolic, infectious, or neurological causes. Consider CT head."},
    "memory loss": {"severity": "medium", "type": "neurological", "title": "Cognitive Decline Noted",
                    "description": "Patient reports memory loss.",
                    "recommendation": "Neurocognitive assessment, B12 levels, thyroid function, and MRI brain."},
}

# Drug interaction database
DRUG_INTERACTIONS = {
    ("ibuprofen", "lisinopril"): {"severity": "high", "title": "NSAID-ACE Inhibitor Interaction",
                                   "description": "Concurrent use of Ibuprofen and Lisinopril may reduce antihypertensive effect and increase risk of kidney injury.",
                                   "recommendation": "Consider alternative analgesic. Avoid NSAIDs with ACE inhibitors when possible."},
    ("nsaids", "lisinopril"): {"severity": "high", "title": "NSAID-ACE Inhibitor Interaction",
                                "description": "NSAIDs can reduce the effectiveness of ACE inhibitors and increase renal risk.",
                                "recommendation": "Use acetaminophen instead of NSAIDs for pain management."},
    ("warfarin", "aspirin"): {"severity": "critical", "title": "Bleeding Risk - Warfarin + Aspirin",
                               "description": "Concurrent use significantly increases bleeding risk.",
                               "recommendation": "Careful monitoring of INR. Consider risk-benefit analysis."},
    ("metformin", "ibuprofen"): {"severity": "medium", "title": "Metformin-NSAID Interaction",
                                  "description": "NSAIDs may affect renal function and alter metformin clearance.",
                                  "recommendation": "Monitor renal function if concurrent use is necessary."},
}


def extract_medical_entities(text: str) -> Dict[str, List[str]]:
    """Extract medical entities from clinical text."""
    text_lower = text.lower()

    symptoms = list(set([s for s in SYMPTOM_PATTERNS if s in text_lower]))
    diseases = list(set([d for d in DISEASE_PATTERNS if d in text_lower]))
    medications = list(set([m for m in MEDICATION_PATTERNS if m in text_lower]))

    # Extract vitals using regex
    vitals = {}
    bp_match = re.search(r'(\d{2,3})/(\d{2,3})', text)
    if bp_match:
        vitals["blood_pressure"] = bp_match.group(0)
        systolic = int(bp_match.group(1))
        if systolic >= 140:
            diseases.append("elevated blood pressure")

    hr_match = re.search(r'heart rate\s*(?:is\s*)?(\d+)', text_lower)
    if hr_match:
        vitals["heart_rate"] = hr_match.group(1)

    temp_match = re.search(r'temperature\s*(?:is\s*)?(?:normal\s*(?:at\s*)?)?(\d+\.?\d*)', text_lower)
    if temp_match:
        vitals["temperature"] = temp_match.group(1)

    return {
        "symptoms": symptoms,
        "diseases": diseases,
        "medications": medications,
        "vitals": vitals
    }


def detect_risk_alerts(text: str, entities: Dict) -> List[Dict]:
    """Detect medical risk alerts from text and entities."""
    alerts = []
    text_lower = text.lower()

    # Check for risk indicators in text
    for indicator, alert_info in RISK_INDICATORS.items():
        if indicator in text_lower:
            alerts.append({
                "alert_type": alert_info["type"],
                "severity": alert_info["severity"],
                "title": alert_info["title"],
                "description": alert_info["description"],
                "recommendation": alert_info["recommendation"]
            })

    # Check for drug interactions
    medications = [m.lower() for m in entities.get("medications", [])]
    for (drug1, drug2), interaction in DRUG_INTERACTIONS.items():
        if drug1 in medications and drug2 in medications:
            alerts.append({
                "alert_type": "drug_interaction",
                "severity": interaction["severity"],
                "title": interaction["title"],
                "description": interaction["description"],
                "recommendation": interaction["recommendation"]
            })
        elif drug1 in text_lower and drug2 in text_lower:
            alerts.append({
                "alert_type": "drug_interaction",
                "severity": interaction["severity"],
                "title": interaction["title"],
                "description": interaction["description"],
                "recommendation": interaction["recommendation"]
            })

    # Deduplicate by title
    seen_titles = set()
    unique_alerts = []
    for alert in alerts:
        if alert["title"] not in seen_titles:
            seen_titles.add(alert["title"])
            unique_alerts.append(alert)

    return unique_alerts
