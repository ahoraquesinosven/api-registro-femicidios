import { createHash, randomBytes } from 'crypto';

export const createNonce = () => {
  return randomBytes(16).toString("hex");
};

export const createXSRFToken = () => {
  const randomBuffer = randomBytes(1024);
  return createHash("sha256").update(randomBuffer).digest("hex");
};

