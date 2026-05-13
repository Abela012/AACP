import { GoogleGenerativeAI } from '@google/generative-ai';
import env from './env';
import logger from '../utils/logger';

/**
 * Gemini AI Configuration
 * Uses Google's Generative AI SDK with the Gemini model.
 */

let genAI: GoogleGenerativeAI | null = null;

if (env.GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    logger.info('[Gemini] AI client initialized');
} else {
    logger.warn('[Gemini] GEMINI_API_KEY not set — AI features will return fallback responses');
}

/**
 * Get the Gemini generative model instance.
 * Returns null if the API key is not configured.
 */
export const getGeminiModel = () => {
    if (!genAI) return null;
    return genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
};

export default genAI;
