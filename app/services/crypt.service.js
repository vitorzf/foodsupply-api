const crypto = require('crypto');
const algorithm = 'aes-256-ctr';
const ENCRYPTION_KEY = Buffer.from('nehVDWGFOdzwjUUhz7bi1aGT0OVzLSMGiDplgKh7Ibm', 'base64');
const IV_LENGTH = 16;

module.exports = {
    encrypt : (text) => {
        let iv = crypto.randomBytes(IV_LENGTH);
        let cipher = crypto.createCipheriv(algorithm, Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
        let encrypted = cipher.update(text);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return iv.toString('hex') + '-' + encrypted.toString('hex');
    },

    decrypt : (text) => {
        let textParts = text.split('-');
        let iv = Buffer.from(textParts.shift(), 'hex');
        let encryptedText = Buffer.from(textParts.join('-'), 'hex');
        let decipher = crypto.createDecipheriv(algorithm, Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    }
}