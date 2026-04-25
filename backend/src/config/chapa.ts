import env from './env';

const chapaConfig = {
    secretKey: env.CHAPA_SECRET_KEY,
    baseUrl: 'https://api.chapa.co/v1',
};

export default chapaConfig;
