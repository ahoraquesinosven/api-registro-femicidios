const entry = (params) => {
  return {
    required: true,
    ...params,
  };
};

export default {
  server: {
    cannonicalOrigin: entry({
      envKey: "SERVER_CANNONICAL_ORIGIN",
      doc: "Cannonical origin for the server, used to compose absolute URL's in some endpoints. Ex: http://localhost:8080",
    }),
  },

  auth: {
    google: {
      clientId: entry({
        envKey: "AUTH_GOOGLE_CLIENT_ID",
        doc: "Google OpenID Client Id. See https://developers.google.com/identity/openid-connect/openid-connect#getcredentials",
      }),

      clientSecret: entry({
        envKey: "AUTH_GOOGLE_CLIENT_SECRET",
        doc: "Google OpenID Client Secret. See https://developers.google.com/identity/openid-connect/openid-connect#getcredentials",
      }),
    },

    // These need to be changed to be a database-stored list of client
    // settings, but will be stored as part of the config for now
    provider: {
      acceptedClientId: entry({
        envKey: "AUTH_PROVIDER_ACCEPTED_CLIENT_ID",
        doc: "OAuth2.0 client id that will be accepted to the authorize endpoint.",
      }),

      redirectUri: entry({
        envKey: "AUTH_PROVIDER_REDIRECT_URI",
        doc: "OAuth2.0 redirect URI for valid authorization request redirections."
      }),

      authCodeEncryptionSecret: entry({
        envKey: "AUTH_PROVIDER_CODE_ENCRYPTION_SECRET",
        doc: "Encryption key for encrypting authorization codes."
      }),
    },

    internal: {
      key: entry({
        envKey: "AUTH_INTERNAL_KEY",
        doc: "Base64-encoded user:password pair, as defined by RFC7617"
      }),
    },
  },

  db: {
    connectionString: entry({
      envKey: "DB_CONNECTION_STRING",
      doc: "Connection string to the PG database.",
    }),
  },
};
