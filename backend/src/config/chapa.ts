// Chapa Payment Gateway Config
// Managed by: Backend Developer 1 (Payments module)
const env = require('./env');

const chapaConfig = {
    secretKey: env.CHAPA_SECRET_KEY,
    baseUrl: 'https://api.chapa.co/v1',
};

module.exports = chapaConfig;
