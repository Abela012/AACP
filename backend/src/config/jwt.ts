import jwt from 'jsonwebtoken';
import env from './env';

export const signToken = (payload: string | object | Buffer): string => {
    return jwt.sign(payload, env.JWT_SECRET as string, { expiresIn: env.JWT_EXPIRES_IN as any });
};

export const verifyToken = (token: string): any => {
    return jwt.verify(token, env.JWT_SECRET as string);
};
