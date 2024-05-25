import axios from 'axios';
import {decodeJwt} from 'jose';
import config from '../config/values.js';
import {createNonce} from '../lib/crypto.js';

let openIdConfiguration = null;
const getOpenIdConfiguration = async () => {
  if (!openIdConfiguration) {
    const response = await axios.get(
      "https://accounts.google.com/.well-known/openid-configuration"
    );

    openIdConfiguration = response.data;
  }

  return openIdConfiguration;
};

export const buildAuthorizationURL = async ({callbackURL, state}) => {
  const googleOpenIDConfiguration = await getOpenIdConfiguration();
  const authorizationEndpoint = googleOpenIDConfiguration["authorization_endpoint"];

  const result = new URL(authorizationEndpoint);
  result.searchParams.append("client_id", config.auth.google.clientId);
  result.searchParams.append("response_type", "code");
  result.searchParams.append("scope", "openid profile email");
  result.searchParams.append("redirect_uri", callbackURL);
  result.searchParams.append("state", state);
  result.searchParams.append("nonce", createNonce());
  result.searchParams.append("hd", "ahoraquesinosven.org.ar");
  return result;
};

export const exchangeAuthorizationCode = async ({callbackURL, code}) => {
  const googleOpenIDConfiguration = await getOpenIdConfiguration();
  const tokenEndpoint = googleOpenIDConfiguration["token_endpoint"];

  const requestData = new URLSearchParams();
  requestData.append("code", code);
  requestData.append("client_id", config.auth.google.clientId);
  requestData.append("client_secret", config.auth.google.clientSecret);
  requestData.append("redirect_uri", callbackURL);
  requestData.append("grant_type", "authorization_code");

  const response = await axios.post(tokenEndpoint, requestData);
  const token = response.data["id_token"];

  return decodeJwt(token);
};

export const verifyGoogleTokenValues = (token) => {
  if (token.aud !== config.auth.google.clientId) {
    console.warn(`Received invalid google token with aud ${token.aud}`);
    return false;
  }

  if (token.iss !== "https://accounts.google.com") {
    console.warn(`Received invalid google token with issuer ${token.iss}`);
    return false;
  }

  if (token.hd !== "ahoraquesinosven.org.ar") {
    console.warn(`Received invalid google token with domain ${token.hd}`);
    return false;
  }

  if (!token.email_verified) {
    console.warn("Received invalid google token with unverified email");
    return false;
  }

  return true;
};

