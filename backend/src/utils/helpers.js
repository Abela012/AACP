const crypto = require('crypto');

const generateRandomString = (length = 32) => {
    return crypto.randomBytes(length).toString('hex');
};

const formatDate = (date) => {
    return new Date(date).toISOString();
};

module.exports = {
    generateRandomString,
    formatDate,
};
