'use strict';

const { randomBytes, scrypt: scryptCallback, timingSafeEqual } = require('crypto');
const { promisify } = require('util');

const scrypt = promisify(scryptCallback);
const KEY_LENGTH = 64;
const SCRYPT_N = 32768;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const SCRYPT_OPTIONS = { N: SCRYPT_N, r: SCRYPT_R, p: SCRYPT_P, maxmem: 64 * 1024 * 1024 };

async function deriveKey(password, salt) {
  return scrypt(password, salt, KEY_LENGTH, SCRYPT_OPTIONS);
}

async function hashPassword(password) {
  const salt = randomBytes(16);
  const key = await deriveKey(password, salt);
  return [
    'scrypt', SCRYPT_N, SCRYPT_R, SCRYPT_P,
    salt.toString('base64url'), key.toString('base64url')
  ].join('$');
}

async function verifyPassword(password, encodedHash) {
  const parts = typeof encodedHash === 'string' ? encodedHash.split('$') : [];
  const validFormat = parts.length === 6
    && parts[0] === 'scrypt'
    && Number(parts[1]) === SCRYPT_N
    && Number(parts[2]) === SCRYPT_R
    && Number(parts[3]) === SCRYPT_P;
  const salt = validFormat ? Buffer.from(parts[4], 'base64url') : Buffer.alloc(16);
  const expected = validFormat ? Buffer.from(parts[5], 'base64url') : Buffer.alloc(KEY_LENGTH);
  const wellFormed = validFormat && salt.length === 16 && expected.length === KEY_LENGTH;
  const actual = await deriveKey(password, wellFormed ? salt : Buffer.alloc(16));
  const matches = timingSafeEqual(actual, wellFormed ? expected : Buffer.alloc(KEY_LENGTH));
  return wellFormed && matches;
}

module.exports = { hashPassword, verifyPassword };
