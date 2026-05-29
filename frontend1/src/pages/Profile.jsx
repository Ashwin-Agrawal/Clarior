import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Skeleton from "../components/ui/Skeleton";
import Footer from "../components/Footer";
import SiteContainer from "../components/layout/SiteContainer";

function getGradient(name = "") {
  const g = ["from-violet-600 to-indigo-600","from-rose-600 to-pink-600","from-teal-600 to-emerald-600","from-amber-600 to-orange-600","from-blue-600 to-cyan-600","from-fuchsia-600 to-purple-600"];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return g[Math.abs(h) % g.length];
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
  const [mentor, setMentor] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bookingMsg, setBookingMsg] = useState({ type: "", text: "" });
  const [bookingSlot, setBookingSlot] = useState(null);
  const bookingPanelRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(""); setLoading(true);
        const userRes = await api.get("/users/seniors");
        const selected = userRes.data.seniors.find(u => u._id === id);
        setMentor(selected);
        const slotRes = await api.get(`/slots/senior/${id}`);
        setSlots(slotRes.data.slots || []);
      } catch (err) { setError(err?.response?.data?.message || "Failed to load senior"); } finally { setLoading(false); }
    };
    fetchData();
  }, [id]);

  const handleBooking = async (slotId) => {
    try {
      setBookingMsg({ type: "", text: "" });
      setBookingSlot(slotId);
      if (!user) return navigate("/login");
      if (user.callCredits === 0) return navigate("/buy-credits");
      await api.post("/bookings", { slotId });
      setBookingMsg({ type: "success", text: "Session booked! Find joining links in your dashboard." });
    } catch (err) { setBookingMsg({ type: "error", text: err?.response?.data?.message || "Booking failed" }); } finally { setBookingSlot(null); }
  };

  const gradient = getGradient(mentor?.name || "");
  const initials = mentor?.name?.trim().split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "?";

  return (
    <>
      <Navbar />
      <main className="bg-bg min-h-screen pb-20 relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] majestic-blob animate-float-slow opacity-20" />
        <div className="absolute bottom-[-10%] left-[-10%] majestic-blob animate-float-slow delay-500 opacity-15" />
        
        <SiteContainer className="max-w-6xl relative">
          {loading && (
            <div className="space-y-6 pt-12 animate-fade-in">
              <Skeleton className="h-[300px] rounded-[48px]" />
              <div className="grid grid-cols-3 gap-6"><Skeleton className="h-32 rounded-3xl" /><Skeleton className="h-32 rounded-3xl" /><Skeleton className="h-32 rounded-3xl" /></div>
              <Skeleton className="h-64 rounded-3xl" />
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
                <div className={`relative h-[440px] md:h-[540px] w-full rounded-[48px] overflow-hidden bg-gradient-to-br ${gradient} shadow-2xl group`}>
                  <div className="absolute inset-0 bg-black/10" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.2),transparent_70%)] animate-pulse" />
                  
                  <div className="absolute inset-0 p-8 md:p-16 flex flex-col items-center justify-center text-center">
                    <div className="flex flex-col items-center gap-6 md:gap-10">
                      <div className="flex h-32 w-32 md:h-48 md:w-48 flex-shrink-0 items-center justify-center rounded-[40px] bg-white/20 backdrop-blur-xl border border-white/40 text-white text-5xl md:text-7xl font-black shadow-2xl animate-float group-hover:scale-105 transition-transform duration-700">
                        {initials}
                      </div>
                      <div className="space-y-6">
                        <div className="flex items-center justify-center gap-2">
                          {mentor.isVerified && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-white text-primary px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.2em] shadow-xl">
                              <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                              Verified Senior
                            </span>
                          )}
                        </div>
                        <h1 className="heading-display text-6xl md:text-[100px] font-black text-white tracking-tighter leading-[0.85]">
                          {mentor.name}
                        </h1>
                        <p className="text-white/90 text-2xl md:text-3xl font-medium tracking-tight">
                          {mentor.college || "Top College"}{mentor.branch ? ` · ${mentor.branch}` : ""}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 -mt-16 relative z-10 px-4 md:px-20">
                {[
                  { label: "Sessions", value: mentor.sessionsCompleted || 0, icon: "sessions" },
                  { label: "Rating", value: typeof mentor.rating === "number" ? `${mentor.rating.toFixed(1)} / 5` : "New", icon: "rating" },
                  { label: "Experience", value: mentor.year ? `${mentor.year}th Year` : "Senior", icon: "experience" },
                  { label: "Response", value: "< 24h", icon: "response" },
                ].map(stat => (
                  <Card key={stat.label} className="p-6 md:p-8 text-center bg-surface/90 backdrop-blur-2xl shadow-hero border-white/50 dark:border-white/5 rounded-3xl">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <StatIcon type={stat.icon} />
                    </div>
                    <div className="text-2xl md:text-4xl font-black text-fg tracking-tighter">{stat.value}</div>
                    <div className="text-[10px] font-black text-muted uppercase tracking-[0.2em] mt-2">{stat.label}</div>
                  </Card>
                ))}
              </div>

              {/* Main Content Split */}
              <div className="mt-16 grid lg:grid-cols-[1.8fr,1.2fr] gap-12">
                <div className="space-y-12">
                  <section>
                    <h2 className="heading-display text-2xl font-black text-fg uppercase tracking-widest mb-6">About Me</h2>
                    <Card className="p-10 border-border/50 bg-surface/50 backdrop-blur-sm">
                      <StarRow rating={mentor.rating} reviews={mentor.numReviews} />
                      <p className="mt-8 text-fg/90 text-lg leading-relaxed font-medium">
                        {mentor.bio || "Hello! I'm here to help you navigate the complex world of college admissions and career planning. Whether you're worried about which branch to pick or how to prepare for placements, I've got you covered with honest, firsthand experience."}
                      </p>
                      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                          "Doubt solving for branch selection",
                          "Placement & internship roadmap",
                          "College life & cultural insights",
                          "Resume & profile building"
                        ].map(f => (
                          <div key={f} className="flex items-center gap-3 text-sm font-bold text-fg/70">
                            <span className="h-2 w-2 rounded-full bg-primary" />
                            {f}
                          </div>
                        ))}
                      </div>
                    </Card>
                  </section>

                  {/* Reviews Section Placeholder */}
                  <section>
                    <h2 className="heading-display text-2xl font-black text-fg uppercase tracking-widest mb-6">Recent Reviews</h2>
                    <div className="space-y-4">
                      {[
                        { u: "Rahul S.", r: 5, t: "Amazing session! Cleared all my doubts about CSE vs IT." },
                        { u: "Ananya P.", r: 5, t: "Very helpful and honest about the college placement scenario." }
                      ].map((rev, idx) => (
                        <Card key={idx} className="p-6 border-border/40 hover:border-primary/20 transition-all">
                          <div className="flex justify-between items-start mb-2">
                            <div className="font-black text-fg text-sm">{rev.u}</div>
                            <div className="flex text-warning gap-0.5">
                              {[1,2,3,4,5].map(i => <svg key={i} width="10" height="10" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>)}
                            </div>
                          </div>
                          <p className="text-sm text-muted font-medium italic">"{rev.t}"</p>
                        </Card>
                      ))}
                    </div>
                  </section>
                </div>

                {/* Booking Sidebar */}
                <div className="space-y-8">
                  <div ref={bookingPanelRef} id="booking-panel" className="sticky top-24 scroll-mt-28">
                    <h2 className="heading-display text-2xl font-black text-fg uppercase tracking-widest mb-6">Choose a Slot</h2>
                    
                    {bookingMsg.text && (
                      <div className={`mb-6 p-4 rounded-3xl text-sm font-black animate-scale-in border ${
                        bookingMsg.type === "success" ? "bg-success/5 border-success/20 text-success" : "bg-danger/5 border-danger/20 text-danger"
                      }`}>
                        {bookingMsg.text}
                      </div>
                    )}

                    <div className="space-y-4">
                      {slots.length > 0 ? (
                        slots.map((slot) => (
                          <Card key={slot._id} className="group p-6 flex justify-between items-center gap-4 hover:border-primary/40 hover:shadow-soft transition-all cursor-pointer" onClick={() => handleBooking(slot._id)}>
                            <div>
                              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted mb-2 group-hover:text-primary transition-colors">Available</div>
                              <div className="font-black text-fg text-lg">
                                {new Date(slot.date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
                              </div>
                              <div className="mt-1 flex items-center gap-1.5 text-sm font-bold text-muted">
                                <StatIcon type="clock" />
                                {slot.time || slot.startTime}
                              </div>
                            </div>
                            <Button
                              onClick={(e) => { e.stopPropagation(); handleBooking(slot._id); }}
                              loading={bookingSlot === slot._id}
                              size="lg"
                              className="rounded-2xl shadow-soft"
                            >
                              ₹69
                            </Button>
                          </Card>
                        ))
                      ) : (
                        <Card className="p-12 text-center border-dashed">
                          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface2 text-muted">
                            <StatIcon type="calendar" />
                          </div>
                          <h4 className="font-black text-fg uppercase tracking-widest">Fully Booked</h4>
                          <p className="text-xs text-muted mt-2 font-bold uppercase tracking-wider">No slots available right now. Check back later!</p>
                          <Button variant="secondary" className="mt-8 rounded-full w-full" onClick={() => navigate("/explore")}>Explore Others</Button>
                        </Card>
                      )}
                    </div>

                    <Card className="mt-8 p-6 bg-surface2/50 border-border/40">
                      <div className="flex items-center gap-3 text-primary">
                        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                        <span className="text-[11px] font-black uppercase tracking-[0.15em]">Money Back Guarantee</span>
                      </div>
                      <p className="text-[10px] text-muted font-bold mt-2 uppercase leading-relaxed tracking-wider">
                        Not satisfied with your session? Contact support within 24h for a full credit refund.
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
        <div className="fixed bottom-0 left-0 w-full p-4 bg-surface/80 backdrop-blur-xl border-t border-border z-[60] md:hidden animate-slide-down">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-[10px] font-black uppercase text-muted tracking-widest">Next available</div>
              <div className="text-sm font-black text-fg">{new Date(slots[0].date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} • {slots[0].time}</div>
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
