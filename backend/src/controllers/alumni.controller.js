const Alumni = require("../models/Alumni");
const User = require("../models/User");
const Notification = require("../models/Notification");
const { sendSuccess, sendBadRequest, sendNotFound, sendError } = require("../utils/response.util");

// List of free/personal email domains rejected for corporate verification
const DISALLOWED_EMAIL_DOMAINS = new Set([
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "yahoo.co.in",
  "yahoo.co.uk",
  "outlook.com",
  "hotmail.com",
  "live.com",
  "msn.com",
  "icloud.com",
  "proton.me",
  "protonmail.com",
  "zoho.com",
  "rediffmail.com",
  "mail.com",
  "gmx.com",
  "yandex.com",
  "aol.com",
]);

/**
 *  Apply to become an Alumni Mentor
 */
exports.applyAlumni = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      name,
      phone,
      isCollegeDropout,
      college,
      degree,
      specialization,
      graduationDate,
      masters,
      currentJobTitle,
      currentCompany,
      joiningDate,
      companyEmail,
      linkedin,
      bio,
      upiId,
      sessionPrice,
      weeklySessionsLimit,
    } = req.body;

    const user = await User.findById(userId);
    if (!user) return sendNotFound(res, "User not found");

    if (user.role === "alumni" && user.isVerified) {
      return sendBadRequest(res, "You are already an approved alumni mentor");
    }

    const existingAlumni = await Alumni.findOne({ user: userId });
    if (existingAlumni && existingAlumni.status === "pending") {
      return sendBadRequest(res, "Your alumni application is already under review");
    }

    // 1. Phone validation
    const normalizedPhone = String(phone || "").replace(/\s+/g, "").trim();
    if (!/^\+?\d{10,15}$/.test(normalizedPhone)) {
      return sendBadRequest(res, "Please enter a valid contact phone number");
    }

    // 2. Academic validation (if not dropout)
    const isDropout = Boolean(isCollegeDropout);
    if (!isDropout) {
      if (!college || !String(college).trim()) {
        return sendBadRequest(res, "College or University name is required");
      }
      if (!degree || !String(degree).trim()) {
        return sendBadRequest(res, "Undergraduate degree name is required");
      }
      if (!graduationDate) {
        return sendBadRequest(res, "Graduation completion date is required");
      }
    }

    // 3. Professional validation
    if (!currentJobTitle || !String(currentJobTitle).trim()) {
      return sendBadRequest(res, "Current job title is required");
    }
    if (!currentCompany || !String(currentCompany).trim()) {
      return sendBadRequest(res, "Current company or organization name is required");
    }
    if (!joiningDate) {
      return sendBadRequest(res, "Date of joining current field is required");
    }

    // 4. Strict Company Email validation
    const trimmedEmail = String(companyEmail || "").trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return sendBadRequest(res, "Please enter a valid company email address");
    }

    const domain = trimmedEmail.split("@")[1];
    if (!domain || DISALLOWED_EMAIL_DOMAINS.has(domain)) {
      return sendBadRequest(
        res,
        "Official corporate work email required. Personal email domains (Gmail, Yahoo, Outlook, etc.) are automatically rejected."
      );
    }

    // 5. LinkedIn & Bio validation
    if (!linkedin || !/^https?:\/\/.+/i.test(String(linkedin).trim())) {
      return sendBadRequest(res, "Please enter a valid LinkedIn profile URL");
    }
    if (!bio || String(bio).trim().length < 20) {
      return sendBadRequest(res, "Bio must be at least 20 characters describing your guidance topics");
    }

    // 6. UPI ID validation
    const trimmedUpi = String(upiId || "").trim();
    const upiRegex = /^[\w.]+@[\w]+$/;
    if (!upiRegex.test(trimmedUpi)) {
      return sendBadRequest(res, "Please enter a valid UPI ID (e.g. username@bank)");
    }

    // 7. Session Price validation (20 min session)
    const priceNum = Number(sessionPrice);
    if (isNaN(priceNum) || priceNum < 99 || priceNum > 9999) {
      return sendBadRequest(res, "Session fee must be between ₹99 and ₹9,999 for a 20-min session");
    }

    // Format optional masters details
    const mastersData = {
      hasMasters: Boolean(masters?.hasMasters),
      degree: masters?.hasMasters ? String(masters?.degree || "").trim() : "",
      college: masters?.hasMasters ? String(masters?.college || "").trim() : "",
      graduationYear: masters?.hasMasters && masters?.graduationYear ? Number(masters.graduationYear) : null,
    };

    // Upsert Alumni profile
    let alumniDoc;
    const weeklyLimitNum = Number(weeklySessionsLimit) || 5;

    if (existingAlumni) {
      existingAlumni.isCollegeDropout = isDropout;
      existingAlumni.college = isDropout ? (college || "College Dropout") : String(college).trim();
      existingAlumni.degree = isDropout ? "N/A" : String(degree).trim();
      existingAlumni.specialization = isDropout ? "" : String(specialization || "").trim();
      existingAlumni.graduationDate = isDropout ? new Date() : new Date(graduationDate);
      existingAlumni.masters = mastersData;
      existingAlumni.currentJobTitle = String(currentJobTitle).trim();
      existingAlumni.currentCompany = String(currentCompany).trim();
      existingAlumni.joiningDate = new Date(joiningDate);
      existingAlumni.companyEmail = trimmedEmail;
      existingAlumni.linkedin = String(linkedin).trim();
      existingAlumni.bio = String(bio).trim();
      existingAlumni.upiId = trimmedUpi;
      existingAlumni.sessionPrice = Math.round(priceNum);
      existingAlumni.weeklySessionsLimit = Math.min(Math.max(weeklyLimitNum, 1), 50);
      existingAlumni.status = "pending";
      existingAlumni.rejectionReason = null;
      alumniDoc = await existingAlumni.save();
    } else {
      alumniDoc = await Alumni.create({
        user: userId,
        isCollegeDropout: isDropout,
        college: isDropout ? (college || "College Dropout") : String(college).trim(),
        degree: isDropout ? "N/A" : String(degree).trim(),
        specialization: isDropout ? "" : String(specialization || "").trim(),
        graduationDate: isDropout ? new Date() : new Date(graduationDate),
        masters: mastersData,
        currentJobTitle: String(currentJobTitle).trim(),
        currentCompany: String(currentCompany).trim(),
        joiningDate: new Date(joiningDate),
        companyEmail: trimmedEmail,
        linkedin: String(linkedin).trim(),
        bio: String(bio).trim(),
        upiId: trimmedUpi,
        sessionPrice: Math.round(priceNum),
        weeklySessionsLimit: Math.min(Math.max(weeklyLimitNum, 1), 50),
        sessionDuration: 20,
        platformFeePercent: 20,
        status: "pending",
      });
    }

    // Update User record without polluting it with alumni career fields
    user.applicationStatus = "pending";
    user.alumniProfile = alumniDoc._id;
    user.phone = normalizedPhone;
    user.upiId = trimmedUpi;
    if (name && String(name).trim()) {
      user.name = String(name).trim();
    }
    await user.save();

    // Trigger confirmation notification
    (async () => {
      try {
        await Notification.create({
          recipient: userId,
          title: "Alumni Application Submitted",
          message:
            "Your alumni mentor application has been received and is under review. We will verify your company email and LinkedIn within 48 hours.",
          type: "system",
        });
      } catch (notifyErr) {
        console.error("Failed to create alumni application notification:", notifyErr.message);
      }
    })();

    return sendSuccess(
      res,
      "Alumni mentor application submitted successfully. Verification will take up to 48 hours.",
      { alumni: alumniDoc },
      201
    );
  } catch (error) {
    console.error("Error in applyAlumni:", error);
    return sendError(res, error.message);
  }
};

/**
 *  Get current user's Alumni application status / profile
 */
exports.getMyAlumniProfile = async (req, res) => {
  try {
    const alumni = await Alumni.findOne({ user: req.user.id });
    return sendSuccess(res, "Alumni profile retrieved", { alumni });
  } catch (error) {
    return sendError(res, error.message);
  }
};

/**
 *  Get all approved Alumni mentors (Public Directory)
 */
exports.getAllAlumni = async (req, res) => {
  try {
    const { q, company, college, maxPrice } = req.query;

    const query = { status: "approved" };

    if (company && String(company).trim()) {
      query.currentCompany = { $regex: String(company).trim(), $options: "i" };
    }

    if (college && String(college).trim()) {
      query.college = { $regex: String(college).trim(), $options: "i" };
    }

    if (maxPrice && !isNaN(Number(maxPrice))) {
      query.sessionPrice = { $lte: Number(maxPrice) };
    }

    if (q && String(q).trim()) {
      const regex = { $regex: String(q).trim(), $options: "i" };
      query.$or = [
        { currentCompany: regex },
        { currentJobTitle: regex },
        { college: regex },
        { bio: regex },
      ];
    }

    const list = await Alumni.find(query)
      .populate("user", "name avatar rating")
      .select("-companyEmail -upiId -reviewedBy -rejectionReason -linkedin")
      .sort({ rating: -1, sessionsCompleted: -1, createdAt: -1 })
      .lean();

    return sendSuccess(res, "Approved alumni list retrieved", { alumni: list });
  } catch (error) {
    return sendError(res, error.message);
  }
};

/**
 *  Get public profile of a single approved Alumni mentor
 */
exports.getAlumniById = async (req, res) => {
  try {
    const alumni = await Alumni.findOne({ _id: req.params.id, status: "approved" })
      .populate("user", "name avatar rating numReviews")
      .select("-companyEmail -upiId -reviewedBy -rejectionReason -linkedin")
      .lean();

    if (!alumni) return sendNotFound(res, "Alumni mentor not found or not approved");

    return sendSuccess(res, "Alumni mentor details retrieved", { alumni });
  } catch (error) {
    return sendError(res, error.message);
  }
};
