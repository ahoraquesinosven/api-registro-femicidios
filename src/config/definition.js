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
    }
  },

  db: {
    connectionString: entry({
      envKey: "DB_CONNECTION_STRING",
      doc: "Connection string to the PG database.",
    }),
  },
};
