import {createHash, randomBytes, createSecretKey} from 'crypto';
import {SignJWT, jwtVerify} from 'jose';
import config from '../config/values.js';

export const createNonce = () => {
  return randomBytes(16).toString("hex");
};

export const createXSRFToken = () => {
  const randomBuffer = randomBytes(1024);
  return createHash("sha256").update(randomBuffer).digest("hex");
};

const deriveChallenge = (verifier) => {
  const hash = createHash("sha256").update(verifier).digest('base64');
  const challenge = hash.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return challenge;
}

export const verifyPKCEPair = (verifier, challenge) => {
  const derivedChallenge = deriveChallenge(verifier);

  return challenge === derivedChallenge;
};

export const createPKCEPair = () => {
  const verifier = randomBytes(25).toString("hex");
  const challenge = deriveChallenge(verifier);

  return { verifier, challenge, method: "S256" };
};

const jwtSignKey = createSecretKey(config.auth.provider.authCodeEncryptionSecret, 'utf-8');

export const createSignedJwt = async (payload, expirationTime) => {
  return new SignJWT(payload)
    .setProtectedHeader({alg: "HS256"})
    .setIssuedAt()
    .setExpirationTime(expirationTime)
    .sign(jwtSignKey);
};

export const verifySignedJwt = async (token) => {
  const {payload} = await jwtVerify(token, jwtSignKey);

  return payload;
};
