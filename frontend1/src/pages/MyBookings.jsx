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
  
  // Notes Modal State
  const [notesModalBooking, setNotesModalBooking] = useState(null);
  const [notesInput, setNotesInput] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [copiedNotes, setCopiedNotes] = useState(false);

  const openNotesModal = (b) => {
    setNotesModalBooking(b);
    setNotesInput(b.notes || "");
  };

  const handleSaveNotes = async () => {
    if (!notesModalBooking) return;
    try {
      setSavingNotes(true);
      await api.patch(`/bookings/${notesModalBooking._id}/notes`, { notes: notesInput });
      showSuccess("Preparation notes saved!");
      setBookings((prev) =>
        prev.map((b) => (b._id === notesModalBooking._id ? { ...b, notes: notesInput } : b))
      );
      setNotesModalBooking(null);
    } catch (err) {
      showError(err?.response?.data?.message || "Failed to save notes");
    } finally {
      setSavingNotes(false);
    }
  };

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
                      <div className="text-muted font-bold uppercase tracking-widest text-[9px] mb-1">Video Call</div>
                      <div className="text-fg font-medium flex items-center gap-1.5 pt-1 text-xs">
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                        <span className="font-bold text-fg">In-App Room Ready</span>
                      </div>
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

                  <Button className="w-full rounded-2xl" variant="secondary" onClick={() => openNotesModal(b)}>
                    Prep Notes
                  </Button>

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

      {/* Prep Notes Modal */}
      {notesModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
          <div className="bg-surface border border-border rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl space-y-5 animate-scale-in">
            <div className="flex items-center justify-between border-b border-border/80 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Preparation Workspace</span>
                <h3 className="text-xl font-black text-fg mt-0.5">
                  Notes with {user?.role === "student" ? notesModalBooking.senior?.name : notesModalBooking.student?.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setNotesModalBooking(null)}
                className="h-8 w-8 rounded-full bg-surface2 border border-border text-muted hover:text-fg flex items-center justify-center font-bold text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            {user?.role === "student" ? (
              <div className="space-y-3">
                <p className="text-xs text-muted leading-relaxed">
                  Write down any questions, topics, or background context you want the senior to review before or during the call.
                </p>
                <textarea
                  rows={5}
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  placeholder="E.g., What are the placement statistics for CSE? How difficult is it to maintain a 9+ CGPA here?"
                  className="w-full p-4 rounded-2xl border border-border bg-surface2/60 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-xs font-bold text-fg placeholder:text-muted/60"
                />
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
                        if (!notesInput.includes(prompt)) {
                          setNotesInput(prev => (prev ? `${prev}\n• ${prompt}` : `• ${prompt}`));
                        }
                      }}
                      className="text-[9px] font-black uppercase px-2.5 py-1 rounded-lg bg-surface2 border border-border text-muted hover:text-primary hover:border-primary/30 transition-all cursor-pointer"
                    >
                      + {prompt}
                    </button>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-border/80">
                  <span className="text-[10px] font-black uppercase text-muted tracking-wider">
                    {notesInput.length}/2000 characters
                  </span>
                  <Button
                    size="sm"
                    onClick={handleSaveNotes}
                    loading={savingNotes}
                    className="rounded-xl font-black px-6 py-2 cursor-pointer text-xs"
                  >
                    Save Notes
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-muted leading-relaxed">
                  Student's prep notes and questions for this session:
                </p>
                <div className="p-4 rounded-2xl border border-border bg-surface2/60 text-xs font-bold text-fg leading-relaxed min-h-[120px] whitespace-pre-wrap">
                  {notesModalBooking.notes ? notesModalBooking.notes : (
                    <span className="text-muted/60 italic select-none">No preparation notes written by student yet.</span>
                  )}
                </div>
                {notesModalBooking.notes && (
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        navigator.clipboard.writeText(notesModalBooking.notes);
                        setCopiedNotes(true);
                        setTimeout(() => setCopiedNotes(false), 2000);
                      }}
                      className="rounded-xl font-black px-4 py-1.5 text-xs cursor-pointer"
                    >
                      {copiedNotes ? "✓ Copied!" : "📋 Copy Notes"}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
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
