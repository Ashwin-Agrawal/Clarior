import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function BecomeMentor() {
  const { user, fetchUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({
    phone: "",
    college: "",
    domain: "",
    branch: "",
    year: "",
    cgpa: "",
    bio: "",
    linkedin: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (user?.role === "senior" && user?.isVerified) {
      setMessage("You are already a verified senior.");
    }
  }, [user]);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const validateForm = () => {
    const nextErrors = {};
    const cleanedPhone = form.phone.replace(/\s+/g, "");
    if (!cleanedPhone) {
      nextErrors.phone = "Phone is required";
    } else if (!/^\+?\d{10,15}$/.test(cleanedPhone)) {
      nextErrors.phone = "Enter a valid phone number";
    }

    if (!form.college.trim()) nextErrors.college = "College is required";
    if (!form.branch.trim()) nextErrors.branch = "Branch is required";

    if (form.year && (Number(form.year) < 1 || Number(form.year) > 6)) {
      nextErrors.year = "Year should be between 1 and 6";
    }
    if (form.cgpa && (Number(form.cgpa) < 0 || Number(form.cgpa) > 10)) {
      nextErrors.cgpa = "CGPA should be between 0 and 10";
    }
    if (form.linkedin && !/^https?:\/\/.+/i.test(form.linkedin)) {
      nextErrors.linkedin = "LinkedIn URL should start with http:// or https://";
    }

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate("/login", { state: { from: location.pathname } });
      return;
    }
    if (!validateForm()) return;
    setError("");
    setMessage("");
    setLoading(true);

    try {
      await api.post("/users/apply-senior", {
        ...form,
        phone: form.phone.replace(/\s+/g, ""),
        year: form.year ? Number(form.year) : undefined,
        cgpa: form.cgpa ? Number(form.cgpa) : undefined,
      });
      await fetchUser?.();
      setMessage("Application submitted. Our team will verify your profile shortly.");
      setForm({
        phone: "",
        college: "",
        domain: "",
        branch: "",
        year: "",
        cgpa: "",
        bio: "",
        linkedin: "",
      });
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to submit application");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="px-6 py-10 md:py-14">
        <div className="max-w-5xl mx-auto">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-surface2 border border-border text-primary px-4 py-2 rounded-full text-sm font-semibold">
              <span>✉</span>
              <span>CollegeConnect</span>
            </div>
            <h1 className="mt-5 text-4xl md:text-5xl font-extrabold tracking-tight">Become a Senior</h1>
            <p className="mt-3 text-muted max-w-2xl mx-auto">
              Help future students make informed decisions and earn while sharing your experience.
            </p>
            <div className="mt-5 flex items-center justify-center gap-3">
              <span className="text-xs bg-surface border border-border px-3 py-1.5 rounded-full">Avg approval in 24-48 hrs</span>
              <span className="text-xs bg-surface border border-border px-3 py-1.5 rounded-full">Flexible schedule</span>
            </div>
          </div>

          <div className="mt-8 grid md:grid-cols-3 gap-4">
            <div className="bg-surface border border-border rounded-2xl p-5 text-center shadow-sm">
              <h3 className="font-bold text-fg">Earn Money</h3>
              <p className="text-sm text-muted mt-1">Get 80% of every chat/call</p>
            </div>
            <div className="bg-surface border border-border rounded-2xl p-5 text-center shadow-sm">
              <h3 className="font-bold text-fg">Flexible Hours</h3>
              <p className="text-sm text-muted mt-1">Work on your schedule</p>
            </div>
            <div className="bg-surface border border-border rounded-2xl p-5 text-center shadow-sm">
              <h3 className="font-bold text-fg">Help Students</h3>
              <p className="text-sm text-muted mt-1">Guide the next generation</p>
            </div>
          </div>

          {!user && (
            <div className="mt-8 rounded-2xl border border-border bg-surface p-6 text-center shadow-sm">
              <h3 className="text-2xl font-bold">Login required</h3>
              <p className="mt-2 text-sm text-muted">Please login first to submit your senior application.</p>
              <div className="mt-4">
                <Link
                  to="/login"
                  state={{ from: "/become-senior" }}
                  className="inline-flex rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primaryFg"
                >
                  Login to continue
                </Link>
              </div>
            </div>
          )}

          <div className="mt-8 grid lg:grid-cols-[2fr,1fr] gap-6">
          <form onSubmit={onSubmit} className="bg-surface border border-border rounded-2xl p-6 md:p-8 shadow-sm">
            <h2 className="text-2xl font-extrabold tracking-tight">Senior Application Form</h2>
            <p className="text-muted mt-1">Fill in your details to get verified as a senior.</p>

            {message && (
              <div className="mt-4 text-sm text-success bg-surface2 border border-success rounded-xl p-3">
                {message}
              </div>
            )}
            {error && (
              <div className="mt-4 text-sm text-danger bg-surface2 border border-danger rounded-xl p-3">
                {error}
              </div>
            )}

            <h3 className="mt-6 font-semibold text-lg">Personal Information</h3>
            <div className="mt-4 grid md:grid-cols-2 gap-4">
              <label className="text-sm">
                <div className="font-medium mb-1">Phone Number *</div>
                <input className="w-full rounded-xl border border-border bg-surface px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20" value={form.phone} onChange={(e) => updateField("phone", e.target.value)} placeholder="+91 98765 43210" required />
                {fieldErrors.phone && <p className="mt-1 text-xs text-danger">{fieldErrors.phone}</p>}
              </label>
            </div>

            <h3 className="mt-7 font-semibold text-lg">Academic Information</h3>
            <div className="mt-4 grid md:grid-cols-2 gap-4">
              <label className="text-sm">
                <div className="font-medium mb-1">College Name *</div>
                <input className="w-full rounded-xl border border-border bg-surface px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20" value={form.college} onChange={(e) => updateField("college", e.target.value)} placeholder="Your college name" required />
                {fieldErrors.college && <p className="mt-1 text-xs text-danger">{fieldErrors.college}</p>}
              </label>
              <label className="text-sm">
                <div className="font-medium mb-1">Domain/Stream</div>
                <select
                  className="w-full rounded-xl border border-border bg-surface px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20"
                  value={form.domain}
                  onChange={(e) => updateField("domain", e.target.value)}
                >
                  <option value="">Select domain</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Medical">Medical</option>
                  <option value="Commerce">Commerce</option>
                  <option value="Arts">Arts</option>
                  <option value="Law">Law</option>
                  <option value="Other">Other</option>
                </select>
                {fieldErrors.domain && <p className="mt-1 text-xs text-danger">{fieldErrors.domain}</p>}
              </label>
              <label className="text-sm">
                <div className="font-medium mb-1">Branch/Department *</div>
                <input className="w-full rounded-xl border border-border bg-surface px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20" value={form.branch} onChange={(e) => updateField("branch", e.target.value)} placeholder="CSE, ECE, MBA..." required />
                {fieldErrors.branch && <p className="mt-1 text-xs text-danger">{fieldErrors.branch}</p>}
              </label>
              <label className="text-sm">
                <div className="font-medium mb-1">Current Year</div>
                <input type="number" min={1} max={6} className="w-full rounded-xl border border-border bg-surface px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20" value={form.year} onChange={(e) => updateField("year", e.target.value)} placeholder="3" />
                {fieldErrors.year && <p className="mt-1 text-xs text-danger">{fieldErrors.year}</p>}
              </label>
              <label className="text-sm">
                <div className="font-medium mb-1">CGPA</div>
                <input type="number" step="0.01" min={0} max={10} className="w-full rounded-xl border border-border bg-surface px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20" value={form.cgpa} onChange={(e) => updateField("cgpa", e.target.value)} placeholder="8.4" />
                {fieldErrors.cgpa && <p className="mt-1 text-xs text-danger">{fieldErrors.cgpa}</p>}
              </label>
            </div>

            <h3 className="mt-7 font-semibold text-lg">Profile</h3>
            <div className="mt-4 space-y-4">
              <label className="block text-sm">
                <div className="font-medium mb-1">Short Bio</div>
                <textarea rows={4} className="w-full rounded-xl border border-border bg-surface px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 resize-y" value={form.bio} onChange={(e) => updateField("bio", e.target.value)} placeholder="Tell students what you can help with..." />
              </label>
              <label className="block text-sm">
                <div className="font-medium mb-1">LinkedIn URL</div>
                <input className="w-full rounded-xl border border-border bg-surface px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20" value={form.linkedin} onChange={(e) => updateField("linkedin", e.target.value)} placeholder="https://linkedin.com/in/yourprofile" />
                {fieldErrors.linkedin && <p className="mt-1 text-xs text-danger">{fieldErrors.linkedin}</p>}
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || !user || (user?.role === "senior" && user?.isVerified)}
              className="mt-7 w-full md:w-auto bg-primary text-primaryFg px-7 py-3 rounded-xl font-semibold hover:opacity-90 disabled:opacity-60"
            >
              {loading ? "Submitting..." : "Submit Application"}
            </button>
            <p className="text-xs text-muted mt-3">
              By applying, you agree to senior quality guidelines and community standards.
            </p>
          </form>
          <aside className="bg-surface border border-border rounded-2xl p-6 shadow-sm h-fit">
            <h3 className="text-lg font-bold">What happens next?</h3>
            <ol className="mt-4 space-y-3 text-sm text-muted">
              <li>1. Team reviews your profile and details.</li>
              <li>2. Verification call if needed.</li>
              <li>3. Senior dashboard unlocks with slots.</li>
            </ol>
            <div className="mt-6 border-t border-border pt-4">
              <h4 className="font-semibold">Need help first?</h4>
              <p className="text-sm text-muted mt-1">Read senior expectations before applying.</p>
              <Link
                to="/mentor-guidelines"
                className="inline-block mt-3 text-sm font-semibold text-primary hover:underline"
              >
                View senior guidelines
              </Link>
            </div>
          </aside>
          </div>

          <div className="mt-8 bg-surface border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="text-xl font-bold">Frequently asked questions</h3>
            <div className="mt-4 grid md:grid-cols-2 gap-4 text-sm">
              <div className="rounded-xl border border-border p-4">
                <p className="font-semibold">How much can I earn?</p>
                <p className="text-muted mt-1">Seniors currently receive up to 80% of session value.</p>
              </div>
              <div className="rounded-xl border border-border p-4">
                <p className="font-semibold">Do I choose my own timing?</p>
                <p className="text-muted mt-1">Yes, you control your availability and slot schedule.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default BecomeMentor;
