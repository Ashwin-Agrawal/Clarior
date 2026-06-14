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
    <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${tint}`}>
      {children}
    </div>
  );
}

function EmptyState({ title, description }) {
  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-surface2/50 px-6 py-10 text-center animate-fade-in">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface text-primary shadow-soft">
        <svg className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
      </div>
      <div className="mt-5 text-xl font-bold text-fg">{title}</div>
      <div className="mt-2 max-w-md text-sm leading-6 text-muted">{description}</div>
    </div>
  );
}

function SessionList({ items, userRole, actionLabel, emptyTitle, emptyDescription }) {
  if (!items.length) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="mt-6 space-y-4">
      {items.map((booking, idx) => {
        const startTime = new Date(booking.startTime || booking.date || 0).getTime();
        const isToday = new Date().toDateString() === new Date(startTime).toDateString();
        
        let borderClass = "border-l-4 border-l-muted/30";
        if (booking.status === "confirmed") {
          borderClass = isToday ? "border-l-4 border-l-success" : "border-l-4 border-l-primary";
        }

        return (
          <div
            key={booking._id}
            className={`group flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-border bg-surface p-5 shadow-soft hover:shadow-lift hover:border-primary/20 transition-all duration-200 animate-fade-up ${borderClass}`}
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <div className="text-lg font-bold text-fg group-hover:text-primary transition-colors">
                  {userRole === "student"
                    ? booking?.senior?.name || "Senior"
                    : booking?.student?.name || "Student"}
                </div>
                <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
                  booking.status === "confirmed" ? "bg-success/10 text-success border border-success/20" :
                  booking.status === "completed" ? "bg-primary/10 text-primary border border-primary/20" :
                  booking.status === "cancelled" ? "bg-danger/10 text-danger border border-danger/20" :
                  "bg-muted/10 text-muted border border-muted/20"
                }`}>
                  {booking.status}
                </span>
              </div>

              <div className="mt-3 grid gap-4 text-xs text-muted md:grid-cols-2 lg:grid-cols-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-surface2 flex items-center justify-center text-muted">
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
                  </div>
                  <div>
                    <div className="font-semibold text-muted/60 uppercase tracking-widest text-[9px]">Date & Time</div>
                    <div className="text-fg font-medium">{formatDateTime(booking.startTime)}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-surface2 flex items-center justify-center text-muted">
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                  </div>
                  <div>
                    <div className="font-semibold text-muted/60 uppercase tracking-widest text-[9px]">Duration</div>
                    <div className="text-fg font-medium">25-minute call</div>
                  </div>
                </div>
              </div>
            </div>

            <Link to={`/session/${booking._id}`} className="w-full sm:w-auto">
              <Button 
                variant={booking.status === "completed" || booking.status === "cancelled" ? "secondary" : "primary"} 
                className="w-full sm:w-auto rounded-2xl"
              >
                {actionLabel}
              </Button>
            </Link>
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
  const [bookings, setBookings] = useState([]);
  const [slots, setSlots] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(() => Date.now());

  const handleWithdraw = async () => {
    try {
      const amount = Number(withdrawAmount);
      if (!amount || amount < 50) {
        showError("Enter a valid amount (minimum ₹50).");
        return;
      }
      setLoading(true);
      await api.post("/withdraw/request", { amount });
      showSuccess("Withdraw request sent successfully.");
      setWithdrawAmount("");
      // Refresh to update balances
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
      // Silent refresh
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

  const firstName = user?.name?.split(" ")[0] || "there";
  const today = useMemo(() => new Date(), []);
  const isUnverifiedSenior = user?.role === "senior" && !user?.isVerified;

  const handleLogout = async () => {
    try { await api.get("/auth/logout"); } catch {
      // Logout remains local-first so users are never trapped by a stale session.
    }
    setUser(null);
    navigate("/");
  };

  const { walletBorder, walletTint } = useMemo(() => {
    if (user?.role === "student") {
      const credits = user.callCredits ?? 0;
      if (credits === 0) {
        return { walletBorder: "border-l-danger", walletTint: "bg-danger/10 text-danger" };
      } else if (credits === 1) {
        return { walletBorder: "border-l-warning", walletTint: "bg-warning/10 text-warning" };
      }
    }
    return { walletBorder: "border-l-success", walletTint: "bg-success/10 text-success" };
  }, [user]);

  return (
    <AppShell title="Dashboard">
      <div className="space-y-8 pb-10">
        {/* Welcome Header */}
        <section className="relative overflow-hidden rounded-[32px] border border-border bg-surface p-8 shadow-card animate-fade-up">
          <div className="absolute right-0 top-0 h-40 w-40 rounded-full blur-3xl bg-primary/8 dark:bg-primary/5 -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between relative z-10">
            <div className="flex items-center gap-6">
              <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-[28px] bg-gradient-to-br from-primary to-accent text-3xl font-extrabold text-primary-foreground shadow-lift">
                {user?.name?.trim()?.[0] || "C"}
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary mb-2">
                  {formatDayLabel(today)}
                </div>
                <h2 className="heading-display text-3xl font-extrabold text-fg sm:text-4xl">
                  {user?.role === "admin" ? "Admin command center" : `Welcome back, ${firstName}`}
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
                  {user?.role === "senior" 
                    ? "Your senior portal is ready. Track your earnings and manage your availability below."
                    : "Ready to get some clarity? Book a session or manage your upcoming calls here."}
                </p>
                {user?.role === "senior" && (
                  <div className="mt-4 flex flex-wrap gap-3">
                    <div className="rounded-2xl border border-border bg-surface-2/30 backdrop-blur px-4 py-2 shadow-sm bg-surface2/40">
                      <div className="text-[9px] font-black text-muted uppercase tracking-wider">Available Balance</div>
                      <div className="text-base font-black text-success mt-0.5">₹{user?.availableBalance ?? 0}</div>
                    </div>
                    <div className="rounded-2xl border border-border bg-surface-2/30 backdrop-blur px-4 py-2 shadow-sm bg-surface2/40">
                      <div className="text-[9px] font-black text-muted uppercase tracking-wider">Pending Earnings</div>
                      <div className="text-base font-black text-fg mt-0.5">₹{user?.pendingEarnings ?? 0}</div>
                    </div>
                  </div>
                )}
                {isUnverifiedSenior && (
                  <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-amber-700">
                    <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                    Verification pending
                  </div>
                )}
              </div>
            </div>

            <div className="grid w-full gap-3 sm:grid-cols-2 lg:w-[400px]">
              {(user?.role === "student" || user?.role === "senior") && (
                <Link to="/bookings">
                  <Button className="w-full rounded-2xl" size="lg">Open sessions</Button>
                </Link>
              )}
              {user?.role === "senior" && user?.isVerified && (
                <Link to="/availability">
                  <Button variant="secondary" className="w-full rounded-2xl" size="lg">Manage slots</Button>
                </Link>
              )}
              {user?.role === "student" && (
                <Link to="/explore">
                  <Button variant="secondary" className="w-full rounded-2xl" size="lg">Find Seniors</Button>
                </Link>
              )}
              {user?.role === "admin" && (
                <Link to="/admin">
                  <Button variant="secondary" className="w-full rounded-2xl" size="lg">Admin panel</Button>
                </Link>
              )}
              <Button variant="ghost" className="w-full rounded-2xl" size="lg" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </section>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Role Card */}
          <Card className="p-6 border-l-4 border-l-primary animate-fade-up delay-100">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-muted">Account Type</div>
                <div className="mt-2 text-2xl font-extrabold capitalize text-fg">{user?.role || "—"}</div>
              </div>
              <StatIcon>
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </StatIcon>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-muted">
              {user?.role === "student" ? "Book sessions and get clarity from top seniors." : "Help students and earn per session."}
            </p>
          </Card>

          {/* Wallet/Credits Card */}
          <Card className={`p-6 border-l-4 ${walletBorder} animate-fade-up delay-200`}>
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-muted">
                  {user?.role === "senior" ? "Available Balance" : "Available Credits"}
                </div>
                <div className="mt-2 text-2xl font-extrabold text-fg">
                  {user?.role === "senior" ? `₹${user?.availableBalance ?? 0}` : user?.callCredits ?? 0}
                </div>
              </div>
              <StatIcon tint={walletTint}>
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/><path d="M16 14h2"/></svg>
              </StatIcon>
            </div>
            {user?.role === "senior" ? (
              <div className="mt-4 flex gap-2">
                <div className="flex-1 rounded-xl bg-surface2 p-2 text-center">
                  <div className="text-[9px] font-bold text-muted uppercase">Pending</div>
                  <div className="text-xs font-bold text-fg">₹{user?.pendingEarnings ?? 0}</div>
                </div>
                <div className="flex-1 rounded-xl bg-success/10 px-2 py-2 text-center text-[10px] font-bold text-success">
                  Ready
                </div>
              </div>
            ) : (
              <div className="mt-4 flex items-center justify-between">
                <p className="text-xs text-muted">Use credits to book calls.</p>
                <Link to="/buy-credits" className="text-xs font-bold text-primary hover:underline">Buy more →</Link>
              </div>
            )}
          </Card>

          {/* Activity Card */}
          <Card className="p-6 border-l-4 border-l-accent animate-fade-up delay-300">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-muted">Sessions</div>
                <div className="mt-2 text-2xl font-extrabold text-fg">{bookings.length}</div>
              </div>
              <StatIcon tint="bg-accent/10 text-accent">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
              </StatIcon>
            </div>
            <p className="mt-4 text-xs text-muted leading-relaxed">
              Track your journey through completed conversations.
            </p>
          </Card>
        </div>

        {/* Sessions Section */}
        {(user?.role === "student" || user?.role === "senior") && (
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Upcoming */}
            <div className="space-y-4 animate-fade-up">
              <div className="flex items-center justify-between px-2">
                <h3 className="heading-display text-xl font-extrabold text-fg">Upcoming</h3>
                <Button variant="ghost" size="sm" onClick={refresh} loading={dataLoading} className="text-xs">
                  Refresh
                </Button>
              </div>
              <SessionList
                items={upcoming.slice(0, 5)}
                userRole={user?.role}
                actionLabel="View Session"
                emptyTitle="All quiet for now"
                emptyDescription={user?.role === "student" ? "Book a session to see it here." : "Waiting for students to book."}
              />
            </div>

            {/* Past */}
            <div className="space-y-4 animate-fade-up delay-200">
              <div className="flex items-center justify-between px-2">
                <h3 className="heading-display text-xl font-extrabold text-fg">History</h3>
              </div>
              <SessionList
                items={past.slice(0, 5)}
                userRole={user?.role}
                actionLabel="View details"
                emptyTitle="No history yet"
                emptyDescription="Completed sessions will appear here."
              />
            </div>
          </div>
        )}

        {/* Senior Specific: Withdraw/Slots */}
        {user?.role === "senior" && (
          <div className="grid gap-8 lg:grid-cols-2 animate-fade-up">
            {/* Withdrawal Request */}
            <Card className="p-6">
              <h3 className="heading-display text-lg font-extrabold text-fg mb-4">Request Withdrawal</h3>
              <div className="space-y-4">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted font-bold text-sm select-none">₹</span>
                  <input
                    type="number"
                    min="50"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="Enter amount (min ₹50)"
                    className="w-full rounded-2xl border border-border bg-surface2 pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition animate-fade-in"
                  />
                </div>
                <div className="text-[10px] font-black text-muted uppercase tracking-widest mt-[-8px] pl-1 select-none">
                  Minimum withdrawal amount is ₹50
                </div>
                <Button
                  onClick={handleWithdraw}
                  disabled={loading || !user?.isVerified || !withdrawAmount}
                  className="w-full rounded-2xl"
                  size="lg"
                  loading={loading}
                >
                  {user?.isVerified ? "Submit Request" : "Locked (Verify first)"}
                </Button>
              </div>
            </Card>

            {/* Slot Management Preview */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="heading-display text-lg font-extrabold text-fg">Open Slots</h3>
                <Link to="/availability" className="text-xs font-bold text-primary hover:underline">Manage All →</Link>
              </div>
              <div className="space-y-3">
                {slots.length ? (
                  slots.slice(0, 3).map((slot) => (
                    <div key={slot._id} className="flex items-center justify-between p-3 rounded-2xl bg-surface2 border border-border/50">
                      <div>
                        <div className="text-xs font-bold text-fg">
                          {new Date(slot.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                        </div>
                        <div className="text-[10px] text-muted">{slot.startTime || slot.time}</div>
                      </div>
                      <span className="h-2 w-2 rounded-full bg-success shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted text-center py-4 italic">No active slots. Add some to get booked!</p>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>
    </AppShell>
  );
}

export default Dashboard;
