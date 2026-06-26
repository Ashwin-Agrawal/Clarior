import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import AppShell from "../components/AppShell";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Skeleton from "../components/ui/Skeleton";
import ConfirmModal from "../components/ui/ConfirmModal";
import { useToast } from "../context/ToastContext";
import useSEO from "../hooks/useSEO";

function formatDateTime(d) {
  if (!d) return "—";
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
  }).format(dt);
}

function formatTimeOnly(d) {
  if (!d) return "—";
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit", minute: "2-digit"
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
    title: "My Sessions",
    description: "Manage and join your 1:1 mentorship calls on Clarior."
  });

  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

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
      setActionError("");
      const res = await api.patch(`/bookings/start/${bookingId}`);
      patchBooking(bookingId, {
        isStudentStarted: res.data.isStudentStarted,
        isSeniorStarted: res.data.isSeniorStarted,
        isCallStarted: res.data.isCallStarted,
        actualStartTime: res.data.startTime
      });
    } catch (e) {
      setActionError(e?.response?.data?.message || "Error starting call");
    }
  };

  const seniorComplete = async (bookingId) => {
    try {
      setActionError("");
      await api.patch(`/bookings/senior-complete/${bookingId}`);
      patchBooking(bookingId, { isSeniorMarkedDone: true });
    } catch (e) {
      setActionError(e?.response?.data?.message || "Error marking done");
    }
  };

  const studentConfirm = async (bookingId) => {
    try {
      setActionError("");
      await api.patch(`/bookings/student-confirm/${bookingId}`);
      patchBooking(bookingId, { isStudentConfirmed: true, status: "completed" });
    } catch (e) {
      setActionError(e?.response?.data?.message || "Error confirming");
    }
  };

  const handleDeleteSession = async () => {
    if (!confirmDeleteId) return;
    try {
      setDeleteLoading(true);
      setDeletingId(confirmDeleteId);
      await api.delete(`/bookings/history/${confirmDeleteId}`);
      // Animate out then remove
      setTimeout(() => {
        setBookings(prev => prev.filter(b => b._id !== confirmDeleteId));
        setDeletingId(null);
      }, 350);
      showSuccess("Session removed from your history.");
    } catch (e) {
      showError(e?.response?.data?.message || "Could not remove session.");
      setDeletingId(null);
    } finally {
      setDeleteLoading(false);
      setConfirmDeleteId(null);
    }
  };

  return (
    <AppShell title="Sessions" subtitle="Manage your session lifecycle — from start to completion.">
      <div className="flex justify-end mb-6">
        <Button variant="secondary" onClick={refresh} loading={loading} size="sm" className="rounded-xl">
          Refresh
        </Button>
      </div>

      {actionError && (
        <div className="mb-6 rounded-2xl border border-danger/30 bg-danger/5 px-6 py-4 text-sm text-danger animate-scale-in flex justify-between items-center">
          <span>{actionError}</span>
          <button onClick={() => setActionError("")} className="font-bold text-xs uppercase hover:underline">Dismiss</button>
        </div>
      )}

      {loading && (
        <div className="grid gap-4">
          {[1,2,3].map(i => <Skeleton.Session key={i} />)}
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
            <Card
              key={b._id}
              className={`p-6 animate-fade-up transition-all duration-350 ${
                deletingId === b._id ? "opacity-0 scale-95 pointer-events-none" : "opacity-100"
              }`}
              style={{ animationDelay: `${idx * 100}ms` }}
            >
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

                    {/* Delete button — only for completed/cancelled */}
                    {(b.status === "completed" || b.status === "cancelled") && (
                      <button
                        onClick={() => setConfirmDeleteId(b._id)}
                        title="Remove from history"
                        className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider text-danger/70 border border-danger/15 bg-danger/5 hover:bg-danger/10 hover:text-danger hover:border-danger/30 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                        Delete
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1">
                      <div className="text-muted font-bold uppercase tracking-widest text-[9px]">Scheduled Time</div>
                      <div className="text-fg font-medium">{formatDateTime(b.startTime)} → {formatTimeOnly(b.endTime)}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-muted font-bold uppercase tracking-widest text-[9px] mb-1">Meet Link</div>
                      {b.meetLink ? (
                        <div className="truncate">
                          <a 
                            href={b.meetLink} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs font-bold hover:bg-primary/20 transition-all"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                            </svg>
                            Open Meet
                          </a>
                        </div>
                      ) : (
                        <span className="text-xs text-muted font-semibold italic">Generated soon</span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 pt-2">
                    {[
                      { label: "Student Started", val: b.isStudentStarted },
                      { label: "Senior Started", val: b.isSeniorStarted },
                      { label: "Call Live", val: b.isCallStarted },
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
                    !b.isStudentStarted ? (
                      <Button className="w-full rounded-2xl" variant="primary" onClick={() => startCall(b._id)}>
                        Start Session
                      </Button>
                    ) : (
                      <Button className="w-full rounded-2xl" variant="secondary" disabled>
                        Waiting for Senior...
                      </Button>
                    )
                  )}

                  {user?.role === "senior" && b.status === "confirmed" && !b.isCallStarted && (
                    !b.isSeniorStarted ? (
                      <Button className="w-full rounded-2xl" variant="primary" onClick={() => startCall(b._id)}>
                        Start Session
                      </Button>
                    ) : (
                      <Button className="w-full rounded-2xl" variant="secondary" disabled>
                        Waiting for Student...
                      </Button>
                    )
                  )}

                  {user?.role === "senior" && b.isCallStarted && !b.isSeniorMarkedDone && (
                    <Button className="w-full rounded-2xl" variant="primary" onClick={() => seniorComplete(b._id)}>
                      Mark Complete
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

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={!!confirmDeleteId}
        title="Remove from History"
        message="This will remove this session from your history view. The session record is kept for admin purposes. This cannot be undone."
        confirmText="Yes, Remove"
        cancelText="Keep it"
        variant="danger"
        loading={deleteLoading}
        onConfirm={handleDeleteSession}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </AppShell>
  );
}

export default MyBookings;
