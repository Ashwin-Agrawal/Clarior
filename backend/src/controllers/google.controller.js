const { google } = require("googleapis");
const GoogleToken = require("../models/GoogleToken");
const { getOAuthClient } = require("../utils/googleClient");

const SCOPES = [
  // Create calendar events + add Meet conference
  "https://www.googleapis.com/auth/calendar.events",
];

exports.getAuthUrl = async (req, res, next) => {
  try {
    const oauth2Client = getOAuthClient();
    if (!oauth2Client) {
      const e = new Error("Google OAuth is not configured on the server (missing GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET).");
      e.statusCode = 503;
      throw e;
    }

    const url = oauth2Client.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: SCOPES,
    });

    return res.json({ url });
  } catch (err) {
    next(err);
  }
};

exports.oauthCallback = async (req, res, next) => {
  try {
    const oauth2Client = getOAuthClient();
    if (!oauth2Client) {
      const e = new Error("Google OAuth is not configured on the server.");
      e.statusCode = 503;
      throw e;
    }

    const { code } = req.query;
    if (!code) {
      const e = new Error("Missing code parameter");
      e.statusCode = 400;
      throw e;
    }

    const { tokens } = await oauth2Client.getToken(String(code));
    if (!tokens.refresh_token) {
      const e = new Error("No refresh token returned. Remove app access from your Google Account and re-connect with prompt=consent.");
      e.statusCode = 400;
      throw e;
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
    next(err);
  }
};

exports.status = async (req, res, next) => {
  try {
    const doc = await GoogleToken.findOne({ provider: "google" }).lean();
    console.log("👉 Google Status Check Hit! Token found in DB:", !!doc);
    return res.json({
      connected: Boolean(doc?.refreshToken),
      updatedAt: doc?.updatedAt || null,
      scopes: doc?.scope || null,
    });
  } catch (err) {
    console.error("👉 Google Status Check Error:", err);
    next(err);
  }
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

  // Fetch student and senior emails to invite them as attendees
  const User = require("../models/User");
  const attendees = [];
  try {
    if (booking.student) {
      const student = await User.findById(booking.student).select("email");
      if (student?.email) attendees.push({ email: student.email });
    }
  } catch (err) {
    console.error("Error fetching student email for Calendar event:", err);
  }

  try {
    if (booking.senior) {
      const senior = await User.findById(booking.senior).select("email");
      if (senior?.email) attendees.push({ email: senior.email });
    }
  } catch (err) {
    console.error("Error fetching senior email for Calendar event:", err);
  }

  let event;
  try {
    event = await calendar.events.insert({
      calendarId,
      conferenceDataVersion: 1,
      sendUpdates: "all",
      requestBody: {
        summary: summary || "Clarior Mentorship Session",
        description: description || `Booking ${booking._id}`,
        start: { dateTime: new Date(start).toISOString() },
        end: { dateTime: new Date(end).toISOString() },
        attendees: attendees,
        conferenceData: {
          createRequest: {
            requestId,
            conferenceSolutionKey: { type: "hangoutsMeet" },
          },
        },
      },
    });
  } catch (err) {
    console.error("Google Calendar API insert failed, throwing fallback exception:", err.message);
    const e = new Error(`Google Calendar insertion failed: ${err.message}`);
    e.statusCode = 502;
    throw e;
  }

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
