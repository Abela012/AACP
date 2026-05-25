import { getGeminiModel } from '../../config/gemini';
import logger from '../../utils/logger';
import { GeminiRequestOptions, GeminiResult } from './ai.types';

const DEFAULT_OPTIONS: Required<GeminiRequestOptions> = {
    timeoutMs: 15_000,
    maxRetries: 1,
    temperature: 0.7,
};

let circuitBreakerUntil: number | null = null;
let consecutiveFailures = 0;

export const generateJSON = async <T = any>(
    prompt: string,
    fallback: T,
    options?: GeminiRequestOptions
): Promise<GeminiResult<T>> => {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    const startTime = Date.now();

    // Circuit breaker check
    if (circuitBreakerUntil && Date.now() < circuitBreakerUntil) {
        logger.warn(`[GeminiService] Circuit breaker active. Returning fallback immediately.`);
        return { data: fallback, fromCache: false, latencyMs: Date.now() - startTime };
    }

    const model = getGeminiModel();
    if (!model) {
        logger.warn('[GeminiService] Model unavailable (no API key). Returning fallback.');
        return { data: fallback, fromCache: false, latencyMs: Date.now() - startTime };
    }

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
        // AbortController to cleanly cancel timed out fetch requests
        const abortController = new AbortController();
        const timeoutId = setTimeout(() => {
            abortController.abort(new Error('Gemini request timed out'));
        }, opts.timeoutMs);

        try {
            if (attempt > 0) {
                // Jitter: random 0-500ms
                const jitter = Math.random() * 500;
                // Exponential backoff
                const backoffMs = Math.pow(2, attempt) * 500 + jitter;
                logger.info(`[GeminiService] Retry attempt ${attempt} after ${Math.round(backoffMs)}ms`);
                await new Promise((resolve) => setTimeout(resolve, backoffMs));
            }

            const result = await model.generateContent({
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                generationConfig: {
                    responseMimeType: 'application/json',
                    temperature: opts.temperature,
                },
            }, {
                // Not all TS definitions of @google/generative-ai expose this, so we cast to any
                signal: abortController.signal
            } as any);

            clearTimeout(timeoutId);

            const text = result.response.text();
            const parsed: T = JSON.parse(text);
            const latencyMs = Date.now() - startTime;

            consecutiveFailures = 0; // reset on success
            if (circuitBreakerUntil) circuitBreakerUntil = null;

            logger.info(`[GeminiService] Success in ${latencyMs}ms (attempt ${attempt + 1})`);
            return { data: parsed, fromCache: false, latencyMs, tokenEstimate: Math.ceil(prompt.length / 4) };
        } catch (err: any) {
            clearTimeout(timeoutId);
            lastError = err;
            const errMsg = err.message || '';

            if (err instanceof SyntaxError) {
                logger.error(`[GeminiService] JSON parse failure: ${errMsg}`);
                break; // Don't retry on invalid response format
            }
            
            logger.warn(`[GeminiService] Error (attempt ${attempt + 1}): ${errMsg}`);

            // Smart Retry Logic: 429 Quota Exceeded
            if (errMsg.includes('429') || errMsg.includes('Quota exceeded')) {
                const retryDelayMatch = errMsg.match(/retryDelay["\s:]+["']?(\d+)s/);
                if (retryDelayMatch) {
                    const delaySeconds = parseInt(retryDelayMatch[1], 10);
                    logger.warn(`[GeminiService] Quota exceeded. Google requested delay of ${delaySeconds}s. Tripping circuit breaker.`);
                    circuitBreakerUntil = Date.now() + (delaySeconds * 1000);
                    break;
                } else {
                    circuitBreakerUntil = Date.now() + 10_000;
                    break;
                }
            }

            // Smart Retry Logic: 503 High Demand
            if (errMsg.includes('503') || errMsg.includes('high demand') || errMsg.includes('overloaded')) {
                if (attempt === opts.maxRetries) {
                    circuitBreakerUntil = Date.now() + 30_000; // Trip breaker for 30s
                }
            }

            // Smart Retry Logic: Timeout
            if (err.name === 'AbortError' || errMsg.includes('timed out')) {
                if (attempt >= 1) break; // Limit timeout retries to 1 to avoid hanging requests
            }
        }
    }

    consecutiveFailures++;
    if (consecutiveFailures >= 3 && !circuitBreakerUntil) {
        circuitBreakerUntil = Date.now() + 60_000;
        logger.error(`[GeminiService] 3 consecutive failures. Tripping circuit breaker for 60s.`);
    }

    const latencyMs = Date.now() - startTime;
    logger.error(`[GeminiService] All attempts failed after ${latencyMs}ms. Returning fallback.`);
    return { data: fallback, fromCache: false, latencyMs };
};
