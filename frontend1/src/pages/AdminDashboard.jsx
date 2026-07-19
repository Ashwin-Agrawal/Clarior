import { useEffect, useMemo, useState } from "react";
import AppShell from "../components/AppShell";
import api from "../services/api";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import useSEO from "../hooks/useSEO";
import ConfirmModal from "../components/ui/ConfirmModal";

async function fetchGoogleStatus(setGoogleStatus) {
  try {
    const res = await api.get("/google/status");
    setGoogleStatus(res.data || null);
  } catch {
    setGoogleStatus({ connected: false, error: true });
  }
}

async function loadAdminData({ 
  setMsg, 
  setLoading, 
  setUsers, 
  setPending, 
  setGoogleStatus, 
  setPendingPayouts, 
  setPendingReleases,
  setTickets,
  setRequests
}) {
  setMsg({ type: "", text: "" });
  setLoading(true);
  try {
    const [usersRes, pendingRes, payoutsRes, releasesRes, ticketsRes, requestsRes] = await Promise.all([
      api.get("/admin/users"), 
      api.get("/admin/pending-seniors"),
      api.get("/withdraw/pending"),
      api.get("/admin/pending-releases"),
      api.get("/support/admin/tickets"),
      api.get("/colleges/admin/requests")
    ]);
    setUsers(usersRes.data?.users || []);
    setPending(pendingRes.data?.seniors || []);
    setPendingPayouts(payoutsRes.data?.withdraws || []);
    setPendingReleases(releasesRes.data?.bookings || []);
    setTickets(ticketsRes.data?.tickets || []);
    setRequests(requestsRes.data?.requests || []);
    await fetchGoogleStatus(setGoogleStatus);
  } catch (e) {
    setMsg({ type: "error", text: e?.response?.data?.message || "Failed to load admin data" });
  } finally {
    setLoading(false);
  }
}

function AdminDashboard() {
  useSEO({
    title: "Admin Panel",
    description: "Clarior AdminDashboard page"
  });

  const [users, setUsers] = useState([]);
  const [pending, setPending] = useState([]);
  const [pendingPayouts, setPendingPayouts] = useState([]);
  const [pendingReleases, setPendingReleases] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleStatus, setGoogleStatus] = useState(null);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [activeTab, setActiveTab] = useState("queue");
  const [confirmConfig, setConfirmConfig] = useState({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "",
    onConfirm: () => {},
    variant: "danger",
  });

  const loadGoogleStatus = async () => {
    await fetchGoogleStatus(setGoogleStatus);
  };

  const refresh = async () => {
    await loadAdminData({ 
      setMsg, 
      setLoading, 
      setUsers, 
      setPending, 
      setGoogleStatus, 
      setPendingPayouts, 
      setPendingReleases,
      setTickets,
      setRequests
    });
  };

  useEffect(() => {
    refresh();
  }, []);

  const stats = useMemo(() => {
    const total = users.length;
    const seniors = users.filter((u) => u.role === "senior").length;
    const students = users.filter((u) => u.role === "student").length;
    const admins = users.filter((u) => u.role === "admin").length;
    return { total, seniors, students, admins };
  }, [users]);

  const approve = async (id) => {
    try { 
      await api.patch(`/admin/verify/${id}`); 
      setMsg({ type: "success", text: "Senior approved." }); 
      refresh(); 
    } catch (e) { 
      setMsg({ type: "error", text: e?.response?.data?.message || "Approve failed" }); 
    }
  };

  const reject = (id) => {
    setConfirmConfig({
      isOpen: true,
      title: "Reject & Delete User",
      message: "Are you sure you want to reject and delete this user? This action is permanent.",
      confirmText: "Delete User",
      variant: "danger",
      onConfirm: async () => {
        try { 
          await api.delete(`/admin/user/${id}`); 
          setMsg({ type: "success", text: "User deleted." }); 
          refresh(); 
        } catch (e) { 
          setMsg({ type: "error", text: e?.response?.data?.message || "Reject failed" }); 
        } finally {
          setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const approvePayout = async (id) => {
    try { 
      await api.patch(`/withdraw/approve/${id}`); 
      setMsg({ type: "success", text: "Payout approved." }); 
      refresh(); 
    } catch (e) { 
      setMsg({ type: "error", text: e?.response?.data?.message || "Approve payout failed" }); 
    }
  };

  const rejectPayout = (id) => {
    setConfirmConfig({
      isOpen: true,
      title: "Reject Payout Request",
      message: "Are you sure you want to reject this withdrawal payout request?",
      confirmText: "Reject Payout",
      variant: "danger",
      onConfirm: async () => {
        try { 
          await api.patch(`/withdraw/reject/${id}`); 
          setMsg({ type: "success", text: "Payout rejected." }); 
          refresh(); 
        } catch (e) { 
          setMsg({ type: "error", text: e?.response?.data?.message || "Reject payout failed" }); 
        } finally {
          setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const handleReleaseEarnings = async (id) => {
    try { 
      await api.patch(`/admin/release-earnings/${id}`); 
      setMsg({ type: "success", text: "Earnings released successfully." }); 
      refresh(); 
    } catch (e) { 
      setMsg({ type: "error", text: e?.response?.data?.message || "Failed to release earnings" }); 
    }
  };

  const handleRejectEarnings = (id) => {
    setConfirmConfig({
      isOpen: true,
      title: "Reject Session Payout",
      message: "Are you sure you want to reject this session payout? This will refund the credit to the student and deduct the payout from the senior's pending balance.",
      confirmText: "Reject Payout & Refund",
      variant: "danger",
      onConfirm: async () => {
        try {
          await api.patch(`/admin/reject-earnings/${id}`);
          setMsg({ type: "success", text: "Earnings rejected and student credit refunded." });
          refresh();
        } catch (e) {
          setMsg({ type: "error", text: e?.response?.data?.message || "Failed to reject earnings" });
        } finally {
          setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const connectGoogle = async () => {
    setGoogleLoading(true);
    try {
      const res = await api.get("/google/auth-url");
      const url = res.data?.url;
      if (!url) return setMsg({ type: "error", text: "Google auth URL missing. Check backend setup." });
      window.open(url, "_blank", "noopener,noreferrer");
      setMsg({ type: "success", text: "Google OAuth opened. Finish consent then refresh status." });
    } catch (e) { 
      setMsg({ type: "error", text: e?.response?.data?.message || "OAuth failed" }); 
    } finally { 
      setGoogleLoading(false); 
    }
  };

  // Support Tickets Handlers
  const handleResolveTicket = async (id, status) => {
    try {
      await api.patch(`/support/admin/tickets/${id}/resolve`, { status });
      setMsg({ type: "success", text: `Ticket status marked as ${status}` });
      refresh();
    } catch (e) {
      setMsg({ type: "error", text: e?.response?.data?.message || "Failed to resolve support ticket" });
    }
  };

  // College Add Request Handlers
  const handleApproveRequest = async (id) => {
    try {
      await api.patch(`/colleges/admin/requests/${id}/approve`);
      setMsg({ type: "success", text: "College request marked as approved/completed." });
      refresh();
    } catch (e) {
      setMsg({ type: "error", text: e?.response?.data?.message || "Failed to approve college request" });
    }
  };

  const handleRejectRequest = (id) => {
    setConfirmConfig({
      isOpen: true,
      title: "Reject College Request",
      message: "Are you sure you want to reject this college addition request?",
      confirmText: "Reject Request",
      variant: "danger",
      onConfirm: async () => {
        try {
          await api.patch(`/colleges/admin/requests/${id}/reject`);
          setMsg({ type: "success", text: "College request rejected." });
          refresh();
        } catch (e) {
          setMsg({ type: "error", text: e?.response?.data?.message || "Failed to reject college request" });
        } finally {
          setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const formatISTDate = (dateStr) => {
    return new Intl.DateTimeFormat('en-IN', { 
      timeZone: 'Asia/Kolkata', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateStr));
  };

  const activeTicketsCount = tickets.filter(t => t.status === "open").length;
  const pendingRequestsCount = requests.filter(r => r.status === "pending").length;
  const pendingQueueCount = pending.length + pendingPayouts.length + pendingReleases.length;

  return (
    <AppShell title="Admin Panel" subtitle="Manage users, verify seniors, resolve support tickets, and maintain platform integrity.">
      <div className="flex justify-end mb-6">
        <Button variant="secondary" onClick={refresh} loading={loading} size="sm" className="rounded-xl">Refresh Data</Button>
      </div>

      {msg.text && (
        <div className={`mb-6 p-4 rounded-xl text-xs font-bold animate-scale-in border ${
          msg.type === "success" ? "bg-success/5 border-success/20 text-success" : "bg-danger/5 border-danger/20 text-danger"
        }`}>
          {msg.text}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Users", val: stats.total, color: "primary", i: "●" },
          { label: "Students", val: stats.students, color: "success", i: "●" },
          { label: "Seniors", val: stats.seniors, color: "accent", i: "★" },
          { label: "Admins", val: stats.admins, color: "muted", i: "◆" },
        ].map(s => (
          <Card key={s.label} className="p-6 animate-fade-up">
            <div className="flex items-center justify-between">
              <span className="text-xl">{s.i}</span>
              <div className="text-[10px] font-bold uppercase tracking-widest text-muted">{s.label}</div>
            </div>
            <div className="mt-2 text-3xl font-black text-fg">{s.val}</div>
          </Card>
        ))}
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-border/50 mb-8 overflow-x-auto scrollbar-hide gap-1">
        {[
          { id: "queue", label: "Queue Control", count: pendingQueueCount, icon: "⚙️" },
          { id: "tickets", label: "Support Tickets", count: activeTicketsCount, icon: "📧" },
          { id: "requests", label: "College Requests", count: pendingRequestsCount, icon: "🏫" },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-6 py-3 font-black text-xs uppercase tracking-widest border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === t.id
                ? "border-primary text-primary"
                : "border-transparent text-muted hover:text-fg hover:border-border"
            }`}
          >
            <span>{t.icon}</span>
            <span>{t.label}</span>
            {t.count > 0 && (
              <span className="bg-primary/10 text-primary text-[10px] px-1.5 py-0.5 rounded-full font-sans">
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* activeTab == queue: Full-width list */}
      {activeTab === "queue" && (
        <div className="space-y-12 max-w-4xl mx-auto">
          {/* Verification, Payouts, Releases column */}
          <div className="space-y-12">
            
            {/* Pending Seniors */}
            <div className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <h3 className="heading-display text-xl font-extrabold text-fg">Pending Verification</h3>
                <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">{pending.length} pending</span>
              </div>

              <div className="space-y-4">
                {loading && (
                  <div className="space-y-4">
                    {[1,2,3].map(i => (
                      <div key={i} className="h-24 rounded-2xl bg-surface2 animate-pulse" />
                    ))}
                  </div>
                )}
                {pending.map((s, idx) => (
                  <Card key={s._id} className="p-6 animate-fade-up" style={{ animationDelay: `${idx * 100}ms` }}>
                    <div className="flex flex-col md:flex-row justify-between gap-6">
                      <div className="flex-1 space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-surface2 flex items-center justify-center text-lg font-bold text-fg">
                            {s.name?.[0]}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-fg">{s.name}</div>
                            <div className="text-[10px] text-muted font-medium">{s.email} • {s.phone || "No Phone"}</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-surface2/50 p-4 rounded-2xl border border-border/50">
                          <div className="space-y-1">
                            <div className="text-[9px] font-bold text-muted uppercase">College</div>
                            <div className="text-xs font-bold text-fg truncate">{s.college || "—"}{s.affiliatedCollege ? ` (${s.affiliatedCollege})` : ""}</div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-[9px] font-bold text-muted uppercase">Branch</div>
                            <div className="text-xs font-bold text-fg">{s.branch || "—"}</div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-[9px] font-bold text-muted uppercase">Year/CGPA</div>
                            <div className="text-xs font-bold text-fg">{s.year || "—"} / {s.cgpa || "—"}</div>
                          </div>
                        </div>

                        {s.linkedin && (
                          <a href={s.linkedin} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-[10px] font-bold text-primary hover:underline">
                            View LinkedIn Profile ↗
                          </a>
                        )}
                        {s.bio && (
                          <p className="text-xs text-muted leading-relaxed line-clamp-2">"{s.bio}"</p>
                        )}
                      </div>

                      <div className="flex flex-row md:flex-col gap-2 min-w-[140px] justify-center">
                        <Button onClick={() => approve(s._id)} className="flex-1 rounded-xl" size="sm">Approve</Button>
                        <Button variant="secondary" onClick={() => reject(s._id)} className="flex-1 rounded-xl" size="sm">Reject</Button>
                      </div>
                    </div>
                  </Card>
                ))}

                {pending.length === 0 && !loading && (
                  <div className="py-12 text-center bg-surface2/50 rounded-[40px] border border-dashed border-border">
                    <div className="text-3xl mb-4">✨</div>
                    <h4 className="text-lg font-bold text-fg">Queue clear!</h4>
                    <p className="text-sm text-muted mt-1">No pending applications to review right now.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Pending Payouts */}
            <div className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <h3 className="heading-display text-xl font-extrabold text-fg">Pending Payouts</h3>
                <span className="bg-accent/10 text-accent text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">{pendingPayouts.length} pending</span>
              </div>

              <div className="space-y-4">
                {pendingPayouts.map((p, idx) => (
                  <Card key={p._id} className="p-6 animate-fade-up" style={{ animationDelay: `${idx * 100}ms` }}>
                    <div className="flex flex-col md:flex-row justify-between gap-6">
                      <div className="flex-1 space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center text-lg font-bold text-accent">
                            ₹
                          </div>
                          <div>
                            <div className="text-sm font-bold text-fg">{p.senior?.name}</div>
                            <div className="text-[10px] text-muted font-medium">{p.senior?.email}</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 bg-surface2/50 p-4 rounded-2xl border border-border/50">
                          <div className="space-y-1">
                            <div className="text-[9px] font-bold text-muted uppercase">Amount Requested</div>
                            <div className="text-lg font-black text-fg">₹{p.amount}</div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-[9px] font-bold text-muted uppercase">UPI ID</div>
                            <div className="text-sm font-bold text-fg select-all">{p.upiId || p.senior?.upiId || "—"}</div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-row md:flex-col gap-2 min-w-[140px] justify-center">
                        <Button onClick={() => approvePayout(p._id)} className="flex-1 rounded-xl bg-accent text-accent-fg hover:bg-accent/90" size="sm">Mark Paid</Button>
                        <Button variant="secondary" onClick={() => rejectPayout(p._id)} className="flex-1 rounded-xl border-danger/20 text-danger hover:bg-danger/10" size="sm">Reject</Button>
                      </div>
                    </div>
                  </Card>
                ))}

                {pendingPayouts.length === 0 && !loading && (
                  <div className="py-12 text-center bg-surface2/50 rounded-[40px] border border-dashed border-border">
                    <div className="text-3xl mb-4">💸</div>
                    <h4 className="text-lg font-bold text-fg">All caught up!</h4>
                    <p className="text-sm text-muted mt-1">No pending payout requests.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Pending Releases */}
            <div className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <h3 className="heading-display text-xl font-extrabold text-fg">Pending Earnings Releases</h3>
                <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">{pendingReleases.length} pending</span>
              </div>

              <div className="space-y-4">
                {pendingReleases.map((b, idx) => (
                  <Card key={b._id} className="p-6 animate-fade-up" style={{ animationDelay: `${idx * 100}ms` }}>
                    <div className="flex flex-col md:flex-row justify-between gap-6">
                      <div className="flex-1 space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-lg font-bold text-primary">
                            🎙️
                          </div>
                          <div>
                            <div className="text-sm font-bold text-fg">Session with {b.student?.name}</div>
                            <div className="text-[10px] text-muted font-medium">Senior: {b.senior?.name} ({b.senior?.email})</div>
                          </div>
                        </div>

                        {b.review ? (
                          <div className="bg-surface2/60 p-4.5 rounded-2xl border border-border/50 text-xs mt-3 space-y-1.5 shadow-sm">
                            <div className="flex items-center gap-2 font-bold text-fg">
                              <span className="text-amber-500 font-extrabold flex items-center gap-0.5">
                                ★ {b.review.rating}/5
                              </span>
                              <span className="text-[9px] font-black uppercase tracking-wider text-muted">• Student Review</span>
                            </div>
                            {b.review.comment ? (
                              <p className="text-muted leading-relaxed italic">"{b.review.comment}"</p>
                            ) : (
                              <p className="text-muted/65 italic select-none">No comment provided.</p>
                            )}
                          </div>
                        ) : (
                          <div className="bg-surface2/30 p-3 rounded-2xl text-[9px] text-muted font-black uppercase tracking-widest mt-3 border border-border/30 select-none">
                            No review left by student yet
                          </div>
                        )}
                      </div>

                      <div className="flex flex-row md:flex-col gap-2 min-w-[140px] justify-center">
                        <Button onClick={() => handleReleaseEarnings(b._id)} className="flex-1 rounded-xl" size="sm">Release Funds</Button>
                        <Button 
                          variant="secondary" 
                          onClick={() => handleRejectEarnings(b._id)} 
                          className="flex-1 rounded-xl border-danger/25 text-danger hover:bg-danger/10" 
                          size="sm"
                        >
                          Reject Payout
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}

                {pendingReleases.length === 0 && !loading && (
                  <div className="py-12 text-center bg-surface2/50 rounded-[40px] border border-dashed border-border">
                    <div className="text-3xl mb-4">🌟</div>
                    <h4 className="text-lg font-bold text-fg">All earnings released!</h4>
                    <p className="text-sm text-muted mt-1">No pending completed sessions.</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* activeTab == tickets: Support tickets */}
      {activeTab === "tickets" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="heading-display text-xl font-extrabold text-fg">Support Ticket Queue</h3>
            <span className="bg-primary/10 text-primary text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">{activeTicketsCount} Open Tickets</span>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {tickets.filter(t => t.status === "open").map((t, idx) => {
              const categoryColors = {
                "Payment Issue": "bg-danger/10 text-danger border-danger/25",
                "Booking Problem": "bg-warning/10 text-warning border-warning/25",
                "General Inquiry": "bg-primary/10 text-primary border-primary/25",
                "Other": "bg-muted/10 text-muted border-muted/25"
              };

              const leftBorders = {
                "Payment Issue": "border-l-4 border-l-danger",
                "Booking Problem": "border-l-4 border-l-warning",
                "General Inquiry": "border-l-4 border-l-primary",
                "Other": "border-l-4 border-l-muted"
              };

              return (
                <Card 
                  key={t._id} 
                  className={`p-6 md:p-7 border border-border bg-gradient-to-br from-surface via-surface to-surface-2 shadow-card hover:shadow-lift transition-all duration-300 relative overflow-hidden rounded-[28px] ${leftBorders[t.category] || "border-l-4 border-l-primary"}`}
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <div className="text-base font-black text-fg">{t.name}</div>
                        <div className="text-[10px] text-muted font-bold tracking-tight mt-0.5">{t.email}</div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${categoryColors[t.category] || "bg-primary/10 text-primary border-primary/20"}`}>
                        {t.category}
                      </span>
                    </div>

                    <div className="bg-surface2/60 p-4.5 rounded-2xl border border-border/40 text-xs font-semibold leading-relaxed text-fg/90 italic min-h-[90px]">
                      "{t.message}"
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-muted font-black uppercase tracking-wider pt-4 border-t border-border/40">
                      <span>Submitted: {formatISTDate(t.createdAt)}</span>
                      <button
                        onClick={() => handleResolveTicket(t._id, "resolved")}
                        className="text-success font-black hover:text-emerald-600 transition-colors uppercase tracking-wider cursor-pointer flex items-center gap-1"
                      >
                        <span className="text-xs">✓</span> Resolve Ticket
                      </button>
                    </div>
                  </div>
                </Card>
              );
            })}

            {tickets.filter(t => t.status === "open").length === 0 && !loading && (
              <div className="col-span-2 py-16 text-center bg-surface2/30 rounded-[40px] border border-dashed border-border/80 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-success/[0.01] to-transparent pointer-events-none" />
                <div className="text-4xl mb-4">📥</div>
                <h4 className="text-lg font-black text-fg tracking-tight">Support queue clear!</h4>
                <p className="text-xs text-muted mt-1 max-w-xs mx-auto leading-relaxed">Hooray! No pending support inquiries need attention right now.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* activeTab == requests: College requests */}
      {activeTab === "requests" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="heading-display text-xl font-extrabold text-fg">College Add Requests</h3>
            <span className="bg-primary/10 text-primary text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">{pendingRequestsCount} Pending Requests</span>
          </div>

          <div className="space-y-4">
            {requests.filter(r => r.status === "pending").map((r, idx) => (
              <Card 
                key={r._id} 
                className="p-6 md:p-7 border border-border bg-gradient-to-br from-surface via-surface to-surface-2 shadow-card hover:shadow-lift transition-all duration-300 rounded-[28px] border-l-4 border-l-accent"
              >
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-2xl bg-accent/10 text-accent flex items-center justify-center text-xl border border-accent/15 shadow-sm">
                        🏫
                      </div>
                      <div>
                        <div className="text-base font-black text-fg">{r.name}</div>
                        <div className="text-[10px] text-muted font-black uppercase tracking-wider mt-0.5">
                          Type: {r.type} {r.established ? `• Established ${r.established}` : ""}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-surface2/50 p-4 rounded-2xl border border-border/50 text-xs">
                      <div className="space-y-1">
                        <div className="text-[9px] font-black text-muted uppercase tracking-wider">Location</div>
                        <div className="font-bold text-fg">{r.city}, {r.state}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-[9px] font-black text-muted uppercase tracking-wider">Requested By</div>
                        <div className="font-bold text-fg select-all">{r.requesterEmail || "Guest / Anonymous"}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-[9px] font-black text-muted uppercase tracking-wider">Requested On</div>
                        <div className="font-bold text-fg">{formatISTDate(r.createdAt)}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-row md:flex-col gap-3 min-w-[150px] justify-center items-stretch shrink-0">
                    <Button onClick={() => handleApproveRequest(r._id)} className="flex-1 rounded-xl font-black text-xs" size="sm">
                      Approve Request
                    </Button>
                    <Button variant="secondary" onClick={() => handleRejectRequest(r._id)} className="flex-1 rounded-xl border-danger/25 text-danger hover:bg-danger/10 font-black text-xs" size="sm">
                      Reject Request
                    </Button>
                  </div>
                </div>
              </Card>
            ))}

            {requests.filter(r => r.status === "pending").length === 0 && !loading && (
              <div className="py-16 text-center bg-surface2/30 rounded-[40px] border border-dashed border-border/80 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.01] to-transparent pointer-events-none" />
                <div className="text-4xl mb-4">🏫</div>
                <h4 className="text-lg font-black text-fg tracking-tight">No college requests</h4>
                <p className="text-xs text-muted mt-1 max-w-xs mx-auto leading-relaxed font-semibold">All college addition requests have been reviewed and completed.</p>
              </div>
            )}
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmText={confirmConfig.confirmText}
        cancelText="Cancel"
        onConfirm={confirmConfig.onConfirm}
        onCancel={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
        variant={confirmConfig.variant}
      />
    </AppShell>
  );
}

export default AdminDashboard;
