import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AppShell from "../components/AppShell";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import useSEO from "../hooks/useSEO";
import { useToast } from "../context/ToastContext";

function formatDateTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatDayLabel(date) {
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);
}

function StatIcon({ children, tint = "bg-primary/10 text-primary" }) {
  return (
    <div className={`flex h-11 w-11 items-center justify-center rounded-2xl shadow-inner border border-white/5 backdrop-blur-md transition-transform duration-300 group-hover:scale-110 ${tint}`}>
      {children}
    </div>
  );
}

function MiniSparkline({ points, strokeColor = "rgb(var(--primary))" }) {
  return (
    <div className="h-6 w-20 overflow-hidden shrink-0 select-none opacity-85">
      <svg className="h-full w-full" viewBox="0 0 100 30" preserveAspectRatio="none">
        <path
          d={points}
          fill="none"
          stroke={strokeColor}
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

function EmptyState({ title, description }) {
  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center rounded-[32px] border border-dashed border-border/80 bg-surface2/30 px-6 py-10 text-center animate-fade-in relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.01] to-transparent pointer-events-none" />
      <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-surface text-primary shadow-soft border border-border/60 group-hover:scale-105 transition-transform duration-300">
        <svg className="h-7 w-7 text-primary/80" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24" aria-hidden="true">
          <rect x="3" y="4" width="18" height="18" rx="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div className="mt-5 text-lg font-black text-fg tracking-tight">{title}</div>
      <div className="mt-2 max-w-sm text-xs font-semibold leading-relaxed text-muted">{description}</div>
    </div>
  );
}

function SessionList({ items, userRole, actionLabel, emptyTitle, emptyDescription }) {
  if (!items.length) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="mt-4 space-y-4">
      {items.map((booking, idx) => {
        const startTime = new Date(booking.startTime || booking.date || 0).getTime();
        const isToday = new Date().toDateString() === new Date(startTime).toDateString();
        const name = userRole === "student"
          ? booking?.senior?.name || "Senior"
          : booking?.student?.name || "Student";
        const initials = name.trim().split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "?";
        
        let borderClass = "border-l-4 border-l-border/80";
        let cardBg = "bg-surface/90";
        if (booking.status === "confirmed") {
          borderClass = isToday ? "border-l-4 border-l-success shadow-[0_0_15px_rgba(16,185,129,0.08)]" : "border-l-4 border-l-primary shadow-[0_0_15px_rgba(37,99,235,0.06)]";
          cardBg = isToday ? "bg-gradient-to-r from-success/[0.02] via-surface to-surface" : "bg-gradient-to-r from-primary/[0.02] via-surface to-surface";
        } else if (booking.status === "completed") {
          borderClass = "border-l-4 border-l-success/40";
        } else if (booking.status === "cancelled") {
          borderClass = "border-l-4 border-l-danger/40";
        }

        return (
          <div
            key={booking._id}
            className={`group relative flex flex-wrap items-center justify-between gap-4 rounded-[24px] border border-border/70 p-4 md:p-5 shadow-soft hover:shadow-lift hover:border-primary/25 transition-all duration-300 animate-fade-up ${cardBg} ${borderClass}`}
            style={{ animationDelay: `${idx * 80}ms` }}
          >
            {isToday && booking.status === "confirmed" && (
              <span className="absolute right-4 top-4 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
              </span>
            )}

            <div className="flex flex-1 items-center gap-4 min-w-0">
              {/* User Avatar Initials with custom premium gradients */}
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-border bg-gradient-to-tr from-surface2 to-border/40 text-sm font-black text-fg shadow-sm group-hover:scale-105 transition-transform duration-300">
                {initials}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="text-base font-black text-fg group-hover:text-primary transition-colors leading-none truncate">
                    {name}
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider ${
                    booking.status === "confirmed" ? (isToday ? "bg-success/15 text-success border border-success/30 animate-pulse" : "bg-primary/10 text-primary border border-primary/20") :
                    booking.status === "completed" ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" :
                    booking.status === "cancelled" ? "bg-rose-500/10 text-rose-500 border border-rose-500/20" :
                    "bg-muted/10 text-muted border border-muted/20"
                  }`}>
                    {booking.status}
                  </span>
                  
                  {isToday && booking.status === "confirmed" && (
                    <span className="rounded-full bg-success text-white px-2 py-0.5 text-[9px] font-black uppercase tracking-wider shadow-soft">
                      Today
                    </span>
                  )}
                </div>

                <div className="mt-2.5 flex flex-wrap gap-4 text-[10px] font-bold text-muted uppercase tracking-wider">
                  <div className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-primary/70" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                    <span>{formatDateTime(booking.startTime)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-accent/70" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2"/></svg>
                    <span>20 min call</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full sm:w-auto shrink-0">
              <Link to={`/session/${booking._id}`} className="block w-full">
                <Button 
                  variant={booking.status === "completed" || booking.status === "cancelled" ? "secondary" : "primary"} 
                  className="w-full sm:w-auto rounded-xl font-bold px-6 py-2.5 text-sm"
                >
                  {actionLabel}
                </Button>
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}

async function loadDashboardData({ user, showError, setDataLoading, setBookings, setSlots }) {
  setDataLoading(true);

  try {
    const bookingsResponse = await api.get("/bookings/my");
    setBookings(Array.isArray(bookingsResponse.data) ? bookingsResponse.data : []);

    if (user?.role === "senior" && user?._id) {
      const slotResponse = await api.get(`/slots/senior/${user._id}`);
      setSlots(slotResponse.data?.slots || []);
    } else {
      setSlots([]);
    }
  } catch (err) {
    if (showError) {
      showError(err?.response?.data?.message || "Failed to load dashboard data");
    }
  } finally {
    setDataLoading(false);
  }
}

function Dashboard() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawUpi, setWithdrawUpi] = useState("");
  const [bookings, setBookings] = useState([]);
  const [slots, setSlots] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(() => Date.now());

  const upcomingSlots = useMemo(() => {
    return slots.filter((slot) => {
      if (slot.dateTime) {
        return new Date(slot.dateTime).getTime() > currentTime;
      }
      if (slot.date && slot.time) {
        const [h, m] = slot.time.split("-")[0].split(":").map(Number);
        const d = new Date(slot.date);
        d.setHours(h, m, 0, 0);
        return d.getTime() > currentTime;
      }
      return true;
    });
  }, [slots, currentTime]);

  useSEO({ title: "Dashboard", description: "Manage bookings, availability, and payout transfers on Clarior." });

  useEffect(() => {
    if (user?.upiId && !withdrawUpi) {
      setWithdrawUpi(user.upiId);
    }
  }, [user, withdrawUpi]);

  const handleWithdraw = async () => {
    try {
      const amount = Number(withdrawAmount);
      if (!amount || amount < 50) {
        showError("Enter a valid amount (minimum ₹50).");
        return;
      }
      if (!withdrawUpi.trim()) {
        showError("UPI ID is required.");
        return;
      }
      const upiRegex = /^[\w.]+@[\w]+$/;
      if (!upiRegex.test(withdrawUpi.trim())) {
        showError("Invalid UPI ID format (e.g. name@bank).");
        return;
      }
      setLoading(true);
      await api.post("/withdraw/request", { amount, upiId: withdrawUpi.trim() });
      showSuccess("Withdraw request sent successfully.");
      setWithdrawAmount("");
      refresh();
    } catch (err) {
      showError(err?.response?.data?.message || "Withdraw request failed");
    } finally {
      setLoading(false);
    }
  };

  const refresh = async () => {
    await loadDashboardData({ user, showError, setDataLoading, setBookings, setSlots });
  };

  useEffect(() => {
    if (!user) return;
    loadDashboardData({ user, showError, setDataLoading, setBookings, setSlots });
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      loadDashboardData({ user, showError: null, setDataLoading: () => {}, setBookings, setSlots });
    }, 60000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(Date.now()), 60000);
    return () => clearInterval(interval);
  }, []);

  const { upcoming, past } = useMemo(() => {
    const now = currentTime;
    const list = Array.isArray(bookings) ? bookings : [];
    const sortedPast = [...list.filter((b) => {
      if (b.status === "cancelled" || b.status === "completed") return true;
      const time = new Date(b.startTime || b.date || 0).getTime();
      return isNaN(time) ? false : time < now;
    })].sort((a, b) => new Date(b.startTime || b.date || 0) - new Date(a.startTime || a.date || 0));

    return {
      upcoming: list.filter((b) => {
        if (b.status === "cancelled" || b.status === "completed") return false;
        const time = new Date(b.startTime || b.date || 0).getTime();
        return isNaN(time) ? true : time >= now;
      }),
      past: sortedPast,
    };
  }, [bookings, currentTime]);

  // Prep Notes Workspace State & Logic
  const [notesText, setNotesText] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [activePrepBookingId, setActivePrepBookingId] = useState(null);

  const soonestBooking = upcoming?.[0];

  useEffect(() => {
    if (soonestBooking) {
      if (activePrepBookingId !== soonestBooking._id) {
        setActivePrepBookingId(soonestBooking._id);
        setNotesText(soonestBooking.notes || "");
      }
    } else {
      setActivePrepBookingId(null);
      setNotesText("");
    }
  }, [soonestBooking, activePrepBookingId]);

  const handleSaveNotes = async () => {
    if (!activePrepBookingId) return;
    try {
      setSavingNotes(true);
      await api.patch(`/bookings/${activePrepBookingId}/notes`, { notes: notesText });
      showSuccess("Preparation notes saved successfully!");
      setBookings((prev) =>
        prev.map((b) => (b._id === activePrepBookingId ? { ...b, notes: notesText } : b))
      );
    } catch (err) {
      showError(err?.response?.data?.message || "Failed to save notes");
    } finally {
      setSavingNotes(false);
    }
  };

  const firstName = user?.name?.split(" ")[0] || "there";
  const today = useMemo(() => new Date(), []);
  const isUnverifiedSenior = user?.role === "senior" && !user?.isVerified;

  const handleLogout = async () => {
    try { await api.get("/auth/logout"); } catch {
      // Keep local flow robust.
    }
    setUser(null);
    navigate("/");
  };

  const { walletBorder, walletTint } = useMemo(() => {
    if (user?.role === "student") {
      const credits = user.callCredits ?? 0;
      if (credits === 0) {
        return { walletBorder: "border-t-danger hover:border-t-danger", walletTint: "bg-danger/10 text-danger" };
      } else if (credits === 1) {
        return { walletBorder: "border-t-warning hover:border-t-warning", walletTint: "bg-warning/10 text-warning" };
      }
    }
    return { walletBorder: "border-t-success hover:border-t-success", walletTint: "bg-success/10 text-success" };
  }, [user]);

  return (
    <AppShell title="Dashboard">
      <div className="space-y-8 pb-10 animate-fade-in">
        {/* Welcome Header Section */}
        <section className="relative overflow-hidden rounded-[36px] border border-border/80 bg-gradient-to-br from-surface via-surface/90 to-primary/5 p-6 md:p-8 shadow-[0_32px_100px_-20px_rgba(59,130,246,0.12)] backdrop-blur-md">
          {/* Accent light/dark ambient orbs */}
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full blur-[100px] bg-primary/20 dark:bg-primary/10 pointer-events-none animate-pulse" />
          <div className="absolute -left-10 -bottom-10 h-48 w-48 rounded-full blur-[80px] bg-accent/15 dark:bg-accent/8 pointer-events-none" />
          
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between relative z-10">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
              {/* User Initials Badge with elegant gradient design */}
              <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-3xl border border-primary/20 bg-gradient-to-tr from-primary/10 to-accent/10 text-3xl font-black text-primary shadow-soft hover:scale-105 transition-transform duration-300">
                {user?.name?.trim()?.[0] || "C"}
              </div>
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                  <span>{formatDayLabel(today)}</span>
                </div>
                
                <h2 className="text-3xl font-black text-fg sm:text-4xl leading-tight tracking-tight mt-1">
                  {user?.role === "admin" ? "Admin Command Center" : `Welcome back, ${firstName}`}
                </h2>
                
                <p className="max-w-xl text-sm font-semibold leading-relaxed text-muted">
                  {user?.role === "senior" 
                    ? "Your senior portal is ready. Track your earnings, manage your availability, and clear doubts."
                    : "Ready to get some clarity? Book a session with seniors worldwide or manage your upcoming calls here."}
                </p>

                {user?.role === "senior" && (
                  <div className="pt-2 flex flex-wrap gap-3 justify-center sm:justify-start">
                    <div className="rounded-2xl border border-border/80 bg-surface/80 backdrop-blur px-4.5 py-2.5 shadow-sm hover:border-success/30 transition-all">
                      <div className="text-[9px] font-black text-muted uppercase tracking-wider">Available Balance</div>
                      <div className="text-lg font-black text-success mt-0.5">₹{user?.availableBalance ?? 0}</div>
                    </div>
                    <div className="rounded-2xl border border-border/80 bg-surface/80 backdrop-blur px-4.5 py-2.5 shadow-sm hover:border-primary/30 transition-all">
                      <div className="text-[9px] font-black text-muted uppercase tracking-wider">Pending Earnings</div>
                      <div className="text-lg font-black text-fg mt-0.5">₹{user?.pendingEarnings ?? 0}</div>
                    </div>
                  </div>
                )}

                {isUnverifiedSenior && (
                  <div className="pt-2">
                    <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-wider text-amber-500">
                      <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                      Verification Pending
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions Grid */}
            <div className="grid w-full gap-3 sm:grid-cols-2 lg:w-[380px] shrink-0">
              {(user?.role === "student" || user?.role === "senior") && (
                <Link to="/bookings" className="w-full">
                  <Button className="w-full rounded-2xl font-bold py-4 shadow-soft hover:-translate-y-1 transition-all" size="lg" iconLeft={<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>}>
                    Open Sessions
                  </Button>
                </Link>
              )}
              {user?.role === "senior" && user?.isVerified && (
                <Link to="/availability" className="w-full">
                  <Button variant="secondary" className="w-full rounded-2xl font-bold py-4 hover:-translate-y-1 transition-all" size="lg" iconLeft={<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}>
                    Manage Slots
                  </Button>
                </Link>
              )}
              {user?.role === "student" && (
                <Link to="/explore" className="w-full">
                  <Button variant="secondary" className="w-full rounded-2xl font-bold py-4 hover:-translate-y-1 transition-all" size="lg" iconLeft={<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>}>
                    Find Seniors
                  </Button>
                </Link>
              )}
              {user?.role === "admin" && (
                <Link to="/admin" className="w-full">
                  <Button variant="secondary" className="w-full rounded-2xl font-bold py-4 hover:-translate-y-1 transition-all" size="lg" iconLeft={<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>}>
                    Admin Panel
                  </Button>
                </Link>
              )}
              <Button variant="ghost" className="w-full rounded-2xl font-bold py-4 hover:bg-surface2 hover:text-red-500 transition-all border border-transparent hover:border-red-500/10" size="lg" onClick={handleLogout} iconLeft={<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>}>
                Logout
              </Button>
            </div>
          </div>
        </section>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Account Type Card */}
          <Card className="p-6 border-t-4 border-t-primary hover:border-primary/50 shadow-soft hover:shadow-lift hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted">Account Type</span>
                <div className="text-2xl font-black text-fg capitalize mt-1.5 flex items-center gap-2">
                  {user?.role || "—"}
                  <span className={`h-2.5 w-2.5 rounded-full ${
                    user?.role === "student" ? "bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]" :
                    user?.role === "senior" ? "bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]" :
                    "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                  }`} />
                </div>
              </div>
              <StatIcon tint="bg-primary/10 text-primary">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.4" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
              </StatIcon>
            </div>
            <div className="mt-4 pt-3 border-t border-border/50 text-[11px] font-semibold leading-relaxed text-muted flex flex-col justify-between h-full">
              <div>
                {user?.role === "student" && "Authorized to book 1:1 calls with verified seniors."}
                {user?.role === "senior" && (user?.isVerified ? "Verified Senior: active slot creation enabled." : "Verification pending profile approval.")}
                {user?.role === "admin" && "Superuser control center access active."}
              </div>
              <div className="flex justify-between items-end mt-4 pt-1">
                <span className="text-[9px] font-black uppercase text-muted tracking-wider">Aesthetics & Level</span>
                <MiniSparkline points="M 0,25 C 20,5 30,30 50,10 C 70,5 80,25 100,5" strokeColor="rgb(var(--primary))" />
              </div>
            </div>
          </Card>

          {/* Wallet/Credits Card */}
          <Card className={`p-6 border-t-4 ${walletBorder} shadow-soft hover:shadow-lift hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group`}>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted">
                  {user?.role === "senior" ? "Available Balance" : "Available Credit"}
                </span>
                <div className="text-2xl font-black text-fg mt-1.5 flex items-baseline gap-1">
                  {user?.role === "senior" ? (
                    <>
                      <span className="text-sm font-bold text-muted">₹</span>
                      <span className="text-success">{user?.availableBalance ?? 0}</span>
                    </>
                  ) : (
                    <>
                      <span className="text-cyan-500">{user?.callCredits ?? 0}</span>
                      <span className="text-xs font-bold text-muted uppercase tracking-wider ml-1">Credits</span>
                    </>
                  )}
                </div>
              </div>
              <StatIcon tint={user?.role === "senior" ? "bg-success/10 text-success" : "bg-cyan-500/10 text-cyan-500"}>
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.4" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              </StatIcon>
            </div>
            
            {user?.role === "senior" ? (
              <div className="mt-4 pt-3 border-t border-border/50 text-xs flex flex-col justify-between h-full">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-muted">Pending: ₹{user?.pendingEarnings ?? 0}</span>
                  <span className="font-black text-success bg-success/10 px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wider">Active</span>
                </div>
                <div className="flex justify-between items-end mt-4 pt-1">
                  <span className="text-[9px] font-black uppercase text-muted tracking-wider">Earnings Trend</span>
                  <MiniSparkline points="M 0,15 C 15,25 30,5 50,20 C 70,10 85,25 100,2" strokeColor="rgb(var(--success))" />
                </div>
              </div>
            ) : (
              <div className="mt-4 pt-3 border-t border-border/50 text-xs flex flex-col justify-between h-full">
                <div className="space-y-2">
                  <div className="h-1.5 w-full rounded-full bg-border/40 overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${
                        (user?.callCredits ?? 0) >= 3 ? "bg-cyan-500" :
                        (user?.callCredits ?? 0) > 0 ? "bg-amber-500" : "bg-danger"
                      }`}
                      style={{ width: `${Math.min((user?.callCredits ?? 0) * 33.3, 100)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between font-semibold">
                    <span className="text-muted">1 credit = 1 call</span>
                    <Link to="/buy-credits" className="font-black text-primary hover:text-accent transition-colors flex items-center gap-0.5">
                      Add credits <span className="text-xs">→</span>
                    </Link>
                  </div>
                </div>
                <div className="flex justify-between items-end mt-4 pt-1">
                  <span className="text-[9px] font-black uppercase text-muted tracking-wider">Credits Volatility</span>
                  <MiniSparkline points="M 0,25 C 20,5 30,30 50,10 C 70,5 80,25 100,5" strokeColor="rgb(var(--accent))" />
                </div>
              </div>
            )}
          </Card>

          {/* Activity Card */}
          <Card className="p-6 border-t-4 border-t-accent hover:border-accent/50 shadow-soft hover:shadow-lift hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted">Total Sessions</span>
                <div className="text-2xl font-black text-fg mt-1.5">{bookings.length}</div>
              </div>
              <StatIcon tint="bg-accent/10 text-accent">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.4" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>
              </StatIcon>
            </div>
            
            <div className="mt-4 pt-3 border-t border-border/50 text-xs flex flex-col justify-between h-full">
              <div className="space-y-2">
                <div className="h-1.5 w-full rounded-full bg-border/40 overflow-hidden flex">
                  <div 
                    className="h-full bg-success transition-all duration-500" 
                    style={{ width: `${bookings.length ? (bookings.filter(b => b.status === "completed").length / bookings.length) * 100 : 0}%` }}
                    title="Completed"
                  />
                  <div 
                    className="h-full bg-primary transition-all duration-500" 
                    style={{ width: `${bookings.length ? (bookings.filter(b => b.status === "confirmed").length / bookings.length) * 100 : 0}%` }}
                    title="Confirmed"
                  />
                  <div 
                    className="h-full bg-danger/55 transition-all duration-500" 
                    style={{ width: `${bookings.length ? (bookings.filter(b => b.status === "cancelled").length / bookings.length) * 100 : 0}%` }}
                    title="Cancelled"
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] font-black text-muted uppercase tracking-wider">
                  <span>Completed: {bookings.filter(b => b.status === "completed").length}</span>
                  <span>Confirmed: {bookings.filter(b => b.status === "confirmed").length}</span>
                </div>
              </div>
              <div className="flex justify-between items-end mt-4 pt-1">
                <span className="text-[9px] font-black uppercase text-muted tracking-wider">Engagement Rate</span>
                <MiniSparkline points="M 0,20 C 15,10 30,25 45,15 C 60,30 80,5 100,10" strokeColor="rgb(var(--accent))" />
              </div>
            </div>
          </Card>
        </div>

        {/* Prep Notes Workspace */}
        {soonestBooking && (
          <section className="animate-fade-up">
            <Card className="p-6 md:p-8 border-t-4 border-t-primary shadow-soft hover:shadow-lift transition-all relative overflow-hidden group">
              <div className="absolute -right-16 -top-16 h-36 w-36 bg-primary/5 blur-2xl pointer-events-none rounded-full" />
              <div className="flex flex-col md:flex-row gap-6 justify-between">
                <div className="space-y-3 flex-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-primary/10 border border-primary/20 text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary live-pulse-active" />
                    Next Call Prep Workspace
                  </div>
                  <h3 className="text-xl font-black text-fg tracking-tight">
                    Session Prep Notes with {user?.role === "student" ? soonestBooking.senior?.name : soonestBooking.student?.name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-muted uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 text-primary shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" /></svg>
                      {formatDateTime(soonestBooking.startTime)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 text-accent shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      20 min call
                    </span>
                  </div>
                  <p className="text-xs text-muted max-w-xl leading-relaxed">
                    Write down any questions you want to ask, links to your LinkedIn, or career concerns below. These notes will be saved and visible to both parties during the live call window.
                  </p>
                </div>
                
                <div className="w-full md:w-[380px] space-y-3">
                  <textarea
                    rows={4}
                    placeholder="E.g., What are the placement statistics for CSE? How difficult is it to maintain a 9+ CGPA here?"
                    value={notesText}
                    onChange={(e) => setNotesText(e.target.value)}
                    className="w-full p-4 rounded-2xl border border-border bg-surface2/60 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-xs font-bold text-fg hover:border-primary/25 placeholder:text-muted/60"
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-muted tracking-wider">
                      {notesText.length} characters
                    </span>
                    <Button
                      size="sm"
                      onClick={handleSaveNotes}
                      loading={savingNotes}
                      className="rounded-xl font-black px-5 py-2 cursor-pointer text-xs"
                    >
                      Save Prep Notes
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </section>
        )}


        {/* Sessions Section */}
        {(user?.role === "student" || user?.role === "senior") && (
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Upcoming */}
            <div className="space-y-4 animate-fade-up">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-xl font-black text-fg tracking-tight">Upcoming Sessions</h3>
                <Button variant="ghost" size="sm" onClick={refresh} loading={dataLoading} className="text-xs font-bold rounded-xl">
                  Refresh
                </Button>
              </div>
              <SessionList
                items={upcoming.slice(0, 5)}
                userRole={user?.role}
                actionLabel="View Session"
                emptyTitle="All quiet for now"
                emptyDescription={user?.role === "student" ? "Book a session with a senior to see it here." : "Waiting for students to book a session."}
              />
            </div>

            {/* Past */}
            <div className="space-y-4 animate-fade-up delay-200">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-xl font-black text-fg tracking-tight">Session History</h3>
              </div>
              <SessionList
                items={past.slice(0, 5)}
                userRole={user?.role}
                actionLabel="View Details"
                emptyTitle="No history yet"
                emptyDescription="Completed or cancelled sessions will appear here."
              />
            </div>
          </div>
        )}

        {/* Senior Specific: Withdraw/Slots */}
        {user?.role === "senior" && (
          <div className="grid gap-8 lg:grid-cols-2 animate-fade-up">
            {/* Withdrawal Request */}
            <Card className="p-6 flex flex-col justify-between hover:shadow-lift hover:border-primary/20 transition-all duration-300">
              <div>
                <h3 className="text-lg font-black text-fg tracking-tight mb-4">Request Payout</h3>
                
                {/* Visual Debit Card Widget */}
                <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-5 text-white shadow-xl border border-white/10 mb-6">
                  {/* Grid mesh backdrop overlay */}
                  <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:14px_24px]" />
                  {/* Holographic glowing orb */}
                  <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full blur-[50px] bg-emerald-500/20 pointer-events-none animate-pulse" />
                  
                  <div className="flex justify-between items-start relative z-10">
                    <div>
                      <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">Available Balance</div>
                      <div className="text-3xl font-black mt-1 text-emerald-400 tracking-tight">₹{user?.availableBalance ?? 0}</div>
                    </div>
                    {/* Fintech style chip symbol */}
                    <div className="h-8 w-11 rounded-lg bg-gradient-to-r from-amber-400/90 to-amber-500/80 shadow-[inset_0_1px_2px_rgba(255,255,255,0.4)] border border-amber-300/30 flex items-center justify-center p-1.5 opacity-90">
                      <div className="grid grid-cols-3 gap-0.5 w-full h-full border border-slate-950/20 rounded-md p-0.5 opacity-60">
                        <div className="border-r border-b border-slate-950/20" />
                        <div className="border-r border-b border-slate-950/20" />
                        <div className="border-b border-slate-950/20" />
                        <div className="border-r border-slate-950/20" />
                        <div className="border-r border-slate-950/20" />
                        <div className="bg-transparent" />
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 relative z-10 flex justify-between items-end">
                    <div>
                      <div className="text-[9px] font-black uppercase tracking-widest text-slate-500">Registered UPI Address</div>
                      <div className="text-xs font-semibold tracking-wide font-mono mt-0.5 text-slate-300 max-w-[180px] truncate">{user?.upiId || "Not Registered"}</div>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Status</span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[8px] font-black uppercase tracking-wider text-emerald-400 border border-emerald-500/20 mt-0.5">Verified</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted pl-1">Amount to withdraw</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted font-bold text-sm select-none">₹</span>
                      <input
                        type="number"
                        min="50"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        placeholder="Enter amount (min ₹50)"
                        className="w-full rounded-2xl border border-border bg-surface2/60 pl-10 pr-4 py-3.5 text-sm outline-none focus:border-primary/45 focus:bg-surface transition"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted pl-1">Target UPI ID</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted font-bold text-sm select-none">UPI</span>
                      <input
                        type="text"
                        value={withdrawUpi}
                        onChange={(e) => setWithdrawUpi(e.target.value)}
                        placeholder="username@bank"
                        disabled={loading || !user?.isVerified}
                        className="w-full rounded-2xl border border-border bg-surface2/60 pl-12 pr-4 py-3.5 text-sm outline-none focus:border-primary/45 focus:bg-surface transition"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleWithdraw}
                    disabled={loading || !user?.isVerified || !withdrawAmount || !withdrawUpi}
                    className="w-full rounded-2xl font-bold py-3.5 mt-2"
                    size="lg"
                    loading={loading}
                  >
                    {user?.isVerified ? "Send Payout Request" : "Locked (Verify profile first)"}
                  </Button>
                </div>
              </div>
            </Card>

            {/* Slot Management Preview */}
            <Card className="p-6 flex flex-col justify-between hover:shadow-lift hover:border-primary/20 transition-all duration-300">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="space-y-1">
                    <h3 className="text-lg font-black text-fg tracking-tight">Active Calendar Slots</h3>
                    <p className="text-xs text-muted font-semibold">Your current availability slots</p>
                  </div>
                  <Link to="/availability">
                    <Button variant="ghost" size="sm" className="rounded-xl font-bold text-xs hover:border-primary/30">
                      Manage All
                    </Button>
                  </Link>
                </div>
                
                <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border/60">
                  {upcomingSlots.length ? (
                    upcomingSlots.slice(0, 3).map((slot, idx) => {
                      const slotDate = new Date(slot.date);
                      const isPast = slotDate.getTime() < Date.now();
                      return (
                        <div key={slot._id} className="relative group/slot animate-fade-up" style={{ animationDelay: `${idx * 100}ms` }}>
                          {/* Timeline Dot */}
                          <span className={`absolute -left-[22px] top-1.5 h-3.5 w-3.5 rounded-full border-2 bg-surface transition-all duration-300 ${
                            isPast ? "border-muted" : "border-success group-hover/slot:scale-125"
                          }`} />
                          
                          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-surface2/60 border border-border/40 group-hover/slot:border-primary/20 group-hover/slot:bg-surface transition-all duration-300">
                            <div>
                              <div className="text-xs font-black text-fg">
                                {slotDate.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                              </div>
                              <div className="text-[10px] font-bold text-muted mt-0.5">{slot.startTime || slot.time}</div>
                            </div>
                            <span className={`h-2 w-2 rounded-full ${
                              isPast ? "bg-muted" : "bg-success shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                            }`} />
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-6 text-center select-none">
                      <div className="text-2xl mb-2">📅</div>
                      <p className="text-xs font-semibold text-muted italic">No active slots created yet.</p>
                      <Link to="/availability" className="inline-block mt-3 text-xs font-black text-primary hover:text-accent transition-colors">
                        Create some now →
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </AppShell>
  );
}

export default Dashboard;
