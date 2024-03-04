import crypto from 'crypto';
import dotenv from 'dotenv/config';

const { MESSAGE_KEY, ENCRYPTION_ALGORITHM } = process.env;

const keyBuffer = Buffer.from(MESSAGE_KEY, 'hex');

export function encrypt(object) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, keyBuffer, iv);

  let encrypted = cipher.update(JSON.stringify(object), 'utf8', 'hex');
  encrypted += cipher.final('hex');

  return { iv: iv.toString('hex'), encryptedMessage: encrypted };
}

export function decrypt(encryptedObject) {
  const decipher = crypto.createDecipheriv(
    ENCRYPTION_ALGORITHM,
    keyBuffer,
    Buffer.from(encryptedObject.iv, 'hex')
  );

  let decrypted = decipher.update(
    encryptedObject.encryptedMessage,
    'hex',
    'utf8'
  );
  decrypted += decipher.final('utf8');

  return JSON.parse(decrypted);
}
