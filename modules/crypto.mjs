import { createHmac } from 'node:crypto';

export function generateHash(data) {
    const secret = process.env.SECRET;
    if (!secret) {
        throw new Error('Secret is not defined in environment variables');
    }
    const hash = createHmac('sha256', secret)
                   .update(data)
                   .digest('hex');
    return hash;
}
