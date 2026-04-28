import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import AppShell from "../components/AppShell";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Skeleton from "../components/ui/Skeleton";

function formatDateTime(d) {
  if (!d) return "—";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "—";
  return dt.toLocaleString();
}

function MyBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const sorted = useMemo(() => {
    return [...bookings].sort(
      (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    );
  }, [bookings]);

  const refresh = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await api.get("/bookings/my");
      setBookings(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const patchBooking = (id, patch) => {
    setBookings((prev) =>
      prev.map((b) => (b._id === id ? { ...b, ...patch } : b))
    );
  };

  const startCall = async (bookingId) => {
    const res = await api.patch(`/bookings/start/${bookingId}`);
    patchBooking(bookingId, { isCallStarted: true, actualStartTime: res.data.startTime });
  };

  const seniorComplete = async (bookingId) => {
    await api.patch(`/bookings/senior-complete/${bookingId}`);
    patchBooking(bookingId, { isSeniorMarkedDone: true });
  };

  const studentConfirm = async (bookingId) => {
    await api.patch(`/bookings/student-confirm/${bookingId}`);
    patchBooking(bookingId, { isStudentConfirmed: true, status: "completed" });
  };

  return (
    <AppShell
      title="Sessions"
      subtitle="Start, complete, confirm, and review — all in one place."
    >
      <div className="flex justify-end">
        <Button variant="secondary" onClick={refresh}>
          Refresh
        </Button>
      </div>

      {loading && (
        <div className="mt-5 grid gap-4">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
      )}

      {!loading && error && (
        <div className="mt-5 rounded-2xl border border-danger bg-surface2 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="mt-5 space-y-4">
          {sorted.map((b) => (
            <Card key={b._id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-[260px]">
                  <div className="text-xs font-semibold text-muted">Status</div>
                  <div className="mt-1 text-lg font-bold uppercase">{b.status}</div>
                  <div className="mt-3 text-sm text-muted">
                    Slot: {formatDateTime(b.startTime)} → {formatDateTime(b.endTime)}
                  </div>
                  <div className="text-sm text-muted">
                    Actual start: {formatDateTime(b.actualStartTime)}
                  </div>
                  <div className="text-sm text-muted">Meet: {b.meetLink || "—"}</div>
                </div>

                <div className="flex flex-col gap-2 min-w-[240px]">
                  <Link to={`/session/${b._id}`}>
                    <Button className="w-full">Open session</Button>
                  </Link>

                  {user?.role === "student" &&
                    b.status === "confirmed" &&
                    !b.isCallStarted && (
                      <Button
                        className="w-full"
                        variant="secondary"
                        onClick={() => startCall(b._id)}
                      >
                        Start on platform
                      </Button>
                    )}

                  {user?.role === "senior" &&
                    b.isCallStarted &&
                    !b.isSeniorMarkedDone && (
                      <Button
                        className="w-full"
                        variant="secondary"
                        onClick={() => seniorComplete(b._id)}
                      >
                        Mark 25 min done
                      </Button>
                    )}

                  {user?.role === "student" &&
                    b.isSeniorMarkedDone &&
                    !b.isStudentConfirmed && (
                      <Button
                        className="w-full"
                        onClick={() => studentConfirm(b._id)}
                      >
                        Confirm completion
                      </Button>
                    )}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted">
                <span>Call started: {b.isCallStarted ? "Yes" : "No"}</span>
                <span>Senior marked: {b.isSeniorMarkedDone ? "Yes" : "No"}</span>
                <span>Student confirmed: {b.isStudentConfirmed ? "Yes" : "No"}</span>
              </div>
            </Card>
          ))}

          {sorted.length === 0 && (
            <Card className="p-6">
              <div className="text-lg font-bold">No sessions yet</div>
              <div className="text-sm text-muted mt-2">
                Explore seniors, book a slot, then manage the session lifecycle here.
              </div>
              <div className="mt-4">
                <Link to="/explore">
                  <Button variant="secondary">Explore seniors</Button>
                </Link>
              </div>
            </Card>
          )}
        </div>
      )}
    </AppShell>
  );
}

export default MyBookings;

