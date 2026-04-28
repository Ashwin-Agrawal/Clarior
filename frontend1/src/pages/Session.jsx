import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import AppShell from "../components/AppShell";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

const SESSION_SECONDS = 25 * 60;

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

  const load = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await api.get("/bookings/my");
      const list = Array.isArray(res.data) ? res.data : [];
      const found = list.find((b) => b._id === bookingId);
      if (!found) {
        setError("Booking not found in your account");
        setBooking(null);
      } else {
        setBooking(found);
      }
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load booking");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId]);

  const actualStart = useMemo(() => {
    if (!booking?.actualStartTime) return null;
    const d = new Date(booking.actualStartTime);
    if (Number.isNaN(d.getTime())) return null;
    return d;
  }, [booking?.actualStartTime]);

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

  const startCall = async () => {
    const res = await api.patch(`/bookings/start/${bookingId}`);
    setBooking((b) => (b ? { ...b, isCallStarted: true, actualStartTime: res.data.startTime } : b));
  };

  const seniorComplete = async () => {
    await api.patch(`/bookings/senior-complete/${bookingId}`);
    setBooking((b) => (b ? { ...b, isSeniorMarkedDone: true } : b));
  };

  const studentConfirm = async () => {
    await api.patch(`/bookings/student-confirm/${bookingId}`);
    setBooking((b) => (b ? { ...b, isStudentConfirmed: true, status: "completed" } : b));
  };

  const submitReview = async () => {
    setReviewMsg("");
    try {
      if (!booking?.senior) return;
      const seniorId = typeof booking.senior === "string" ? booking.senior : booking.senior?._id;
      await api.post("/reviews", { seniorId, rating: Number(rating), comment });
      setReviewMsg("Review submitted ✅");
    } catch (e) {
      setReviewMsg(e?.response?.data?.message || "Review failed");
    }
  };

  return (
    <AppShell
      title="Session"
      subtitle="Use the platform buttons to keep payments fair."
    >
      <div className="flex justify-end">
        <Button variant="secondary" onClick={() => navigate("/bookings")}>
          Back to sessions
        </Button>
      </div>

      {loading && <div className="mt-5 text-sm text-muted">Loading…</div>}
      {!loading && error && (
        <div className="mt-5 rounded-2xl border border-danger bg-surface2 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      {!loading && booking && (
        <div className="mt-5 space-y-4">
          <Card className="p-6">
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div>
                <div className="text-xs font-semibold text-muted">Status</div>
                <div className="mt-1 text-2xl font-extrabold uppercase">
                  {booking.status}
                </div>

                <div className="mt-4 text-sm text-muted">
                  Meet link:{" "}
                  {booking.meetLink ? (
                    <a
                      className="text-primary underline"
                      href={booking.meetLink}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open meeting
                    </a>
                  ) : (
                    "—"
                  )}
                </div>
                <div className="text-sm text-muted">
                  Actual start:{" "}
                  {booking.actualStartTime
                    ? new Date(booking.actualStartTime).toLocaleString()
                    : "—"}
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs font-semibold text-muted">
                  Timer (25:00)
                </div>
                <div className="mt-1 text-5xl font-extrabold tabular-nums">
                  {remainingLabel}
                </div>
                <div className="mt-2 text-sm text-muted">
                  {remaining === 0
                    ? "Session window complete"
                    : "Complete full duration"}
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              {user?.role === "student" &&
                booking.status === "confirmed" &&
                !booking.isCallStarted && (
                  <Button onClick={startCall}>
                    Student: confirm session started
                  </Button>
                )}

              {user?.role === "senior" &&
                booking.isCallStarted &&
                !booking.isSeniorMarkedDone && (
                  <Button onClick={seniorComplete} variant="secondary">
                    Senior: mark completed (after 25 min)
                  </Button>
                )}

              {user?.role === "student" &&
                booking.isSeniorMarkedDone &&
                !booking.isStudentConfirmed && (
                  <Button onClick={studentConfirm}>
                    Student: confirm completion
                  </Button>
                )}

              <Button onClick={load} variant="secondary">
                Refresh state
              </Button>
            </div>

            <div className="mt-5 flex flex-wrap gap-4 text-xs text-muted">
              <span>Call started: {booking.isCallStarted ? "Yes" : "No"}</span>
              <span>
                Senior marked: {booking.isSeniorMarkedDone ? "Yes" : "No"}
              </span>
              <span>
                Student confirmed: {booking.isStudentConfirmed ? "Yes" : "No"}
              </span>
            </div>
          </Card>

          {user?.role === "student" && booking.status === "completed" && (
            <Card className="p-6">
              <div className="text-lg font-bold">Rate your senior</div>
              <div className="text-sm text-muted mt-1">
                Ratings protect trust across the platform.
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <label className="text-sm text-muted">
                  Rating
                  <select
                    className="ml-2 rounded-xl border border-border bg-surface px-3 py-2 text-sm text-fg outline-none focus:ring-2 focus:ring-primary/15"
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                  >
                    {[5, 4, 3, 2, 1].map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <textarea
                className="mt-3 w-full rounded-xl border border-border bg-surface p-4 text-sm text-fg outline-none focus:ring-2 focus:ring-primary/15"
                rows={4}
                placeholder="Feedback (optional)"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Button onClick={submitReview}>Submit review</Button>
                {reviewMsg && (
                  <span className="text-sm text-muted">{reviewMsg}</span>
                )}
              </div>
            </Card>
          )}
        </div>
      )}
    </AppShell>
  );
}

export default Session;

