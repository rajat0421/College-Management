const LOWER = 'abcdefghijklmnopqrstuvwxyz';
const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const NUMS = '0123456789';
const SPECIAL = '!@#$%^&*-_=+';

export function generatePassword(length, includeSpecial) {
  const len = Math.min(64, Math.max(6, Number(length) || 12));
  let charset = LOWER + UPPER + NUMS;
  if (includeSpecial) charset += SPECIAL;

  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  let out = '';
  for (let i = 0; i < len; i += 1) {
    out += charset[bytes[i] % charset.length];
  }
  return out;
}
