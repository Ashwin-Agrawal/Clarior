const { google } = require("googleapis");

function getOAuthClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri =
    process.env.GOOGLE_REDIRECT_URI || "http://localhost:3000/api/google/callback";

  if (!clientId || !clientSecret) return null;

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

async function getAuthedOAuthClient() {
  const GoogleToken = require("../models/GoogleToken");
  const oauth2Client = getOAuthClient();
  if (!oauth2Client) return { client: null, reason: "missing_oauth_env" };

  const tokenDoc = await GoogleToken.findOne({ provider: "google" });
  if (!tokenDoc) return { client: null, reason: "not_connected" };

  oauth2Client.setCredentials({
    refresh_token: tokenDoc.refreshToken,
    access_token: tokenDoc.accessToken || undefined,
    expiry_date: tokenDoc.expiryDate || undefined,
    scope: tokenDoc.scope || undefined,
    token_type: tokenDoc.tokenType || undefined,
  });

  // Keep DB in sync when googleapis refreshes the access token.
  oauth2Client.on("tokens", async (tokens) => {
    const update = {};
    if (tokens.access_token) update.accessToken = tokens.access_token;
    if (tokens.expiry_date) update.expiryDate = tokens.expiry_date;
    if (tokens.refresh_token) update.refreshToken = tokens.refresh_token;
    if (Object.keys(update).length) {
      await GoogleToken.updateOne({ provider: "google" }, { $set: update });
    }
  });

  return { client: oauth2Client, reason: null };
}

module.exports = { getOAuthClient, getAuthedOAuthClient };

