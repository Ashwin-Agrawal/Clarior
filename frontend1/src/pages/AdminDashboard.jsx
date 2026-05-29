import { useEffect, useMemo, useState } from "react";
import AppShell from "../components/AppShell";
import api from "../services/api";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

async function fetchGoogleStatus(setGoogleStatus) {
  try {
    const res = await api.get("/google/status");
    setGoogleStatus(res.data || null);
  } catch {
    setGoogleStatus({ connected: false, error: true });
  }
}

async function loadAdminData({ setMsg, setLoading, setUsers, setPending, setGoogleStatus, setPendingPayouts, setPendingReleases }) {
  setMsg({ type: "", text: "" });
  setLoading(true);
  try {
    const [usersRes, pendingRes, payoutsRes, releasesRes] = await Promise.all([
      api.get("/admin/users"), 
      api.get("/admin/pending-seniors"),
      api.get("/withdraw/pending"),
      api.get("/admin/pending-releases")
    ]);
    setUsers(usersRes.data?.users || []);
    setPending(pendingRes.data?.seniors || []);
    setPendingPayouts(payoutsRes.data?.withdraws || []);
    setPendingReleases(releasesRes.data?.bookings || []);
    await fetchGoogleStatus(setGoogleStatus);
  } catch (e) {
    setMsg({ type: "error", text: e?.response?.data?.message || "Failed to load admin data" });
  } finally {
    setLoading(false);
  }
}

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [pending, setPending] = useState([]);
  const [pendingPayouts, setPendingPayouts] = useState([]);
  const [pendingReleases, setPendingReleases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleStatus, setGoogleStatus] = useState(null);
  const [msg, setMsg] = useState({ type: "", text: "" });

  const loadGoogleStatus = async () => {
    await fetchGoogleStatus(setGoogleStatus);
  };

  const refresh = async () => {
    await loadAdminData({ setMsg, setLoading, setUsers, setPending, setGoogleStatus, setPendingPayouts, setPendingReleases });
  };

  useEffect(() => {
    loadAdminData({ setMsg, setLoading, setUsers, setPending, setGoogleStatus, setPendingPayouts, setPendingReleases });
  }, []);

  const stats = useMemo(() => {
    const total = users.length;
    const seniors = users.filter((u) => u.role === "senior").length;
    const students = users.filter((u) => u.role === "student").length;
    const admins = users.filter((u) => u.role === "admin").length;
    return { total, seniors, students, admins };
  }, [users]);

  const approve = async (id) => {
    try { await api.patch(`/admin/verify/${id}`); setMsg({ type: "success", text: "Senior approved." }); refresh(); } catch (e) { setMsg({ type: "error", text: e?.response?.data?.message || "Approve failed" }); }
  };

  const reject = async (id) => {
    if (!window.confirm("Are you sure you want to reject and delete this user?")) return;
    try { await api.delete(`/admin/user/${id}`); setMsg({ type: "success", text: "User deleted." }); refresh(); } catch (e) { setMsg({ type: "error", text: e?.response?.data?.message || "Reject failed" }); }
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

  const rejectPayout = async (id) => {
    if (!window.confirm("Are you sure you want to reject this payout?")) return;
    try { 
      await api.patch(`/withdraw/reject/${id}`); 
      setMsg({ type: "success", text: "Payout rejected." }); 
      refresh(); 
    } catch (e) { 
      setMsg({ type: "error", text: e?.response?.data?.message || "Reject payout failed" }); 
    }
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

  const connectGoogle = async () => {
    setGoogleLoading(true);
    try {
      const res = await api.get("/google/auth-url");
      const url = res.data?.url;
      if (!url) return setMsg({ type: "error", text: "Google auth URL missing. Check backend setup." });
      window.open(url, "_blank", "noopener,noreferrer");
      setMsg({ type: "success", text: "Google OAuth opened. Finish consent then refresh status." });
    } catch (e) { setMsg({ type: "error", text: e?.response?.data?.message || "OAuth failed" }); } finally { setGoogleLoading(false); }
  };

  return (
    <AppShell title="Admin Panel" subtitle="Manage users, verify seniors, and maintain platform integrity.">
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
          { label: "Total Users", val: stats.total, color: "primary", i: "👥" },
          { label: "Students", val: stats.students, color: "success", i: "🎓" },
          { label: "Seniors", val: stats.seniors, color: "accent", i: "⭐" },
          { label: "Admins", val: stats.admins, color: "muted", i: "🛡️" },
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

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Google Status */}
        <div className="lg:col-span-1">
          <Card className="p-6 space-y-6 animate-fade-up delay-100">
            <div>
              <h3 className="heading-display text-lg font-extrabold text-fg">Google Meet Account</h3>
              <p className="text-xs text-muted mt-1 leading-relaxed">Required for generating automated session links.</p>
            </div>
            
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${googleStatus?.connected ? "bg-success shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-warning"}`} />
              <span className="text-[10px] font-bold uppercase tracking-widest text-fg">
                {googleStatus?.connected ? "System Connected" : "Connection Required"}
              </span>
            </div>

            <div className="space-y-3">
              <Button onClick={connectGoogle} loading={googleLoading} className="w-full rounded-2xl" variant={googleStatus?.connected ? "secondary" : "primary"}>
                {googleStatus?.connected ? "Reconnect Account" : "Connect Google"}
              </Button>
              <Button variant="ghost" onClick={loadGoogleStatus} className="w-full text-xs font-bold">Refresh Status</Button>
            </div>
          </Card>
        </div>

        {/* Pending Seniors */}
        <div className="lg:col-span-2 space-y-6 animate-fade-up delay-200">
          <div className="flex items-center justify-between px-2">
            <h3 className="heading-display text-xl font-extrabold text-fg">Pending Verification</h3>
            <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">{pending.length} pending</span>
          </div>

          <div className="space-y-4">
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
                        <div className="text-xs font-bold text-fg truncate">{s.college || "—"}</div>
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

                  <div className="flex flex-row md:flex-col gap-2 min-w-[140px]">
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
        <div className="lg:col-span-2 space-y-6 animate-fade-up delay-300">
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

        {/* Pending Earnings Releases */}
        <div className="lg:col-span-2 space-y-6 animate-fade-up delay-400">
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
                  </div>

                  <div className="flex flex-row md:flex-col gap-2 min-w-[140px] justify-center">
                    <Button onClick={() => handleReleaseEarnings(b._id)} className="flex-1 rounded-xl" size="sm">Release Funds</Button>
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
    </AppShell>
  );
}

export default AdminDashboard;
