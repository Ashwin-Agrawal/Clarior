import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AppShell from "../components/AppShell";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

function formatDateTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString();
}

function formatDayLabel(date) {
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);
}

function StatIcon({ children, tint = "bg-[rgba(59,91,219,0.14)] text-primary" }) {
  return (
    <div className={`flex h-8 w-8 items-center justify-center rounded-[20px] ${tint}`}>
      {children}
    </div>
  );
}

function EmptyState({ title, description }) {
  return (
    <div className="flex min-h-[240px] flex-col items-center justify-center rounded-[28px] border border-dashed border-border bg-surface2/70 px-6 py-10 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-primary shadow-soft">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-7 w-7">
          <rect x="3.5" y="5" width="17" height="15" rx="3" />
          <path d="M8 3v4M16 3v4M3.5 10.5h17" />
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
      {items.map((booking) => (
        <div
          key={booking._id}
          className="flex flex-wrap items-center justify-between gap-4 rounded-[28px] border border-border bg-white p-5 shadow-soft"
        >
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <div className="text-lg font-bold text-fg">
                {userRole === "student"
                  ? booking?.senior?.name || "Senior"
                  : booking?.student?.name || "Student"}
              </div>
              <span className="rounded-full bg-[rgba(59,91,219,0.1)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                {booking.status}
              </span>
            </div>

            <div className="mt-3 grid gap-3 text-sm text-muted md:grid-cols-2 xl:grid-cols-3">
              <div>
                <div className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-muted/80">
                  Starts
                </div>
                <div className="mt-1 text-fg">{formatDateTime(booking.startTime)}</div>
              </div>
              <div>
                <div className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-muted/80">
                  Ends
                </div>
                <div className="mt-1 text-fg">{formatDateTime(booking.endTime)}</div>
              </div>
              <div>
                <div className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-muted/80">
                  Format
                </div>
                <div className="mt-1 text-fg">25-minute guided session</div>
              </div>
            </div>
          </div>

          <Link to={`/session/${booking._id}`}>
            <Button variant={actionLabel === "View details" ? "secondary" : "primary"} size="lg">
              {actionLabel}
            </Button>
          </Link>
        </div>
      ))}
    </div>
  );
}

async function loadDashboardData({ user, setMsg, setDataLoading, setBookings, setSlots }) {
  setMsg("");
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
    setMsg(err?.response?.data?.message || "Failed to load dashboard data");
  } finally {
    setDataLoading(false);
  }
}

function Dashboard() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [bookings, setBookings] = useState([]);
  const [slots, setSlots] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(() => Date.now());

  const handleWithdraw = async () => {
    try {
      setMsg("");
      const amount = Number(withdrawAmount);

      if (!amount || amount <= 0) {
        setMsg("Enter a valid withdraw amount.");
        return;
      }

      setLoading(true);
      await api.post("/withdraw/request", { amount });
      setMsg("Withdraw request sent.");
      setWithdrawAmount("");
    } catch (err) {
      setMsg(err?.response?.data?.message || "Withdraw request failed");
    } finally {
      setLoading(false);
    }
  };

  const refresh = async () => {
    await loadDashboardData({
      user,
      setMsg,
      setDataLoading,
      setBookings,
      setSlots,
    });
  };

  useEffect(() => {
    if (!user) return;

    const timeoutId = window.setTimeout(() => {
      loadDashboardData({
        user,
        setMsg,
        setDataLoading,
        setBookings,
        setSlots,
      });
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [user]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const { upcoming, past } = useMemo(() => {
    const now = currentTime;
    const list = Array.isArray(bookings) ? bookings : [];

    return {
      upcoming: list.filter((booking) => {
        if (booking.status === "cancelled" || booking.status === "completed") {
          return false;
        }

        const time = new Date(booking.startTime || booking.date || 0).getTime();
        return Number.isNaN(time) ? true : time >= now;
      }),
      past: list.filter((booking) => {
        if (booking.status === "cancelled" || booking.status === "completed") {
          return true;
        }

        const time = new Date(booking.startTime || booking.date || 0).getTime();
        return Number.isNaN(time) ? false : time < now;
      }),
    };
  }, [bookings, currentTime]);

  const firstName = user?.name?.split(" ")[0] || "there";
  const today = useMemo(() => new Date(), []);
  const isUnverifiedSenior = user?.role === "senior" && !user?.isVerified;

  const handleLogout = async () => {
    try {
      await api.get("/auth/logout");
    } catch {
      // no-op
    }
    setUser(null);
    navigate("/");
  };

  return (
    <AppShell
      title="Dashboard"
      subtitle="Everything you need to manage your Clarior journey in one place."
    >
      <div className="space-y-8">
        <section className="rounded-[32px] border border-white/70 bg-white p-6 shadow-soft">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-5">
              <div className="flex h-20 w-20 items-center justify-center rounded-[28px] bg-slate-950 text-3xl font-bold text-white shadow-[0_20px_40px_rgba(15,23,42,0.15)]">
                {user?.name?.trim()?.[0] || "C"}
              </div>
              <div>
                <div className="text-sm uppercase tracking-[0.22em] text-primary">
                  {formatDayLabel(today)}
                </div>
                <h2 className="mt-3 text-4xl font-extrabold tracking-tight text-fg sm:text-5xl">
                  {/* Welcome back, {firstName}. */}
                  {user?.role === "admin" ? `Radhe Radhe ❤️`: `Welcome back, ${firstName}`}
                </h2>
                <p className="mt-3 max-w-2xl text-base leading-7 text-muted">
                  Your dashboard now spans the screen with quick stats, session previews, and clear next steps for your role.
                </p>
                {isUnverifiedSenior && (
                  <div className="mt-4 inline-flex rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-700">
                    Verification status: Pending. Booking and slot management will unlock after approval.
                  </div>
                )}
              </div>
            </div>

            <div className="grid w-full gap-3 sm:grid-cols-2 lg:w-[360px]">
              {(user?.role === "student" || user?.role === "senior") && (
                <Link to="/bookings">
                  <Button size="lg">Open sessions</Button>
                </Link>
              )}
              {user?.role === "senior" && user?.isVerified && (
                <Link to="/availability">
                  <Button variant="secondary" size="lg">Manage slots</Button>
                </Link>
              )}
              {user?.role === "student" && (
                <Link to="/become-senior">
                  <Button variant="secondary" size="lg">Become a Senior</Button>
                </Link>
              )}
              {user?.role === "student" && (
                <Link to="/buy-credits">
                  <Button variant="secondary" size="lg">Buy credits</Button>
                </Link>
              )}
              {user?.role === "admin" && (
                <Link to="/admin">
                  <Button variant="secondary" size="lg">Admin panel</Button>
                </Link>
              )}
              <Button variant="ghost" size="lg" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </section>

        <div className="mt-6 grid gap-6">
          <div className="grid grid-cols-3 gap-4">
            <Card className="rounded-2xl bg-indigo-50 border border-indigo-200 shadow-sm p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Role</div>
                  <div className="mt-3 text-3xl font-extrabold capitalize">{user?.role || "—"}</div>
                </div>
                <StatIcon tint="bg-indigo-100 text-indigo-600">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6">
                    <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
                    <path d="M5 20a7 7 0 0 1 14 0" />
                  </svg>
                </StatIcon>
              </div>
              <div className="mt-4 text-sm leading-6 text-muted">
                {user?.role === "student"
                  ? "Book sessions, confirm starts, and turn short calls into clear decisions."
                  : user?.role === "senior"
                  ? user?.isVerified
                    ? "Set availability, support students, and keep your guidance rhythm organized."
                    : "Your senior profile is pending verification. You can track status from this dashboard."
                  : user?.role === "admin"
                  ? "Review senior applications and keep platform quality high."
                  : "—"}
              </div>
            </Card>

            <Card className="rounded-2xl bg-teal-50 border border-teal-200 shadow-sm p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                    {user?.role === "senior" ? "Wallet" : "Credits"}
                  </div>
                  <div className="mt-3 text-3xl font-extrabold">
                    {user?.role === "senior"
                      ? `₹${user?.availableBalance ?? 0}`
                      : typeof user?.callCredits === "number"
                      ? user.callCredits
                      : "—"}
                  </div>
                </div>
                <StatIcon tint="bg-teal-100 text-teal-600">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6">
                    <rect x="3.5" y="6.5" width="17" height="11" rx="2.5" />
                    <path d="M8 12h8M8 15h5" />
                  </svg>
                </StatIcon>
              </div>
              {user?.role === "senior" ? (
                <>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[22px] bg-surface2 p-4">
                      <div className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Pending</div>
                      <div className="mt-2 text-xl font-bold text-fg">₹{user?.pendingEarnings ?? 0}</div>
                    </div>
                    <div className="rounded-[22px] bg-surface2 p-4">
                      <div className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Available</div>
                      <div className="mt-2 text-xl font-bold text-fg">₹{user?.availableBalance ?? 0}</div>
                    </div>
                  </div>
                  <div className="mt-5 flex flex-col gap-3">
                    <input
                      type="number"
                      min="1"
                      value={withdrawAmount}
                      onChange={(event) => setWithdrawAmount(event.target.value)}
                      placeholder="Enter withdrawal amount"
                      className="w-full rounded-full border border-border bg-white px-5 py-3 text-sm outline-none transition focus:ring-2 focus:ring-primary/20"
                    />
                    <Button
                      onClick={handleWithdraw}
                      disabled={loading || !user?.isVerified}
                      className="w-full"
                      variant="secondary"
                      size="lg"
                    >
                      {loading ? "Sending request..." : user?.isVerified ? "Withdraw balance" : "Available after verification"}
                    </Button>
                  </div>
                </>
              ) : (
                <div className="mt-4 text-sm leading-6 text-muted">
                  {user?.role === "student"
                    ? "1 credit lets you book one focused 25-minute senior guidance session."
                    : "Credits are used by students to book guided sessions."}
                </div>
              )}
            </Card>

            <Card className="rounded-2xl bg-teal-50 border border-teal-200 shadow-sm p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Next step</div>
                  <div className="mt-3 text-2xl font-extrabold">
                    {user?.role === "senior"
                      ? user?.isVerified
                        ? "Keep your calendar open"
                        : "Complete verification"
                      : user?.role === "admin"
                      ? "Review senior applications"
                      : "Find the right senior"}
                  </div>
                </div>
                <StatIcon tint="bg-teal-100 text-teal-600">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6">
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </StatIcon>
              </div>
              <div className="mt-4 text-sm leading-6 text-muted">
                {user?.role === "senior"
                  ? user?.isVerified
                    ? "Add fresh time slots so students can book you and your upcoming sessions populate here."
                    : "Your profile is pending admin review. You can explore the dashboard while booking and slot creation stay locked."
                  : user?.role === "admin"
                  ? "Approve or reject pending senior applications and keep Clarior trusted."
                  : "Browse seniors, compare profiles, and book a slot that fits your questions."}
              </div>
              <div className="mt-6">
                {user?.role === "admin" ? (
                  <Link to="/admin">
                    <Button variant="secondary" className="w-full rounded-full" size="lg">
                      Open admin panel
                    </Button>
                  </Link>
                ) : user?.role === "senior" ? (
                  user?.isVerified ? (
                    <Link to="/availability">
                      <Button variant="secondary" className="w-full rounded-full" size="lg">
                        Open availability
                      </Button>
                    </Link>
                  ) : (
                    <Link to="/verify">
                      <Button variant="secondary" className="w-full rounded-full" size="lg">
                        Complete verification
                      </Button>
                    </Link>
                  )
                ) : (
                  <Link to="/explore">
                    <Button variant="secondary" className="w-full rounded-full" size="lg">
                      Explore seniors
                    </Button>
                  </Link>
                )}
              </div>
            </Card>
          </div>

          {(user?.role === "student" || user?.role === "senior") && (
            <div className="grid grid-cols-2 gap-4">
              <Card className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="text-2xl font-extrabold tracking-tight text-fg">Upcoming sessions</div>
                    <div className="mt-2 text-sm text-muted">Your next confirmed calls, with room to act fast.</div>
                  </div>
                  <Button variant="secondary" onClick={refresh} disabled={dataLoading} size="sm">
                    {dataLoading ? "Refreshing..." : "Refresh"}
                  </Button>
                </div>

                <SessionList
                  items={upcoming.slice(0, 5)}
                  userRole={user?.role}
                  actionLabel="Open session"
                  emptyTitle="No upcoming sessions yet"
                  emptyDescription={
                    user?.role === "student"
                      ? "Explore seniors and book a session to see your next call here."
                      : "Create availability so students can book you and your upcoming sessions populate here."
                  }
                />
              </Card>

              <Card className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
                <div>
                  <div className="text-2xl font-extrabold tracking-tight text-fg">Past sessions</div>
                  <div className="mt-2 text-sm text-muted">Completed and cancelled conversations, ready for review.</div>
                </div>

                <SessionList
                  items={past.slice(0, 5)}
                  userRole={user?.role}
                  actionLabel="View details"
                  emptyTitle="No past sessions yet"
                  emptyDescription="Once sessions are completed or cancelled, they’ll appear here with their timeline."
                />
              </Card>
            </div>
          )}

          {user?.role === "senior" && user?.isVerified && (
            <div className="mt-10">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <div className="text-2xl font-extrabold tracking-tight">My open slots</div>
                  <div className="mt-2 text-sm text-muted">Fresh availability helps students discover and book you faster.</div>
                </div>
                <Link to="/availability">
                  <Button variant="secondary" size="lg">Create or manage slots</Button>
                </Link>
              </div>

              <div className="mt-6 grid gap-4">
                {slots.length ? (
                  slots.map((slot) => (
                    <Card key={slot._id} className="rounded-[28px] p-5">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <div className="text-lg font-semibold text-fg">{slot.title || "Available slot"}</div>
                          <div className="mt-1 text-sm text-muted">{slot.date} · {slot.startTime} - {slot.endTime}</div>
                        </div>
                        <div className="rounded-full bg-[rgba(59,91,219,0.08)] px-3 py-1 text-sm font-semibold text-primary">Open</div>
                      </div>
                    </Card>
                  ))
                ) : (
                  <EmptyState
                    title="No open slots yet"
                    description="Add availability so students can book sessions directly from your profile."
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

export default Dashboard;
