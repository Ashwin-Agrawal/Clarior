const { google } = require("googleapis");
const GoogleToken = require("../models/GoogleToken");
const { getOAuthClient } = require("../utils/googleClient");

const SCOPES = [
  // Create calendar events + add Meet conference
  "https://www.googleapis.com/auth/calendar.events",
];

exports.getAuthUrl = async (req, res) => {
  const oauth2Client = getOAuthClient();
  if (!oauth2Client) {
    return res.status(503).json({
      message: "Google OAuth is not configured on the server (missing GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET).",
    });
  }

  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: SCOPES,
  });

  return res.json({ url });
};

exports.oauthCallback = async (req, res) => {
  try {
    const oauth2Client = getOAuthClient();
    if (!oauth2Client) {
      return res.status(503).json({
        message: "Google OAuth is not configured on the server.",
      });
    }

    const { code } = req.query;
    if (!code) return res.status(400).json({ message: "Missing code" });

    const { tokens } = await oauth2Client.getToken(String(code));
    if (!tokens.refresh_token) {
      // This happens if Google doesn't return refresh_token on subsequent auths.
      return res.status(400).json({
        message:
          "No refresh token returned. Remove app access from your Google Account and re-connect with prompt=consent.",
      });
    }

    await GoogleToken.updateOne(
      { provider: "google" },
      {
        $set: {
          provider: "google",
          refreshToken: tokens.refresh_token,
          accessToken: tokens.access_token || null,
          expiryDate: tokens.expiry_date || null,
          scope: tokens.scope || null,
          tokenType: tokens.token_type || null,
        },
      },
      { upsert: true }
    );

    return res.json({ success: true, message: "Google account connected" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.status = async (req, res) => {
  const doc = await GoogleToken.findOne({ provider: "google" }).lean();
  return res.json({
    connected: Boolean(doc?.refreshToken),
    updatedAt: doc?.updatedAt || null,
    scopes: doc?.scope || null,
  });
};

// Creates a Meet link by inserting a Calendar event with conferenceData.
exports.createMeetForBooking = async (booking, { summary, description }) => {
  const { getAuthedOAuthClient } = require("../utils/googleClient");
  const { client, reason } = await getAuthedOAuthClient();
  if (!client) {
    const e = new Error(`GOOGLE_NOT_READY:${reason}`);
    e.statusCode = 503;
    throw e;
  }

  const calendarId = process.env.GOOGLE_CALENDAR_ID || "primary";

  const calendar = google.calendar({ version: "v3", auth: client });

  const requestId = `clarior-${booking._id}-${Date.now()}`;
  const start = booking.startTime || booking.date || new Date();
  const end = booking.endTime || new Date(new Date(start).getTime() + 25 * 60 * 1000);

  const event = await calendar.events.insert({
    calendarId,
    conferenceDataVersion: 1,
    requestBody: {
      summary: summary || "Clarior Mentorship Session",
      description: description || `Booking ${booking._id}`,
      start: { dateTime: new Date(start).toISOString() },
      end: { dateTime: new Date(end).toISOString() },
      conferenceData: {
        createRequest: {
          requestId,
          conferenceSolutionKey: { type: "hangoutsMeet" },
        },
      },
    },
  });

  const meetLink =
    event.data?.hangoutLink ||
    event.data?.conferenceData?.entryPoints?.find((e) => e.entryPointType === "video")?.uri ||
    null;

  if (!meetLink) {
    const e = new Error("Failed to create Meet link");
    e.statusCode = 500;
    throw e;
  }

  return { meetLink, eventId: event.data.id };
};

