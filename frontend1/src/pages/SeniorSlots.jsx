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
    if (showError) {
      showError(e?.response?.data?.message || "Failed to load slots");
    }
  } finally {
    setLoading(false);
  }
}

function SeniorSlots() {
  useSEO({
    title: "My Availability",
    description: "Manage your student mentorship session availability slots on Clarior."
  });

  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [mySlots, setMySlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [openSlotId, setOpenSlotId] = useState(null);
  const [confirmSlotId, setConfirmSlotId] = useState(null);
  const [now, setNow] = useState(() => Date.now());
  const [todayMin] = useState(() => new Date().toISOString().split("T")[0]);
  const [activeTab, setActiveTab] = useState("Open");

  const getSlotStatus = (s, isPast) => {
    if (isPast) return "Past";
    if (s.isBooked) {
      if (s.booking?.status === "completed" || s.booking?.status === "cancelled") {
        return "Past";
      }
      return "Booked";
    }
    return "Open";
  };

  const filteredSlots = useMemo(() => {
    return mySlots.filter((s) => {
      const dt = s.dateTime ? new Date(s.dateTime) : parseSlotDateTime(s.date, s.time);
      const isPast = dt ? dt.getTime() < now : false;
      const status = getSlotStatus(s, isPast);
      return status === activeTab;
    });
  }, [mySlots, activeTab, now]);

  const load = async () => {
    if (!user?._id) return;
    await loadSeniorSlots({ userId: user._id, setLoading, setMySlots, showError });
  };

  useEffect(() => {
    if (!user?._id) return;
    loadSeniorSlots({ userId: user._id, setLoading, setMySlots, showError });
  }, [user?._id]);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 15000); // Poll every 15s instead of 60s for snappier UI updates
    return () => clearInterval(interval);
  }, []);

  const create = async () => {
    setCreating(true);
    try {
      if (!date || !time) return showError("Please select date and time");
      const slotDT = parseSlotDateTime(date, time);
      if (!slotDT || slotDT.getTime() <= now) return showError("Please select a future time");
      
      await api.post("/slots", { date, time });
      setDate(""); setTime("");
      showSuccess("Slot created successfully.");
      load();
    } catch (e) {
      showError(e?.response?.data?.message || "Failed to create slot");
    } finally {
      setCreating(false);
    }
  };

  const handleCancelSlot = async (slotId, isBooked) => {
    try {
      setLoading(true);
      await api.delete(`/slots/${slotId}`);
      showSuccess(isBooked ? "Slot cancelled and student booking refunded." : "Slot deleted successfully.");
      setOpenSlotId(null);
      setConfirmSlotId(null);
      load();
    } catch (e) {
      showError(e?.response?.data?.message || "Failed to cancel slot");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell title="Availability" subtitle="Define when you're available to help students. Each slot is 20 minutes.">
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Creation Panel */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-6 sticky top-24">
            <h3 className="text-lg font-bold text-fg mb-4">Add New Slot</h3>
            <div className="space-y-4">
              <Input label="Select Date" type="date" min={todayMin} value={date} onChange={(e) => setDate(e.target.value)}
                iconLeft={<svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>} />
              <Input label="Select Time" type="time" value={time} onChange={(e) => setTime(e.target.value)} hint="Future times only"
                iconLeft={<svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>} />
              <Button onClick={create} loading={creating} disabled={creating} className="w-full rounded-2xl shadow-lift" size="lg">Create Slot</Button>
            </div>
          </Card>
        </div>

        {/* List Panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-2">
            <div>
              <h3 className="heading-display text-xl font-extrabold text-fg">Active Slots</h3>
              <p className="text-xs text-muted mt-1">{mySlots.length} total availability slots</p>
            </div>
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={load} 
              loading={loading}
              className="rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              iconLeft={
                <svg className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
              }
            >
              Refresh
            </Button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-4 border-b border-border/60 pb-px">
            {["Open", "Booked", "Past"].map((tab) => {
              const count = mySlots.filter((s) => {
                const dt = s.dateTime ? new Date(s.dateTime) : parseSlotDateTime(s.date, s.time);
                const isPast = dt ? dt.getTime() < now : false;
                const status = getSlotStatus(s, isPast);
                return status === tab;
              }).length;

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

          <div className="grid sm:grid-cols-2 gap-4">
            {loading ? (
              [1, 2, 3, 4].map((i) => <Skeleton.Slot key={i} />)
            ) : (
              filteredSlots.map((s, idx) => {
                const dt = s.dateTime ? new Date(s.dateTime) : parseSlotDateTime(s.date, s.time);
                const isPast = dt ? dt.getTime() < now : false;
                const status = getSlotStatus(s, isPast);
                const isOpen = openSlotId === s._id;

                return (
                  <Card key={s._id} className="p-5 animate-fade-up relative overflow-hidden group" style={{ animationDelay: `${idx * 50}ms` }}>
                    <div className={`absolute top-0 right-0 h-16 w-16 bg-gradient-to-bl opacity-5 transition-opacity group-hover:opacity-10 ${
                      status === "Open" ? "from-success" : status === "Booked" ? "from-primary" : "from-muted"
                    }`} />
                    
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-[9px] font-bold text-muted uppercase tracking-[0.2em] mb-1">Time Slot</div>
                        <div className="font-bold text-fg leading-tight">
                          {new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(s.date))} • {formatTimeLabel(s.time)}
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                        status === "Open" ? "bg-success/10 text-success border-success/20" :
                        status === "Booked" ? "bg-primary/10 text-primary border-primary/20" :
                        "bg-muted/10 text-muted border-muted/20"
                      }`}>
                        {status}
                      </span>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <Button 
                        variant={isOpen ? "dark" : "secondary"}
                        size="sm"
                        onClick={() => { setOpenSlotId(isOpen ? null : s._id); setConfirmSlotId(null); }} 
                        className="rounded-2xl text-[10px] px-3.5 py-1.5 min-h-0 font-black uppercase tracking-widest shadow-sm hover:scale-[1.03] active:scale-[0.98] transition-all cursor-pointer"
                      >
                        {isOpen ? "Hide Details" : "View Details"}
                      </Button>
                      {s.isBooked && (
                        <span className="px-2.5 py-1.5 rounded-xl text-[9px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                          Linked to booking
                        </span>
                      )}
                    </div>

                    {isOpen && (
                      <div className="mt-4 pt-4 border-t border-border/50 space-y-3.5 animate-slide-down">
                        {s.booking && (
                          <div className="p-3.5 rounded-2xl bg-surface2 border border-border/40 space-y-2">
                            <div className="flex items-center gap-2.5 mb-1.5">
                              <div className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                                {s.booking.studentName.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="text-[9px] font-bold text-muted uppercase tracking-widest">Booked Student</div>
                                <div className="text-xs font-bold text-fg">{s.booking.studentName}</div>
                              </div>
                            </div>
                            <div className="flex justify-between items-center text-xs pt-1 border-t border-border/20">
                              <span className="text-muted">Student Email:</span>
                              <span className="text-fg font-medium">{s.booking.studentEmail || "—"}</span>
                            </div>
                          </div>
                        )}
                        
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-xs p-2.5 rounded-xl bg-surface/40 border border-border/30">
                            <span className="text-muted flex items-center gap-1.5">
                              <svg className="w-3.5 h-3.5 text-muted/80" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="10" />
                                <path d="M12 6v6l4 2" />
                              </svg>
                              Auto-Expire:
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                              isPast ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" : "bg-success/10 text-success border border-success/20"
                            }`}>
                              {isPast ? "Expired" : "Active"}
                            </span>
                          </div>
                          
                          <div className="flex justify-between items-center text-xs p-2.5 rounded-xl bg-surface/40 border border-border/30">
                            <span className="text-muted flex items-center gap-1.5">
                              <svg className="w-3.5 h-3.5 text-muted/80" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path d="M2.062 12.348a1 1 0 010-.696 10.75 10.75 0 0119.876 0 1 1 0 010 .696 10.75 10.75 0 01-19.876 0z" />
                                <circle cx="12" cy="12" r="3" />
                              </svg>
                              Visibility:
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                              status === "Open" ? "bg-primary/10 text-primary border border-primary/20" : "bg-muted/10 text-muted border border-muted/20"
                            }`}>
                              {status === "Open" ? "Visible on Profile" : "Hidden"}
                            </span>
                          </div>
                        </div>

                        {s.isBooked && (
                          <div className="pt-1.5">
                            <Link to="/bookings" className="text-xs font-bold text-primary block text-center py-2.5 bg-primary/10 hover:bg-primary/15 rounded-xl border border-primary/20 transition-all hover:scale-[1.01] active:scale-[0.99]">
                              Go to Session Portal
                            </Link>
                          </div>
                        )}
                        {(status === "Open" || status === "Booked") && (
                          confirmSlotId === s._id ? (
                            <div className="pt-2 p-3.5 rounded-2xl bg-danger/5 border border-danger/15 space-y-2.5 animate-scale-in">
                              <div className="text-[10px] font-bold text-danger uppercase tracking-wider flex items-center gap-1.5">
                                <svg className="w-3.5 h-3.5 text-danger" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286zm0 13.036h.008v.008H12v-.008z" />
                                </svg>
                                Confirm Action
                              </div>
                              <p className="text-[10px] text-muted leading-relaxed font-semibold">
                                {status === "Booked"
                                  ? "Warning: Cancelling will void the booking and refund the student's credit."
                                  : "This slot will be deleted permanently."}
                              </p>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleCancelSlot(s._id, status === "Booked")}
                                  className="flex-1 text-center py-2 text-[10px] font-black uppercase tracking-wider text-white bg-gradient-to-r from-red-500 to-rose-600 rounded-xl hover:from-red-600 hover:to-rose-700 transition-all cursor-pointer shadow-[0_2px_8px_rgba(239,68,68,0.2)]"
                                >
                                  Yes, Cancel
                                </button>
                                <button
                                  onClick={() => setConfirmSlotId(null)}
                                  className="flex-1 text-center py-2 text-[10px] font-black uppercase tracking-wider text-fg bg-surface2 hover:bg-surface3 border border-border/50 rounded-xl transition-all cursor-pointer"
                                >
                                  Keep Slot
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="pt-1">
                              <button
                                onClick={() => setConfirmSlotId(s._id)}
                                className="w-full text-center py-2.5 text-xs font-black uppercase tracking-wider text-white bg-gradient-to-r from-red-500 via-rose-600 to-red-500 hover:from-red-600 hover:to-rose-700 rounded-xl transition-all cursor-pointer shadow-[0_4px_12px_rgba(239,68,68,0.25)] hover:shadow-[0_6px_16px_rgba(239,68,68,0.35)] hover:-translate-y-px active:translate-y-0"
                              >
                                {status === "Booked" ? "Cancel & Refund Student" : "Delete Slot"}
                              </button>
                            </div>
                          )
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
  );
}

export default SeniorSlots;
