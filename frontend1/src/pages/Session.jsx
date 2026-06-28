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
          "Keep the video call session active until the timer completes."
        )}
      </div>
    </Card>
  );
}

// Detects if the page is currently in dark mode
function useIsDark() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));
  useEffect(() => {
    const obs = new MutationObserver(() =>
      setDark(document.documentElement.classList.contains("dark"))
    );
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);
  return dark;
}

function triggerConfettiCelebration() {
  const colors = ["#2563eb", "#3b82f6", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6"];
  for (let i = 0; i < 75; i++) {
    const p = document.createElement("div");
    p.className = "confetti-particle";
    p.style.left = Math.random() * 100 + "vw";
    p.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    p.style.width = Math.random() * 8 + 6 + "px";
    p.style.height = Math.random() * 14 + 8 + "px";
    p.style.animationDelay = Math.random() * 1.5 + "s";
    p.style.opacity = Math.random() * 0.8 + 0.2;
    document.body.appendChild(p);
    
    setTimeout(() => p.remove(), 5500);
  }
}

function Session() {
  useSEO({ title: "Live Session Room", description: "Join your live 1:1 call with a verified mentor on Clarior." });
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isDark = useIsDark();

  const [booking, setBooking] = useState(null);
  const [sessionNotes, setSessionNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);

  useEffect(() => {
    if (booking) {
      setSessionNotes(booking.notes || "");
    }
  }, [booking]);

  const handleSaveSessionNotes = async () => {
    if (!bookingId) return;
    try {
      setSavingNotes(true);
      await api.patch(`/bookings/${bookingId}/notes`, { notes: sessionNotes });
      setBooking((prev) => ({ ...prev, notes: sessionNotes }));
    } catch (err) {
      console.error("Failed to save notes during session", err);
    } finally {
      setSavingNotes(false);
    }
  };

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

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewMsg, setReviewMsg] = useState("");
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [submittingReview, setSubmittingReview] = useState(false);

  const [actionError, setActionError] = useState("");

  // Auto-open Review Modal when session is completed and not reviewed yet
  useEffect(() => {
    if (
      booking &&
      booking.status === "completed" &&
      user?.role === "student" &&
      !booking.review &&
      !reviewMsg
    ) {
      setShowReviewModal(true);
    }
  }, [booking?.status, booking?.review, user?.role, reviewMsg]);

  const toggleCamera = async () => {
    setActionError("");
    if (cameraActive) {
      if (stream) {
        stream.getVideoTracks().forEach(track => track.stop());
      }
      setCameraActive(false);
    } else {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
        setStream(mediaStream);
        setCameraActive(true);
      } catch (err) {
        console.error("Error accessing webcam:", err);
        setCameraActive(false);
        setActionError("Camera access denied. Please click 'Allow' in the browser permission prompt.");
      }
    }
  };

  const toggleMic = async () => {
    setActionError("");
    if (micActive) {
      if (stream) {
        stream.getAudioTracks().forEach(track => track.stop());
      }
      setMicActive(false);
    } else {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setStream(mediaStream);
        setMicActive(true);
      } catch (err) {
        console.error("Error accessing microphone:", err);
        setMicActive(false);
        setActionError("Microphone access denied. Please click 'Allow' in the browser permission prompt.");
      }
    }
  };

  // Jitsi Meet Integration States
  const [jitsiLoaded, setJitsiLoaded] = useState(false);
  const [jitsiApi, setJitsiApi] = useState(null);
  const jitsiContainerRef = useRef(null);

  // Dynamic script loader for Jitsi
  useEffect(() => {
    if (window.JitsiMeetExternalAPI) {
      setJitsiLoaded(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://meet.jit.si/external_api.js";
    script.async = true;
    script.onload = () => setJitsiLoaded(true);
    document.body.appendChild(script);
  }, []);

  // Reset/Refresh Jitsi call session handler
  const handleRefreshCall = () => {
    if (jitsiApi) {
      try {
        jitsiApi.dispose();
      } catch (err) {
        console.error("Error disposing Jitsi:", err);
      }
      setJitsiApi(null);
    }
    setRefreshKey((prev) => prev + 1);
  };

  // Jitsi Iframe mounting hook
  useEffect(() => {
    if (booking?.isCallStarted && joinedLobby && jitsiLoaded && jitsiContainerRef.current && !jitsiApi) {
      const domain = "jitsi.riot.im";
      const roomName = `ClariorSession-Booking-${bookingId}`;

      const options = {
        roomName: roomName,
        width: "100%",
        height: "100%",
        parentNode: jitsiContainerRef.current,
        userInfo: {
          displayName: user?.name || "Participant",
          email: user?.email || "",
        },
        configOverwrite: {
          prejoinPageEnabled: false,
          startWithAudioMuted: !micActive,
          startWithVideoMuted: !cameraActive,
          disableDeepLinking: true,
          disableEndMeetingForAll: true,
        },
        interfaceConfigOverwrite: {
          TOOLBAR_BUTTONS: [
            "microphone",
            "camera",
            "closedcaptions",
            "desktop",
            "fullscreen",
            "fodeviceselection",
            "hangup",
            "profile",
            "chat",
            "settings",
            "videoquality",
            "filmstrip",
            "shortcuts",
            "tileview",
            "videobackgroundblur",
          ],
        },
      };

      try {
        const apiInstance = new window.JitsiMeetExternalAPI(domain, options);
        setJitsiApi(apiInstance);

        // Listen for call hung up by user
        apiInstance.addEventListener("videoConferenceLeft", () => {
          apiInstance.dispose();
          setJitsiApi(null);
        });
      } catch (err) {
        console.error("Error creating Jitsi instance:", err);
      }
    }

    return () => {
      if (jitsiApi) {
        jitsiApi.dispose();
      }
    };
  }, [booking?.isCallStarted, joinedLobby, jitsiLoaded, bookingId, user, micActive, cameraActive, refreshKey]);

  const load = async () => {
    await loadSessionBooking({ bookingId, setError, setLoading, setBooking });
  };

  useEffect(() => {
    loadSessionBooking({ bookingId, setError, setLoading, setBooking });
  }, [bookingId]);

  // Background polling to sync call start/end states in real-time (every 5 seconds)
  useEffect(() => {
    if (!bookingId) return;

    // Stop polling once session is completed/cancelled
    if (booking && (booking.status === "completed" || booking.status === "cancelled")) {
      return;
    }

    const interval = setInterval(() => {
      loadSessionBooking({
        bookingId,
        setError: () => {}, // Silent error handling to prevent UI flickers
        setLoading: () => {}, // Silent loading to prevent screen overlays
        setBooking
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [bookingId, booking?.status]);

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
      setReviewMsg("Review submitted successfully.");
      triggerConfettiCelebration();
      setShowReviewModal(false); // Only close modal on success
      load(); // Reload booking details to sync status
    } catch (e) {
      setReviewMsg(e?.response?.data?.message || "Review submission failed. Please try again.");
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
        <div className="max-w-3xl mx-auto animate-fade-up">
          <Card className="p-6 md:p-8 shadow-hero border border-border/80 bg-surface/90 backdrop-blur-xl relative overflow-hidden rounded-[32px]">
            {/* Ambient subtle glow background */}
            <div className="absolute -top-12 -right-12 w-28 h-28 rounded-full bg-primary/10 blur-xl pointer-events-none" />

            <div className="grid md:grid-cols-2 gap-8 items-stretch">
              {/* Left Column: Device Checklist */}
              <div className="space-y-6 flex flex-col justify-between">
                <div className="space-y-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary px-3.5 py-1 text-[10px] font-black uppercase tracking-wider">
                    Lobby Check-in
                  </span>
                  <h2 className="text-xl font-black text-fg tracking-tight">Audio & Video Setup</h2>
                  <p className="text-xs text-muted font-semibold leading-relaxed">Configure call options before entering.</p>
                </div>

                <div className="space-y-3.5">
                  {/* Camera Row */}
                  <button
                    onClick={toggleCamera}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 transform active:scale-[0.99] cursor-pointer ${
                      cameraActive 
                        ? "bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/35" 
                        : "bg-surface2/60 border-border/60 hover:border-primary/30"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`text-base select-none ${cameraActive ? "text-emerald-500" : "text-muted"}`}>📹</span>
                      <span className="text-sm font-black text-fg">Enable Camera Access</span>
                    </div>
                    <div className={`h-6 w-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${
                      cameraActive 
                        ? "bg-emerald-500 border-emerald-500 text-white shadow-sm" 
                        : "border-border bg-transparent"
                    }`}>
                      {cameraActive && (
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      )}
                    </div>
                  </button>

                  {/* Microphone Row */}
                  <button
                    onClick={toggleMic}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 transform active:scale-[0.99] cursor-pointer ${
                      micActive 
                        ? "bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/35" 
                        : "bg-surface2/60 border-border/60 hover:border-primary/30"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`text-base select-none ${micActive ? "text-emerald-500" : "text-muted"}`}>🎙️</span>
                      <span className="text-sm font-black text-fg">Enable Microphone Access</span>
                    </div>
                    <div className={`h-6 w-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${
                      micActive 
                        ? "bg-emerald-500 border-emerald-500 text-white shadow-sm" 
                        : "border-border bg-transparent"
                    }`}>
                      {micActive && (
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      )}
                    </div>
                  </button>
                </div>

                {actionError && (
                  <div className="rounded-xl border border-danger/30 bg-danger/5 px-4 py-3 text-xs font-bold text-danger animate-scale-in">
                    ⚠️ {actionError}
                  </div>
                )}
              </div>

              {/* Right Column: Suggestions & Enter Button */}
              <div className="space-y-6 md:border-l md:border-border/40 md:pl-8 flex flex-col justify-between">
                <div className="space-y-3.5">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-muted pl-0.5">Join Guidelines</h3>
                  <ul className="space-y-3.5">
                    {[
                      { icon: <svg className="w-5 h-5 text-primary shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" /></svg>, title: "Headphones Suggested", desc: "Filters background noise and prevents audio echoes." },
                      { icon: <svg className="w-5 h-5 text-primary shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>, title: "Focused Session", desc: "Keep questions prioritized to fit the 20-minute limit." },
                      { icon: <svg className="w-5 h-5 text-primary shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.284 16.284A3 3 0 0012 21a3 3 0 003.716-4.716m-7.432-1.136A6 6 0 0112 15a6 6 0 013.716 1.136m-7.432-1.136a9 9 0 0114.864 0M1.657 7.057a15 15 0 0120.686 0" /></svg>, title: "Connection Quality", desc: "Join from a quiet spot with a stable network link." }
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span className="shrink-0 pt-0.5">{item.icon}</span>
                        <div>
                          <div className="text-xs font-black text-fg leading-none">{item.title}</div>
                          <div className="text-[11px] text-muted font-semibold mt-1 leading-normal">{item.desc}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                {user?.role === "senior" && (
                  <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 space-y-2">
                    <h4 className="text-xs font-black text-primary uppercase tracking-wider flex items-center gap-1.5 select-none">
                      <svg className="w-4 h-4 text-primary shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" /></svg>
                      Student Prep Notes
                    </h4>
                    <p className="text-[11px] font-semibold text-fg whitespace-pre-wrap leading-relaxed">
                      {booking.notes ? booking.notes : (
                        <span className="text-muted/65 italic select-none">No preparation notes written by student yet.</span>
                      )}
                    </p>
                  </div>
                )}

                <div className="pt-2">
                  <Button
                    onClick={() => {
                      if (stream) {
                        stream.getTracks().forEach(track => track.stop());
                      }
                      setJoinedLobby(true);
                    }}
                    className="w-full rounded-2xl py-3.5 shadow-hero text-xs font-black uppercase tracking-wider"
                  >
                    Enter Call Room
                  </Button>
                </div>
              </div>
            </div>
          </Card>
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
                statusDesc = "The 20-minute session countdown is active. Join the video room below and start talking now!";
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
              {booking.isCallStarted && booking.status !== "completed" && booking.status !== "cancelled" && (
                <SessionTimer actualStart={actualStart} />
              )}

              {/* Jitsi In-App Video Call Screen */}
              {booking.isCallStarted && booking.status !== "completed" && booking.status !== "cancelled" && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center px-2">
                    <span className="text-[10px] font-black uppercase text-muted tracking-widest">In-App Calling Active</span>
                    <button
                      onClick={handleRefreshCall}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider text-primary border border-primary/20 bg-primary/5 hover:bg-primary/10 hover:border-primary/45 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
                    >
                      🔄 Refresh Video Call
                    </button>
                  </div>
                  <Card className="p-2 overflow-hidden bg-slate-950 border border-border/80 rounded-[32px] shadow-hero aspect-video w-full min-h-[480px] relative">
                    {!jitsiLoaded && (
                      <div className="absolute inset-0 flex items-center justify-center bg-slate-900/90 backdrop-blur-md rounded-[28px] z-10 animate-fade-in">
                        <div className="text-center space-y-3">
                          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary mx-auto" />
                          <div className="text-xs font-black text-white uppercase tracking-widest">Initializing Secure Room...</div>
                          <p className="text-[10px] text-slate-400">Loading open-source audio & video engine</p>
                        </div>
                      </div>
                    )}
                    <div ref={jitsiContainerRef} className="w-full h-full rounded-[24px] overflow-hidden" />
                  </Card>
                </div>
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

                {/* Room Status display */}
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted block pl-1">Room Status</span>
                  <div className="p-3.5 rounded-2xl bg-surface2/60 border border-border/60 text-xs font-semibold flex items-center justify-between gap-3">
                    {booking.isCallStarted ? (
                      <div className="flex items-center gap-2 text-xs">
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                        <span className="font-bold text-fg">In-App Live Room Active</span>
                      </div>
                    ) : (
                      <span className="text-muted/65 italic select-none">Waiting for check-in to start room</span>
                    )}
                  </div>
                </div>
              </Card>

              {/* Prep Notes Card */}
              <Card className="p-6 md:p-8 space-y-4 hover:shadow-lift hover:border-primary/20 transition-all duration-300">
                <div>
                  <h3 className="text-lg font-black text-fg tracking-tight flex items-center gap-2">
                    <svg className="w-5 h-5 text-primary shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
                    Prep Notes & Questions
                  </h3>
                  <p className="text-xs text-muted font-semibold mt-1">Shared pre-call prep details</p>
                </div>

                {user?.role === "student" ? (
                  <div className="space-y-3">
                    <textarea
                      rows={5}
                      placeholder="Write your questions here so the senior can prepare in advance. You can also edit them during the call."
                      value={sessionNotes}
                      onChange={(e) => setSessionNotes(e.target.value)}
                      className="w-full p-4 rounded-2xl border border-border bg-surface2/60 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-xs font-bold text-fg hover:border-primary/25 placeholder:text-muted/60"
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-muted tracking-wider">
                        {sessionNotes.length} characters
                      </span>
                      <Button
                        size="sm"
                        onClick={handleSaveSessionNotes}
                        loading={savingNotes}
                        className="rounded-xl font-black px-5 py-2 cursor-pointer text-xs"
                      >
                        Save Notes
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-surface2/60 border border-border/60 text-xs font-bold text-fg whitespace-pre-wrap leading-relaxed">
                    {booking.notes ? booking.notes : (
                      <span className="text-muted/65 italic select-none">No preparation notes written by student yet.</span>
                    )}
                  </div>
                )}
              </Card>
            </div>
          </div>

          {/* Glassmorphic Review Modal (Forcing Student Review) */}
          {user?.role === "student" && booking.status === "completed" && showReviewModal && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 100,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 16,
                background: isDark ? "rgba(0,0,0,0.7)" : "rgba(15,33,59,0.45)",
                backdropFilter: "blur(12px)",
                animation: "fadeIn 0.25s ease both",
              }}
            >
              {/* Modal Box */}
              <div
                style={{
                  position: "relative",
                  zIndex: 10,
                  width: "100%",
                  maxWidth: 480,
                  background: isDark ? "#0f1d33" : "#ffffff",
                  border: `1.5px solid ${isDark ? "#233b5c" : "#d0e0f7"}`,
                  borderRadius: 28,
                  padding: "32px 28px",
                  boxShadow: isDark
                    ? "0 32px 80px -20px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)"
                    : "0 32px 80px -20px rgba(15,33,59,0.18), 0 0 0 1px rgba(37,99,235,0.06)",
                  animation: "scaleIn 0.3s cubic-bezier(0.22,1,0.36,1) both",
                }}
              >
                {/* Header Badge */}
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "3px 12px",
                    borderRadius: 999,
                    background: isDark ? "rgba(16,185,129,0.15)" : "rgba(16,185,129,0.1)",
                    border: `1px solid ${isDark ? "rgba(16,185,129,0.25)" : "rgba(16,185,129,0.2)"}`,
                    color: isDark ? "#10b981" : "#10b981",
                    fontSize: 9,
                    fontWeight: 900,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    marginBottom: 12,
                  }}
                >
                  🎉 Call Completed!
                </div>

                <h2 style={{ fontSize: 22, fontWeight: 900, color: isDark ? "#dfeafc" : "#10213b", marginBottom: 6, lineHeight: 1.15 }}>
                  Rate your{" "}
                  <span
                    style={{
                      background: "linear-gradient(135deg, #2563eb, #38bdf8)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    Senior Mentor
                  </span>
                </h2>
                
                <p style={{ fontSize: 12, color: isDark ? "#95b0dc" : "#567198", lineHeight: 1.6, marginBottom: 24 }}>
                  Your feedback helps us maintain high quality mentorship and guidance on Clarior.
                </p>

                {/* Rating Stars */}
                <div style={{ marginBottom: 20 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: isDark ? "#dfeafc" : "#10213b", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>
                    Your Rating
                  </span>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRating(r)}
                        className="transition-transform hover:scale-110 focus:outline-none cursor-pointer"
                        aria-label={`${r} star${r !== 1 ? 's' : ''}`}
                      >
                        <svg
                          width="36"
                          height="36"
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

                {/* Feedback Input */}
                <div style={{ marginBottom: 24 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: isDark ? "#dfeafc" : "#10213b", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>
                    Feedback & Comments
                  </span>
                  <textarea
                    className="w-full rounded-2xl border border-border bg-surface2/60 p-4 text-sm text-fg outline-none focus:border-primary/45 focus:bg-surface transition"
                    rows={4}
                    placeholder="Tell us what you learned during your session..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                  />
                </div>

                {/* Error Banner */}
                {reviewMsg && !reviewMsg.includes("successfully") && (
                  <div style={{
                    padding: "10px 14px",
                    borderRadius: 12,
                    marginBottom: 16,
                    background: isDark ? "rgba(239,68,68,0.1)" : "rgba(239,68,68,0.06)",
                    border: "1px solid rgba(239,68,68,0.3)",
                    color: "#ef4444",
                    fontSize: 12,
                    fontWeight: 700,
                  }}>
                    ⚠️ {reviewMsg}
                  </div>
                )}

                {/* Submit Action */}
                <Button
                  onClick={async () => {
                    await submitReview();
                  }}
                  loading={submittingReview}
                  disabled={submittingReview}
                  className="w-full rounded-xl py-3.5 font-black text-sm tracking-wide shadow-hero"
                >
                  Submit Review & End Session
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </AppShell>
  );
}

export default Session;
