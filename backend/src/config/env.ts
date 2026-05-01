import dotenv from 'dotenv';
dotenv.config();

interface EnvConfig {
    NODE_ENV: string;
    PORT: string | number;
    MONGO_URI: string;
    CHAPA_SECRET_KEY?: string;
    GEMINI_API_KEY?: string;
    FACEBOOK_APP_ID?: string;
    FACEBOOK_APP_SECRET?: string;
    FACEBOOK_ACCESS_TOKEN?: string;
    ENCRYPTION_SECRET: string;
    CORS_ORIGIN?: string;
}

const env: EnvConfig = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: process.env.PORT || 5000,
    MONGO_URI: process.env.MONGO_URI as string,
    CHAPA_SECRET_KEY: process.env.CHAPA_SECRET_KEY,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    FACEBOOK_APP_ID: process.env.FACEBOOK_APP_ID,
    FACEBOOK_APP_SECRET: process.env.FACEBOOK_APP_SECRET,
    FACEBOOK_ACCESS_TOKEN: process.env.FACEBOOK_ACCESS_TOKEN,
    ENCRYPTION_SECRET: process.env.ENCRYPTION_SECRET as string,
    CORS_ORIGIN: process.env.CORS_ORIGIN,
};

const requiredEnvVars: (keyof EnvConfig)[] = ['MONGO_URI', 'ENCRYPTION_SECRET'];

requiredEnvVars.forEach((key) => {
    if (!env[key]) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
});

export default env;
