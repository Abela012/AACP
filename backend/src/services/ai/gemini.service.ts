import { getGeminiModel } from '../../config/gemini';
import logger from '../../utils/logger';
import { GeminiRequestOptions, GeminiResult } from './ai.types';

const DEFAULT_OPTIONS: Required<GeminiRequestOptions> = {
    timeoutMs: 15_000,
    maxRetries: 1,
    temperature: 0.7,
};

export const generateJSON = async <T = any>(
    prompt: string,
    fallback: T,
    options?: GeminiRequestOptions
): Promise<GeminiResult<T>> => {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    const startTime = Date.now();

    const model = getGeminiModel();
    if (!model) {
        logger.warn('[GeminiService] Model unavailable (no API key). Returning fallback.');
        return { data: fallback, fromCache: false, latencyMs: Date.now() - startTime };
    }

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
        try {
            if (attempt > 0) {
                const backoffMs = Math.pow(2, attempt) * 500;
                logger.info(`[GeminiService] Retry attempt ${attempt} after ${backoffMs}ms`);
                await new Promise((resolve) => setTimeout(resolve, backoffMs));
            }

            const callPromise = model.generateContent({
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                generationConfig: {
                    responseMimeType: 'application/json',
                    temperature: opts.temperature,
                },
            });

            const timeoutPromise = new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error('Gemini request timed out')), opts.timeoutMs)
            );

            const result = await Promise.race([callPromise, timeoutPromise]);
            const text = result.response.text();
            const parsed: T = JSON.parse(text);
            const latencyMs = Date.now() - startTime;

            logger.info(`[GeminiService] Success in ${latencyMs}ms (attempt ${attempt + 1})`);
            return { data: parsed, fromCache: false, latencyMs, tokenEstimate: Math.ceil(prompt.length / 4) };
        } catch (err: any) {
            lastError = err;
            if (err instanceof SyntaxError) {
                logger.error(`[GeminiService] JSON parse failure: ${err.message}`);
                break;
            }
            logger.warn(`[GeminiService] Error (attempt ${attempt + 1}): ${err.message}`);
        }
    }

    const latencyMs = Date.now() - startTime;
    logger.error(`[GeminiService] All attempts failed after ${latencyMs}ms. Returning fallback.`);
    return { data: fallback, fromCache: false, latencyMs };
};
