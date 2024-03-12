// crypto.mjs
const { createHmac } = await import('node:crypto');

export function generateHash(data, secret) {
    const hash = createHmac('sha256', secret)
                   .update(data)
                   .digest('hex');
    return hash;
}

