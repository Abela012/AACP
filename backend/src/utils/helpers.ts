import crypto from 'crypto';

export const generateRandomString = (length: number = 32): string => {
    return crypto.randomBytes(length).toString('hex');
};

export const formatDate = (date: string | number | Date): string => {
    return new Date(date).toISOString();
};
