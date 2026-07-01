import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import api from "../services/api";
import AppShell from "../components/AppShell";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import useSEO from "../hooks/useSEO";
import { useTheme } from "../context/ThemeContext";

// Pre-defined premium illustrative SVG avatars
const PRESET_AVATARS = [
  {
    id: "initials",
    name: "Initials",
    render: (initials) => (
      <div className="w-full h-full bg-gradient-to-tr from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center text-white text-4xl sm:text-5xl font-black uppercase tracking-wider">
        <div className="absolute inset-0 bg-gradient-to-b from-white/15 to-transparent" />
        <span className="relative z-10 drop-shadow-md">{initials}</span>
      </div>
    )
  },
  {
    id: "avatar-1",
    name: "Cyber Geek",
    render: () => (
      <svg className="w-full h-full" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="cyber-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#1e1b4b" />
          </linearGradient>
          <linearGradient id="neon-glow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>
        <rect width="100" height="100" fill="url(#cyber-grad)" />
        <path d="M10 0v100M30 0v100M50 0v100M70 0v100M90 0v100M0 10h100M0 30h100M0 50h100M0 70h100M0 90h100" stroke="#38bdf8" strokeWidth="0.5" strokeOpacity="0.15" />
        <circle cx="50" cy="45" r="22" fill="#1e293b" stroke="url(#neon-glow)" strokeWidth="2.5" />
        <rect x="36" y="38" width="28" height="8" rx="2" fill="#06b6d4" fillOpacity="0.3" stroke="#22d3ee" strokeWidth="1.5" />
        <line x1="36" y1="42" x2="64" y2="42" stroke="#22d3ee" strokeWidth="2" />
        <rect x="25" y="40" width="4" height="12" rx="1" fill="#3b82f6" />
        <rect x="71" y="40" width="4" height="12" rx="1" fill="#3b82f6" />
        <path d="M27 40C27 25 73 25 73 40" stroke="#3b82f6" strokeWidth="1.5" />
        <circle cx="50" cy="18" r="2" fill="#00f2fe" />
        <path d="M50 20v8M45 24h10" stroke="#00f2fe" strokeWidth="1" />
        <path d="M22 82c0-10 8-18 18-18h20c10 0 18 8 18 18v18H22V82z" fill="#0f172a" stroke="url(#neon-glow)" strokeWidth="1.5" />
        <polygon points="50,68 56,76 44,76" fill="#00f2fe" opacity="0.8" />
      </svg>
    )
  },
  {
    id: "avatar-2",
    name: "Cosmic Astro",
    render: () => (
      <svg className="w-full h-full" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="astro-bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2e1065" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>
          <linearGradient id="visor-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ec4899" />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>
        <rect width="100" height="100" fill="url(#astro-bg)" />
        <circle cx="15" cy="20" r="0.8" fill="#fff" opacity="0.8" />
        <circle cx="85" cy="15" r="1.2" fill="#fff" opacity="0.9" />
        <circle cx="75" cy="70" r="0.5" fill="#fff" opacity="0.5" />
        <circle cx="20" cy="65" r="1" fill="#fff" opacity="0.7" />
        <circle cx="50" cy="46" r="24" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" />
        <path d="M32 46c0-10 8-16 18-16s18 6 18 16-8 12-18 12-18-2-18-12z" fill="url(#visor-grad)" stroke="#1e1b4b" strokeWidth="1" />
        <path d="M36 40c4-4 10-6 14-6s8 1 10 3c-4-2-9-3-13-3s-9 2-11 6z" fill="#fff" fillOpacity="0.4" />
        <rect x="49" y="14" width="2" height="8" fill="#94a3b8" />
        <circle cx="50" cy="12" r="3" fill="#ef4444" />
        <path d="M24 82c0-8 8-14 18-14h16c10 0 18 6 18 14v18H24V82z" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="2" />
        <rect x="42" y="74" width="16" height="12" rx="1" fill="#e2e8f0" />
        <circle cx="47" cy="80" r="2" fill="#3b82f6" />
        <circle cx="53" cy="80" r="2" fill="#10b981" />
      </svg>
    )
  },
  {
    id: "avatar-3",
    name: "Artistic Spark",
    render: () => (
      <svg className="w-full h-full" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="art-bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#db2777" />
          </linearGradient>
        </defs>
        <rect width="100" height="100" fill="url(#art-bg)" />
        <circle cx="80" cy="30" r="15" fill="#fff" fillOpacity="0.15" />
        <circle cx="35" cy="40" r="18" fill="#fff" fillOpacity="0.9" />
        <circle cx="35" cy="40" r="18" fill="url(#art-bg)" fillOpacity="0.35" />
        <path d="M70 45l4 4-4 4-4-4 4-4z" fill="#fff" />
        <path d="M80 60l2 2-2 2-2-2 2-2z" fill="#fff" />
        <path d="M50 20l3 3-3 3-3-3 3-3z" fill="#fff" />
        <path d="M10 90c30-10 50-40 80-20" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
        <path d="M20 15c20 30 10 60 50 70" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
      </svg>
    )
  },
  {
    id: "avatar-4",
    name: "Mentor Shield",
    render: () => (
      <svg className="w-full h-full" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="gold-bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#78350f" />
            <stop offset="100%" stopColor="#1e1b4b" />
          </linearGradient>
          <linearGradient id="gold-foil" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
        </defs>
        <rect width="100" height="100" fill="url(#gold-bg)" />
        <circle cx="50" cy="50" r="32" stroke="url(#gold-foil)" strokeWidth="1" strokeDasharray="4 4" opacity="0.4" />
        <path d="M18 42c12-8 26-2 32 8-6-10-20-16-32-8zm64 0c-12-8-26-2-32 8 6-10 20-16 32-8z" fill="url(#gold-foil)" opacity="0.6" />
        <path d="M34 32c0 0 8-4 16-4s16 4 16 4v20c0 10-16 18-16 18S34 62 34 52V32z" fill="#1e1b4b" stroke="url(#gold-foil)" strokeWidth="3.5" />
        <path d="M42 42c2 4 4 8 8 10 4-2 6-6 8-10" stroke="url(#gold-foil)" strokeWidth="2" strokeLinecap="round" />
        <polygon points="50,38 53,44 60,45 55,50 56,57 50,53 44,57 45,50 40,45 47,44" fill="url(#gold-foil)" />
      </svg>
    )
  },
  {
    id: "avatar-5",
    name: "Alchemist",
    render: () => (
      <svg className="w-full h-full" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="chem-bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#042f2e" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
        </defs>
        <rect width="100" height="100" fill="url(#chem-bg)" />
        <ellipse cx="50" cy="50" rx="35" ry="12" transform="rotate(30 50 50)" stroke="#14b8a6" strokeWidth="1" opacity="0.3" />
        <ellipse cx="50" cy="50" rx="35" ry="12" transform="rotate(-30 50 50)" stroke="#14b8a6" strokeWidth="1" opacity="0.3" />
        <circle cx="72" cy="38" r="2" fill="#2dd4bf" />
        <circle cx="28" cy="62" r="1.5" fill="#f43f5e" />
        <path d="M44 26h12v10l16 28c3 5-1 11-7 11H35c-6 0-10-6-7-11l16-28V26z" fill="#0f172a" stroke="#2dd4bf" strokeWidth="2.5" />
        <path d="M32 60c4-2 8-2 12 0s8 2 12 0 8-2 12 0l-3 10H35l-3-10z" fill="#14b8a6" fillOpacity="0.4" />
        <circle cx="50" cy="48" r="2.5" fill="#2dd4bf" />
        <circle cx="44" cy="54" r="1.5" fill="#2dd4bf" />
        <circle cx="56" cy="56" r="2" fill="#2dd4bf" />
        <path d="M50 15l2 2-2 2-2-2 2-2z" fill="#fff" />
      </svg>
    )
  },
  {
    id: "avatar-6",
    name: "Scholar",
    render: () => (
      <svg className="w-full h-full" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="school-bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4c1d95" />
            <stop offset="100%" stopColor="#1e1b4b" />
          </linearGradient>
        </defs>
        <rect width="100" height="100" fill="url(#school-bg)" />
        <polygon points="50,22 80,34 50,46 20,34" fill="#1e1b4b" stroke="#a78bfa" strokeWidth="2" />
        <rect x="43" y="38" width="14" height="12" fill="#1e1b4b" stroke="#a78bfa" strokeWidth="2" />
        <path d="M72 35v16c0 4-4 6-4 6" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="68" cy="58" r="2" fill="#fbbf24" />
        <rect x="30" y="66" width="40" height="10" rx="3" fill="#fef08a" stroke="#eab308" strokeWidth="2" />
        <line x1="38" y1="71" x2="62" y2="71" stroke="#ca8a04" strokeWidth="1.5" strokeDasharray="3 3" />
        <path d="M28 69c0-3 3-5 5-5v14c-2 0-5-2-5-9z" fill="#fde047" stroke="#eab308" strokeWidth="1.5" />
        <path d="M72 69c0-3-3-5-5-5v14c2 0 5-2 5-9z" fill="#fde047" stroke="#eab308" strokeWidth="1.5" />
        <polygon points="25,50 27,53 30,54 27,55 25,58 24,55 21,54 24,53" fill="#fef08a" />
        <polygon points="75,52 76,54 78,55 76,56 75,58 74,56 72,55 74,54" fill="#fef08a" />
      </svg>
    )
  }
];

function UserProfile() {
  useSEO({
    title: "My Profile Hub — Clarior",
    description: "Manage your Clarior account settings, update details, and navigate platform features.",
  });

  const { user, fetchUser, setUser } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();
  const { theme } = useTheme();

  /* ── edit modal colour tokens matching RequestCollegeModal ── */
  const isDark   = theme === "dark";
  const modalBg       = isDark ? "#0f1d33" : "#ffffff";
  const modalSurface  = isDark ? "#142439" : "#f8fafc";
  const modalBorder   = isDark ? "#233b5c" : "#d0e0f7";
  const modalFg       = isDark ? "#dfeafc" : "#10213b";
  const modalMuted    = isDark ? "#95b0dc" : "#567198";
  const modalInputBg  = isDark ? "#14253d" : "#ffffff";

  const labelStyle   = { fontSize: 13, fontWeight: 600, color: modalFg, marginBottom: 6, display: "block" };
  const inputStyle   = {
    width: "100%", height: 44, padding: "0 14px", borderRadius: 12,
    border: `1.5px solid ${modalBorder}`, background: modalInputBg, color: modalFg,
    fontSize: 14, outline: "none", boxSizing: "border-box",
    transition: "border-color 0.2s",
  };
  const selectStyle  = { ...inputStyle, cursor: "pointer" };
  const textareaStyle = {
    width: "100%", padding: "12px 14px", borderRadius: 12,
    border: `1.5px solid ${modalBorder}`, background: modalInputBg, color: modalFg,
    fontSize: 14, outline: "none", boxSizing: "border-box",
    transition: "border-color 0.2s",
    fontFamily: "inherit"
  };

  // Modal visibility
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "shortcuts"

  // Profile Edit State fields
  const [year, setYear] = useState(user?.year || "");
  const [linkedin, setLinkedin] = useState(user?.linkedin || "");
  const [upiId, setUpiId] = useState(user?.upiId || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [cgpa, setCgpa] = useState(user?.cgpa || "");
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || "initials");
  const [isSaving, setIsSaving] = useState(false);

  // Sync state if user changes/loads
  useEffect(() => {
    if (user) {
      setYear(user.year || "");
      setLinkedin(user.linkedin || "");
      setUpiId(user.upiId || "");
      setBio(user.bio || "");
      setCgpa(user.cgpa || "");
      setSelectedAvatar(user.avatar || "initials");
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await api.get("/auth/logout");
    } catch (_) {}
    setUser(null);
    navigate("/");
  };

  const handleOpenModal = () => {
    if (user) {
      setYear(user.year || "");
      setLinkedin(user.linkedin || "");
      setUpiId(user.upiId || "");
      setBio(user.bio || "");
      setCgpa(user.cgpa || "");
      setSelectedAvatar(user.avatar || "initials");
    }
    setIsEditModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (cgpa !== undefined && cgpa !== null && cgpa !== "") {
        const cgpaNum = Number(cgpa);
        if (isNaN(cgpaNum) || cgpaNum < 0 || cgpaNum > 10) {
          showError("Invalid CGPA. Must be between 0.00 and 10.00.");
          setIsSaving(false);
          return;
        }
      }

      // 1. Update basic profile fields (bio, year, avatar, cgpa)
      await api.patch("/users/profile", {
        bio: bio.trim(),
        year: year ? Number(year) : undefined,
        avatar: selectedAvatar,
        cgpa: cgpa ? Number(cgpa) : undefined,
      });

      // 2. Update UPI ID (if senior role and changed)
      if (user?.role === "senior" && upiId.trim() !== (user.upiId || "")) {
        const upiRegex = /^[a-zA-Z0-9._-]{3,}@[a-zA-Z]{3,}$/;
        if (upiId.trim() && !upiRegex.test(upiId.trim())) {
          showError("Invalid UPI ID format (e.g., name@bank)");
          setIsSaving(false);
          return;
        }
        await api.patch("/users/upi", { upiId: upiId.trim() });
      }

      showSuccess("Profile details updated!");
      await fetchUser(); // Reload latest user context
      setIsEditModalOpen(false);
    } catch (err) {
      showError(err?.response?.data?.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  // Calculate profile completion percentage
  const calculateCompletion = () => {
    let score = 40; // Name and Email are always set
    if (user?.college) score += 15;
    if (user?.year) score += 10;
    if (user?.domain) score += 10;
    if (user?.bio) score += 15;
    if (user?.linkedin) score += 10;
    return score;
  };

  const completionPercent = calculateCompletion();
  const initials = user?.name?.trim()?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "C";
  const currentAvatar = PRESET_AVATARS.find(av => av.id === (user?.avatar || "initials")) || PRESET_AVATARS[0];

  return (
    <AppShell title="Profile Hub" subtitle="Configure details, manage assets, and access shortcuts on your Clarior space.">
      
      {/* 🌟 1. HERO HEADER CARD (Clean, no cover banner, matching public senior profile) */}
      <div className="relative mb-8 rounded-[36px] border border-border/60 bg-surface/85 backdrop-blur-xl p-6 sm:p-8 md:p-10 shadow-hero shadow-primary/5 animate-fade-in">
        
        {/* Profile Details Row */}
        <div className="flex flex-col md:flex-row items-center md:items-center justify-between gap-6 relative z-10">
          
          {/* Left Area: Avatar & Details */}
          <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left w-full md:w-auto">
            {/* Avatar Container with glowing Outer Progress ring */}
            <div className="relative shrink-0 flex items-center justify-center group">
              {/* Outer Circular Progress Ring */}
              <div className="absolute -inset-3.5 rounded-full pointer-events-none">
                <svg className="w-36 h-36 sm:w-44 sm:h-44 transform -rotate-90" viewBox="0 0 100 100">
                  {/* Background Track */}
                  <circle
                    cx="50"
                    cy="50"
                    r="44"
                    className="stroke-border/20 fill-none"
                    strokeWidth="3"
                  />
                  {/* Completion Indicator */}
                  <circle
                    cx="50"
                    cy="50"
                    r="44"
                    className="stroke-primary fill-none transition-all duration-1000 ease-out"
                    strokeWidth="3"
                    strokeDasharray="276.4"
                    strokeDashoffset={276.4 - (completionPercent / 100) * 276.4}
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              {/* Core Avatar Box */}
              <div className="relative flex h-28 w-28 sm:h-36 sm:w-36 items-center justify-center rounded-full bg-surface border-[5px] border-surface shadow-2xl overflow-hidden group-hover:scale-[1.02] transition-transform duration-300">
                {currentAvatar.render(initials)}
              </div>

            </div>

            {/* Info Details */}
            <div className="space-y-2">
              <div className="flex flex-wrap justify-center sm:justify-start items-center gap-3">
                <h2 className="text-3xl sm:text-4xl font-black text-fg tracking-tight leading-none">{user?.name}</h2>
                <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider border shadow-sm ${
                  user?.role === "senior"
                    ? "bg-primary/10 text-primary border-primary/20"
                    : user?.role === "admin"
                    ? "bg-danger/10 text-danger border-danger/20"
                    : "bg-success/10 text-success border-success/20"
                }`}>
                  {user?.role === "senior" ? "Senior Mentor" : user?.role === "admin" ? "Admin" : "Student"}
                </span>
              </div>
              <p className="text-sm font-semibold text-muted">{user?.email}</p>
              
              <div className="flex flex-wrap justify-center sm:justify-start items-center gap-3 pt-1 text-xs font-bold text-muted/80">
                <span className="flex items-center gap-1.5 bg-success/10 text-success px-2 py-0.5 rounded-md border border-success/20">
                  <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                  Active Account
                </span>
                {user?.role === "senior" && (
                  <>
                    <span className="text-border/60 font-normal">•</span>
                    <span className="bg-warning/10 text-warning px-2 py-0.5 rounded-md border border-warning/20">
                      Rating: {user?.rating ? `★ ${user.rating.toFixed(1)}` : "New Mentor"}
                    </span>
                    <span className="text-border/60 font-normal">•</span>
                    <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-md border border-primary/20">
                      {user?.sessionsCompleted || 0} Sessions Done
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Senior verification tag */}
          {user?.role === "senior" && (
            <div className="shrink-0 pt-2 md:pt-0">
              <span className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider border flex items-center gap-1.5 shadow-sm ${
                user?.isVerified
                  ? "bg-success/10 text-success border-success/20"
                  : "bg-warning/10 text-warning border-warning/20 animate-pulse"
              }`}>
                <span className="text-sm leading-none">{user?.isVerified ? "✓" : "⏳"}</span>
                {user?.isVerified ? "Verified Mentor" : "Verification Pending"}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 🌟 2. NAVIGATION TAB SELECTOR (Premium Pill Style) */}
      <div className="flex flex-wrap gap-3 mb-8 animate-fade-in">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-5 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl border transition-all duration-300 cursor-pointer flex items-center gap-2 ${
            activeTab === "overview"
              ? "text-white dark:text-[#09111f] bg-primary border-primary shadow-[0_4px_14px_rgba(37,99,235,0.25)] scale-[1.02]"
              : "text-muted border-border/60 bg-surface/40 hover:text-fg hover:border-primary/45 hover:bg-surface/80"
          }`}
        >
          <span className={`h-1.5 w-1.5 rounded-full transition-colors ${activeTab === "overview" ? "bg-white dark:bg-[#09111f]" : "bg-muted"}`} />
          Overview Desk
        </button>
        <button
          onClick={() => setActiveTab("shortcuts")}
          className={`px-5 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl border transition-all duration-300 cursor-pointer flex items-center gap-2 ${
            activeTab === "shortcuts"
              ? "text-white dark:text-[#09111f] bg-primary border-primary shadow-[0_4px_14px_rgba(37,99,235,0.25)] scale-[1.02]"
              : "text-muted border-border/60 bg-surface/40 hover:text-fg hover:border-primary/45 hover:bg-surface/80"
          }`}
        >
          <span className={`h-1.5 w-1.5 rounded-full transition-colors ${activeTab === "shortcuts" ? "bg-white dark:bg-[#09111f]" : "bg-muted"}`} />
          Platform Bento Shortcuts
        </button>
      </div>

      {/* 🌟 3. MAIN TABBED BODY CONTENT */}
      {activeTab === "overview" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-scale-in">
          {/* Left Column: Wallet & Completion */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* 💳 PREMIUM METALLIC WALLET CARD */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1e293b] via-[#0f172a] to-[#1e1b4b] border border-white/10 shadow-2xl flex flex-col justify-between p-6 text-white aspect-[1.586/1] group transition-all duration-500 hover:scale-[1.03] hover:shadow-[0_20px_50px_rgba(99,102,241,0.2)]">
              {/* Metallic shine reflection effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
              
              {/* Card top */}
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300/80">CLARIOR PLATINUM</span>
                  <h4 className="text-xs font-bold text-white/90 leading-none mt-1">
                    {user?.role === "student" ? "STUDENT MEMBER PASS" : "PREMIUM MENTOR PASS"}
                  </h4>
                </div>
                <div className="text-2xl font-black text-indigo-400 animate-pulse">⚡</div>
              </div>

              {/* Card middle: microchip & balance */}
              <div className="flex justify-between items-center my-3">
                {/* Realistic Gold Chip */}
                <div className="w-12 h-9 bg-gradient-to-br from-[#ffd700] via-[#fcd34d] to-[#d97706] rounded-lg border border-[#ca8a04] flex flex-col justify-between p-1.5 relative overflow-hidden shadow-md">
                  <div className="w-full h-[1px] bg-yellow-900/30" />
                  <div className="w-full h-[1px] bg-yellow-900/30" />
                  <div className="w-full h-[1px] bg-yellow-900/30" />
                  <div className="absolute inset-y-0 left-1/3 w-[1px] bg-yellow-900/30" />
                  <div className="absolute inset-y-0 right-1/3 w-[1px] bg-yellow-900/30" />
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent" />
                </div>

                <div className="text-right">
                  <div className="text-[9px] font-bold text-indigo-300/70 uppercase tracking-widest">Balance Assets</div>
                  <div className="text-2xl sm:text-3xl font-black tracking-wide mt-0.5 text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-indigo-300">
                    {user?.role === "student" ? (
                      `🪙 ${user?.callCredits || 0}`
                    ) : (
                      `₹${user?.availableBalance || 0}`
                    )}
                  </div>
                </div>
              </div>

              {/* Card bottom */}
              <div className="flex justify-between items-end pt-3 border-t border-white/10">
                <div className="truncate pr-4">
                  <div className="text-[8px] text-indigo-300/60 uppercase tracking-widest font-semibold">Card Member</div>
                  <div className="text-xs font-black tracking-wider uppercase truncate mt-0.5 max-w-[140px]">{user?.name}</div>
                </div>

                {/* Styled Button */}
                {user?.role === "student" ? (
                  <Link to="/buy-credits">
                    <span className="text-[10px] font-black uppercase tracking-wider text-white bg-indigo-600 hover:bg-indigo-500 hover:shadow-glow px-4 py-2 rounded-xl border border-indigo-400/20 transition-all duration-300 cursor-pointer inline-block">
                      Recharge
                    </span>
                  </Link>
                ) : (
                  <Link to="/dashboard">
                    <span className="text-[10px] font-black uppercase tracking-wider text-white bg-indigo-600 hover:bg-indigo-500 hover:shadow-glow px-4 py-2 rounded-xl border border-indigo-400/20 transition-all duration-300 cursor-pointer inline-block">
                      Withdraw
                    </span>
                  </Link>
                )}
              </div>
            </div>

            {/* 🎯 PROFILE STRENGTH GRAPHIC WIDGET */}
            <Card className="p-5 bg-surface/50 backdrop-blur-xl border border-border/40 shadow-soft flex items-center gap-5 hover:border-primary/30 transition-all duration-300">
              <div className="h-16 w-16 shrink-0 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-pink-500/10 border border-primary/20 flex items-center justify-center text-2xl font-black text-primary">
                {completionPercent}%
              </div>
              <div className="space-y-1">
                <span className="text-[9px] font-black uppercase tracking-widest text-muted">Hub Strength</span>
                <h4 className="text-sm font-black text-fg">
                  {completionPercent < 100 ? "Complete setup milestones" : "100% Configured"}
                </h4>
                <p className="text-[10px] text-muted leading-relaxed">
                  {completionPercent < 100 ? "Configure year, bio, or LinkedIn link in your settings." : "All account parameters are configured."}
                </p>
              </div>
            </Card>
          </div>

          {/* Right Columns: Profile Details */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Primary Details Card */}
            <Card className="p-6 bg-surface/50 backdrop-blur-xl border border-border/40 shadow-soft">
              <div className="flex items-center justify-between border-b border-border/30 pb-4 mb-6">
                <h3 className="text-xs font-black uppercase tracking-widest text-muted/80 flex items-center gap-2">
                  <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  Profile Attributes
                </h3>
                
                {/* 🔒 Edit Profile Trigger */}
                {user?.role === "senior" && (
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={handleOpenModal}
                    className="rounded-xl flex items-center gap-1.5 text-xs font-black border border-border/60 hover:border-primary/30 transition-all shadow-sm cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path d="M12 20h9"/>
                      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                    </svg>
                    Edit Profile
                  </Button>
                )}
              </div>

              {/* Grid Layout of fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-muted uppercase tracking-wider block pl-1">Institution / College</span>
                  <div className="text-sm font-semibold text-fg bg-surface/50 px-4 py-3 rounded-xl border border-border/40">
                    {user?.college || <span className="text-muted/50 italic font-medium">Not specified</span>}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-black text-muted uppercase tracking-wider block pl-1">Branch / Stream</span>
                  <div className="text-sm font-semibold text-fg bg-surface/50 px-4 py-3 rounded-xl border border-border/40">
                    {user?.branch || <span className="text-muted/50 italic font-medium">Not specified</span>}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-black text-muted uppercase tracking-wider block pl-1">Academic Year</span>
                  <div className="text-sm font-semibold text-fg bg-surface/50 px-4 py-3 rounded-xl border border-border/40">
                    {user?.year ? `${user.year} Year` : <span className="text-muted/50 italic font-medium">Not specified</span>}
                  </div>
                </div>

                {user?.role === "senior" && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-muted uppercase tracking-wider block pl-1">CGPA</span>
                    <div className="text-sm font-semibold text-fg bg-surface/50 px-4 py-3 rounded-xl border border-border/40">
                      {user?.cgpa ? Number(user.cgpa).toFixed(2) : <span className="text-muted/50 italic font-medium">Not specified</span>}
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <span className="text-[10px] font-black text-muted uppercase tracking-wider block pl-1">LinkedIn Profile</span>
                  {user?.linkedin ? (
                    <a 
                      href={user.linkedin} 
                      target="_blank" 
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-xs font-black text-primary bg-primary/5 hover:bg-primary/10 border border-primary/20 px-4 py-3 rounded-xl transition-all w-full"
                    >
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                      </svg>
                      View LinkedIn Profile Link
                    </a>
                  ) : (
                    <div className="text-sm font-semibold text-fg bg-surface/50 px-4 py-3 rounded-xl border border-border/40">
                      <span className="text-muted/50 italic font-medium">Not specified</span>
                    </div>
                  )}
                </div>

                {user?.role === "senior" && (
                  <div className="space-y-1 sm:col-span-2">
                    <span className="text-[10px] font-black text-muted uppercase tracking-wider block pl-1">UPI ID (Payouts)</span>
                    <div className="text-sm font-mono font-semibold text-fg bg-surface/50 px-4 py-3 rounded-xl border border-border/40">
                      {user?.upiId || <span className="text-muted/50 italic font-medium">Not configured</span>}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-1 mt-5">
                <span className="text-[10px] font-black text-muted uppercase tracking-wider block pl-1">Profile Bio Description</span>
                <div className="relative mt-2 p-4 rounded-xl bg-surface2/25 border-l-4 border-primary text-sm font-medium text-fg italic leading-relaxed backdrop-blur-sm">
                  {user?.bio ? (
                    `"${user.bio}"`
                  ) : (
                    <span className="text-muted/50 not-italic font-medium">"Describe your skills, experiences, or academic track here..."</span>
                  )}
                </div>
              </div>
            </Card>

            {/* Logout/Session Card */}
            <Card className="p-6 border border-danger/20 bg-danger/[0.02] rounded-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-black text-danger">Sign Out Session</h4>
                  <p className="text-xs text-muted mt-0.5">Log out and clear your active account session from this device.</p>
                </div>
                <Button 
                  variant="secondary" 
                  onClick={handleLogout} 
                  className="rounded-xl border-danger/30 text-danger hover:bg-danger/10 hover:text-danger active:bg-danger/25 font-black shrink-0 shadow-sm cursor-pointer"
                >
                  Sign Out
                </Button>
              </div>
            </Card>

          </div>
        </div>
      ) : (
        /* 🌟 BENTO GRID SHORTCUTS TAB */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-scale-in">
          
          <Link to="/dashboard" className="group">
            <div className="p-6 rounded-3xl bg-surface/50 border border-border/40 hover:border-primary/40 hover:shadow-lift transition-all duration-300 flex flex-col justify-between h-full min-h-[160px]">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <rect x="3" y="3" width="7" height="7" rx="1"/>
                  <rect x="14" y="3" width="7" height="7" rx="1"/>
                  <rect x="3" y="14" width="7" height="7" rx="1"/>
                  <rect x="14" y="14" width="7" height="7" rx="1"/>
                </svg>
              </div>
              <div className="mt-4">
                <div className="text-base font-black text-fg group-hover:text-primary transition-colors flex items-center justify-between">
                  System Dashboard
                  <span className="text-xs font-bold text-muted group-hover:translate-x-1 transition-transform">→</span>
                </div>
                <p className="text-xs text-muted mt-1 leading-relaxed">Check your recent updates, session bookings, and statistics.</p>
              </div>
            </div>
          </Link>

          <Link to="/bookings" className="group">
            <div className="p-6 rounded-3xl bg-surface/50 border border-border/40 hover:border-primary/40 hover:shadow-lift transition-all duration-300 flex flex-col justify-between h-full min-h-[160px]">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <rect x="3" y="4" width="18" height="18" rx="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
              <div className="mt-4">
                <div className="text-base font-black text-fg group-hover:text-primary transition-colors flex items-center justify-between">
                  My Sessions
                  <span className="text-xs font-bold text-muted group-hover:translate-x-1 transition-transform">→</span>
                </div>
                <p className="text-xs text-muted mt-1 leading-relaxed">Manage your active, scheduled, and past calls.</p>
              </div>
            </div>
          </Link>

          <Link to="/explore" className="group">
            <div className="p-6 rounded-3xl bg-surface/50 border border-border/40 hover:border-primary/40 hover:shadow-lift transition-all duration-300 flex flex-col justify-between h-full min-h-[160px]">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8"/>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </div>
              <div className="mt-4">
                <div className="text-base font-black text-fg group-hover:text-primary transition-colors flex items-center justify-between">
                  Explore Mentors
                  <span className="text-xs font-bold text-muted group-hover:translate-x-1 transition-transform">→</span>
                </div>
                <p className="text-xs text-muted mt-1 leading-relaxed">Search profiles and book slots with seniors.</p>
              </div>
            </div>
          </Link>

          {user?.role === "senior" && (
            <>
              <Link to="/availability" className="group">
                <div className="p-6 rounded-3xl bg-surface/50 border border-border/40 hover:border-primary/40 hover:shadow-lift transition-all duration-300 flex flex-col justify-between h-full min-h-[160px]">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <rect x="3" y="4" width="18" height="18" rx="2"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                      <path d="M9 16l2 2 4-4"/>
                    </svg>
                  </div>
                  <div className="mt-4">
                    <div className="text-base font-black text-fg group-hover:text-primary transition-colors flex items-center justify-between">
                      Manage Availability
                      <span className="text-xs font-bold text-muted group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                    <p className="text-xs text-muted mt-1 leading-relaxed">Configure dates, time slots, and schedule.</p>
                  </div>
                </div>
              </Link>

              <Link to="/verify" className="group">
                <div className="p-6 rounded-3xl bg-surface/50 border border-border/40 hover:border-primary/40 hover:shadow-lift transition-all duration-300 flex flex-col justify-between h-full min-h-[160px]">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                  </div>
                  <div className="mt-4">
                    <div className="text-base font-black text-fg group-hover:text-primary transition-colors flex items-center justify-between">
                      Verification Credentials
                      <span className="text-xs font-bold text-muted group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                    <p className="text-xs text-muted mt-1 leading-relaxed">Update college enrollment details and UPI payout address.</p>
                  </div>
                </div>
              </Link>
              
              <Link to={`/profile/${user.id || user._id}`} className="group">
                <div className="p-6 rounded-3xl bg-surface/50 border border-border/40 hover:border-primary/40 hover:shadow-lift transition-all duration-300 flex flex-col justify-between h-full min-h-[160px]">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </div>
                  <div className="mt-4">
                    <div className="text-base font-black text-fg group-hover:text-primary transition-colors flex items-center justify-between">
                      View Public Profile
                      <span className="text-xs font-bold text-muted group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                    <p className="text-xs text-muted mt-1 leading-relaxed">See how your mentor card and slots list appear to students.</p>
                  </div>
                </div>
              </Link>
            </>
          )}

          {user?.role === "student" && (
            <Link to="/become-mentor" className="group">
              <div className="p-6 rounded-3xl bg-surface/50 border border-border/40 hover:border-primary/40 hover:shadow-lift transition-all duration-300 flex flex-col justify-between h-full min-h-[160px]">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                  </svg>
                </div>
                <div className="mt-4">
                  <div className="text-base font-black text-fg group-hover:text-primary transition-colors flex items-center justify-between">
                    Become a Mentor
                    <span className="text-xs font-bold text-muted group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                  <p className="text-xs text-muted mt-1 leading-relaxed">Apply as a mentor and share your knowledge with juniors.</p>
                </div>
              </div>
            </Link>
          )}

          {user?.role === "admin" && (
            <Link to="/admin" className="group">
              <div className="p-6 rounded-3xl bg-surface/50 border border-border/40 hover:border-primary/40 hover:shadow-lift transition-all duration-300 flex flex-col justify-between h-full min-h-[160px]">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="3"/>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                  </svg>
                </div>
                <div className="mt-4">
                  <div className="text-base font-black text-fg group-hover:text-primary transition-colors flex items-center justify-between">
                    Admin Dashboard
                    <span className="text-xs font-bold text-muted group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                  <p className="text-xs text-muted mt-1 leading-relaxed">Approve mentors, handle withdrawals, and review logs.</p>
                </div>
              </div>
            </Link>
          )}

        </div>
      )}

      {/* 🌟 4. EDIT PROFILE MODAL */}
      {isEditModalOpen && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 1000,
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 16,
            background: isDark ? "rgba(0,0,0,0.65)" : "rgba(15,33,59,0.35)",
            backdropFilter: "blur(10px)",
            animation: "fadeIn 0.25s ease both",
          }}
        >
          {/* Backdrop click */}
          <div style={{ position: "absolute", inset: 0 }} onClick={handleCloseModal} />
          
          {/* Modal box */}
          <div
            style={{
              position: "relative", zIndex: 10,
              width: "100%", maxWidth: 520,
              background: modalBg,
              border: `1.5px solid ${modalBorder}`,
              borderRadius: 28,
              padding: "32px 28px",
              boxShadow: isDark
                ? "0 32px 80px -20px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)"
                : "0 32px 80px -20px rgba(15,33,59,0.18), 0 0 0 1px rgba(37,99,235,0.06)",
              maxHeight: "90vh",
              overflowY: "auto",
              animation: "scaleIn 0.3s cubic-bezier(0.22,1,0.36,1) both",
            }}
          >
            {/* Close button */}
            <button
              onClick={handleCloseModal}
              style={{
                position: "absolute", top: 14, right: 14,
                width: 32, height: 32, borderRadius: "50%",
                background: "transparent", border: "none",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", color: modalMuted,
              }}
              aria-label="Close modal"
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Header badge */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "3px 12px", borderRadius: 999,
              background: isDark ? "rgba(96,165,250,0.15)" : "rgba(37,99,235,0.1)",
              border: `1px solid ${isDark ? "rgba(96,165,250,0.25)" : "rgba(37,99,235,0.2)"}`,
              color: isDark ? "#60a5fa" : "#2563eb",
              fontSize: 10, fontWeight: 900, letterSpacing: "0.12em",
              textTransform: "uppercase", marginBottom: 12,
            }}>
              Update Profile
            </div>

            <h2 style={{ fontSize: 22, fontWeight: 900, color: modalFg, marginBottom: 6, lineHeight: 1.15 }}>
              Update Profile{" "}
              <span style={{
                background: "linear-gradient(135deg, #2563eb, #38bdf8)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>
                Attributes.
              </span>
            </h2>
            <p style={{ fontSize: 12, color: modalMuted, lineHeight: 1.7, marginBottom: 20 }}>
              Configure your academic year, professional handles, custom bio description, and choose a premium illustrative avatar.
            </p>

            {/* Modal Form */}
            <form onSubmit={handleSaveProfile}>
              
              {/* Premium Avatar Selector grid */}
              <div style={{ marginBottom: 14 }}>
                <span style={labelStyle}>Choose Profile Illustration</span>
                <div className="grid grid-cols-4 gap-3 mt-1.5">
                  {PRESET_AVATARS.map((av) => (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => setSelectedAvatar(av.id)}
                      className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition-all duration-300 cursor-pointer ${
                        selectedAvatar === av.id 
                          ? "border-primary scale-105" 
                          : "hover:border-primary/45"
                      }`}
                      style={{
                        borderColor: selectedAvatar === av.id ? "#2563eb" : modalBorder,
                        boxShadow: selectedAvatar === av.id ? "0 0 12px rgba(99,102,241,0.35)" : "none"
                      }}
                    >
                      {av.render(initials)}
                      {selectedAvatar === av.id && (
                        <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                          <div className="bg-primary text-white p-1 rounded-full shadow">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Year Select input */}
              <div style={{ marginBottom: 14 }}>
                <span style={labelStyle}>Academic Year</span>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  style={selectStyle}
                  className="focus:border-primary/60 font-semibold"
                >
                  <option value="" style={{ background: modalInputBg, color: modalFg }}>Select current year</option>
                  <option value="1" style={{ background: modalInputBg, color: modalFg }}>1st Year (Freshman)</option>
                  <option value="2" style={{ background: modalInputBg, color: modalFg }}>2nd Year (Sophomore)</option>
                  <option value="3" style={{ background: modalInputBg, color: modalFg }}>3rd Year (Junior)</option>
                  <option value="4" style={{ background: modalInputBg, color: modalFg }}>4th Year (Senior)</option>
                  <option value="5" style={{ background: modalInputBg, color: modalFg }}>5th Year (Fifth Year)</option>
                  <option value="6" style={{ background: modalInputBg, color: modalFg }}>6th Year (Sixth Year)</option>
                </select>
              </div>

              {/* CGPA Input (Only visible for seniors) */}
              {user?.role === "senior" && (
                <div style={{ marginBottom: 14 }}>
                  <span style={labelStyle}>CGPA</span>
                  <input 
                    type="number" 
                    step="0.01"
                    min="0"
                    max="10"
                    value={cgpa} 
                    onChange={(e) => setCgpa(e.target.value)} 
                    placeholder="e.g. 8.50"
                    style={inputStyle}
                    className="focus:border-primary/60 placeholder:text-muted/60 font-semibold"
                  />
                </div>
              )}

              {/* UPI ID input (Only visible for seniors) */}
              {user?.role === "senior" && (
                <div style={{ marginBottom: 14 }}>
                  <span style={labelStyle}>UPI Payout Address</span>
                  <input 
                    type="text" 
                    value={upiId} 
                    onChange={(e) => setUpiId(e.target.value)} 
                    placeholder="e.g. username@okaxis"
                    style={{ ...inputStyle, fontFamily: "monospace" }}
                    className="focus:border-primary/60 placeholder:text-muted/60"
                  />
                  <p style={{ fontSize: 10, color: modalMuted, marginTop: 5, fontWeight: 500 }}>
                    Format: name@bank (used for direct payouts transfer)
                  </p>
                </div>
              )}

              {/* Bio Textarea */}
              <div style={{ marginBottom: 20 }}>
                <span style={labelStyle}>Bio / Professional Intro</span>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell students about your domain interests, experiences, achievements, and topics you teach..."
                  rows={4}
                  style={textareaStyle}
                  className="focus:border-primary/60 font-medium placeholder:text-muted/60"
                  maxLength={500}
                />
                <div style={{ fontSize: 10, color: modalMuted, textAlign: "right", marginTop: 4, fontWeight: 500 }}>
                  {bio.length}/500 characters
                </div>
              </div>

              {/* Divider */}
              <div style={{ height: 1, background: modalBorder, marginBottom: 20 }} />

              {/* Action buttons */}
              <div style={{ display: "flex", gap: 10 }}>
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={handleCloseModal}
                  className="flex-1 rounded-xl font-black text-sm"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 rounded-xl font-black text-sm"
                  loading={isSaving}
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}

export default UserProfile;
