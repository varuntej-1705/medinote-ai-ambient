import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const apiRoutes = {
    // Dashboard
    dashboardStats: '/api/analytics/dashboard',
    symptomFrequency: '/api/analytics/symptom-frequency',
    diseaseDistribution: '/api/analytics/disease-distribution',
    consultationTimeline: '/api/analytics/consultation-timeline',
    patientDemographics: '/api/analytics/patient-demographics',
    riskSummary: '/api/analytics/risk-summary',

    // Consultations
    consultations: '/api/consultations',
    uploadAudio: '/api/consultations/upload-audio',
    processText: '/api/consultations/process-text',
    demoConsultation: '/api/consultations/demo',

    // Notes
    notes: '/api/notes',

    // Risks
    risks: '/api/risks',
};

export default api;
