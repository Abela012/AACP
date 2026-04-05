import dotenv from 'dotenv';
dotenv.config();

interface EnvConfig {
    NODE_ENV: string;
    PORT: string | number;
    MONGO_URI: string;
    CHAPA_SECRET_KEY?: string;
    GEMINI_API_KEY?: string;
}

const env: EnvConfig = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: process.env.PORT || 5000,
    MONGO_URI: process.env.MONGO_URI as string,
    CHAPA_SECRET_KEY: process.env.CHAPA_SECRET_KEY,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
};

const requiredEnvVars: (keyof EnvConfig)[] = ['MONGO_URI'];

requiredEnvVars.forEach((key) => {
    if (!env[key]) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
});

export default env;
