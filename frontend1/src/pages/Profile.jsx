import { useEffect, useRef, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Skeleton from "../components/ui/Skeleton";
import Footer from "../components/Footer";
import SiteContainer from "../components/layout/SiteContainer";
import useSEO from "../hooks/useSEO";
import { useToast } from "../context/ToastContext";
import ConfirmModal from "../components/ui/ConfirmModal";

function getGradient(domain = "", name = "") {
  const domainLower = domain?.toLowerCase() || "";
  if (domainLower.includes("engineering") || domainLower.includes("tech")) {
    return "from-blue-600 to-indigo-700";
  }
  if (domainLower.includes("medical") || domainLower.includes("science")) {
    return "from-emerald-600 to-teal-700";
  }
  if (domainLower.includes("commerce") || domainLower.includes("finance")) {
    return "from-amber-500 to-orange-600";
  }
  if (domainLower.includes("arts") || domainLower.includes("humanities")) {
    return "from-pink-600 to-rose-700";
  }
  if (domainLower.includes("law")) {
    return "from-violet-600 to-purple-700";
  }
  const g = ["from-violet-600 to-indigo-600","from-rose-600 to-pink-600","from-teal-600 to-emerald-600","from-amber-600 to-orange-600","from-blue-600 to-cyan-600","from-fuchsia-600 to-purple-600"];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return g[Math.abs(h) % g.length];
}

function formatReviewDate(dateStr) {
  if (!dateStr) return "recently";
  const date = new Date(dateStr);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays <= 1) return "today";
  if (diffDays === 2) return "yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} week${weeks !== 1 ? 's' : ''} ago`;
  }
  const months = Math.floor(diffDays / 30);
  return `${months} month${months !== 1 ? 's' : ''} ago`;
}

function StarRow({ rating, reviews }) {
  const num = typeof rating === "number" ? rating : null;
  return (
    <div className="flex items-center gap-3">
      <div className="flex gap-1">
        {[1,2,3,4,5].map(i => (
          <svg key={i} width="20" height="20" fill={num && i <= Math.round(num) ? "#f59e0b" : "none"} stroke="#f59e0b" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        ))}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-xl font-black text-fg">{num ? num.toFixed(1) : "New"}</span>
        <span className="text-sm font-bold text-muted tracking-tight">({reviews || 0} reviews)</span>
      </div>
    </div>
  );
}

function StatIcon({ type }) {
  const icons = {
    sessions: <path strokeLinecap="round" strokeLinejoin="round" d="m5 13 4 4L19 7" />,
    rating: <path strokeLinecap="round" strokeLinejoin="round" d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z" />,
    experience: <path strokeLinecap="round" strokeLinejoin="round" d="M4 10 12 6l8 4-8 4-8-4Zm3 3v4c2.8 1.8 7.2 1.8 10 0v-4" />,
    response: <path strokeLinecap="round" strokeLinejoin="round" d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />,
    calendar: <path strokeLinecap="round" strokeLinejoin="round" d="M7 3v3m10-3v3M4 9h16M6 5h12a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" />,
    clock: <><circle cx="12" cy="12" r="8" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v5l3 2" /></>,
    alert: <><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01" /><path strokeLinecap="round" strokeLinejoin="round" d="M10.3 4.4 2.7 17.5A2 2 0 0 0 4.4 20h15.2a2 2 0 0 0 1.7-2.5L13.7 4.4a2 2 0 0 0-3.4 0Z" /></>,
  };

  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.1" viewBox="0 0 24 24" aria-hidden="true">
      {icons[type]}
    </svg>
  );
}

function LocationIcon({ className = "h-5 w-5" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2.4" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
    </svg>
  );
}

function CalendarIcon({ className = "h-5 w-5" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2.4" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
    </svg>
  );
}

function AcademicIcon({ className = "h-5 w-5" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2.4" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.9c2.783 0 5.437-.72 7.731-2.006a60.438 60.438 0 0 0-.49-6.347m-15.482 0a48.47 48.47 0 0 1 7.74-2.006m0 0a48.47 48.47 0 0 1 7.74 2.006M4.26 10.147l7.74-2.006m0 0v-5.61m0 5.61 7.74 2.006M12 2.525l7.74 2.006m0 0-7.74 2.006m0 0L4.26 4.531 12 2.525Z" />
    </svg>
  );
}

function BackIcon({ className = "h-4 w-4" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2.8" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
    </svg>
  );
}

function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [mentor, setMentor] = useState(null);
  const [slots, setSlots] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bookingSlot, setBookingSlot] = useState(null);
  const bookingPanelRef = useRef(null);
  const isOwnProfile = user && (user.id === id || user._id === id);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [slotToBook, setSlotToBook] = useState(null);

  const slotsByDay = useMemo(() => {
    const groups = {};
    slots.forEach(slot => {
      if (!slot.date) return;
      const d = new Date(slot.date);
      if (isNaN(d.getTime())) return;
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const dayVal = String(d.getDate()).padStart(2, '0');
      const dateKey = `${year}-${month}-${dayVal}`;
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(slot);
    });
    return groups;
  }, [slots]);

  const days = useMemo(() => Object.keys(slotsByDay).sort(), [slotsByDay]);
  const [activeDay, setActiveDay] = useState(null);

  useEffect(() => {
    if (days.length > 0 && (!activeDay || !days.includes(activeDay))) {
      setActiveDay(days[0]);
    }
  }, [days, activeDay]);

  useSEO({ title: mentor?.name ? `${mentor.name} — Senior Profile` : 'Senior Profile', description: mentor ? `Book a 20-minute 1:1 session with ${mentor.name} from ${mentor.college || 'top college'} on Clarior.` : 'Find and book verified seniors on Clarior.' });

  const load = async () => {
    try {
      setError(""); setLoading(true);
      const res = await api.get(`/users/seniors/${id}`);
      setMentor(res.data.senior);
      const slotRes = await api.get(`/slots/senior/${id}?available=true`);
      setSlots(slotRes.data.slots || []);
      const reviewRes = await api.get('/reviews/' + id);
      setReviews(reviewRes.data.reviews || []);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 404) {
        setError("Mentor not found");
      } else {
        setError(err?.response?.data?.message || "Failed to load senior");
      }
    } finally { setLoading(false); }
  };

  useEffect(() => {
    load();
  }, [id]);

  const triggerBooking = (slotId) => {
    if (!user) return navigate("/login");
    if (user.callCredits === 0) return navigate("/buy-credits");
    setSlotToBook(slotId);
    setConfirmOpen(true);
  };

  const handleConfirmBooking = async () => {
    if (!slotToBook) return;
    try {
      setBookingSlot(slotToBook);
      setConfirmOpen(false);
      await api.post("/bookings", { slotId: slotToBook });
      showSuccess("Session booked! Find joining links in your dashboard.");
      setSlots(prev => prev.filter(s => s._id !== slotToBook));
    } catch (err) {
      showError(err?.response?.data?.message || "Booking failed");
    } finally {
      setBookingSlot(null);
      setSlotToBook(null);
    }
  };  const gradient = getGradient(mentor?.domain, mentor?.name || "");
  const initials = mentor?.name?.trim().split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "?";

  return (
    <>
      <Navbar />
      <main className="bg-bg min-h-screen pb-24 relative overflow-hidden">
        {/* Ambient background glow orbs */}
        <div className="absolute top-[-5%] left-[-5%] w-[60%] h-[60%] rounded-full bg-gradient-to-tr from-primary/10 to-accent/5 blur-[130px] pointer-events-none animate-float-slow" />
        <div className="absolute bottom-[10%] right-[-5%] w-[50%] h-[50%] rounded-full bg-gradient-to-bl from-accent/10 to-primary/5 blur-[140px] pointer-events-none animate-float" style={{ animationDelay: '-3s' }} />
        <div className="absolute top-[40%] left-[20%] w-[40%] h-[40%] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none animate-float-slow" style={{ animationDelay: '-6s' }} />

        <SiteContainer className="max-w-6xl relative">
          {loading && (
            <div className="space-y-8 pt-10 animate-pulse">
              {/* Banner Skeleton */}
              <div className="h-36 md:h-56 w-full bg-muted/15 rounded-3xl md:rounded-[40px]" />
              
              {/* Profile Block Skeleton */}
              <div className="flex flex-col md:flex-row items-center md:items-end gap-6 px-4 md:px-8 mt-8 md:mt-4">
                <div className="h-28 w-28 md:h-36 md:w-36 rounded-full bg-muted/20 border-[6px] border-surface" />
                <div className="flex-1 space-y-3 pb-1 w-full text-center md:text-left">
                  <div className="h-6 w-1/3 bg-muted/20 rounded-full mx-auto md:mx-0" />
                  <div className="h-4 w-1/2 bg-muted/20 rounded-full mx-auto md:mx-0" />
                </div>
              </div>

              {/* Stats Skeleton */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 md:mt-16 px-2 md:px-8">
                {[1,2,3,4].map(i => (
                  <div key={i} className="h-24 rounded-2xl bg-muted/10 border border-border/50" />
                ))}
              </div>

              {/* Main Content Split Skeleton */}
              <div className="grid lg:grid-cols-[1.8fr,1.2fr] gap-12 mt-12">
                <div className="h-64 rounded-3xl bg-muted/10" />
                <div className="h-64 rounded-3xl bg-muted/10" />
              </div>
            </div>
          )}

          {!loading && error && (
            <div className="mt-12 p-8 rounded-3xl bg-danger/5 border border-danger/20 text-center animate-scale-in">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-danger/10 text-danger">
                <StatIcon type="alert" />
              </div>
              <h2 className="text-xl font-black text-fg">{error}</h2>
              <Button variant="secondary" className="mt-6" onClick={() => navigate("/explore")}>Return to Explore</Button>
            </div>
          )}

          {!loading && mentor && (
            <div className="animate-fade-up pt-8 md:pt-12">
              {/* Info Card */}
              <div className="relative z-10">
                <div className="bg-surface/85 border border-border/60 backdrop-blur-xl rounded-[36px] p-6 sm:p-8 md:p-10 shadow-hero shadow-primary/5 hover:border-primary/20 transition-all duration-500">
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-6 w-full">
                      {/* Top Action & Verification Status */}
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <button
                          onClick={() => navigate("/explore")}
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-surface2/60 backdrop-blur border border-border text-xs font-bold text-muted hover:text-fg hover:border-primary/40 hover:scale-105 active:scale-95 transition-all shadow-sm cursor-pointer"
                        >
                          <BackIcon className="h-4 w-4 text-primary" />
                          Back to Explore
                        </button>
                      </div>

                      {/* Profile Block with Name & Avatar */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-6 pt-2">
                        <div className="relative group/avatar shrink-0">
                          {/* Inner glowing aura */}
                          <div className={`absolute -inset-1.5 rounded-full bg-gradient-to-tr ${gradient} opacity-60 blur-lg group-hover/avatar:opacity-90 transition-opacity duration-500 animate-pulse`} />
                          
                          {/* Main avatar */}
                          <div className={`relative flex h-24 w-24 md:h-28 md:w-28 items-center justify-center rounded-full border-[5px] border-surface bg-gradient-to-tr ${gradient} text-2xl md:text-4xl font-black text-white shadow-xl transition-all duration-500 group-hover/avatar:scale-105 group-hover/avatar:rotate-3`}>
                            {initials}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-fg tracking-tight leading-none flex flex-wrap items-center gap-3">
                            <span>{mentor.name}</span>
                            {mentor.isVerified && (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-500 via-success to-teal-500 text-white px-4 py-1.5 text-xs font-black uppercase tracking-wider shadow-lg shadow-success/15 select-none hover:scale-105 transition-all duration-300">
                                <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20" className="h-3.5 w-3.5">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                Verified
                              </span>
                            )}
                          </h1>
                          <p className="text-sm md:text-base font-bold text-primary flex flex-wrap items-center gap-2">
                            <span>{mentor.domain || "General Domain"}</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-border" />
                            <span className="text-muted">{mentor.branch || "Specialization"}</span>
                          </p>
                        </div>
                      </div>

                      {/* Bento Details Hub */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-border/30">
                        {/* College Widget */}
                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-surface2/60 border border-border/35 hover:border-primary/30 hover:bg-surface backdrop-blur-md hover:shadow-soft hover:scale-[1.02] transition-all duration-300 shadow-sm">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <LocationIcon className="h-6 w-6" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-[10px] font-black uppercase text-muted tracking-wider block">College</span>
                            <span className="text-sm font-black text-fg truncate block">
                              {mentor.college || "Top College"}
                            </span>
                            {mentor.affiliatedCollege && (
                              <span className="text-[10px] font-bold text-muted truncate block">
                                {mentor.affiliatedCollege}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Academic Year Widget */}
                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-surface2/60 border border-border/35 hover:border-accent/30 hover:bg-surface backdrop-blur-md hover:shadow-soft hover:scale-[1.02] transition-all duration-300 shadow-sm">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                            <CalendarIcon className="h-6 w-6" />
                          </div>
                          <div>
                            <span className="text-[10px] font-black uppercase text-muted tracking-wider block">Year of Study</span>
                            <span className="text-sm font-black text-fg block">
                              {mentor.year ? `${mentor.year}th Year Student` : "Senior"}
                            </span>
                          </div>
                        </div>

                        {/* Sessions Widget */}
                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-surface2/60 border border-border/35 hover:border-success/30 hover:bg-surface backdrop-blur-md hover:shadow-soft hover:scale-[1.02] transition-all duration-300 shadow-sm">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-success/10 text-success">
                            <AcademicIcon className="h-6 w-6" />
                          </div>
                          <div>
                            <span className="text-[10px] font-black uppercase text-muted tracking-wider block">Sessions Guided</span>
                            <span className="text-sm font-black text-fg block">
                              {mentor.sessionsCompleted || 0} Calls Completed
                            </span>
                          </div>
                        </div>

                        {/* Rating Widget */}
                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-surface2/60 border border-border/35 hover:border-warning/30 hover:bg-surface backdrop-blur-md hover:shadow-soft hover:scale-[1.02] transition-all duration-300 shadow-sm">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-warning/10 text-warning">
                            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                            </svg>
                          </div>
                          <div>
                            <span className="text-[10px] font-black uppercase text-muted tracking-wider block">Rating & Feedback</span>
                            <span className="text-sm font-black text-fg block">
                              {mentor.rating ? `${mentor.rating.toFixed(1)} / 5.0` : "New Mentor"}
                            </span>
                            <span className="text-[10px] font-bold text-muted block">
                              ({mentor.numReviews || 0} verified reviews)
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content Details Grid */}
              <div className="mt-12">
                <div className="grid lg:grid-cols-[1.8fr,1.2fr] gap-12">
                  {/* Left Column (About & Reviews) */}
                  <div className="space-y-12">
                    <section>
                      <h2 className="text-xl font-black text-fg mb-6 flex items-center gap-2">
                        <span>About {mentor.name.split(" ")[0]}</span>
                      </h2>
                      <Card className="relative overflow-hidden p-8 border border-border/50 bg-surface shadow-soft hover:shadow-soft-2 transition-all">
                        {/* Upper right soft glow orb inside about card */}
                        <div className="absolute -top-12 -right-12 w-28 h-28 rounded-full bg-primary/10 blur-xl pointer-events-none" />
                        
                        <div className="relative space-y-6">
                          <StarRow rating={mentor.rating} reviews={mentor.numReviews} />
                          
                          <div className="border-l-4 border-primary/50 pl-4 py-1">
                            <p className="text-fg/90 text-base leading-relaxed italic font-medium">
                              "{mentor.bio || "Hello! I'm here to help you navigate the complex world of college admissions and career planning. Whether you're worried about which branch to pick or how to prepare for placements, I've got you covered with honest, firsthand experience."}"
                            </p>
                          </div>
                          
                          <div className="pt-6 border-t border-border/40 grid grid-cols-2 sm:grid-cols-4 gap-6">
                            <div>
                              <div className="text-[10px] font-black text-muted uppercase tracking-widest">Domain</div>
                              <div className="mt-1.5 text-sm font-black text-primary uppercase tracking-wide">{mentor.domain || "General"}</div>
                            </div>
                            <div>
                              <div className="text-[10px] font-black text-muted uppercase tracking-widest">Year of Study</div>
                              <div className="mt-1.5 text-sm font-black text-fg">{mentor.year ? `${mentor.year}th Year` : "N/A"}</div>
                            </div>
                            <div>
                              <div className="text-[10px] font-black text-muted uppercase tracking-widest">Sessions Guided</div>
                              <div className="mt-1.5 text-sm font-black text-fg">{mentor.sessionsCompleted || 0} calls</div>
                            </div>
                            <div>
                              <div className="text-[10px] font-black text-muted uppercase tracking-widest">College</div>
                              <div className="mt-1.5 text-sm font-black text-fg truncate">{mentor.college || "N/A"}</div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </section>

                    <section>
                      <h2 className="text-xl font-black text-fg mb-6">Ratings & Reviews</h2>
                      
                      {/* Ratings Breakdown Grid */}
                      <Card className="p-6 mb-6 border border-border/50 bg-surface shadow-soft">
                        <div className="grid md:grid-cols-[1fr,2fr] gap-8 items-center">
                          {/* Left stats summary */}
                          <div className="text-center md:border-r md:border-border/40 md:pr-8 py-2">
                            <h3 className="text-5xl font-black text-fg leading-none">
                              {mentor.rating ? mentor.rating.toFixed(1) : "0.0"}
                            </h3>
                            <div className="flex justify-center text-warning gap-1 mt-3">
                              {[1,2,3,4,5].map(i => (
                                <svg key={i} width="16" height="16" fill={i <= Math.round(mentor.rating || 0) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                </svg>
                              ))}
                            </div>
                            <p className="text-xs text-muted font-bold mt-2 uppercase tracking-wider">
                              {mentor.numReviews || 0} Verified Reviews
                            </p>
                          </div>

                          {/* Right bar chart */}
                          <div className="space-y-2">
                            {[5, 4, 3, 2, 1].map((stars) => {
                              const count = reviews.filter(r => Math.round(r.rating) === stars).length;
                              const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                              return (
                                <div key={stars} className="flex items-center gap-3 text-xs">
                                  <span className="w-8 text-right font-black text-fg">{stars} ★</span>
                                  <div className="flex-1 h-3 rounded-full bg-border/40 overflow-hidden relative shadow-inner">
                                    <div 
                                      className="absolute top-0 bottom-0 left-0 rounded-full bg-gradient-to-r from-warning to-amber-400 transition-all duration-500" 
                                      style={{ width: `${pct}%` }} 
                                    />
                                  </div>
                                  <span className="w-10 text-muted font-bold text-right">{Math.round(pct)}%</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Recommendation Tags */}
                        {reviews.length > 0 && (
                          <div className="mt-6 pt-5 border-t border-border/30">
                            <span className="text-[10px] font-black uppercase text-muted tracking-wider block mb-3">Student Tags & Highlights</span>
                            <div className="flex flex-wrap gap-2">
                              {["🎓 Career Guidance", "📝 Admission Tips", "💻 Placement Prep", "💬 Extremely Friendly"].map((tag, idx) => (
                                <span key={idx} className="inline-flex items-center rounded-xl bg-primary/8 border border-primary/15 text-primary text-[10px] font-black uppercase tracking-wider px-3.5 py-1.5 shadow-sm">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </Card>

                      <h3 className="text-base font-black text-fg mb-4 uppercase tracking-wider">Recent Reviews</h3>
                      <div className="space-y-4">
                        {reviews.length === 0 ? (
                          <Card className="p-8 text-center border-dashed border-2 border-border/70 bg-surface/40 backdrop-blur-sm">
                            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary text-xl">
                              ⭐
                            </div>
                            <h4 className="font-black text-fg text-sm uppercase tracking-wider">No reviews yet</h4>
                            <p className="text-xs text-muted mt-1 font-semibold">Be the first to share your experience after booking!</p>
                          </Card>
                        ) : reviews.map((rev, idx) => {
                          const revInitials = rev.student?.name?.trim().split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "S";
                          return (
                            <Card key={rev._id || idx} className="p-6 border border-border/40 hover:border-primary/20 hover:shadow-soft transition-all duration-300 bg-surface/90">
                              <div className="flex gap-4">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-2 border border-border text-xs font-black text-muted shadow-sm">
                                  {revInitials}
                                </div>
                                <div className="flex-1 space-y-1">
                                  <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div>
                                      <div className="font-black text-fg text-sm leading-none">{rev.student?.name || "Student"}</div>
                                      <div className="text-[10px] text-muted font-bold mt-1">{formatReviewDate(rev.createdAt)}</div>
                                    </div>
                                    <div className="flex text-warning gap-0.5 bg-warning/5 px-2 py-1 rounded-lg border border-warning/10">
                                      {[1,2,3,4,5].map(i => (
                                        <svg key={i} width="10" height="10" fill={i <= rev.rating ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                        </svg>
                                      ))}
                                    </div>
                                  </div>
                                  {rev.comment && (
                                    <p className="text-sm text-fg/80 leading-relaxed font-semibold italic mt-2">
                                      "{rev.comment}"
                                    </p>
                                  )}
                                </div>
                              </div>
                            </Card>
                          );
                        })}
                      </div>
                    </section>
                  </div>

                  {/* Right Column (Booking Sidebar & Policy) */}
                  <div className="space-y-8">
                    <div ref={bookingPanelRef} id="booking-panel" className="sticky top-28 scroll-mt-32">
                      <h2 className="text-xl font-black text-fg mb-6">Choose a Slot</h2>

                      <div className="space-y-4">
                        {isOwnProfile && (
                          <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 text-center text-xs font-bold text-fg mb-4">
                            This is your public profile. You cannot book your own slots.
                          </div>
                        )}
                        {days.length > 0 ? (
                          <>
                            {/* Calendar Week Strip */}
                            <div className="flex gap-2.5 overflow-x-auto pb-3 -mx-2 px-2 scrollbar-hide">
                              {days.map((dayKey) => {
                                const parsedDate = new Date(dayKey);
                                const weekday = parsedDate.toLocaleDateString("en-IN", { weekday: "short" });
                                const dateLabel = parsedDate.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
                                const isActive = activeDay === dayKey;
                                return (
                                  <button
                                    key={dayKey}
                                    onClick={() => setActiveDay(dayKey)}
                                    className={`flex-shrink-0 px-4.5 py-3 rounded-2xl border text-center transition-all duration-300 transform cursor-pointer ${
                                      isActive
                                        ? "bg-gradient-to-tr from-primary via-blue-600 to-accent border-transparent text-white shadow-[0_8px_20px_-6px_rgba(37,99,235,0.4)] scale-105"
                                        : "bg-surface2/60 dark:bg-surface-2/40 border-border/40 text-fg hover:border-primary/40 hover:text-primary hover:scale-[1.02]"
                                    }`}
                                  >
                                    <div className={`text-[9px] font-black uppercase tracking-[0.18em] ${isActive ? "text-white/85" : "text-muted"}`}>
                                      {weekday}
                                    </div>
                                    <div className={`text-sm font-black mt-0.5 ${isActive ? "text-white" : "text-fg"}`}>
                                      {dateLabel}
                                    </div>
                                  </button>
                                );
                              })}
                            </div>

                             {/* Slots for Active Day Categorized */}
                            {(() => {
                              const activeSlots = slotsByDay[activeDay] || [];
                              
                              const categorizeTime = (timeStr) => {
                                  if (!timeStr) return "evening";
                                  const lower = timeStr.toLowerCase();
                                  if (lower.includes("am")) {
                                    const hour = parseInt(lower);
                                    if (hour < 12) return "morning";
                                  }
                                  if (lower.includes("pm")) {
                                    const hour = parseInt(lower);
                                    if (hour === 12 || hour < 5) return "afternoon";
                                    return "evening";
                                  }
                                  const hour = parseInt(timeStr.split(":")[0]);
                                  if (!isNaN(hour)) {
                                    if (hour < 12) return "morning";
                                    if (hour < 17) return "afternoon";
                                    return "evening";
                                  }
                                  return "evening";
                                };

                              const morningSlots = activeSlots.filter(s => categorizeTime(s.time) === "morning");
                              const afternoonSlots = activeSlots.filter(s => categorizeTime(s.time) === "afternoon");
                              const eveningSlots = activeSlots.filter(s => categorizeTime(s.time) === "evening");

                              const renderSlotGroup = (title, items) => {
                                if (items.length === 0) return null;
                                return (
                                  <div className="space-y-2.5 mt-5 animate-fade-up">
                                    <h4 className="text-[10px] font-black text-muted uppercase tracking-[0.2em] flex items-center gap-2 pl-1">
                                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                                      {title}
                                    </h4>
                                    <div className="grid grid-cols-1 gap-2.5">
                                      {items.map((slot) => (
                                        <div
                                          key={slot._id}
                                          className={`group flex items-center justify-between p-3.5 rounded-2xl border border-border/40 bg-surface2/60 dark:bg-surface-2/20 hover:border-primary/30 hover:bg-surface transition-all duration-300 ${
                                            bookingSlot === slot._id || isOwnProfile ? "opacity-60 pointer-events-none" : ""
                                          }`}
                                        >
                                          <div className="flex items-center gap-2.5 text-xs font-black text-fg pl-1">
                                            <span className="text-primary flex-shrink-0">
                                              <StatIcon type="clock" />
                                            </span>
                                            <span>{slot.time || slot.startTime}</span>
                                          </div>
                                          <Button
                                            disabled={bookingSlot === slot._id || isOwnProfile}
                                            onClick={() => triggerBooking(slot._id)}
                                            variant="primary"
                                            size="sm"
                                            className="rounded-xl shadow-sm hover:scale-[1.03] text-xs font-black uppercase tracking-wider"
                                          >
                                            Book
                                          </Button>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                );
                              };

                              return (
                                <div className="space-y-4">
                                  {renderSlotGroup("Morning Sessions", morningSlots)}
                                  {renderSlotGroup("Afternoon Sessions", afternoonSlots)}
                                  {renderSlotGroup("Evening Sessions", eveningSlots)}
                                </div>
                              );
                            })()}
                          </>
                        ) : (
                          <Card className="p-8 text-center border-dashed border-2 border-border/70 bg-surface">
                            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-danger/10 text-danger">
                              <StatIcon type="calendar" />
                            </div>
                            <h4 className="font-black text-fg text-sm uppercase tracking-widest">Fully Booked</h4>
                            <p className="text-xs text-muted mt-2 font-bold uppercase tracking-wider">No availability right now — check back soon!</p>
                            <Button 
                              variant="primary" 
                              className="mt-6 rounded-2xl w-full font-black uppercase tracking-wide"
                              onClick={() => {
                                showSuccess("Interest noted! We'll notify you as soon as this senior adds new slots.");
                              }}
                            >
                              🔔 Notify me when slots open
                            </Button>
                            <Button variant="secondary" className="mt-2 rounded-2xl w-full font-black uppercase tracking-wide" onClick={() => navigate("/explore")}>
                              Explore Others
                            </Button>
                          </Card>
                        )}
                      </div>

                      {/* Updated Cancellation & Refund Policy Card */}
                      <Card className="mt-8 p-6 bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/15 rounded-3xl relative overflow-hidden">
                        <div className="absolute -bottom-8 -right-8 w-20 h-20 rounded-full bg-primary/10 blur-xl pointer-events-none" />
                        
                        <div className="flex items-center gap-3 text-primary mb-3">
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                          </svg>
                          <span className="text-xs font-black uppercase tracking-[0.15em]">Cancellation & Refund</span>
                        </div>
                        <p className="text-xs text-muted leading-relaxed font-bold">
                          We only provide a credit refund if and only if a Senior cancels a booked session slot.
                        </p>
                      </Card>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </SiteContainer>
      </main>

      {/* Sticky Mobile Booking Bar */}
      {!loading && mentor && slots.length > 0 && !isOwnProfile && (
        <div className="fixed bottom-0 left-0 w-full p-4 bg-surface border-t border-border z-[60] md:hidden animate-slide-down">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-[10px] font-black uppercase text-muted tracking-widest">Next available</div>
              <div className="text-sm font-black text-fg">{new Date(slots[0].date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} • {slots[0].time || slots[0].startTime}</div>
            </div>
            <Button size="lg" className="rounded-2xl px-10 shadow-hero" onClick={() => bookingPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>
              Book (1 Credit)
            </Button>
          </div>
        </div>
      )}
      
      <ConfirmModal
        isOpen={confirmOpen}
        title="Confirm Booking"
        message="Are you sure you want to book this session? 1 Credit will be deducted from your wallet."
        confirmText="Book Slot"
        cancelText="Cancel"
        onConfirm={handleConfirmBooking}
        onCancel={() => { setConfirmOpen(false); setSlotToBook(null); }}
        loading={!!bookingSlot}
      />
      
      <Footer />
    </>
  );
}

export default Profile;
