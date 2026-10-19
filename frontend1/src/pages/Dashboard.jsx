import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
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

function formatISTDate(dateStr) {
  if (!dateStr) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateStr));
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
    <div className="flex min-h-[260px] flex-col items-center justify-center rounded-[32px] border border-dashed border-border/80 bg-surface2/30 px-6 py-10 text-center animate-fade-in relative overflow-hidden group">
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

async function loadDashboardData({ 
  user, 
  showError, 
  setDataLoading, 
  setBookings, 
  setSlots, 
  setSlotRequests,
  setMyWithdraws,
  setMyCollegeRequests,
  setMyTickets
}) {
  setDataLoading(true);

  try {
    const isMentor = user?.role === "senior" || user?.role === "alumni";

    const [bookingsRes, slotReqsRes, collegesRes, ticketsRes] = await Promise.all([
      api.get("/bookings/my").catch(() => ({ data: [] })),
      api.get("/slot-requests").catch(() => ({ data: { requests: [] } })),
      api.get("/colleges/my-requests").catch(() => ({ data: { requests: [] } })),
      api.get("/support/my-tickets").catch(() => ({ data: { tickets: [] } })),
    ]);

    setBookings(Array.isArray(bookingsRes.data) ? bookingsRes.data : []);
    setSlotRequests(slotReqsRes.data?.requests || []);
    setMyCollegeRequests(collegesRes.data?.requests || []);
    setMyTickets(ticketsRes.data?.tickets || []);

    if (isMentor && user?._id) {
      const [slotRes, withdrawRes] = await Promise.all([
        api.get(`/slots/senior/${user._id}`).catch(() => ({ data: { slots: [] } })),
        api.get("/withdraw/my").catch(() => ({ data: { withdraws: [] } }))
      ]);
      setSlots(slotRes.data?.slots || []);
      setMyWithdraws(withdrawRes.data?.withdraws || []);
    } else {
      setSlots([]);
      setMyWithdraws([]);
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
  const [searchParams, setSearchParams] = useSearchParams();
  const { showSuccess, showError } = useToast();

  const [loading, setLoading] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawUpi, setWithdrawUpi] = useState("");
  const [bookings, setBookings] = useState([]);
  const [slots, setSlots] = useState([]);
  const [slotRequests, setSlotRequests] = useState([]);
  const [myWithdraws, setMyWithdraws] = useState([]);
  const [myCollegeRequests, setMyCollegeRequests] = useState([]);
  const [myTickets, setMyTickets] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(() => Date.now());
  const [showHistoryMore, setShowHistoryMore] = useState(false);
  const HISTORY_PREVIEW_COUNT = 3;

  // Main Tab Navigation: "overview" | "requests"
  const activeMainTab = searchParams.get("tab") === "requests" ? "requests" : "overview";
  const setActiveMainTab = (tab) => {
    if (tab === "overview") {
      searchParams.delete("tab");
      setSearchParams(searchParams);
    } else {
      setSearchParams({ tab });
    }
  };

  // Subtab for Requests Center
  const isMentor = user?.role === "senior" || user?.role === "alumni";
  const [requestSubTab, setRequestSubTab] = useState("slots");

  // Modals for user to request a college or open support ticket
  const [showCollegeModal, setShowCollegeModal] = useState(false);
  const [newCollege, setNewCollege] = useState({ name: "", city: "", state: "", type: "Private", established: "" });
  const [submittingCollege, setSubmittingCollege] = useState(false);

  const [showTicketModal, setShowTicketModal] = useState(false);
  const [newTicket, setNewTicket] = useState({ category: "General Inquiry", message: "" });
  const [submittingTicket, setSubmittingTicket] = useState(false);

  const handleUpdateStatus = async (id, status) => {
    try {
      setLoading(true);
      await api.patch(`/slot-requests/${id}/status`, { status });
      showSuccess(`Slot request ${status} successfully.`);
      refresh();
    } catch (err) {
      showError(err?.response?.data?.message || "Failed to update slot request");
    } finally {
      setLoading(false);
    }
  };

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

  useSEO({ title: "Dashboard", description: "Manage bookings, requests, availability, and payout transfers on Clarior." });

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

  const handleCreateCollegeRequest = async (e) => {
    e.preventDefault();
    if (!newCollege.name || !newCollege.city || !newCollege.state) {
      showError("Please fill in College Name, City, and State.");
      return;
    }
    try {
      setSubmittingCollege(true);
      await api.post("/colleges/request", {
        ...newCollege,
        requesterEmail: user?.email,
      });
      showSuccess("College addition request submitted successfully!");
      setShowCollegeModal(false);
      setNewCollege({ name: "", city: "", state: "", type: "Private", established: "" });
      refresh();
    } catch (err) {
      showError(err?.response?.data?.message || "Failed to submit college request");
    } finally {
      setSubmittingCollege(false);
    }
  };

  const handleCreateSupportTicket = async (e) => {
    e.preventDefault();
    if (!newTicket.message.trim()) {
      showError("Please write your inquiry message.");
      return;
    }
    try {
      setSubmittingTicket(true);
      await api.post("/support", {
        name: user?.name,
        email: user?.email,
        category: newTicket.category,
        message: newTicket.message.trim(),
      });
      showSuccess("Support ticket submitted! Our team will respond shortly.");
      setShowTicketModal(false);
      setNewTicket({ category: "General Inquiry", message: "" });
      refresh();
    } catch (err) {
      showError(err?.response?.data?.message || "Failed to submit support ticket");
    } finally {
      setSubmittingTicket(false);
    }
  };

  const refresh = async () => {
    await loadDashboardData({ 
      user, 
      showError, 
      setDataLoading, 
      setBookings, 
      setSlots, 
      setSlotRequests,
      setMyWithdraws,
      setMyCollegeRequests,
      setMyTickets 
    });
  };

  useEffect(() => {
    if (!user) return;
    refresh();
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

  const [notesText, setNotesText] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [activePrepBookingId, setActivePrepBookingId] = useState(null);
  const [copiedNotes, setCopiedNotes] = useState(false);

  const soonestBooking = upcoming?.[0];

  useEffect(() => {
    if (upcoming && upcoming.length > 0) {
      const target = upcoming.find((b) => b._id === activePrepBookingId) || upcoming[0];
      if (target._id !== activePrepBookingId) {
        setActivePrepBookingId(target._id);
        setNotesText(target.notes || "");
      }
    } else {
      setActivePrepBookingId(null);
      setNotesText("");
    }
  }, [upcoming, activePrepBookingId]);

  const activePrepBooking = useMemo(() => {
    return upcoming?.find((b) => b._id === activePrepBookingId) || soonestBooking;
  }, [upcoming, activePrepBookingId, soonestBooking]);

  const handleSelectPrepBooking = (bookingId) => {
    setActivePrepBookingId(bookingId);
    const target = upcoming?.find((b) => b._id === bookingId);
    setNotesText(target?.notes || "");
  };

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
  const isUnverifiedMentor = (user?.role === "senior" || user?.role === "alumni") && !user?.isVerified;

  const handleLogout = async () => {
    try { await api.get("/auth/logout"); } catch {
      // Keep local flow robust.
    }
    setUser(null);
    navigate("/");
  };

  // Badge calculations for requests
  const pendingSlotReqsCount = isMentor
    ? slotRequests.filter(r => r.status === "pending").length
    : slotRequests.length;
  const pendingPayoutsCount = myWithdraws.filter(w => w.status === "pending").length;
  const totalUserRequests = isMentor
    ? pendingSlotReqsCount + pendingPayoutsCount + myCollegeRequests.length + myTickets.filter(t => t.status === "open").length
    : slotRequests.length + myCollegeRequests.length + myTickets.filter(t => t.status === "open").length;

  return (
    <AppShell title="Dashboard">
      <div className="space-y-8 pb-10 animate-fade-in">
        {/* Welcome Header Section */}
        <section className="relative overflow-hidden rounded-3xl border border-border bg-surface p-6 md:p-8 shadow-card gpu-layer">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full blur-[100px] bg-primary/20 dark:bg-primary/10 pointer-events-none animate-pulse" />
          <div className="absolute -left-10 -bottom-10 h-48 w-48 rounded-full blur-[80px] bg-accent/15 dark:bg-accent/8 pointer-events-none" />
          
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between relative z-10">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
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
                  {isMentor
                    ? "Your mentor portal is active. Track your earnings, manage your availability, and review session requests."
                    : "Ready to get clarity? Book sessions with verified college seniors and corporate alumni, or track your requests."}
                </p>

                {isMentor && (
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

                {isUnverifiedMentor && (
                  <div className="pt-2">
                    <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-wider text-amber-500">
                      <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                      Verification In Review
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid w-full gap-3 sm:grid-cols-2 lg:w-[380px] shrink-0">
              <Link to="/bookings" className="w-full">
                <Button className="w-full rounded-2xl font-bold py-4 shadow-soft hover:-translate-y-1 transition-all" size="lg" iconLeft={<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>}>
                  Open Sessions
                </Button>
              </Link>

              {isMentor && user?.isVerified ? (
                <Link to="/availability" className="w-full">
                  <Button variant="secondary" className="w-full rounded-2xl font-bold py-4 hover:-translate-y-1 transition-all" size="lg" iconLeft={<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}>
                    Manage Slots
                  </Button>
                </Link>
              ) : user?.role === "student" ? (
                <Link to="/explore" className="w-full">
                  <Button variant="secondary" className="w-full rounded-2xl font-bold py-4 hover:-translate-y-1 transition-all" size="lg" iconLeft={<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>}>
                    Find Mentors
                  </Button>
                </Link>
              ) : null}

              {user?.role === "admin" && (
                <Link to="/admin" className="w-full">
                  <Button variant="secondary" className="w-full rounded-2xl font-bold py-4 hover:-translate-y-1 transition-all" size="lg">
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

        {/* Top-Level Section Tab Switcher: Overview vs Requests Hub */}
        <div className="flex border-b border-border gap-2">
          <button
            onClick={() => setActiveMainTab("overview")}
            className={`pb-3 px-6 font-black text-xs uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeMainTab === "overview"
                ? "border-primary text-primary"
                : "border-transparent text-muted hover:text-fg hover:border-border"
            }`}
          >
            <span>Sessions & Overview</span>
          </button>

          <button
            onClick={() => setActiveMainTab("requests")}
            className={`pb-3 px-6 font-black text-xs uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeMainTab === "requests"
                ? "border-primary text-primary"
                : "border-transparent text-muted hover:text-fg hover:border-border"
            }`}
          >
            <span>Requests Center</span>
            {totalUserRequests > 0 && (
              <span className="bg-primary text-white text-[9px] px-2 py-0.5 rounded-full font-black">
                {totalUserRequests}
              </span>
            )}
          </button>
        </div>

        {/* ============================================================== */}
        {/* MAIN TAB 1: SESSIONS & OVERVIEW */}
        {/* ============================================================== */}
        {activeMainTab === "overview" && (
          <div className="space-y-8 animate-fade-in">
            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-3">
              {/* Account Type Card */}
              <Card className="p-6 border-t-4 border-t-primary shadow-soft hover:shadow-lift transition-all flex flex-col justify-between group">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted">Account Track</span>
                    <div className="text-2xl font-black text-fg capitalize mt-1.5 flex items-center gap-2">
                      {user?.role === "alumni" ? "Alumni Mentor" : user?.role || "—"}
                      <span className={`h-2.5 w-2.5 rounded-full ${
                        user?.role === "student" ? "bg-accent shadow-xs" :
                        user?.role === "senior" ? "bg-primary shadow-xs" :
                        user?.role === "alumni" ? "bg-emerald-500 shadow-xs" :
                        "bg-danger shadow-xs"
                      }`} />
                    </div>
                  </div>
                  <StatIcon tint="bg-primary/10 text-primary">
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.4" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                  </StatIcon>
                </div>
                <div className="mt-4 pt-3 border-t border-border/50 text-[11px] font-semibold text-muted">
                  {user?.role === "student" ? "1-on-1 Mentorship & College Guidance" : `${user?.college || "Top College"} Mentor`}
                </div>
              </Card>

              {/* Wallet / Balance Card */}
              <Card className="p-6 border-t-4 border-t-success shadow-soft hover:shadow-lift transition-all flex flex-col justify-between group">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted">
                      {isMentor ? "Earnings Wallet" : "Call Credits"}
                    </span>
                    <div className="text-3xl font-black text-fg mt-1">
                      {isMentor ? `₹${user?.availableBalance ?? 0}` : `${user?.callCredits ?? 0} Calls`}
                    </div>
                  </div>
                  <StatIcon tint="bg-success/10 text-success">
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.4" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  </StatIcon>
                </div>
                <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-xs font-bold">
                  {isMentor ? (
                    <button
                      onClick={() => { setActiveMainTab("requests"); setRequestSubTab("payouts"); }}
                      className="text-primary hover:underline text-[11px] font-black uppercase tracking-wider"
                    >
                      Request Payout →
                    </button>
                  ) : (
                    <Link to="/buy-credits" className="text-primary hover:underline text-[11px] font-black uppercase tracking-wider">
                      + Buy More Credits
                    </Link>
                  )}
                </div>
              </Card>

              {/* Total Sessions Card */}
              <Card className="p-6 border-t-4 border-t-accent shadow-soft hover:shadow-lift transition-all flex flex-col justify-between group">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted">Total Sessions</span>
                    <div className="text-3xl font-black text-fg mt-1">{bookings.length}</div>
                  </div>
                  <StatIcon tint="bg-accent/10 text-accent">
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.4" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                  </StatIcon>
                </div>
                <div className="mt-4 pt-3 border-t border-border/50 flex justify-between items-center text-[10px] font-black text-muted uppercase tracking-wider">
                  <span>Completed: {bookings.filter(b => b.status === "completed").length}</span>
                  <span>Confirmed: {bookings.filter(b => b.status === "confirmed").length}</span>
                </div>
              </Card>
            </div>

            {/* Prep Notes Workspace */}
            {upcoming && upcoming.length > 0 && activePrepBooking && (
              <section className="animate-fade-up">
                <Card className="p-6 md:p-8 border-t-4 border-t-primary shadow-soft hover:shadow-lift transition-all relative overflow-hidden group">
                  <div className="absolute -right-16 -top-16 h-36 w-36 bg-primary/5 blur-2xl pointer-events-none rounded-full" />
                  <div className="flex flex-col md:flex-row gap-6 justify-between">
                    <div className="space-y-4 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-primary/10 border border-primary/20 text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                          <span className="h-1.5 w-1.5 rounded-full bg-primary live-pulse-active" />
                          Session Prep Workspace
                        </div>

                        {upcoming.length > 1 && (
                          <select
                            value={activePrepBookingId || ""}
                            onChange={(e) => handleSelectPrepBooking(e.target.value)}
                            className="px-3 py-1.5 rounded-xl border border-border bg-surface text-xs font-bold text-fg outline-none focus:border-primary cursor-pointer"
                          >
                            {upcoming.map((b) => (
                              <option key={b._id} value={b._id}>
                                With {user?.role === "student" ? b.senior?.name : b.student?.name} ({new Date(b.startTime).toLocaleDateString("en-IN", { month: "short", day: "numeric" })})
                              </option>
                            ))}
                          </select>
                        )}
                      </div>

                      <h3 className="text-xl font-black text-fg tracking-tight">
                        Session Prep Notes with {user?.role === "student" ? activePrepBooking.senior?.name : activePrepBooking.student?.name}
                      </h3>

                      <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-muted uppercase tracking-wider">
                        <span className="flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 text-primary shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" /></svg>
                          {formatDateTime(activePrepBooking.startTime)}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 text-accent shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          20 min call
                        </span>
                      </div>

                      <p className="text-xs text-muted max-w-xl leading-relaxed">
                        {user?.role === "student"
                          ? "Write down any questions you want to ask, links to your LinkedIn, or concerns. These notes will be saved and visible to the senior during the call."
                          : "These are the preparation notes and questions provided by the student for this upcoming session."}
                      </p>

                      {user?.role === "student" && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {[
                            "Placement Stats",
                            "Branch Change Rules",
                            "Internships",
                            "Campus & Hostel Life",
                            "Exam Prep"
                          ].map((prompt) => (
                            <button
                              key={prompt}
                              type="button"
                              onClick={() => {
                                if (!notesText.includes(prompt)) {
                                  setNotesText(prev => (prev ? `${prev}\n• ${prompt}` : `• ${prompt}`));
                                }
                              }}
                              className="text-[9px] font-black uppercase px-2.5 py-1 rounded-lg bg-surface2 border border-border text-muted hover:text-primary hover:border-primary/30 transition-all cursor-pointer"
                            >
                              + {prompt}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="w-full md:w-[380px] space-y-3">
                      {user?.role === "student" ? (
                        <>
                          <textarea
                            rows={4}
                            placeholder="E.g., What are the placement statistics for CSE? How difficult is it to maintain a 9+ CGPA here?"
                            value={notesText}
                            onChange={(e) => setNotesText(e.target.value)}
                            className="w-full p-4 rounded-2xl border border-border bg-surface2/60 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-xs font-bold text-fg hover:border-primary/25 placeholder:text-muted/60"
                          />
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase text-muted tracking-wider">
                              {notesText.length}/2000 characters
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
                        </>
                      ) : (
                        <div className="space-y-3">
                          <div className="p-4 rounded-2xl border border-border bg-surface2/60 text-xs font-bold text-fg leading-relaxed min-h-[110px] whitespace-pre-wrap">
                            {activePrepBooking.notes ? activePrepBooking.notes : (
                              <span className="text-muted/60 italic select-none">No preparation notes written by student yet.</span>
                            )}
                          </div>
                          {activePrepBooking.notes && (
                            <div className="flex justify-end">
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => {
                                  navigator.clipboard.writeText(activePrepBooking.notes);
                                  setCopiedNotes(true);
                                  setTimeout(() => setCopiedNotes(false), 2000);
                                }}
                                className="rounded-xl font-black px-4 py-1.5 text-xs cursor-pointer"
                              >
                                {copiedNotes ? " Copied" : " Copy Notes"}
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </section>
            )}

            {/* Sessions Grid */}
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
                  emptyDescription={user?.role === "student" ? "Book a session with a mentor to see it here." : "Waiting for students to book a session."}
                />
              </div>

              {/* Past */}
              <div className="space-y-4 animate-fade-up delay-200">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-xl font-black text-fg tracking-tight">Session History</h3>
                  {past.length > HISTORY_PREVIEW_COUNT && (
                    <button
                      onClick={() => setShowHistoryMore(v => !v)}
                      className="flex items-center gap-1.5 text-xs font-black text-primary uppercase tracking-wider hover:underline transition-all"
                    >
                      <span>{showHistoryMore ? "View Less" : `View All (${past.length})`}</span>
                      <svg className={`h-3.5 w-3.5 transition-transform duration-300 ${showHistoryMore ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                      </svg>
                    </button>
                  )}
                </div>
                <SessionList
                  items={showHistoryMore ? past : past.slice(0, HISTORY_PREVIEW_COUNT)}
                  userRole={user?.role}
                  actionLabel="View Details"
                  emptyTitle="No history yet"
                  emptyDescription="Completed or cancelled sessions will appear here."
                />
              </div>
            </div>

            {/* Active Calendar Slots for Mentors */}
            {isMentor && (
              <Card className="p-6 border border-border bg-surface">
                <div className="flex items-center justify-between mb-6">
                  <div className="space-y-1">
                    <h3 className="text-lg font-black text-fg tracking-tight">Active Calendar Availability</h3>
                    <p className="text-xs text-muted font-semibold">Your open session slots visible to students on Clarior</p>
                  </div>
                  <Link to="/availability">
                    <Button variant="secondary" size="sm" className="rounded-xl font-bold text-xs">
                      Manage All Slots →
                    </Button>
                  </Link>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                  {upcomingSlots.length ? (
                    upcomingSlots.slice(0, 6).map((slot) => {
                      const slotDate = new Date(slot.date);
                      return (
                        <div key={slot._id} className="p-3.5 rounded-2xl bg-surface2/60 border border-border/40 flex items-center justify-between">
                          <div>
                            <div className="text-xs font-black text-fg">
                              {slotDate.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                            </div>
                            <div className="text-[10px] font-bold text-muted mt-0.5">{slot.startTime || slot.time}</div>
                          </div>
                          <span className="h-2 w-2 rounded-full bg-success shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                        </div>
                      );
                    })
                  ) : (
                    <div className="col-span-full py-8 text-center text-muted">
                      <p className="text-xs font-semibold">No active slots published. Add your availability so students can book you.</p>
                      <Link to="/availability" className="inline-block mt-2 text-xs font-black text-primary hover:underline">
                        + Add Slots Now
                      </Link>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* MAIN TAB 2: REQUESTS CENTER */}
        {/* ============================================================== */}
        {activeMainTab === "requests" && (
          <div className="space-y-6 animate-fade-in">
            {/* Requests Navigation Pills */}
            <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-surface2/60 border border-border/60">
              <button
                onClick={() => setRequestSubTab("slots")}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                  requestSubTab === "slots"
                    ? "bg-surface text-primary shadow-soft border border-primary/20"
                    : "text-muted hover:text-fg hover:bg-surface/50"
                }`}
              >
                <span>{isMentor ? "Incoming Slot Requests" : "Custom Slot Requests"}</span>
                {pendingSlotReqsCount > 0 && (
                  <span className="bg-primary text-white text-[9px] px-1.5 py-0.5 rounded-full font-black">
                    {pendingSlotReqsCount}
                  </span>
                )}
              </button>

              {isMentor && (
                <button
                  onClick={() => setRequestSubTab("payouts")}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                    requestSubTab === "payouts"
                      ? "bg-surface text-primary shadow-soft border border-primary/20"
                      : "text-muted hover:text-fg hover:bg-surface/50"
                  }`}
                >
                  <span>Payouts & Withdrawals</span>
                  {pendingPayoutsCount > 0 && (
                    <span className="bg-accent text-accent-fg text-[9px] px-1.5 py-0.5 rounded-full font-black">
                      {pendingPayoutsCount}
                    </span>
                  )}
                </button>
              )}

              <button
                onClick={() => setRequestSubTab("colleges")}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                  requestSubTab === "colleges"
                    ? "bg-surface text-primary shadow-soft border border-primary/20"
                    : "text-muted hover:text-fg hover:bg-surface/50"
                }`}
              >
                <span>College Requests</span>
                {myCollegeRequests.length > 0 && (
                  <span className="bg-surface text-muted text-[9px] px-1.5 py-0.5 rounded-full font-black border border-border">
                    {myCollegeRequests.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setRequestSubTab("tickets")}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                  requestSubTab === "tickets"
                    ? "bg-surface text-primary shadow-soft border border-primary/20"
                    : "text-muted hover:text-fg hover:bg-surface/50"
                }`}
              >
                <span>Support Tickets</span>
                {myTickets.filter(t => t.status === "open").length > 0 && (
                  <span className="bg-amber-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-black">
                    {myTickets.filter(t => t.status === "open").length}
                  </span>
                )}
              </button>
            </div>

            {/* -------------------------------------------------------- */}
            {/* SUBTAB 1: SLOT REQUESTS */}
            {/* -------------------------------------------------------- */}
            {requestSubTab === "slots" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <div>
                    <h3 className="heading-display text-lg font-black text-fg">
                      {isMentor ? "Incoming Custom Slot Requests" : "Your Custom Slot Requests"}
                    </h3>
                    <p className="text-xs text-muted font-medium">
                      {isMentor 
                        ? "Students requesting specific call dates with you outside your regular calendar."
                        : "Track custom session requests you've sent to mentors."}
                    </p>
                  </div>
                </div>

                {/* For Mentors: Incoming Requests */}
                {isMentor && (
                  <div>
                    {slotRequests.length === 0 ? (
                      <Card className="p-12 text-center border-dashed border-2 border-border/70 bg-surface2/30">
                        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary text-2xl">
                          
                        </div>
                        <h4 className="font-black text-fg text-sm uppercase tracking-wider">No slot requests yet</h4>
                        <p className="text-xs text-muted mt-1 font-semibold">When students request a custom call time with you, it will appear here.</p>
                      </Card>
                    ) : (
                      <div className="grid gap-4 sm:grid-cols-2">
                        {slotRequests.map((req) => (
                          <Card key={req._id} className="p-5 border border-border bg-surface hover:shadow-soft transition-all flex flex-col justify-between">
                            <div className="space-y-3">
                              <div className="flex justify-between items-start gap-2">
                                <div>
                                  <div className="font-black text-fg text-sm">{req.student?.name || "Student"}</div>
                                  <div className="text-[10px] text-muted font-bold mt-0.5">{req.student?.email}</div>
                                </div>
                                <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[8px] font-black uppercase tracking-wider ${
                                  req.status === "accepted" ? "bg-success/10 text-success border-success/20" :
                                  req.status === "rejected" ? "bg-danger/10 text-danger border-danger/20" :
                                  "bg-warning/10 text-warning border-warning/20"
                                }`}>
                                  {req.status}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 text-xs font-semibold text-fg bg-surface2/60 border border-border/40 px-3 py-2 rounded-xl">
                                <span> {new Date(req.preferredDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                                <span className="h-1 w-1 rounded-full bg-primary" />
                                <span className="capitalize"> {req.preferredTime}</span>
                              </div>

                              {req.notes && (
                                <p className="text-xs text-muted italic bg-surface2/30 p-2.5 rounded-lg border border-border/20 leading-relaxed">
                                  "{req.notes}"
                                </p>
                              )}
                            </div>

                            {req.status === "pending" && (
                              <div className="flex gap-2 pt-4 mt-3 border-t border-border/40">
                                <Button
                                  variant="primary"
                                  size="sm"
                                  className="flex-1 rounded-xl font-black text-xs"
                                  onClick={() => handleUpdateStatus(req._id, "accepted")}
                                  disabled={loading}
                                >
                                   Accept & Add Slot
                                </Button>
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  className="flex-1 rounded-xl font-black text-xs border-danger/20 text-danger hover:bg-danger/10"
                                  onClick={() => handleUpdateStatus(req._id, "rejected")}
                                  disabled={loading}
                                >
                                   Decline
                                </Button>
                              </div>
                            )}
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* For Students: Outgoing Requests */}
                {!isMentor && (
                  <div>
                    {slotRequests.length === 0 ? (
                      <Card className="p-12 text-center border-dashed border-2 border-border/70 bg-surface2/30">
                        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary text-2xl">
                          
                        </div>
                        <h4 className="font-black text-fg text-sm uppercase tracking-wider">No custom slot requests</h4>
                        <p className="text-xs text-muted mt-1 font-semibold">Need a slot with a senior who has no open slots? Go to their profile and click "Request Slot".</p>
                        <Link to="/explore" className="inline-block mt-4">
                          <Button size="sm" className="rounded-xl font-black">Explore Mentors</Button>
                        </Link>
                      </Card>
                    ) : (
                      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                        {slotRequests.map((req) => (
                          <Card key={req._id} className="p-5 border border-border bg-surface hover:shadow-soft transition-all flex flex-col justify-between">
                            <div className="space-y-3">
                              <div className="flex justify-between items-start gap-2">
                                <div>
                                  <div className="font-black text-fg text-sm">{req.senior?.name || "Mentor"}</div>
                                  <div className="text-[10px] text-muted font-bold mt-0.5 truncate max-w-[170px]">
                                    {req.senior?.college || "Top College"}
                                  </div>
                                </div>
                                <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[8px] font-black uppercase tracking-wider ${
                                  req.status === "accepted" ? "bg-success/10 text-success border-success/20" :
                                  req.status === "rejected" ? "bg-danger/10 text-danger border-danger/20" :
                                  "bg-warning/10 text-warning border-warning/20"
                                }`}>
                                  {req.status}
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5 text-[11px] font-bold text-fg bg-surface2/60 border border-border/40 px-2.5 py-1.5 rounded-xl">
                                <span> {new Date(req.preferredDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                                <span className="h-1 w-1 rounded-full bg-primary" />
                                <span className="capitalize"> {req.preferredTime}</span>
                              </div>

                              {req.notes && (
                                <p className="text-xs text-muted italic bg-surface2/30 p-2 rounded-lg border border-border/20 line-clamp-2">
                                  "{req.notes}"
                                </p>
                              )}
                            </div>

                            {req.status === "accepted" && (
                              <div className="pt-3 mt-3 border-t border-border/40">
                                <Link to={`/profile/${req.senior?._id}`} className="block">
                                  <Button variant="primary" size="sm" className="w-full rounded-xl font-black text-xs">
                                    Book Slot Now →
                                  </Button>
                                </Link>
                              </div>
                            )}
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* -------------------------------------------------------- */}
            {/* SUBTAB 2: PAYOUTS & WITHDRAWALS (MENTORS ONLY) */}
            {/* -------------------------------------------------------- */}
            {requestSubTab === "payouts" && isMentor && (
              <div className="space-y-6">
                <div className="grid gap-6 lg:grid-cols-2">
                  {/* Visual Balance & Request Payout Form */}
                  <Card className="p-6 border border-border bg-surface hover:shadow-soft transition-all">
                    <h3 className="text-base font-black text-fg mb-4">Request Withdrawal</h3>
                    
                    {/* Fintech card */}
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-5 text-white shadow-xl border border-white/10 mb-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">Available Balance</div>
                          <div className="text-3xl font-black mt-1 text-emerald-400 tracking-tight">₹{user?.availableBalance ?? 0}</div>
                        </div>
                        <div className="h-7 w-10 rounded-md bg-amber-400/80 p-1 flex items-center justify-center text-[10px] font-black text-black">
                          UPI
                        </div>
                      </div>

                      <div className="mt-6 flex justify-between items-end">
                        <div>
                          <div className="text-[9px] font-black uppercase tracking-widest text-slate-500">Registered UPI</div>
                          <div className="text-xs font-mono font-bold mt-0.5 text-slate-200">{user?.upiId || "Not Registered"}</div>
                        </div>
                        <span className="text-[8px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          Ready
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="text-[10px] font-black uppercase text-muted block mb-1">Withdraw Amount (₹)</label>
                        <input
                          type="number"
                          min="50"
                          value={withdrawAmount}
                          onChange={(e) => setWithdrawAmount(e.target.value)}
                          placeholder="Min. ₹50"
                          className="w-full p-3 rounded-xl border border-border bg-surface2/60 text-sm font-bold text-fg outline-none focus:border-primary"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-black uppercase text-muted block mb-1">Target UPI ID</label>
                        <input
                          type="text"
                          value={withdrawUpi}
                          onChange={(e) => setWithdrawUpi(e.target.value)}
                          placeholder="username@bank"
                          className="w-full p-3 rounded-xl border border-border bg-surface2/60 text-sm font-bold text-fg outline-none focus:border-primary"
                        />
                      </div>

                      <Button
                        onClick={handleWithdraw}
                        disabled={loading || !user?.isVerified || !withdrawAmount || !withdrawUpi}
                        className="w-full rounded-xl font-black py-3"
                        loading={loading}
                      >
                        {user?.isVerified ? "Submit Payout Request" : "Profile Verification Pending"}
                      </Button>
                    </div>
                  </Card>

                  {/* Payout History */}
                  <Card className="p-6 border border-border bg-surface hover:shadow-soft transition-all">
                    <h3 className="text-base font-black text-fg mb-4">Payout Request History</h3>

                    {myWithdraws.length === 0 ? (
                      <div className="py-12 text-center text-muted">
                        <div className="text-3xl mb-2"></div>
                        <p className="text-xs font-semibold">No past withdrawal requests.</p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                        {myWithdraws.map((w) => (
                          <div key={w._id} className="p-3.5 rounded-2xl bg-surface2/50 border border-border/40 flex items-center justify-between">
                            <div>
                              <div className="text-sm font-black text-fg">₹{w.amount}</div>
                              <div className="text-[10px] text-muted font-bold mt-0.5">{w.upiId} • {formatISTDate(w.createdAt)}</div>
                            </div>
                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                              w.status === "approved" ? "bg-success/10 text-success border-success/20" :
                              w.status === "rejected" ? "bg-danger/10 text-danger border-danger/20" :
                              "bg-warning/10 text-warning border-warning/20"
                            }`}>
                              {w.status === "approved" ? "Paid" : w.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                </div>
              </div>
            )}

            {/* -------------------------------------------------------- */}
            {/* SUBTAB 3: COLLEGE REQUESTS */}
            {/* -------------------------------------------------------- */}
            {requestSubTab === "colleges" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <div>
                    <h3 className="heading-display text-lg font-black text-fg">College Addition Requests</h3>
                    <p className="text-xs text-muted font-medium">Colleges you requested to be listed on Clarior.</p>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => setShowCollegeModal(true)} 
                    className="rounded-xl font-black text-xs"
                  >
                    + Request A College
                  </Button>
                </div>

                {myCollegeRequests.length === 0 ? (
                  <Card className="p-12 text-center border-dashed border-2 border-border/70 bg-surface2/30">
                    <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-accent text-2xl">
                      
                    </div>
                    <h4 className="font-black text-fg text-sm uppercase tracking-wider">No college requests submitted</h4>
                    <p className="text-xs text-muted mt-1 font-semibold">Can't find your college on Clarior? Submit a request and our team will verify and add it.</p>
                    <Button 
                      size="sm" 
                      onClick={() => setShowCollegeModal(true)} 
                      className="mt-4 rounded-xl font-black"
                    >
                      + Request A College
                    </Button>
                  </Card>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                    {myCollegeRequests.map((r) => (
                      <Card key={r._id} className="p-5 border border-border bg-surface hover:shadow-soft transition-all">
                        <div className="space-y-2">
                          <div className="flex justify-between items-start gap-2">
                            <h4 className="font-black text-fg text-sm">{r.name}</h4>
                            <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider border ${
                              r.status === "approved" ? "bg-success/10 text-success border-success/20" :
                              r.status === "rejected" ? "bg-danger/10 text-danger border-danger/20" :
                              "bg-warning/10 text-warning border-warning/20"
                            }`}>
                              {r.status}
                            </span>
                          </div>
                          <div className="text-xs text-muted font-medium">{r.city}, {r.state}</div>
                          <div className="text-[10px] text-muted pt-2 border-t border-border/30">
                            Requested: {formatISTDate(r.createdAt)}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* -------------------------------------------------------- */}
            {/* SUBTAB 4: SUPPORT TICKETS */}
            {/* -------------------------------------------------------- */}
            {requestSubTab === "tickets" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <div>
                    <h3 className="heading-display text-lg font-black text-fg">Support & Help Inquiries</h3>
                    <p className="text-xs text-muted font-medium">Track your help desk tickets and inquiries with the Clarior team.</p>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => setShowTicketModal(true)} 
                    className="rounded-xl font-black text-xs"
                  >
                    + Open Support Ticket
                  </Button>
                </div>

                {myTickets.length === 0 ? (
                  <Card className="p-12 text-center border-dashed border-2 border-border/70 bg-surface2/30">
                    <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary text-2xl">
                      
                    </div>
                    <h4 className="font-black text-fg text-sm uppercase tracking-wider">No support tickets</h4>
                    <p className="text-xs text-muted mt-1 font-semibold">Have questions or facing payment / call issues? We're always here to assist.</p>
                    <Button 
                      size="sm" 
                      onClick={() => setShowTicketModal(true)} 
                      className="mt-4 rounded-xl font-black"
                    >
                      + Open Support Ticket
                    </Button>
                  </Card>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {myTickets.map((t) => (
                      <Card key={t._id} className="p-5 border border-border bg-surface hover:shadow-soft transition-all flex flex-col justify-between">
                        <div className="space-y-3">
                          <div className="flex justify-between items-start gap-2">
                            <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                              {t.category || "General"}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider border ${
                              t.status === "resolved" ? "bg-success/10 text-success border-success/20" : "bg-warning/10 text-warning border-warning/20"
                            }`}>
                              {t.status}
                            </span>
                          </div>

                          <div className="text-xs text-fg leading-relaxed bg-surface2/50 p-3 rounded-xl border border-border/30">
                            "{t.message}"
                          </div>
                        </div>

                        <div className="text-[10px] text-muted font-bold pt-3 mt-3 border-t border-border/30">
                          Submitted: {formatISTDate(t.createdAt)}
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* College Request Modal */}
      {showCollegeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-6 space-y-4 animate-scale-in">
            <h4 className="text-base font-black text-fg">Request a College</h4>
            <p className="text-xs text-muted font-medium">
              Submit your college details. Our team will verify and add it to Clarior catalog.
            </p>

            <form onSubmit={handleCreateCollegeRequest} className="space-y-3">
              <div>
                <label className="text-[10px] font-black uppercase text-muted block mb-1">College Name *</label>
                <input
                  type="text"
                  required
                  value={newCollege.name}
                  onChange={(e) => setNewCollege(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Indian Institute of Technology Bombay"
                  className="w-full p-2.5 rounded-xl border border-border bg-surface text-xs font-bold text-fg outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase text-muted block mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={newCollege.city}
                    onChange={(e) => setNewCollege(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="Mumbai"
                    className="w-full p-2.5 rounded-xl border border-border bg-surface text-xs font-bold text-fg outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-muted block mb-1">State *</label>
                  <input
                    type="text"
                    required
                    value={newCollege.state}
                    onChange={(e) => setNewCollege(prev => ({ ...prev, state: e.target.value }))}
                    placeholder="Maharashtra"
                    className="w-full p-2.5 rounded-xl border border-border bg-surface text-xs font-bold text-fg outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase text-muted block mb-1">Type</label>
                  <select
                    value={newCollege.type}
                    onChange={(e) => setNewCollege(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full p-2.5 rounded-xl border border-border bg-surface text-xs font-bold text-fg outline-none focus:border-primary"
                  >
                    <option value="Government">Government / Public</option>
                    <option value="Private">Private</option>
                    <option value="Autonomous">Autonomous</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-muted block mb-1">Est. Year</label>
                  <input
                    type="number"
                    value={newCollege.established}
                    onChange={(e) => setNewCollege(prev => ({ ...prev, established: e.target.value }))}
                    placeholder="1958"
                    className="w-full p-2.5 rounded-xl border border-border bg-surface text-xs font-bold text-fg outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-3">
                <Button type="button" variant="secondary" onClick={() => setShowCollegeModal(false)} size="sm" className="rounded-xl">
                  Cancel
                </Button>
                <Button type="submit" size="sm" loading={submittingCollege} className="rounded-xl font-black">
                  Submit Request
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Support Ticket Modal */}
      {showTicketModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-6 space-y-4 animate-scale-in">
            <h4 className="text-base font-black text-fg">Open Support Ticket</h4>
            <p className="text-xs text-muted font-medium">
              Have an issue or inquiry? Send us a message and our support team will get back to you.
            </p>

            <form onSubmit={handleCreateSupportTicket} className="space-y-3">
              <div>
                <label className="text-[10px] font-black uppercase text-muted block mb-1">Category</label>
                <select
                  value={newTicket.category}
                  onChange={(e) => setNewTicket(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full p-2.5 rounded-xl border border-border bg-surface text-xs font-bold text-fg outline-none focus:border-primary"
                >
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="Payment Issue">Payment Issue</option>
                  <option value="Booking Problem">Booking Problem</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-muted block mb-1">Message *</label>
                <textarea
                  rows={4}
                  required
                  value={newTicket.message}
                  onChange={(e) => setNewTicket(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Describe the issue or question in detail..."
                  className="w-full p-3 rounded-xl border border-border bg-surface text-xs font-bold text-fg outline-none focus:border-primary"
                />
              </div>

              <div className="flex gap-2 justify-end pt-3">
                <Button type="button" variant="secondary" onClick={() => setShowTicketModal(false)} size="sm" className="rounded-xl">
                  Cancel
                </Button>
                <Button type="submit" size="sm" loading={submittingTicket} className="rounded-xl font-black">
                  Send Ticket
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </AppShell>
  );
}

export default Dashboard;
