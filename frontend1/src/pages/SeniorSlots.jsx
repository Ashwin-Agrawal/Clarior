import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import AppShell from "../components/AppShell";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import useSEO from "../hooks/useSEO";
import Skeleton from "../components/ui/Skeleton";
import { useToast } from "../context/ToastContext";

function parseSlotDateTime(slotDate, slotTime) {
  if (!slotDate || !slotTime) return null;
  const [h, m] = String(slotTime).split(":").map(Number);
  if (isNaN(h) || isNaN(m)) return null;
  const date = new Date(slotDate);
  date.setHours(h, m, 0, 0);
  return isNaN(date.getTime()) ? null : date;
}

function formatTimeLabel(value) {
  if (!value) return "";
  const [h, m] = String(value).split(":").map(Number);
  if (isNaN(h) || isNaN(m)) return value;
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

async function loadSeniorSlots({ userId, setLoading, setMySlots, showError }) {
  setLoading(true);
  try {
    const res = await api.get(`/slots/senior/${userId}`);
    setMySlots(res.data.slots || []);
  } catch (e) {
    if (showError) showError(e?.response?.data?.message || "Failed to load slots");
  } finally {
    setLoading(false);
  }
}

// ── Confirm Cancel Modal ──────────────────────────────────────────
function CancelModal({ slot, onConfirm, onClose, cancelling }) {
  const isBooked = slot?.isBooked;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={!cancelling ? onClose : undefined} />

      <div className="relative z-10 w-full max-w-md rounded-[24px] border border-border bg-surface p-6 shadow-[0_32px_80px_-20px_rgba(0,0,0,0.35)] animate-fade-up">

        {/* Warning Icon */}
        <div className={`mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl ${isBooked ? "bg-red-500/10 text-red-500" : "bg-amber-500/10 text-amber-500"}`}>
          <svg className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          </svg>
        </div>

        <h3 className="text-center text-lg font-black text-fg mb-1">
          {isBooked ? "Cancel Booked Slot?" : "Cancel This Slot?"}
        </h3>

        {isBooked ? (
          <div className="mt-3 rounded-2xl border border-red-500/20 bg-red-500/5 p-4 space-y-2 text-center">
            <p className="text-sm font-semibold text-fg leading-relaxed">
              This slot is <span className="text-red-500 font-black">already booked</span> by a student.
            </p>
            <div className="flex items-center justify-center gap-2 pt-1">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-success/15 text-success">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m5 13 4 4L19 7" />
                </svg>
              </span>
              <p className="text-sm text-success font-bold">1 credit will be auto-refunded to the student</p>
            </div>
            {slot?.booking?.studentName && (
              <p className="text-xs text-muted mt-1">Booked by: <span className="text-fg font-semibold">{slot.booking.studentName}</span></p>
            )}
          </div>
        ) : (
          <p className="mt-3 text-center text-sm text-muted leading-relaxed">
            This slot will be permanently removed from your availability and won&apos;t be visible to students.
          </p>
        )}

        <div className="mt-6 flex gap-3">
          <Button
            variant="secondary"
            className="flex-1 rounded-2xl"
            onClick={onClose}
            disabled={cancelling}
          >
            Keep Slot
          </Button>
          <button
            onClick={onConfirm}
            disabled={cancelling}
            className={`flex-1 rounded-2xl font-black text-sm px-4 py-2.5 text-white transition-all disabled:opacity-60 flex items-center justify-center gap-2 ${
              isBooked
                ? "bg-red-500 hover:bg-red-600"
                : "bg-amber-500 hover:bg-amber-600"
            }`}
          >
            {cancelling ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Cancelling…
              </>
            ) : (
              <>{isBooked ? "Cancel & Refund Student" : "Yes, Cancel Slot"}</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────
function SeniorSlots() {
  useSEO({
    title: "My Availability",
    description: "Manage your student mentorship session availability slots on Clarior.",
  });

  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [mySlots, setMySlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [openSlotId, setOpenSlotId] = useState(null);
  const [now, setNow] = useState(() => Date.now());
  const [todayMin] = useState(() => new Date().toISOString().split("T")[0]);
  const [activeTab, setActiveTab] = useState("Open");

  // Cancel modal
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const getStatus = (s) => {
    const dt = parseSlotDateTime(s.date, s.time);
    const isPast = dt ? dt.getTime() < now : false;
    return s.isBooked ? "Booked" : isPast ? "Past" : "Open";
  };

  const filteredSlots = useMemo(
    () => mySlots.filter((s) => getStatus(s) === activeTab),
    [mySlots, activeTab, now]
  );

  const load = async () => {
    if (!user?._id) return;
    await loadSeniorSlots({ userId: user._id, setLoading, setMySlots, showError });
  };

  useEffect(() => {
    if (!user?._id) return;
    loadSeniorSlots({ userId: user._id, setLoading, setMySlots, showError });
  }, [user?._id]);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(interval);
  }, []);

  const create = async () => {
    setCreating(true);
    try {
      if (!date || !time) return showError("Please select date and time");
      const slotDT = parseSlotDateTime(date, time);
      if (!slotDT || slotDT.getTime() <= now) return showError("Please select a future time");
      await api.post("/slots", { date, time });
      setDate("");
      setTime("");
      showSuccess("Slot created successfully.");
      load();
    } catch (e) {
      showError(e?.response?.data?.message || "Failed to create slot");
    } finally {
      setCreating(false);
    }
  };

  const handleCancelConfirm = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      const res = await api.delete(`/slots/${cancelTarget._id}`);
      setMySlots((prev) => prev.filter((s) => s._id !== cancelTarget._id));
      showSuccess(res.data.message || "Slot cancelled.");
      setCancelTarget(null);
    } catch (e) {
      showError(e?.response?.data?.message || "Failed to cancel slot");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <>
      {cancelTarget && (
        <CancelModal
          slot={cancelTarget}
          onConfirm={handleCancelConfirm}
          onClose={() => !cancelling && setCancelTarget(null)}
          cancelling={cancelling}
        />
      )}

      <AppShell
        title="Availability"
        subtitle="Define when you're available to help students. Each slot is 20 minutes."
      >
        <div className="grid lg:grid-cols-3 gap-8">

          {/* ── Creation Panel ─────────────────────────────── */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="p-6 sticky top-24">
              <h3 className="text-lg font-bold text-fg mb-4">Add New Slot</h3>
              <div className="space-y-4">
                <Input
                  label="Select Date"
                  type="date"
                  min={todayMin}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  iconLeft={
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
                    </svg>
                  }
                />
                <Input
                  label="Select Time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  hint="Future times only"
                  iconLeft={
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
                    </svg>
                  }
                />
                <Button
                  onClick={create}
                  loading={creating}
                  disabled={creating}
                  className="w-full rounded-2xl shadow-lift"
                  size="lg"
                >
                  Create Slot
                </Button>
              </div>
            </Card>
          </div>

          {/* ── List Panel ─────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between px-2">
              <div>
                <h3 className="heading-display text-xl font-extrabold text-fg">Active Slots</h3>
                <p className="text-xs text-muted mt-1">{mySlots.length} total availability slots</p>
              </div>
              <Button variant="ghost" size="sm" onClick={load} loading={loading}>Refresh</Button>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-border/60 pb-px">
              {["Open", "Booked", "Past"].map((tab) => {
                const count = mySlots.filter((s) => getStatus(s) === tab).length;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 text-sm font-black uppercase tracking-wider border-b-2 -mb-px transition-all cursor-pointer ${
                      activeTab === tab
                        ? "border-primary text-primary"
                        : "border-transparent text-muted hover:text-fg"
                    }`}
                  >
                    {tab} ({count})
                  </button>
                );
              })}
            </div>

            {/* Slot Cards */}
            <div className="grid sm:grid-cols-2 gap-4">
              {loading ? (
                [1, 2, 3, 4].map((i) => <Skeleton.Slot key={i} />)
              ) : (
                filteredSlots.map((s, idx) => {
                  const dt = parseSlotDateTime(s.date, s.time);
                  const isPast = dt ? dt.getTime() < now : false;
                  const status = getStatus(s);
                  const isOpen = openSlotId === s._id;
                  const canCancel = status === "Open" || status === "Booked";

                  return (
                    <Card
                      key={s._id}
                      className="p-5 animate-fade-up relative overflow-hidden group"
                      style={{ animationDelay: `${idx * 50}ms` }}
                    >
                      {/* Accent gradient */}
                      <div className={`absolute top-0 right-0 h-16 w-16 bg-gradient-to-bl opacity-5 transition-opacity group-hover:opacity-10 ${
                        status === "Open" ? "from-success" : status === "Booked" ? "from-primary" : "from-muted"
                      }`} />

                      {/* Header row */}
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-[9px] font-bold text-muted uppercase tracking-[0.2em] mb-1">Time Slot</div>
                          <div className="font-bold text-fg leading-tight">
                            {new Intl.DateTimeFormat("en-IN", {
                              timeZone: "Asia/Kolkata",
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }).format(new Date(s.date))}{" "}
                            • {formatTimeLabel(s.time)}
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                          status === "Open"
                            ? "bg-success/10 text-success border-success/20"
                            : status === "Booked"
                            ? "bg-primary/10 text-primary border-primary/20"
                            : "bg-muted/10 text-muted border-muted/20"
                        }`}>
                          {status}
                        </span>
                      </div>

                      {/* Actions row */}
                      <div className="mt-4 flex items-center justify-between gap-2 flex-wrap">
                        <button
                          onClick={() => setOpenSlotId(isOpen ? null : s._id)}
                          className="text-[10px] font-bold text-primary hover:underline uppercase tracking-widest"
                        >
                          {isOpen ? "Hide Info" : "View Details"}
                        </button>

                        <div className="flex items-center gap-2">
                          {s.isBooked && (
                            <span className="text-[10px] font-bold text-primary">Linked to booking</span>
                          )}
                          {canCancel && (
                            <button
                              onClick={() => setCancelTarget(s)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-red-500/8 text-red-500 border border-red-500/20 hover:bg-red-500/15 transition-colors"
                            >
                              <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                              </svg>
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Expandable Details */}
                      {isOpen && (
                        <div className="mt-4 pt-4 border-t border-border/50 space-y-2 animate-slide-down">
                          {s.booking && (
                            <>
                              <div className="flex justify-between text-[10px] font-medium">
                                <span className="text-muted">Booked By:</span>
                                <span className="text-fg font-bold">{s.booking.studentName}</span>
                              </div>
                              <div className="flex justify-between text-[10px] font-medium">
                                <span className="text-muted">Student Email:</span>
                                <span className="text-fg">{s.booking.studentEmail || "—"}</span>
                              </div>
                            </>
                          )}
                          <div className="flex justify-between text-[10px] font-medium">
                            <span className="text-muted">Auto-Expire:</span>
                            <span className="text-fg">{isPast ? "Yes" : "No"}</span>
                          </div>
                          <div className="flex justify-between text-[10px] font-medium">
                            <span className="text-muted">Visibility:</span>
                            <span className="text-fg">{status === "Open" ? "Visible on Profile" : "Hidden"}</span>
                          </div>
                          {s.isBooked && (
                            <div className="pt-2">
                              <Link
                                to="/bookings"
                                className="text-[10px] font-bold text-primary block text-center py-2 bg-primary/5 rounded-lg border border-primary/10"
                              >
                                Go to Session
                              </Link>
                            </div>
                          )}
                        </div>
                      )}
                    </Card>
                  );
                })
              )}

              {filteredSlots.length === 0 && !loading && (
                <div className="col-span-full py-16 text-center animate-fade-in bg-surface2/50 rounded-[40px] border border-dashed border-border">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface text-primary shadow-soft">
                    <svg className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                      <rect x="3" y="4" width="18" height="18" rx="2" />
                      <path d="M16 2v4M8 2v4M3 10h18" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-bold text-fg">No {activeTab.toLowerCase()} slots</h4>
                  <p className="text-sm text-muted mt-2 max-w-xs mx-auto">No slots found under this status tab.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </AppShell>
    </>
  );
}

export default SeniorSlots;
