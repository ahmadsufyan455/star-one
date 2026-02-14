// Request payload for the analyze API
export interface AnalysisRequest {
    appId: string;
    country?: string;
    lang?: string;
}

// App idea structure
export interface AppIdea {
    name: string;
    pain_point: string;
    differentiation: string;
    value_proposition: string;
}

// Review structure
export interface Review {
    userName: string;
    userImage?: string;
    score: number;
    date: string;
    text: string;
}

// AI analysis result from Gemini
export interface AIAnalysisResult {
    top_complaints: string[];
    feature_requests: string[];
    sentiment_summary: string;
    app_ideas: (string | AppIdea)[];
    badReviews: Review[];
}

// App metadata from Google Play
export interface AppInfo {
    appName: string;
    appIcon: string;
    lastUpdated: string;
    installs: string;
    score: number;
    ratings: number;
    price: string;
    free: boolean;
    offersIAP: boolean;
}

// Complete API response
export interface AnalysisResponse extends AppInfo, AIAnalysisResult { }

// Error response
export interface ErrorResponse {
    error: string;
    details?: string;
}
