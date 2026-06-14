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
  const [now, setNow] = useState(() => Date.now());
  const [todayMin] = useState(() => new Date().toISOString().split("T")[0]);
  const [activeTab, setActiveTab] = useState("Open");

  const filteredSlots = useMemo(() => {
    return mySlots.filter((s) => {
      const dt = parseSlotDateTime(s.date, s.time);
      const isPast = dt ? dt.getTime() < now : false;
      const status = s.isBooked ? "Booked" : isPast ? "Past" : "Open";
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
      setDate(""); setTime("");
      showSuccess("Slot created successfully.");
      load();
    } catch (e) {
      showError(e?.response?.data?.message || "Failed to create slot");
    } finally {
      setCreating(false);
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
            <Button variant="ghost" size="sm" onClick={load} loading={loading}>Refresh</Button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-4 border-b border-border/60 pb-px">
            {["Open", "Booked", "Past"].map((tab) => {
              const count = mySlots.filter((s) => {
                const dt = parseSlotDateTime(s.date, s.time);
                const isPast = dt ? dt.getTime() < now : false;
                const status = s.isBooked ? "Booked" : isPast ? "Past" : "Open";
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
                const dt = parseSlotDateTime(s.date, s.time);
                const isPast = dt ? dt.getTime() < now : false;
                const status = s.isBooked ? "Booked" : isPast ? "Past" : "Open";
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
                      <button onClick={() => setOpenSlotId(isOpen ? null : s._id)} className="text-[10px] font-bold text-primary hover:underline uppercase tracking-widest">
                        {isOpen ? "Hide Info" : "View Details"}
                      </button>
                      {s.isBooked && <span className="text-[10px] font-bold text-primary">Linked to booking</span>}
                    </div>

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
                            <Link to="/bookings" className="text-[10px] font-bold text-primary block text-center py-2 bg-primary/5 rounded-lg border border-primary/10">
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
  );
}

export default SeniorSlots;
