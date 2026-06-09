import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import AppShell from "../components/AppShell";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Skeleton from "../components/ui/Skeleton";
import useSEO from "../hooks/useSEO";

function formatDateTime(d) {
  if (!d) return "—";
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
  }).format(dt);
}

async function loadBookings({ setError, setLoading, setBookings }) {
  setError("");
  setLoading(true);
  try {
    const res = await api.get("/bookings/my");
    setBookings(Array.isArray(res.data) ? res.data : []);
  } catch (e) {
    setError(e?.response?.data?.message || "Failed to load sessions");
  } finally {
    setLoading(false);
  }
}

function MyBookings() {
  useSEO({
    title: "MyBookings",
    description: "Clarior MyBookings page"
  });

  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const sorted = useMemo(() => {
    return [...bookings].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [bookings]);

  const refresh = async () => {
    await loadBookings({ setError, setLoading, setBookings });
  };

  useEffect(() => {
    loadBookings({ setError, setLoading, setBookings });
  }, []);

  const patchBooking = (id, patch) => {
    setBookings((prev) => prev.map((b) => (b._id === id ? { ...b, ...patch } : b)));
  };

  const startCall = async (bookingId) => {
    try {
      const res = await api.patch(`/bookings/start/${bookingId}`);
      patchBooking(bookingId, { isCallStarted: true, actualStartTime: res.data.startTime });
    } catch (e) { alert(e?.response?.data?.message || "Error starting call"); }
  };

  const seniorComplete = async (bookingId) => {
    try {
      await api.patch(`/bookings/senior-complete/${bookingId}`);
      patchBooking(bookingId, { isSeniorMarkedDone: true });
    } catch (e) { alert(e?.response?.data?.message || "Error marking done"); }
  };

  const studentConfirm = async (bookingId) => {
    try {
      await api.patch(`/bookings/student-confirm/${bookingId}`);
      patchBooking(bookingId, { isStudentConfirmed: true, status: "completed" });
    } catch (e) { alert(e?.response?.data?.message || "Error confirming"); }
  };

  return (
    <AppShell title="Sessions" subtitle="Manage your session lifecycle — from start to completion.">
      <div className="flex justify-end mb-6">
        <Button variant="secondary" onClick={refresh} loading={loading} size="sm" className="rounded-xl">
          Refresh
        </Button>
      </div>

      {loading && (
        <div className="grid gap-4">
          {[1,2,3].map(i => <Skeleton key={i} className="h-40 rounded-3xl" />)}
        </div>
      )}

      {!loading && error && (
        <div className="rounded-2xl border border-danger/30 bg-danger/5 px-6 py-4 text-sm text-danger animate-scale-in">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-4">
          {sorted.map((b, idx) => (
            <Card key={b._id} className="p-6 animate-fade-up" style={{ animationDelay: `${idx * 100}ms` }}>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="text-lg font-bold text-fg">
                      {user?.role === "student" ? b.senior?.name : b.student?.name}
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      b.status === "confirmed" ? "bg-success/10 text-success border-success/20" :
                      b.status === "completed" ? "bg-primary/10 text-primary border-primary/20" :
                      "bg-muted/10 text-muted border-muted/20"
                    }`}>
                      {b.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1">
                      <div className="text-muted font-bold uppercase tracking-widest text-[9px]">Scheduled Time</div>
                      <div className="text-fg font-medium">{formatDateTime(b.startTime)} → {formatDateTime(b.endTime).split(',')[1]}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-muted font-bold uppercase tracking-widest text-[9px]">Meet Link</div>
                      <div className="text-primary font-bold truncate">
                        {b.meetLink ? <a href={b.meetLink} target="_blank" rel="noreferrer" className="hover:underline">{b.meetLink}</a> : "—"}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 pt-2">
                    {[
                      { label: "Call Started", val: b.isCallStarted },
                      { label: "Senior Done", val: b.isSeniorMarkedDone },
                      { label: "Student Confirmed", val: b.isStudentConfirmed },
                    ].map(st => (
                      <div key={st.label} className="flex items-center gap-1.5">
                        <span className={`h-1.5 w-1.5 rounded-full ${st.val ? "bg-success shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-muted/30"}`} />
                        <span className="text-[10px] font-bold text-muted uppercase tracking-wider">{st.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row lg:flex-col gap-3 min-w-[200px]">
                  <Link to={`/session/${b._id}`} className="w-full">
                    <Button className="w-full rounded-2xl" variant="secondary">View Session</Button>
                  </Link>

                  {user?.role === "student" && b.status === "confirmed" && !b.isCallStarted && (
                    <Button className="w-full rounded-2xl" variant="primary" onClick={() => startCall(b._id)}>
                      Start Session
                    </Button>
                  )}

                  {user?.role === "senior" && b.isCallStarted && !b.isSeniorMarkedDone && (
                    <Button className="w-full rounded-2xl" variant="primary" onClick={() => seniorComplete(b._id)}>
                      Mark 25m Done
                    </Button>
                  )}

                  {user?.role === "student" && b.isSeniorMarkedDone && !b.isStudentConfirmed && (
                    <Button className="w-full rounded-2xl" variant="primary" onClick={() => studentConfirm(b._id)}>
                      Confirm Completion
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}

          {sorted.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
              <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl border border-border bg-surface2 text-primary">
                <svg className="h-9 w-9" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <path d="M16 2v4M8 2v4M3 10h18" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-fg">No sessions found</h3>
              <p className="text-muted mt-2 text-sm max-w-sm">
                {user?.role === 'senior'
                  ? "No students have booked a session with you yet. Make sure you've added available slots."
                  : "You haven't booked any sessions yet. Explore our verified seniors to get started."}
              </p>
              {user?.role === 'student' && (
                <Link to="/explore" className="mt-6">
                  <Button variant="primary" className="rounded-full px-8">Find Seniors</Button>
                </Link>
              )}
            </div>
          )}
        </div>
      )}
    </AppShell>
  );
}

export default MyBookings;
