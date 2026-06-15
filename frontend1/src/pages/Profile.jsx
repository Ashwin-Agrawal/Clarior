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

  const slotsByDay = useMemo(() => {
    const groups = {};
    slots.forEach(slot => {
      const dateStr = new Date(slot.date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
      if (!groups[dateStr]) groups[dateStr] = [];
      groups[dateStr].push(slot);
    });
    return groups;
  }, [slots]);

  const days = useMemo(() => Object.keys(slotsByDay), [slotsByDay]);
  const [activeDay, setActiveDay] = useState(null);

    useEffect(() => {
      if (days.length > 0 && !activeDay) {
        setActiveDay(days[0]);
      }
    }, [days, activeDay]);

  useSEO({ title: mentor?.name ? `${mentor.name} — Senior Profile` : 'Senior Profile', description: mentor ? `Book a 20-minute 1:1 session with ${mentor.name} from ${mentor.college || 'top college'} on Clarior.` : 'Find and book verified seniors on Clarior.' });

  const load = async () => {
    try {
      setError(""); setLoading(true);
      const res = await api.get(`/users/seniors/${id}`);
      setMentor(res.data.senior);
      const slotRes = await api.get(`/slots/senior/${id}`);
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

  const handleBooking = async (slotId) => {
    try {
      setBookingSlot(slotId);
      if (!user) return navigate("/login");
      if (user.callCredits === 0) return navigate("/buy-credits");
      await api.post("/bookings", { slotId });
      showSuccess("Session booked! Find joining links in your dashboard.");
      setSlots(prev => prev.filter(s => s._id !== slotId));
    } catch (err) {
      showError(err?.response?.data?.message || "Booking failed");
    } finally {
      setBookingSlot(null);
    }
  };

  const gradient = getGradient(mentor?.domain, mentor?.name || "");
  const initials = mentor?.name?.trim().split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "?";

  return (
    <>
      <Navbar />
      <main className="bg-bg min-h-screen pb-20 relative overflow-hidden">

        
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
            <div className="animate-fade-up">
              {/* Hero Banner Area */}
              <div className="relative pt-10">
                <div className={`relative h-36 md:h-56 w-full rounded-3xl md:rounded-[40px] overflow-hidden bg-gradient-to-br ${gradient} shadow-lg group`}>
                  <div className="absolute inset-0 bg-black/10" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_60%)]" />
                </div>

                {/* Profile Avatar & Info Block */}
                <div className="flex flex-col md:flex-row items-center md:items-end gap-6 px-6 md:px-12 mt-6 md:mt-2 relative z-10">
                  <div className="flex h-28 w-28 md:h-36 md:w-36 shrink-0 items-center justify-center rounded-full border-[6px] border-surface bg-surface-2 -mt-14 md:-mt-20 text-3xl font-black text-fg shadow-xl md:text-5xl z-20">
                    {initials}
                  </div>
                  
                  <div className="flex-1 text-center md:text-left space-y-2 pb-2">
                    <div className="flex flex-wrap items-center gap-3 justify-center md:justify-start">
                      <h1 className="heading-display text-3xl md:text-5xl font-black text-fg tracking-tight leading-none">
                        {mentor.name}
                      </h1>
                      {mentor.isVerified && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 text-success border border-success/20 px-3 py-1 text-[10px] font-black uppercase tracking-wider select-none">
                          <svg width="12" height="12" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                          Verified
                        </span>
                      )}
                    </div>
                    <p className="text-muted text-sm md:text-lg font-semibold">
                      {mentor.college || "Top College"}{mentor.branch ? ` · ${mentor.branch}` : ""}
                    </p>
                  </div>
                </div>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-12 md:mt-16 px-2 md:px-8">
                {[
                  { label: "Sessions", value: mentor.sessionsCompleted || 0, icon: "sessions" },
                  { label: "Rating", value: typeof mentor.rating === "number" ? `${mentor.rating.toFixed(1)} / 5` : "New", icon: "rating" },
                  { label: "Experience", value: mentor.year ? `${mentor.year}th Year` : "Senior", icon: "experience" },
                  { label: "Response", value: "< 24h", icon: "response" },
                ].map(stat => (
                  <Card key={stat.label} className="p-5 flex items-center gap-4 bg-surface border border-border/50 rounded-2xl hover:shadow-soft transition-all">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <StatIcon type={stat.icon} />
                    </div>
                    <div>
                      <div className="text-[9px] font-black text-muted uppercase tracking-widest leading-none">{stat.label}</div>
                      <div className="text-lg font-black text-fg mt-1 leading-none">{stat.value}</div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Main Content Split */}
              <div className="mt-12 grid lg:grid-cols-[1.8fr,1.2fr] gap-12">
                <div className="space-y-12">
                  <section>
                    <h2 className="text-xl font-black text-fg mb-6">About</h2>
                    <Card className="p-8 border-border/50 bg-surface">
                      <StarRow rating={mentor.rating} reviews={mentor.numReviews} />
                      <p className="mt-6 text-fg/90 text-base leading-relaxed">
                        {mentor.bio || "Hello! I'm here to help you navigate the complex world of college admissions and career planning. Whether you're worried about which branch to pick or how to prepare for placements, I've got you covered with honest, firsthand experience."}
                      </p>
                      
                      <div className="mt-8 pt-6 border-t border-border/60 grid grid-cols-2 sm:grid-cols-4 gap-6">
                        <div>
                          <div className="text-[10px] font-black text-muted uppercase tracking-widest">Domain</div>
                          <div className="mt-1 text-sm font-black text-primary">{mentor.domain || "General"}</div>
                        </div>
                        <div>
                          <div className="text-[10px] font-black text-muted uppercase tracking-widest">Year of Study</div>
                          <div className="mt-1 text-sm font-black text-fg">{mentor.year ? `${mentor.year}th Year` : "N/A"}</div>
                        </div>
                        <div>
                          <div className="text-[10px] font-black text-muted uppercase tracking-widest">Sessions Guided</div>
                          <div className="mt-1 text-sm font-black text-fg">{mentor.sessionsCompleted || 0} calls</div>
                        </div>
                        <div>
                          <div className="text-[10px] font-black text-muted uppercase tracking-widest">College</div>
                          <div className="mt-1 text-sm font-black text-fg truncate">{mentor.college || "N/A"}</div>
                        </div>
                      </div>
                    </Card>
                  </section>

                  <section>
                    <h2 className="text-xl font-black text-fg mb-6">Recent Reviews</h2>
                    <div className="space-y-4">
                      {reviews.length === 0 ? (
                        <Card className="p-8 text-center border-dashed border-2 bg-surface/50">
                          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/5 text-primary text-xl">
                            ⭐
                          </div>
                          <p className="text-sm text-fg font-black">No reviews yet</p>
                          <p className="text-xs text-muted mt-1 font-semibold">Be the first to review after your slot!</p>
                        </Card>
                      ) : reviews.map((rev, idx) => (
                        <Card key={rev._id || idx} className="p-6 border-border/40 hover:border-primary/20 transition-all">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <div className="font-black text-fg text-sm">{rev.student?.name || "Student"}</div>
                              <div className="text-[10px] text-muted font-bold mt-0.5">{formatReviewDate(rev.createdAt)}</div>
                            </div>
                            <div className="flex text-warning gap-0.5">
                              {[1,2,3,4,5].map(i => (
                                <svg key={i} width="12" height="12" fill={i <= rev.rating ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                </svg>
                              ))}
                            </div>
                          </div>
                          {rev.comment && <p className="text-sm text-muted italic">"{rev.comment}"</p>}
                        </Card>
                      ))}
                    </div>
                  </section>
                </div>

                {/* Booking Sidebar */}
                <div className="space-y-8">
                  <div ref={bookingPanelRef} id="booking-panel" className="sticky top-24 scroll-mt-28">
                    <h2 className="text-xl font-black text-fg mb-6">Choose a Slot</h2>

                    <div className="space-y-4">
                      {days.length > 0 ? (
                        <>
                          {/* Calendar Week Strip */}
                          <div className="flex gap-2 overflow-x-auto pb-3 -mx-2 px-2 scrollbar-hide">
                            {days.map((day) => (
                              <button
                                key={day}
                                onClick={() => setActiveDay(day)}
                                className={`flex-shrink-0 px-4 py-3 rounded-2xl border text-center transition-all cursor-pointer ${
                                  activeDay === day
                                    ? "bg-primary border-primary text-white shadow-md"
                                    : "bg-surface border-border text-muted hover:border-primary/40 hover:text-fg"
                                }`}
                              >
                                <div className="text-[9px] font-black uppercase tracking-wider opacity-70">
                                  {day.split(" ")[0].replace(",", "")}
                                </div>
                                <div className="text-xs font-black mt-0.5">
                                  {day.split(" ").slice(1).join(" ")}
                                </div>
                              </button>
                            ))}
                          </div>

                          {/* Slots for Active Day */}
                          <div className="space-y-3 mt-4">
                            {(slotsByDay[activeDay] || []).map((slot) => (
                              <Card 
                                key={slot._id} 
                                className="group p-5 flex justify-between items-center gap-4 hover:border-primary/40 hover:shadow-soft transition-all cursor-pointer bg-surface"
                                onClick={() => handleBooking(slot._id)}
                              >
                                <div>
                                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-success mb-1">Available</div>
                                  <div className="mt-1 flex items-center gap-1.5 text-sm font-bold text-fg">
                                    <StatIcon type="clock" />
                                    {slot.time || slot.startTime}
                                  </div>
                                </div>
                                <Button
                                  onClick={(e) => { e.stopPropagation(); handleBooking(slot._id); }}
                                  loading={bookingSlot === slot._id}
                                  size="md"
                                  className="rounded-xl px-6"
                                >
                                  Book ₹69
                                </Button>
                              </Card>
                            ))}
                          </div>
                        </>
                      ) : (
                        <Card className="p-8 text-center border-dashed border-2 bg-surface">
                          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-danger/5 text-danger">
                            <StatIcon type="calendar" />
                          </div>
                          <h4 className="font-black text-fg text-sm uppercase tracking-widest">Fully Booked</h4>
                          <p className="text-xs text-muted mt-2 font-bold uppercase tracking-wider">No availability right now — check back soon!</p>
                          <Button 
                            variant="primary" 
                            className="mt-6 rounded-2xl w-full"
                            onClick={() => {
                              showSuccess("Interest noted! We'll notify you as soon as this senior adds new slots.");
                            }}
                          >
                            🔔 Notify me when slots open
                          </Button>
                          <Button variant="secondary" className="mt-2 rounded-2xl w-full" onClick={() => navigate("/explore")}>
                            Explore Others
                          </Button>
                        </Card>
                      )}
                    </div>

                    <Card className="mt-8 p-6 bg-primary/5 border-primary/15">
                      <div className="flex items-center gap-3 text-primary mb-3">
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                        <span className="text-xs font-black uppercase tracking-[0.15em]">Money Back Guarantee</span>
                      </div>
                      <p className="text-xs text-muted leading-relaxed">
                        Not satisfied with your session? Contact support within 24 hours for a full credit refund.
                      </p>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          )}
        </SiteContainer>
      </main>

      {/* Sticky Mobile Booking Bar */}
      {!loading && mentor && slots.length > 0 && (
        <div className="fixed bottom-0 left-0 w-full p-4 bg-surface border-t border-border z-[60] md:hidden animate-slide-down">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-[10px] font-black uppercase text-muted tracking-widest">Next available</div>
              <div className="text-sm font-black text-fg">{new Date(slots[0].date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} • {slots[0].time || slots[0].startTime}</div>
            </div>
            <Button size="lg" className="rounded-2xl px-10 shadow-hero" onClick={() => bookingPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>
              Book ₹69
            </Button>
          </div>
        </div>
      )}
      
      <Footer />
    </>
  );
}

export default Profile;
