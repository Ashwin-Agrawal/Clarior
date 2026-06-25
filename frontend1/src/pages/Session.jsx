import { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import AppShell from "../components/AppShell";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import useSEO from "../hooks/useSEO";

const SESSION_SECONDS = 20 * 60;

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

  const progressColorClass = useMemo(() => {
    if (percentage > 50) return "from-emerald-500 to-green-400 shadow-[0_0_12px_rgba(16,185,129,0.3)]";
    if (percentage > 20) return "from-amber-500 to-orange-400 shadow-[0_0_12px_rgba(245,158,11,0.3)]";
    return "from-rose-500 to-red-400 animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.4)]";
  }, [percentage]);

  return (
    <Card className="p-6 flex flex-col justify-between hover:shadow-lift hover:border-primary/20 transition-all duration-300">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-sm font-black text-fg uppercase tracking-widest text-muted">Session Duration</h3>
            <p className="text-xs text-muted/80 font-semibold">20 min Call Countdown</p>
          </div>
          <div className="text-2xl font-black text-fg font-mono tracking-tight tabular-nums bg-surface2 px-3 py-1.5 rounded-xl border border-border/50">
            {remainingLabel}
          </div>
        </div>

        {/* Premium Horizontal Linear Progress Bar */}
        <div className="space-y-2 pt-2">
          <div className="relative h-3 w-full rounded-full bg-border/40 overflow-hidden shadow-inner">
            <div
              className={`absolute top-0 bottom-0 left-0 rounded-full bg-gradient-to-r transition-all duration-1000 ${progressColorClass}`}
              style={{ width: `${percentage}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] font-black text-muted uppercase tracking-wider">
            <span>Start</span>
            <span>{remaining === 0 ? "Call Completed" : `${Math.ceil(remaining / 60)} mins left`}</span>
            <span>End</span>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-border/50 text-xs font-semibold text-muted text-center leading-relaxed">
        {remaining === 0 ? (
          <span className="text-success font-bold flex items-center justify-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-success animate-ping" />
            Call Completed! Please submit confirmation below.
          </span>
        ) : (
          "Keep the Google Meet session active until the timer completes."
        )}
      </div>
    </Card>
  );
}

function Session() {
  useSEO({ title: "Live Session Room", description: "Join your live 1:1 call with a verified mentor on Clarior." });
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [joinedLobby, setJoinedLobby] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const toggleCamera = async () => {
    if (cameraActive) {
      if (stream) {
        stream.getVideoTracks().forEach(track => track.stop());
        setStream(null);
      }
      setCameraActive(false);
    } else {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        setCameraActive(true);
      } catch (err) {
        console.error("Error accessing webcam:", err);
        setCameraActive(false);
      }
    }
  };

  const toggleMic = () => {
    setMicActive(!micActive);
  };

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewMsg, setReviewMsg] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const [newMeetLink, setNewMeetLink] = useState("");
  const [meetLinkLoading, setMeetLinkLoading] = useState(false);
  const [meetLinkMsg, setMeetLinkMsg] = useState("");

  const [actionError, setActionError] = useState("");

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
    setActionError("");
    try {
      const res = await api.patch(`/bookings/start/${bookingId}`);
      setBooking((b) => (b ? {
        ...b,
        isStudentStarted: res.data.isStudentStarted,
        isSeniorStarted: res.data.isSeniorStarted,
        isCallStarted: res.data.isCallStarted,
        actualStartTime: res.data.startTime
      } : b));
    } catch (e) { setActionError(e?.response?.data?.message || "Error starting call"); }
  };

  const seniorComplete = async () => {
    setActionError("");
    try {
      await api.patch(`/bookings/senior-complete/${bookingId}`);
      setBooking((b) => (b ? { ...b, isSeniorMarkedDone: true } : b));
    } catch (e) { setActionError(e?.response?.data?.message || "Error marking done"); }
  };

  const studentConfirm = async () => {
    setActionError("");
    try {
      await api.patch(`/bookings/student-confirm/${bookingId}`);
      setBooking((b) => (b ? { ...b, isStudentConfirmed: true, status: "completed" } : b));
    } catch (e) { setActionError(e?.response?.data?.message || "Error confirming"); }
  };

  const submitReview = async () => {
    setReviewMsg("");
    setSubmittingReview(true);
    try {
      const seniorId = typeof booking.senior === "string" ? booking.senior : booking.senior?._id;
      await api.post("/reviews", { bookingId, seniorId, rating: Number(rating), comment });
      setReviewMsg("Review submitted.");
    } catch (e) {
      setReviewMsg(e?.response?.data?.message || "Review failed");
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <AppShell title="Session Room" subtitle="Manage your active session and track the 20-minute timer.">
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

      {!loading && booking && !joinedLobby && booking.status !== "completed" && booking.status !== "cancelled" ? (
        <div className="max-w-3xl mx-auto space-y-8 animate-fade-up">
          {/* Pre-Session Header */}
          <section className="relative overflow-hidden rounded-[36px] border border-border/80 bg-surface/90 p-8 shadow-[0_20px_60px_rgba(37,99,235,0.06)]">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary px-3.5 py-1 text-[10px] font-black uppercase tracking-wider">
                Setup Lobby
              </span>
              <h2 className="text-2xl font-black text-fg tracking-tight">Audio & Video Check</h2>
              <p className="text-sm font-semibold text-muted leading-relaxed">
                Test your devices before joining the scheduled mentorship room.
              </p>
            </div>
          </section>

          {/* Lobby Content Split */}
          <div className="grid md:grid-cols-[1.2fr,1fr] gap-6">
            {/* Left: Device Testing */}
            <Card className="p-6 space-y-6 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest text-muted mb-4">Webcam & Microphone</h3>
                
                {/* Visualizer Box */}
                <div className="relative aspect-video rounded-2xl bg-surface2 border border-border/60 overflow-hidden flex items-center justify-center">
                  {cameraActive ? (
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover transform -scale-x-100" />
                  ) : (
                    <div className="text-center space-y-3">
                      <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary text-xl">
                        📹
                      </div>
                      <div className="text-xs font-bold text-fg">Camera is turned off</div>
                      <p className="text-[10px] text-muted max-w-xs mx-auto">Toggle camera to preview your video layout</p>
                    </div>
                  )}

                  {/* sound visualizer overlay */}
                  {micActive && (
                    <div className="absolute bottom-3 left-3 right-3 flex items-center gap-1 bg-surface/85 backdrop-blur-md px-3 py-2 rounded-xl border border-border/50">
                      <div className="flex gap-0.5 items-end h-3">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div
                            key={i}
                            className="w-0.5 rounded-full bg-primary animate-pulse"
                            style={{
                              height: `${Math.random() * 100}%`,
                              animationDuration: `${0.3 + i * 0.15}s`
                            }}
                          />
                        ))}
                      </div>
                      <span className="text-[9px] font-black uppercase text-muted tracking-wider">Audio Input Active</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Toggles */}
              <div className="flex gap-3 mt-4 pt-4 border-t border-border/40">
                <Button
                  onClick={toggleCamera}
                  variant={cameraActive ? "primary" : "secondary"}
                  className="flex-1 rounded-xl text-xs font-black uppercase tracking-wider py-3"
                >
                  {cameraActive ? "Disable Cam" : "Enable Cam"}
                </Button>
                <Button
                  onClick={toggleMic}
                  variant={micActive ? "primary" : "secondary"}
                  className="flex-1 rounded-xl text-xs font-black uppercase tracking-wider py-3"
                >
                  {micActive ? "Mute Mic" : "Unmute Mic"}
                </Button>
              </div>
            </Card>

            {/* Right: Readiness Checklist */}
            <Card className="p-6 space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <h3 className="text-sm font-black uppercase tracking-widest text-muted">Readiness Checklist</h3>
                <ul className="space-y-3.5">
                  {[
                    { title: "Stable Connection", desc: "Ensure you are in a quiet room with good network reception." },
                    { title: "Microphone Active", desc: "Keep your audio unmuted so the mentor can hear you." },
                    { title: "Ready Questions", desc: "Write down your key queries to make the most of the 20 minutes." }
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-lg bg-success/15 border border-success/20 text-success text-[10px] font-bold">
                        ✓
                      </div>
                      <div>
                        <div className="text-xs font-black text-fg">{item.title}</div>
                        <div className="text-[10px] text-muted mt-0.5 leading-relaxed">{item.desc}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <Button
                onClick={() => {
                  if (stream) {
                    stream.getTracks().forEach(track => track.stop());
                  }
                  setJoinedLobby(true);
                }}
                className="w-full rounded-2xl py-3.5 shadow-hero font-black uppercase tracking-wider"
              >
                Enter Call Room
              </Button>
            </Card>
          </div>
        </div>
      ) : !loading && booking && (
        <div className="space-y-8 animate-fade-up">
          {/* 1. Full-Width Hero Status Banner */}
          {(() => {
            let statusTitle = "Waiting to Start";
            let statusDesc = "The session has been scheduled. Once it's time, please click 'Confirm Start' below to check in.";
            let statusBadge = "bg-muted/10 text-muted border-border/80";
            let glowColor = "bg-primary/10";
            
            if (booking.status === "completed") {
              statusTitle = "Session Completed";
              statusDesc = "Thank you! The session has been successfully completed. You can leave feedback below.";
              statusBadge = "bg-success/10 text-success border-success/20";
              glowColor = "bg-success/10";
            } else if (booking.isCallStarted) {
              if (booking.isSeniorMarkedDone) {
                statusTitle = "Awaiting Confirmation";
                statusDesc = "The senior has completed the session. Student, please verify and confirm below.";
                statusBadge = "bg-amber-500/10 text-amber-500 border-amber-500/20";
                glowColor = "bg-amber-500/10";
              } else {
                statusTitle = "Call is Live!";
                statusDesc = "The 20-minute session countdown is active. Join Google Meet and start talking now!";
                statusBadge = "bg-success/15 text-success border-success/20 animate-pulse";
                glowColor = "bg-success/15 shadow-[0_0_50px_rgba(16,185,129,0.15)]";
              }
            } else if (booking.isStudentStarted || booking.isSeniorStarted) {
              statusTitle = "Checking In...";
              statusDesc = "One partner has checked in. Waiting for the other participant to join to start the call.";
              statusBadge = "bg-primary/10 text-primary border-primary/20 animate-pulse";
              glowColor = "bg-primary/10";
            } else if (booking.status === "cancelled") {
              statusTitle = "Session Cancelled";
              statusDesc = "This session has been cancelled and student credits refunded.";
              statusBadge = "bg-danger/10 text-danger border-danger/20";
              glowColor = "bg-danger/10";
            }

            return (
              <section className="relative overflow-hidden rounded-[36px] border border-border/80 bg-gradient-to-br from-surface via-surface/90 to-primary/5 p-8 md:p-10 shadow-[0_32px_100px_-20px_rgba(59,130,246,0.12)] animate-fade-up">
                {/* Glow Effects */}
                <div className={`absolute -right-20 -top-20 h-64 w-64 rounded-full blur-[100px] ${glowColor} pointer-events-none`} />
                <div className="absolute -left-10 -bottom-10 h-48 w-48 rounded-full blur-[80px] bg-accent/8 dark:bg-accent/4 pointer-events-none" />
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                  <div className="space-y-3 flex-1">
                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1 text-[10px] font-black uppercase tracking-wider ${statusBadge}`}>
                      {booking.status}
                    </span>
                    <h2 className="text-3xl font-black text-fg sm:text-4xl tracking-tight leading-tight">
                      {statusTitle}
                    </h2>
                    <p className="max-w-2xl text-sm font-semibold leading-relaxed text-muted">
                      {statusDesc}
                    </p>
                  </div>

                  {booking.meetLink && booking.status !== "completed" && booking.status !== "cancelled" && (
                    <a
                      href={booking.meetLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2.5 px-8 py-4 bg-gradient-to-br from-emerald-600 to-green-700 dark:from-emerald-500 dark:to-green-600 text-white border border-emerald-500/25 rounded-2xl font-black text-sm md:text-base shadow-[0_16px_36px_-6px_rgba(16,185,129,0.45)] hover:shadow-[0_20px_40px_-6px_rgba(16,185,129,0.55)] hover:-translate-y-1 hover:brightness-105 active:translate-y-0 active:scale-[0.98] transition-all shrink-0 animate-bounce cursor-pointer"
                      style={{ animationDuration: '3s' }}
                    >
                      <span>Join Google Meet</span>
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                      </svg>
                    </a>
                  )}
                </div>

                {/* Progress Stepper embedded directly at bottom of status hero */}
                <div className="mt-10 pt-8 border-t border-border/60 relative z-10">
                  <div className="grid gap-6 md:grid-cols-5 relative">
                    <div className="absolute top-5 left-[10%] right-[10%] h-[2px] bg-border/40 hidden md:block z-0" />
                    
                    {/* Stepper Node 1 */}
                    <div className="flex flex-row md:flex-col items-center gap-4 md:gap-3 text-left md:text-center relative z-10 group/step">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border-2 bg-surface text-success border-success shadow-[0_0_12px_rgba(16,185,129,0.12)]">
                        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      </div>
                      <div>
                        <div className="text-xs font-black text-fg">Scheduled</div>
                        <div className="text-[10px] font-semibold text-muted mt-0.5">Booking is confirmed</div>
                      </div>
                    </div>

                    {/* Stepper Node 2 */}
                    {(() => {
                      const studentCheck = booking.isStudentStarted;
                      const seniorCheck = booking.isSeniorStarted;
                      const isStarted = studentCheck || seniorCheck;
                      const bothStarted = studentCheck && seniorCheck;
                      return (
                        <div className="flex flex-row md:flex-col items-center gap-4 md:gap-3 text-left md:text-center relative z-10 group/step">
                          <div className="absolute left-[21px] -top-6 bottom-0 w-[2px] bg-border/40 md:hidden -z-10" />
                          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border-2 bg-surface transition-all duration-300 ${
                            bothStarted ? "text-success border-success shadow-[0_0_12px_rgba(16,185,129,0.12)]" :
                            isStarted ? "text-primary border-primary animate-pulse shadow-[0_0_12px_rgba(37,99,235,0.12)]" :
                            "text-muted/40 border-border"
                          }`}>
                            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
                          </div>
                          <div>
                            <div className="text-xs font-black text-fg">Check In</div>
                            <div className="mt-1.5 flex flex-wrap gap-1.5 md:justify-center">
                              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[8px] font-black uppercase tracking-wide border ${
                                studentCheck ? "bg-success/10 text-success border-success/20" : "bg-muted/10 text-muted/65 border-border/40"
                              }`}>
                                Student
                              </span>
                              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[8px] font-black uppercase tracking-wide border ${
                                seniorCheck ? "bg-success/10 text-success border-success/20" : "bg-muted/10 text-muted/65 border-border/40"
                              }`}>
                                Senior
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Stepper Node 3 */}
                    {(() => {
                      const isLive = booking.isCallStarted;
                      const isPassed = booking.isSeniorMarkedDone || booking.isStudentConfirmed;
                      return (
                        <div className="flex flex-row md:flex-col items-center gap-4 md:gap-3 text-left md:text-center relative z-10 group/step">
                          <div className="absolute left-[21px] -top-6 bottom-0 w-[2px] bg-border/40 md:hidden -z-10" />
                          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border-2 bg-surface transition-all duration-300 ${
                            isPassed ? "text-success border-success shadow-[0_0_12px_rgba(16,185,129,0.12)]" :
                            isLive ? "text-primary border-primary animate-pulse shadow-[0_0_15px_rgba(37,99,235,0.2)]" :
                            "text-muted/40 border-border"
                          }`}>
                            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" /></svg>
                          </div>
                          <div>
                            <div className="text-xs font-black text-fg">Call Live</div>
                            <div className="text-[10px] font-semibold text-muted mt-0.5">
                              {isPassed ? "Session finished" : isLive ? "Timer is running" : "Waiting for start"}
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Stepper Node 4 */}
                    {(() => {
                      const isDone = booking.isSeniorMarkedDone;
                      const isPassed = booking.isStudentConfirmed;
                      return (
                        <div className="flex flex-row md:flex-col items-center gap-4 md:gap-3 text-left md:text-center relative z-10 group/step">
                          <div className="absolute left-[21px] -top-6 bottom-0 w-[2px] bg-border/40 md:hidden -z-10" />
                          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border-2 bg-surface transition-all duration-300 ${
                            isPassed || isDone ? "text-success border-success shadow-[0_0_12px_rgba(16,185,129,0.12)]" :
                            booking.isCallStarted ? "text-primary border-primary animate-pulse shadow-[0_0_12px_rgba(37,99,235,0.12)]" :
                            "text-muted/40 border-border"
                          }`}>
                            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          </div>
                          <div>
                            <div className="text-xs font-black text-fg">Seniors Call End</div>
                            <div className="text-[10px] font-semibold text-muted mt-0.5">
                              {isPassed || isDone ? "Senior completed" : "20 mins conversation"}
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Stepper Node 5 */}
                    {(() => {
                      const isPassed = booking.isStudentConfirmed || booking.status === "completed";
                      return (
                        <div className="flex flex-row md:flex-col items-center gap-4 md:gap-3 text-left md:text-center relative z-10 group/step">
                          <div className="absolute left-[21px] -top-6 bottom-0 w-[2px] bg-border/40 md:hidden -z-10" />
                          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border-2 bg-surface transition-all duration-300 ${
                            isPassed ? "text-success border-success shadow-[0_0_15px_rgba(16,185,129,0.2)] bg-success/5" :
                            booking.isSeniorMarkedDone ? "text-primary border-primary animate-pulse shadow-[0_0_12px_rgba(37,99,235,0.12)]" :
                            "text-muted/40 border-border"
                          }`}>
                            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.746 3.746 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" /></svg>
                          </div>
                          <div>
                            <div className="text-xs font-black text-fg">Fully Completed</div>
                            <div className="text-[10px] font-semibold text-muted mt-0.5">
                              {isPassed ? "Review & Payout active" : "Student verified end"}
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </section>
            );
          })()}

          {/* 2. Two-Column details panel below the banner */}
          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Left Columns: Controls & Timer */}
            <div className="lg:col-span-2 space-y-6">
              {/* Call Controls Widget */}
              <Card className="p-6 md:p-8 space-y-6">
                <div>
                  <h3 className="text-lg font-black text-fg tracking-tight">Session Controls</h3>
                  <p className="text-xs text-muted font-semibold mt-1">Manage check-in, join status, and session wrap-up.</p>
                </div>

                <div className="flex flex-wrap gap-4">
                  {user?.role === "student" && booking.status === "confirmed" && !booking.isCallStarted && (
                    !booking.isStudentStarted ? (
                      <Button onClick={startCall} size="lg" className="rounded-2xl flex-1 sm:flex-none py-3.5 px-8">Confirm Start (Check In)</Button>
                    ) : (
                      <Button disabled size="lg" className="rounded-2xl flex-1 sm:flex-none bg-muted/20 text-muted border border-border/80">
                        Waiting for Senior to start...
                      </Button>
                    )
                  )}
                  {user?.role === "senior" && booking.status === "confirmed" && !booking.isCallStarted && (
                    !booking.isSeniorStarted ? (
                      <Button onClick={startCall} size="lg" className="rounded-2xl flex-1 sm:flex-none py-3.5 px-8">Confirm Start (Check In)</Button>
                    ) : (
                      <Button disabled size="lg" className="rounded-2xl flex-1 sm:flex-none bg-muted/20 text-muted border border-border/80">
                        Waiting for Student to start...
                      </Button>
                    )
                  )}
                  {user?.role === "senior" && booking.isCallStarted && !booking.isSeniorMarkedDone && (
                    <Button onClick={seniorComplete} size="lg" className="rounded-2xl flex-1 sm:flex-none py-3.5 px-8">Mark Completed (End Call)</Button>
                  )}
                  {user?.role === "student" && booking.isSeniorMarkedDone && !booking.isStudentConfirmed && (
                    <Button onClick={studentConfirm} size="lg" className="rounded-2xl flex-1 sm:flex-none py-3.5 px-8">Confirm Completion</Button>
                  )}
                  
                  {/* Status Badges within Controls */}
                  <div className="flex items-center gap-3 ml-auto">
                    <span className="text-[10px] font-black uppercase text-muted tracking-wider">Your Role:</span>
                    <span className="bg-primary/10 text-primary border border-primary/20 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      {user?.role}
                    </span>
                  </div>
                </div>

                {actionError && (
                  <div className="rounded-2xl border border-danger/30 bg-danger/5 px-6 py-4 text-xs font-bold text-danger animate-scale-in">
                    ⚠️ {actionError}
                  </div>
                )}
              </Card>

              {/* Timer Widget */}
              {booking.isCallStarted && (
                <SessionTimer actualStart={actualStart} />
              )}
            </div>

            {/* Right Column: Session Info & Partner details */}
            <div className="lg:col-span-1 space-y-6">
              {/* Partner Info Card */}
              <Card className="p-6 md:p-8 space-y-6">
                <div>
                  <h3 className="text-lg font-black text-fg tracking-tight">Session Partner</h3>
                  <p className="text-xs text-muted font-semibold mt-1">Connecting 1:1 details</p>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-2xl bg-surface2/50 border border-border/50">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-gradient-to-tr from-primary/10 to-accent/10 text-base font-black text-primary">
                    {(user?.role === "student" ? booking.senior?.name : booking.student?.name)?.charAt(0).toUpperCase() || "?"}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-fg truncate max-w-[150px]">
                      {user?.role === "student" ? booking.senior?.name : booking.student?.name}
                    </div>
                    <span className="inline-flex rounded-full bg-muted/10 border border-border text-[9px] font-bold text-muted px-2 py-0.5 uppercase mt-1">
                      {user?.role === "student" ? "Senior Mentor" : "Student Client"}
                    </span>
                  </div>
                </div>

                {/* Meeting Link display */}
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted block pl-1">Meeting Link Address</span>
                  <div className="p-3.5 rounded-2xl bg-surface2/60 border border-border/60 text-xs font-semibold break-all flex items-center justify-between gap-3">
                    {booking.meetLink ? (
                      <>
                        <a href={booking.meetLink} target="_blank" rel="noreferrer" className="text-primary hover:underline font-bold truncate">
                          {booking.meetLink}
                        </a>
                        <a href={booking.meetLink} target="_blank" rel="noreferrer" className="shrink-0 p-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20 hover:scale-105 transition-all">
                          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3"/></svg>
                        </a>
                      </>
                    ) : (
                      <span className="text-muted/65 italic select-none">Link not generated yet</span>
                    )}
                  </div>
                </div>

                {/* Manage Meet Link for Seniors */}
                {user?.role === "senior" && booking.status === "confirmed" && (
                  <div className="space-y-3 pt-4 border-t border-border/50">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted block pl-1">Manage Meet Link</span>
                    <div className="flex gap-2">
                      <Input
                        placeholder="e.g. https://meet.google.com/abc-defg-hij"
                        value={newMeetLink}
                        onChange={(e) => setNewMeetLink(e.target.value)}
                        className="flex-1 bg-surface2/60 rounded-xl"
                      />
                      <Button onClick={updateMeetLink} loading={meetLinkLoading} className="rounded-xl shrink-0 font-bold px-4">
                        Update
                      </Button>
                    </div>
                    {meetLinkMsg && (
                      <div className={`text-[10px] font-black uppercase tracking-wider ${meetLinkMsg.includes("successfully") ? "text-success" : "text-danger"}`}>
                        {meetLinkMsg}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            </div>
          </div>

          {/* Review Section */}
          {user?.role === "student" && booking.status === "completed" && (
            <Card className="p-8 animate-fade-up max-w-2xl">
              <h3 className="heading-display text-2xl font-extrabold text-fg mb-2">Rate your senior</h3>
              <p className="text-sm text-muted mb-8">Your feedback helps us maintain high quality guidance.</p>

              <div className="space-y-6">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-muted mb-3">Your Rating</div>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((r) => (
                      <button
                        key={r}
                        onClick={() => setRating(r)}
                        className="transition-transform hover:scale-110 focus:outline-none"
                        aria-label={`${r} star${r !== 1 ? 's' : ''}`}
                      >
                        <svg
                          width="32" height="32"
                          fill={rating >= r ? "#f59e0b" : "none"}
                          stroke="#f59e0b"
                          strokeWidth="1.5"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-muted mb-3">Your Feedback</div>
                  <textarea
                    className="w-full rounded-2xl border border-border bg-surface2/60 p-4 text-sm text-fg outline-none focus:border-primary/45 focus:bg-surface transition"
                    rows={4}
                    placeholder="Tell us what you learned..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                </div>

                <div className="flex items-center gap-4">
                  <Button onClick={submitReview} loading={submittingReview} disabled={submittingReview} size="lg" className="rounded-2xl px-10">Submit Review</Button>
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
