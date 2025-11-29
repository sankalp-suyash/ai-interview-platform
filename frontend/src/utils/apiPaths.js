export const BASE_URL = "http://localhost:5000";
export const API_PATHS = { 
    AUTH: {
        REGISTER: '/api/auth/signup',
        LOGIN: '/api/auth/login',
        LOGOUT: '/api/auth/logout'
    },
    INTERVIEWS: {
        USAGE: '/api/interviews/usage',
        TRACK: '/api/interviews/track',
        COMPLETE: '/api/interviews/:id/complete',
        CODING: '/api/interviews/coding',
        BEHAVIORAL: '/api/interviews/behavioral'
    },
    QUESTIONS: {
        CODING: '/api/questions/coding',
        BEHAVIORAL: '/api/questions/behavioral',
        ALL: '/api/questions',
        POPULATE: '/api/questions/populate',
        GENERATE: '/api/questions/generate'
    },
    DASHBOARD: {
        STATS: '/api/dashboard/stats',
        HISTORY: '/api/dashboard/history'
    }
};