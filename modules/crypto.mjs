// crypto.mjs
const { createHmac } = await import('node:crypto');

export function generateHash(data, secret) {
    const hash = createHmac('sha256', secret)
                   .update(data)
                   .digest('hex');
    return hash;
}

// Usage example
const secret = 'abcdefg';
const hash = generateHash('I love cupcakes', secret);
console.log(hash);
