import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import AppShell from "../components/AppShell";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import useSEO from "../hooks/useSEO";

const SESSION_SECONDS = 25 * 60;

async function loadSessionBooking({ bookingId, setError, setLoading, setBooking }) {
  setError("");
  setLoading(true);
  try {
    const res = await api.get(`/bookings/${bookingId}`);
    setBooking(res.data.booking);
  } catch (e) {
    setError(e?.response?.data?.message || "Failed to load session");
  } finally {
    setLoading(false);
  }
}

function SessionTimer({ actualStart }) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const remaining = useMemo(() => {
    if (!actualStart) return SESSION_SECONDS;
    const elapsed = Math.floor((now - actualStart) / 1000);
    return Math.max(0, SESSION_SECONDS - elapsed);
  }, [actualStart, now]);

  const remainingLabel = useMemo(() => {
    const m = Math.floor(remaining / 60);
    const s = remaining % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  }, [remaining]);

  const percentage = (remaining / SESSION_SECONDS) * 100;

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-surface2/50 rounded-3xl border border-border shadow-inner">
      <div className="relative flex items-center justify-center h-40 w-40">
        <svg className="h-full w-full -rotate-90">
          <circle cx="50%" cy="50%" r="45%" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-muted/10" />
          <circle cx="50%" cy="50%" r="45%" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="283" strokeDashoffset={283 - (283 * percentage) / 100} className="text-primary transition-all duration-1000" strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-3xl font-black text-fg tabular-nums">{remainingLabel}</div>
          <div className="text-[10px] font-bold text-muted uppercase tracking-widest mt-1">Remaining</div>
        </div>
      </div>
      <div className="mt-4 text-xs font-bold text-muted text-center leading-tight">
        {remaining === 0 ? <span className="text-success">Session Complete</span> : "Keep talking until the timer ends"}
      </div>
    </div>
  );
}

function Session() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewMsg, setReviewMsg] = useState("");

  const [newMeetLink, setNewMeetLink] = useState("");
  const [meetLinkLoading, setMeetLinkLoading] = useState(false);
  const [meetLinkMsg, setMeetLinkMsg] = useState("");

  const [prevBookingMeetLink, setPrevBookingMeetLink] = useState(null);

  useEffect(() => {
    if (booking?.meetLink && booking.meetLink !== prevBookingMeetLink) {
      setPrevBookingMeetLink(booking.meetLink);
      setNewMeetLink(booking.meetLink);
    }
  }, [booking?.meetLink]);

  const updateMeetLink = async () => {
    setMeetLinkMsg("");
    if (!newMeetLink) {
      setMeetLinkMsg("Please enter a meeting link");
      return;
    }
    setMeetLinkLoading(true);
    try {
      const res = await api.patch(`/bookings/meet-link/${bookingId}`, { meetLink: newMeetLink });
      setBooking((b) => (b ? { ...b, meetLink: res.data.meetLink } : b));
      setMeetLinkMsg("Meet link updated successfully!");
    } catch (e) {
      setMeetLinkMsg(e?.response?.data?.message || "Failed to update meet link");
    } finally {
      setMeetLinkLoading(false);
    }
  };

  const load = async () => {
    await loadSessionBooking({ bookingId, setError, setLoading, setBooking });
  };

  useEffect(() => {
    loadSessionBooking({ bookingId, setError, setLoading, setBooking });
  }, [bookingId]);

  const actualStart = useMemo(() => {
    if (!booking?.actualStartTime) return null;
    const d = new Date(booking.actualStartTime);
    return isNaN(d.getTime()) ? null : d;
  }, [booking]);

  const startCall = async () => {
    try {
      const res = await api.patch(`/bookings/start/${bookingId}`);
      setBooking((b) => (b ? { ...b, isCallStarted: true, actualStartTime: res.data.startTime } : b));
    } catch (e) { alert(e?.response?.data?.message || "Error starting call"); }
  };

  const seniorComplete = async () => {
    try {
      await api.patch(`/bookings/senior-complete/${bookingId}`);
      setBooking((b) => (b ? { ...b, isSeniorMarkedDone: true } : b));
    } catch (e) { alert(e?.response?.data?.message || "Error marking done"); }
  };

  const studentConfirm = async () => {
    try {
      await api.patch(`/bookings/student-confirm/${bookingId}`);
      setBooking((b) => (b ? { ...b, isStudentConfirmed: true, status: "completed" } : b));
    } catch (e) { alert(e?.response?.data?.message || "Error confirming"); }
  };

  const submitReview = async () => {
    setReviewMsg("");
    try {
      const seniorId = typeof booking.senior === "string" ? booking.senior : booking.senior?._id;
      await api.post("/reviews", { seniorId, rating: Number(rating), comment });
      setReviewMsg("Review submitted.");
    } catch (e) { setReviewMsg(e?.response?.data?.message || "Review failed"); }
  };

  return (
    <AppShell title="Session Room" subtitle="Manage your active session and track the 25-minute timer.">
      <div className="flex justify-between items-center mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate("/bookings")} className="rounded-xl">
          Back to sessions
        </Button>
        <Button variant="secondary" size="sm" onClick={load} loading={loading} className="rounded-xl">
          Refresh
        </Button>
      </div>

      {loading && <div className="animate-pulse space-y-6">
        <div className="h-64 bg-surface2 rounded-3xl" />
        <div className="h-40 bg-surface2 rounded-3xl" />
      </div>}
      
      {!loading && error && (
        <div className="rounded-2xl border border-danger/30 bg-danger/5 px-6 py-4 text-sm text-danger">
          {error}
        </div>
      )}

      {!loading && booking && (
        <div className="space-y-6 animate-fade-up">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Session Info */}
            <Card className="lg:col-span-2 p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted mb-1">Session Status</div>
                  <div className="text-3xl font-black text-fg uppercase tracking-tight">{booking.status}</div>
                </div>
                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center text-xl shadow-soft ${
                  booking.status === "confirmed" ? "bg-success/10 text-success" : "bg-primary/10 text-primary"
                }`}>
                  {booking.status === "confirmed" ? "⚡" : "✅"}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-6 pt-4 border-t border-border/50">
                <div className="space-y-1">
                  <div className="text-[9px] font-bold text-muted uppercase tracking-widest">Meeting Link</div>
                  <div className="mt-1">
                    {booking.meetLink ? (
                      <a href={booking.meetLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline group">
                        Open Google Meet
                        <svg className="group-hover:translate-x-1 transition-transform" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3"/></svg>
                      </a>
                    ) : <span className="text-sm text-muted italic">Not generated yet</span>}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-[9px] font-bold text-muted uppercase tracking-widest">Partner</div>
                  <div className="text-sm font-bold text-fg">
                    {user?.role === "student" ? booking.senior?.name : booking.student?.name}
                  </div>
                </div>
              </div>

              {user?.role === "senior" && booking.status === "confirmed" && (
                <div className="mt-6 pt-6 border-t border-border/50 space-y-3">
                  <div className="text-[9px] font-bold text-muted uppercase tracking-widest">Manage Google Meet Link</div>
                  <div className="flex gap-3">
                    <Input
                      placeholder="e.g. https://meet.google.com/abc-defg-hij"
                      value={newMeetLink}
                      onChange={(e) => setNewMeetLink(e.target.value)}
                      className="flex-1"
                    />
                    <Button onClick={updateMeetLink} loading={meetLinkLoading} className="rounded-2xl">
                      Update Link
                    </Button>
                  </div>
                  {meetLinkMsg && (
                    <div className={`text-xs font-bold ${meetLinkMsg.includes("successfully") ? "text-success" : "text-danger"}`}>
                      {meetLinkMsg}
                    </div>
                  )}
                </div>
              )}

              <div className="flex flex-wrap gap-3 pt-6">
                {user?.role === "student" && booking.status === "confirmed" && !booking.isCallStarted && (
                  <Button onClick={startCall} size="lg" className="rounded-2xl flex-1 sm:flex-none">Confirm Start</Button>
                )}
                {user?.role === "senior" && booking.isCallStarted && !booking.isSeniorMarkedDone && (
                  <Button onClick={seniorComplete} size="lg" className="rounded-2xl flex-1 sm:flex-none">Mark Completed</Button>
                )}
                {user?.role === "student" && booking.isSeniorMarkedDone && !booking.isStudentConfirmed && (
                  <Button onClick={studentConfirm} size="lg" className="rounded-2xl flex-1 sm:flex-none">Confirm Completion</Button>
                )}
              </div>

              <div className="flex flex-wrap gap-4 pt-4 border-t border-border/50">
                {[
                  { label: "Call Started", val: booking.isCallStarted },
                  { label: "Senior Marked", val: booking.isSeniorMarkedDone },
                  { label: "Student Confirmed", val: booking.isStudentConfirmed },
                ].map(st => (
                  <div key={st.label} className="flex items-center gap-1.5">
                    <span className={`h-1.5 w-1.5 rounded-full ${st.val ? "bg-success" : "bg-muted/30"}`} />
                    <span className="text-[10px] font-bold text-muted uppercase tracking-wider">{st.label}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Timer Panel */}
            <SessionTimer actualStart={actualStart} />
          </div>

          {/* Review Section */}
          {user?.role === "student" && booking.status === "completed" && (
            <Card className="p-8 animate-fade-up">
              <h3 className="heading-display text-2xl font-extrabold text-fg mb-2">Rate your senior</h3>
              <p className="text-sm text-muted mb-8">Your feedback helps us maintain high quality guidance.</p>

              <div className="space-y-6 max-w-xl">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-muted mb-3">Rating</div>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((r) => (
                      <button key={r} onClick={() => setRating(r)} className={`h-12 w-12 rounded-2xl flex items-center justify-center text-lg font-bold transition-all ${
                        rating === r ? "bg-primary text-white shadow-lift scale-110" : "bg-surface2 text-muted hover:bg-border"
                      }`}>
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-muted mb-3">Your Feedback</div>
                  <textarea
                    className="w-full rounded-2xl border border-border bg-surface2 p-4 text-sm text-fg outline-none focus:ring-2 focus:ring-primary/20 transition"
                    rows={4}
                    placeholder="Tell us what you learned..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                </div>

                <div className="flex items-center gap-4">
                  <Button onClick={submitReview} size="lg" className="rounded-2xl px-10">Submit Review</Button>
                  {reviewMsg && <span className="text-sm font-bold text-success animate-scale-in">{reviewMsg}</span>}
                </div>
              </div>
            </Card>
          )}
        </div>
      )}
    </AppShell>
  );
}

export default Session;
