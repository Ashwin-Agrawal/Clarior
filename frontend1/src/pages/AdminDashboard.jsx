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
  setPendingSeniors, 
  setPendingAlumni,
  setPendingPayouts, 
  setPendingReleases,
  setTickets,
  setRequests,
  setGoogleStatus
}) {
  setMsg({ type: "", text: "" });
  setLoading(true);
  try {
    const [usersRes, seniorsRes, alumniRes, payoutsRes, releasesRes, ticketsRes, requestsRes] = await Promise.all([
      api.get("/admin/users"), 
      api.get("/admin/pending-seniors"),
      api.get("/admin/pending-alumni"),
      api.get("/withdraw/pending"),
      api.get("/admin/pending-releases"),
      api.get("/support/admin/tickets"),
      api.get("/colleges/admin/requests")
    ]);
    setUsers(usersRes.data?.users || []);
    setPendingSeniors(seniorsRes.data?.seniors || []);
    setPendingAlumni(alumniRes.data?.alumni || []);
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
    description: "Clarior Categorized Requests Command Center & Admin Dashboard"
  });

  const [users, setUsers] = useState([]);
  const [pendingSeniors, setPendingSeniors] = useState([]);
  const [pendingAlumni, setPendingAlumni] = useState([]);
  const [pendingPayouts, setPendingPayouts] = useState([]);
  const [pendingReleases, setPendingReleases] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleStatus, setGoogleStatus] = useState(null);
  const [msg, setMsg] = useState({ type: "", text: "" });

  // Main Section Tab: "requests" | "users"
  const [mainTab, setMainTab] = useState("requests");

  // Requests Category Sub-Tab: "seniors" | "alumni" | "payouts" | "releases" | "colleges" | "tickets"
  const [requestCategory, setRequestCategory] = useState("seniors");

  // Filter/Search states
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("all");
  const [ticketStatusFilter, setTicketStatusFilter] = useState("open");
  const [collegeStatusFilter, setCollegeStatusFilter] = useState("pending");

  // Credit Grant Modal State
  const [creditModal, setCreditModal] = useState({ isOpen: false, user: null, credits: 5 });

  const [confirmConfig, setConfirmConfig] = useState({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "",
    onConfirm: () => {},
    variant: "danger",
  });

  const refresh = async () => {
    await loadAdminData({ 
      setMsg, 
      setLoading, 
      setUsers, 
      setPendingSeniors, 
      setPendingAlumni,
      setPendingPayouts, 
      setPendingReleases,
      setTickets,
      setRequests,
      setGoogleStatus
    });
  };

  useEffect(() => {
    refresh();
  }, []);

  const stats = useMemo(() => {
    const total = users.length;
    const seniors = users.filter((u) => u.role === "senior").length;
    const alumni = users.filter((u) => u.role === "alumni").length;
    const students = users.filter((u) => u.role === "student").length;
    const admins = users.filter((u) => u.role === "admin").length;
    return { total, seniors, alumni, students, admins };
  }, [users]);

  // Senior Verification Handlers
  const approveSenior = async (id) => {
    try { 
      await api.patch(`/admin/verify/${id}`); 
      setMsg({ type: "success", text: "Senior application approved successfully." }); 
      refresh(); 
    } catch (e) { 
      setMsg({ type: "error", text: e?.response?.data?.message || "Approve failed" }); 
    }
  };

  const rejectSenior = (id) => {
    setConfirmConfig({
      isOpen: true,
      title: "Reject Senior Application",
      message: "Are you sure you want to reject and remove this senior application?",
      confirmText: "Reject & Delete",
      variant: "danger",
      onConfirm: async () => {
        try { 
          await api.delete(`/admin/user/${id}`); 
          setMsg({ type: "success", text: "Senior application rejected." }); 
          refresh(); 
        } catch (e) { 
          setMsg({ type: "error", text: e?.response?.data?.message || "Reject failed" }); 
        } finally {
          setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  // Alumni Verification Handlers
  const approveAlumni = async (id) => {
    try {
      await api.patch(`/admin/verify-alumni/${id}`);
      setMsg({ type: "success", text: "Alumni mentor approved successfully." });
      refresh();
    } catch (e) {
      setMsg({ type: "error", text: e?.response?.data?.message || "Failed to approve alumni mentor" });
    }
  };

  const rejectAlumniPrompt = (alumniObj) => {
    const defaultReason = "Corporate credentials or experience details could not be validated.";
    const reason = window.prompt("Reason for rejecting this Alumni application:", defaultReason);
    if (reason === null) return; // cancelled

    setConfirmConfig({
      isOpen: true,
      title: "Reject Alumni Application",
      message: `Confirm rejection for ${alumniObj?.user?.name || "this alumni"}? Reason: "${reason}"`,
      confirmText: "Reject Alumni",
      variant: "danger",
      onConfirm: async () => {
        try {
          await api.patch(`/admin/reject-alumni/${alumniObj._id}`, { reason });
          setMsg({ type: "success", text: "Alumni application rejected and applicant notified." });
          refresh();
        } catch (e) {
          setMsg({ type: "error", text: e?.response?.data?.message || "Failed to reject alumni" });
        } finally {
          setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  // Payout Handlers
  const approvePayout = async (id) => {
    try { 
      await api.patch(`/withdraw/approve/${id}`); 
      setMsg({ type: "success", text: "Payout marked as paid and user notified." }); 
      refresh(); 
    } catch (e) { 
      setMsg({ type: "error", text: e?.response?.data?.message || "Approve payout failed" }); 
    }
  };

  const rejectPayout = (id) => {
    setConfirmConfig({
      isOpen: true,
      title: "Reject Payout Request",
      message: "Are you sure you want to reject this withdrawal request? Reserved funds will be refunded to the user's available balance.",
      confirmText: "Reject Payout",
      variant: "danger",
      onConfirm: async () => {
        try { 
          await api.patch(`/withdraw/reject/${id}`); 
          setMsg({ type: "success", text: "Payout rejected and funds returned." }); 
          refresh(); 
        } catch (e) { 
          setMsg({ type: "error", text: e?.response?.data?.message || "Reject payout failed" }); 
        } finally {
          setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  // Session Release Handlers
  const handleReleaseEarnings = async (id) => {
    try { 
      await api.patch(`/admin/release-earnings/${id}`); 
      setMsg({ type: "success", text: "Earnings released and credited to senior's available balance." }); 
      refresh(); 
    } catch (e) { 
      setMsg({ type: "error", text: e?.response?.data?.message || "Failed to release earnings" }); 
    }
  };

  const handleRejectEarnings = (id) => {
    setConfirmConfig({
      isOpen: true,
      title: "Reject Session Payout",
      message: "Are you sure you want to reject this session payout? This will refund the credit to the student and deduct payout from the senior's pending balance.",
      confirmText: "Reject Payout & Refund Student",
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

  // User Credits Grant
  const handleGrantCredits = async () => {
    if (!creditModal.user) return;
    try {
      await api.post(`/admin/grant-credits/${creditModal.user._id}`, { credits: creditModal.credits });
      setMsg({ type: "success", text: `Granted ${creditModal.credits} credits to ${creditModal.user.name}.` });
      setCreditModal({ isOpen: false, user: null, credits: 5 });
      refresh();
    } catch (e) {
      setMsg({ type: "error", text: e?.response?.data?.message || "Failed to grant credits" });
    }
  };

  // Google OAuth
  const connectGoogle = async () => {
    setGoogleLoading(true);
    try {
      const res = await api.get("/google/auth-url");
      const url = res.data?.url;
      if (!url) return setMsg({ type: "error", text: "Google auth URL missing. Check backend setup." });
      window.open(url, "_blank", "noopener,noreferrer");
      setMsg({ type: "success", text: "Google OAuth opened in new tab. Finish consent then refresh status." });
    } catch (e) { 
      setMsg({ type: "error", text: e?.response?.data?.message || "OAuth failed" }); 
    } finally { 
      setGoogleLoading(false); 
    }
  };

  const formatISTDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Intl.DateTimeFormat('en-IN', { 
      timeZone: 'Asia/Kolkata', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateStr));
  };

  // Count calculations
  const openTicketsCount = tickets.filter(t => t.status === "open").length;
  const pendingCollegesCount = requests.filter(r => r.status === "pending").length;
  const totalPendingRequests = 
    pendingSeniors.length + 
    pendingAlumni.length + 
    pendingPayouts.length + 
    pendingReleases.length + 
    pendingCollegesCount + 
    openTicketsCount;

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchesRole = userRoleFilter === "all" || u.role === userRoleFilter;
      const q = userSearch.toLowerCase().trim();
      const matchesSearch = !q || 
        u.name?.toLowerCase().includes(q) || 
        u.email?.toLowerCase().includes(q) || 
        u.college?.toLowerCase().includes(q);
      return matchesRole && matchesSearch;
    });
  }, [users, userRoleFilter, userSearch]);

  return (
    <AppShell 
      title="Admin Command Center" 
      subtitle="Categorized requests triage, mentor verifications, financial releases, and user governance."
    >
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black uppercase tracking-wider text-primary">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            Live Control
          </span>
          <span className="text-xs text-muted font-bold">
            {totalPendingRequests} total requests pending action
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={refresh} loading={loading} size="sm" className="rounded-xl font-black text-xs">
            Refresh All
          </Button>
        </div>
      </div>

      {msg.text && (
        <div className={`mb-6 p-4 rounded-2xl text-xs font-bold animate-scale-in border flex items-center justify-between ${
          msg.type === "success" 
            ? "bg-success/10 border-success/30 text-success" 
            : "bg-danger/10 border-danger/30 text-danger"
        }`}>
          <span>{msg.text}</span>
          <button onClick={() => setMsg({ type: "", text: "" })} className="text-current hover:opacity-70 text-base font-bold ml-4">×</button>
        </div>
      )}

      {/* Global Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 mb-8">
        {[
          { label: "Total Users", val: stats.total, color: "text-primary", bg: "bg-primary/10", border: "border-primary/20", i: "" },
          { label: "Students", val: stats.students, color: "text-fg", bg: "bg-surface2", border: "border-border", i: "" },
          { label: "Seniors", val: stats.seniors, color: "text-accent", bg: "bg-accent/10", border: "border-accent/20", i: "" },
          { label: "Alumni", val: stats.alumni, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20", i: "" },
          { label: "Pending Actions", val: totalPendingRequests, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20", i: "" },
        ].map(s => (
          <Card key={s.label} className={`p-4 border ${s.border} bg-surface shadow-soft hover:shadow-lift transition-all`}>
            <div className="flex items-center justify-between">
              <span className="text-base">{s.i}</span>
              <span className="text-[9px] font-black uppercase tracking-wider text-muted">{s.label}</span>
            </div>
            <div className={`mt-2 text-2xl font-black ${s.color}`}>{s.val}</div>
          </Card>
        ))}
      </div>

      {/* Main Top Switcher: Requests Hub vs Users & Settings */}
      <div className="flex border-b border-border mb-6">
        <button
          onClick={() => setMainTab("requests")}
          className={`pb-3 px-6 font-black text-xs uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            mainTab === "requests"
              ? "border-primary text-primary"
              : "border-transparent text-muted hover:text-fg hover:border-border"
          }`}
        >
          <span>Categorized Requests Center</span>
          {totalPendingRequests > 0 && (
            <span className="bg-primary text-white text-[9px] px-2 py-0.5 rounded-full font-black">
              {totalPendingRequests}
            </span>
          )}
        </button>

        <button
          onClick={() => setMainTab("users")}
          className={`pb-3 px-6 font-black text-xs uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            mainTab === "users"
              ? "border-primary text-primary"
              : "border-transparent text-muted hover:text-fg hover:border-border"
          }`}
        >
          <span>User Directory & Tools</span>
          <span className="bg-surface2 text-muted text-[9px] px-2 py-0.5 rounded-full font-black">
            {stats.total}
          </span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: CATEGORIZED REQUESTS CENTER */}
      {/* ============================================================== */}
      {mainTab === "requests" && (
        <div className="space-y-6">
          {/* Subcategory Pills Bar */}
          <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-surface2/60 border border-border/60">
            {[
              { id: "seniors", label: "Senior Verifications", count: pendingSeniors.length,  },
              { id: "alumni", label: "Alumni Applications", count: pendingAlumni.length,  },
              { id: "payouts", label: "Payout Requests", count: pendingPayouts.length,  },
              { id: "releases", label: "Earnings Releases", count: pendingReleases.length,  },
              { id: "colleges", label: "College Requests", count: pendingCollegesCount,  },
              { id: "tickets", label: "Support Tickets", count: openTicketsCount,  },
            ].map(cat => {
              const isActive = requestCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setRequestCategory(cat.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                    isActive
                      ? "bg-surface text-primary shadow-soft border border-primary/20"
                      : "text-muted hover:text-fg hover:bg-surface/50"
                  }`}
                >
                  
                  <span>{cat.label}</span>
                  {cat.count > 0 && (
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${
                      isActive ? "bg-primary text-white" : "bg-primary/10 text-primary"
                    }`}>
                      {cat.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* -------------------------------------------------------- */}
          {/* CATEGORY 1: SENIOR VERIFICATIONS */}
          {/* -------------------------------------------------------- */}
          {requestCategory === "seniors" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <div>
                  <h3 className="heading-display text-lg font-black text-fg"> Senior Verification Requests</h3>
                  <p className="text-xs text-muted font-medium">Verify enrolled college seniors applying to mentor junior students.</p>
                </div>
                <span className="bg-primary/10 text-primary text-[10px] font-black px-3 py-1 rounded-full uppercase">
                  {pendingSeniors.length} Pending
                </span>
              </div>

              {pendingSeniors.length === 0 ? (
                <div className="py-16 text-center bg-surface2/30 rounded-3xl border border-dashed border-border text-muted">
                  <div className="text-4xl mb-3"></div>
                  <h4 className="text-base font-black text-fg">No pending senior applications</h4>
                  <p className="text-xs text-muted mt-1 max-w-sm mx-auto">All senior mentor submissions have been verified and processed.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {pendingSeniors.map((s) => (
                    <Card key={s._id} className="p-6 border border-border bg-surface hover:shadow-soft transition-all">
                      <div className="flex flex-col lg:flex-row justify-between gap-6">
                        <div className="flex-1 space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-primary/20 to-accent/20 text-primary flex items-center justify-center text-lg font-black border border-primary/30">
                              {s.name?.[0] || "S"}
                            </div>
                            <div>
                              <div className="text-base font-black text-fg flex items-center gap-2">
                                {s.name}
                                <span className="bg-primary/10 text-primary text-[9px] font-black px-2 py-0.5 rounded-md uppercase">College Senior</span>
                              </div>
                              <div className="text-xs text-muted font-medium mt-0.5">{s.email} • {s.phone || "No Phone"}</div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-surface2/50 p-4 rounded-2xl border border-border/50 text-xs">
                            <div>
                              <div className="text-[9px] font-black text-muted uppercase">College</div>
                              <div className="font-bold text-fg truncate mt-0.5">{s.college || "—"}{s.affiliatedCollege ? ` (${s.affiliatedCollege})` : ""}</div>
                            </div>
                            <div>
                              <div className="text-[9px] font-black text-muted uppercase">Branch / Dept</div>
                              <div className="font-bold text-fg mt-0.5">{s.branch || "—"}</div>
                            </div>
                            <div>
                              <div className="text-[9px] font-black text-muted uppercase">Year / CGPA</div>
                              <div className="font-bold text-fg mt-0.5">{s.year || "—"} / {s.cgpa || "—"}</div>
                            </div>
                            <div>
                              <div className="text-[9px] font-black text-muted uppercase">UPI ID</div>
                              <div className="font-bold text-fg mt-0.5 select-all">{s.upiId || "—"}</div>
                            </div>
                          </div>

                          {s.linkedin && (
                            <a href={s.linkedin} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline">
                              <span> View LinkedIn Profile</span>
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                            </a>
                          )}
                          {s.bio && (
                            <p className="text-xs text-muted leading-relaxed italic bg-surface2/30 p-3 rounded-xl border border-border/30">
                              "{s.bio}"
                            </p>
                          )}
                        </div>

                        <div className="flex flex-row lg:flex-col gap-2.5 min-w-[150px] justify-center shrink-0">
                          <Button onClick={() => approveSenior(s._id)} className="flex-1 rounded-xl font-black text-xs" size="sm">
                             Approve Senior
                          </Button>
                          <Button variant="secondary" onClick={() => rejectSenior(s._id)} className="flex-1 rounded-xl border-danger/25 text-danger hover:bg-danger/10 font-black text-xs" size="sm">
                             Reject & Delete
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* -------------------------------------------------------- */}
          {/* CATEGORY 2: ALUMNI APPLICATIONS */}
          {/* -------------------------------------------------------- */}
          {requestCategory === "alumni" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <div>
                  <h3 className="heading-display text-lg font-black text-fg"> Alumni Mentor Applications</h3>
                  <p className="text-xs text-muted font-medium">Verify working corporate professionals & alumni. Strict corporate email match enforced.</p>
                </div>
                <span className="bg-emerald-500/10 text-emerald-500 text-[10px] font-black px-3 py-1 rounded-full uppercase">
                  {pendingAlumni.length} Pending
                </span>
              </div>

              {pendingAlumni.length === 0 ? (
                <div className="py-16 text-center bg-surface2/30 rounded-3xl border border-dashed border-border text-muted">
                  <div className="text-4xl mb-3"></div>
                  <h4 className="text-base font-black text-fg">No pending alumni applications</h4>
                  <p className="text-xs text-muted mt-1 max-w-sm mx-auto">All alumni mentor applications have been reviewed.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {pendingAlumni.map((a) => (
                    <Card key={a._id} className="p-6 border border-emerald-500/20 bg-surface hover:shadow-soft transition-all">
                      <div className="flex flex-col lg:flex-row justify-between gap-6">
                        <div className="flex-1 space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 text-emerald-500 flex items-center justify-center text-lg font-black border border-emerald-500/30">
                              {a.user?.name?.[0] || "A"}
                            </div>
                            <div>
                              <div className="text-base font-black text-fg flex items-center gap-2">
                                {a.user?.name}
                                <span className="bg-emerald-500/10 text-emerald-500 text-[9px] font-black px-2 py-0.5 rounded-md uppercase border border-emerald-500/20">
                                  {a.currentJobTitle} @ {a.currentCompany}
                                </span>
                              </div>
                              <div className="text-xs text-muted font-medium mt-0.5 flex flex-wrap items-center gap-2">
                                <span>Login Email: {a.user?.email}</span>
                                <span>•</span>
                                <span className="text-emerald-500 font-bold bg-emerald-500/5 px-2 py-0.5 rounded-md border border-emerald-500/20">
                                   Company Email: {a.companyEmail}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-surface2/50 p-4 rounded-2xl border border-border/50 text-xs">
                            <div>
                              <div className="text-[9px] font-black text-muted uppercase">Academic Track</div>
                              <div className="font-bold text-fg mt-0.5 truncate">
                                {a.isCollegeDropout ? "College Dropout" : `${a.college || "College"} (${a.degree || ""})`}
                              </div>
                              {a.specialization && <div className="text-[10px] text-muted">{a.specialization}</div>}
                            </div>
                            <div>
                              <div className="text-[9px] font-black text-muted uppercase">Joining / Exp</div>
                              <div className="font-bold text-fg mt-0.5">
                                {a.joiningDate ? new Date(a.joiningDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : "—"}
                              </div>
                              <div className="text-[10px] text-muted">Weekly Max: {a.weeklySessionsLimit || 5} calls</div>
                            </div>
                            <div>
                              <div className="text-[9px] font-black text-muted uppercase">Price / Platform Fee</div>
                              <div className="font-bold text-fg mt-0.5">
                                ₹{a.sessionPrice} / 20 min
                              </div>
                              <div className="text-[10px] text-success">Net Payout: ₹{Math.round(a.sessionPrice * 0.8)} (20% fee)</div>
                            </div>
                            <div>
                              <div className="text-[9px] font-black text-muted uppercase">UPI Payout ID</div>
                              <div className="font-bold text-fg mt-0.5 select-all">{a.upiId || "—"}</div>
                            </div>
                          </div>

                          {a.linkedin && (
                            <a href={a.linkedin} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline">
                              <span> View LinkedIn Profile</span>
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                            </a>
                          )}
                          {a.bio && (
                            <p className="text-xs text-muted leading-relaxed italic bg-surface2/30 p-3 rounded-xl border border-border/30">
                              "{a.bio}"
                            </p>
                          )}
                        </div>

                        <div className="flex flex-row lg:flex-col gap-2.5 min-w-[150px] justify-center shrink-0">
                          <Button onClick={() => approveAlumni(a._id)} className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-black text-xs" size="sm">
                             Approve Alumni
                          </Button>
                          <Button variant="secondary" onClick={() => rejectAlumniPrompt(a)} className="flex-1 rounded-xl border-danger/25 text-danger hover:bg-danger/10 font-black text-xs" size="sm">
                             Reject Application
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* -------------------------------------------------------- */}
          {/* CATEGORY 3: PAYOUT REQUESTS */}
          {/* -------------------------------------------------------- */}
          {requestCategory === "payouts" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <div>
                  <h3 className="heading-display text-lg font-black text-fg"> Withdrawal Payout Requests</h3>
                  <p className="text-xs text-muted font-medium">Process direct bank transfers to mentors' verified UPI addresses.</p>
                </div>
                <span className="bg-accent/10 text-accent text-[10px] font-black px-3 py-1 rounded-full uppercase">
                  {pendingPayouts.length} Pending
                </span>
              </div>

              {pendingPayouts.length === 0 ? (
                <div className="py-16 text-center bg-surface2/30 rounded-3xl border border-dashed border-border text-muted">
                  <div className="text-4xl mb-3"></div>
                  <h4 className="text-base font-black text-fg">All payouts cleared!</h4>
                  <p className="text-xs text-muted mt-1 max-w-sm mx-auto">No pending withdrawal requests from seniors or alumni.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {pendingPayouts.map((p) => (
                    <Card key={p._id} className="p-6 border border-border bg-surface hover:shadow-soft transition-all">
                      <div className="flex flex-col lg:flex-row justify-between gap-6">
                        <div className="flex-1 space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-2xl bg-accent/20 text-accent flex items-center justify-center text-xl font-black border border-accent/30">
                              ₹
                            </div>
                            <div>
                              <div className="text-base font-black text-fg">{p.senior?.name}</div>
                              <div className="text-xs text-muted font-medium mt-0.5">{p.senior?.email} • {p.senior?.college || "Mentor"}</div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-surface2/50 p-4 rounded-2xl border border-border/50 text-xs">
                            <div>
                              <div className="text-[9px] font-black text-muted uppercase">Requested Amount</div>
                              <div className="text-xl font-black text-fg mt-0.5">₹{p.amount}</div>
                            </div>
                            <div>
                              <div className="text-[9px] font-black text-muted uppercase">Target UPI ID</div>
                              <div className="text-sm font-black text-fg select-all mt-0.5">{p.upiId || p.senior?.upiId || "—"}</div>
                            </div>
                            <div>
                              <div className="text-[9px] font-black text-muted uppercase">Requested On</div>
                              <div className="text-xs font-bold text-muted mt-0.5">{formatISTDate(p.createdAt)}</div>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-row lg:flex-col gap-2.5 min-w-[150px] justify-center shrink-0">
                          <Button onClick={() => approvePayout(p._id)} className="flex-1 rounded-xl bg-accent text-accent-fg hover:bg-accent/90 font-black text-xs" size="sm">
                             Mark Paid
                          </Button>
                          <Button variant="secondary" onClick={() => rejectPayout(p._id)} className="flex-1 rounded-xl border-danger/25 text-danger hover:bg-danger/10 font-black text-xs" size="sm">
                             Reject Payout
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* -------------------------------------------------------- */}
          {/* CATEGORY 4: EARNINGS RELEASES */}
          {/* -------------------------------------------------------- */}
          {requestCategory === "releases" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <div>
                  <h3 className="heading-display text-lg font-black text-fg"> Completed Session Releases</h3>
                  <p className="text-xs text-muted font-medium">Verify completed 1-on-1 sessions and release escrow funds to mentor balance.</p>
                </div>
                <span className="bg-primary/10 text-primary text-[10px] font-black px-3 py-1 rounded-full uppercase">
                  {pendingReleases.length} Pending
                </span>
              </div>

              {pendingReleases.length === 0 ? (
                <div className="py-16 text-center bg-surface2/30 rounded-3xl border border-dashed border-border text-muted">
                  <div className="text-4xl mb-3"></div>
                  <h4 className="text-base font-black text-fg">No pending session releases</h4>
                  <p className="text-xs text-muted mt-1 max-w-sm mx-auto">All completed session payouts have been cleared.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {pendingReleases.map((b) => (
                    <Card key={b._id} className="p-6 border border-border bg-surface hover:shadow-soft transition-all">
                      <div className="flex flex-col lg:flex-row justify-between gap-6">
                        <div className="flex-1 space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-2xl bg-primary/20 text-primary flex items-center justify-center text-lg font-black border border-primary/30">
                              
                            </div>
                            <div>
                              <div className="text-base font-black text-fg">Session with {b.student?.name}</div>
                              <div className="text-xs text-muted font-medium mt-0.5">Mentor: {b.senior?.name} ({b.senior?.email})</div>
                            </div>
                          </div>

                          {b.review ? (
                            <div className="bg-surface2/60 p-4 rounded-2xl border border-border/50 text-xs space-y-1.5">
                              <div className="flex items-center gap-2 font-black text-fg">
                                <span className="text-amber-500 font-black"> {b.review.rating}/5</span>
                                <span className="text-[9px] uppercase tracking-wider text-muted">• Student Review</span>
                              </div>
                              {b.review.comment ? (
                                <p className="text-muted leading-relaxed italic">"{b.review.comment}"</p>
                              ) : (
                                <p className="text-muted/65 italic select-none">No written comment provided.</p>
                              )}
                            </div>
                          ) : (
                            <div className="bg-surface2/30 p-3 rounded-xl text-[10px] text-muted font-black uppercase tracking-wider border border-border/30">
                              Student has not submitted a review yet
                            </div>
                          )}
                        </div>

                        <div className="flex flex-row lg:flex-col gap-2.5 min-w-[150px] justify-center shrink-0">
                          <Button onClick={() => handleReleaseEarnings(b._id)} className="flex-1 rounded-xl font-black text-xs" size="sm">
                             Release Funds
                          </Button>
                          <Button 
                            variant="secondary" 
                            onClick={() => handleRejectEarnings(b._id)} 
                            className="flex-1 rounded-xl border-danger/25 text-danger hover:bg-danger/10 font-black text-xs" 
                            size="sm"
                          >
                             Reject & Refund
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* -------------------------------------------------------- */}
          {/* CATEGORY 5: COLLEGE REQUESTS */}
          {/* -------------------------------------------------------- */}
          {requestCategory === "colleges" && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4 px-1">
                <div>
                  <h3 className="heading-display text-lg font-black text-fg"> College Addition Requests</h3>
                  <p className="text-xs text-muted font-medium">Students and seniors requesting unlisted colleges to be added to Clarior.</p>
                </div>

                <div className="flex items-center gap-2">
                  {["pending", "all"].map(st => (
                    <button
                      key={st}
                      onClick={() => setCollegeStatusFilter(st)}
                      className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                        collegeStatusFilter === st
                          ? "bg-primary text-white"
                          : "bg-surface2 text-muted hover:text-fg"
                      }`}
                    >
                      {st === "pending" ? `Pending (${pendingCollegesCount})` : `All (${requests.length})`}
                    </button>
                  ))}
                </div>
              </div>

              {requests.filter(r => collegeStatusFilter === "all" || r.status === "pending").length === 0 ? (
                <div className="py-16 text-center bg-surface2/30 rounded-3xl border border-dashed border-border text-muted">
                  <div className="text-4xl mb-3"></div>
                  <h4 className="text-base font-black text-fg">No college requests found</h4>
                  <p className="text-xs text-muted mt-1 max-w-sm mx-auto">All submitted college requests have been resolved.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {requests
                    .filter(r => collegeStatusFilter === "all" || r.status === "pending")
                    .map((r) => (
                      <Card key={r._id} className="p-6 border border-border bg-surface hover:shadow-soft transition-all">
                        <div className="flex flex-col lg:flex-row justify-between gap-6">
                          <div className="flex-1 space-y-4">
                            <div className="flex items-center gap-3">
                              <div className="h-12 w-12 rounded-2xl bg-accent/15 text-accent flex items-center justify-center text-xl font-black border border-accent/20">
                                
                              </div>
                              <div>
                                <div className="text-base font-black text-fg flex items-center gap-2">
                                  {r.name}
                                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase border ${
                                    r.status === "approved" ? "bg-success/10 text-success border-success/20" :
                                    r.status === "rejected" ? "bg-danger/10 text-danger border-danger/20" :
                                    "bg-warning/10 text-warning border-warning/20"
                                  }`}>
                                    {r.status}
                                  </span>
                                </div>
                                <div className="text-xs text-muted font-medium mt-0.5">
                                  Type: {r.type} {r.established ? `• Est. ${r.established}` : ""}
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-surface2/50 p-4 rounded-2xl border border-border/50 text-xs">
                              <div>
                                <div className="text-[9px] font-black text-muted uppercase">Location</div>
                                <div className="font-bold text-fg mt-0.5">{r.city}, {r.state}</div>
                              </div>
                              <div>
                                <div className="text-[9px] font-black text-muted uppercase">Requested By</div>
                                <div className="font-bold text-fg select-all mt-0.5">{r.requesterEmail || "Guest / Anonymous"}</div>
                              </div>
                              <div>
                                <div className="text-[9px] font-black text-muted uppercase">Requested On</div>
                                <div className="font-bold text-muted mt-0.5">{formatISTDate(r.createdAt)}</div>
                              </div>
                            </div>
                          </div>

                          {r.status === "pending" && (
                            <div className="flex flex-row lg:flex-col gap-2.5 min-w-[150px] justify-center shrink-0">
                              <Button onClick={() => handleApproveRequest(r._id)} className="flex-1 rounded-xl font-black text-xs" size="sm">
                                 Approve Request
                              </Button>
                              <Button variant="secondary" onClick={() => handleRejectRequest(r._id)} className="flex-1 rounded-xl border-danger/25 text-danger hover:bg-danger/10 font-black text-xs" size="sm">
                                 Reject
                              </Button>
                            </div>
                          )}
                        </div>
                      </Card>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* -------------------------------------------------------- */}
          {/* CATEGORY 6: SUPPORT TICKETS */}
          {/* -------------------------------------------------------- */}
          {requestCategory === "tickets" && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4 px-1">
                <div>
                  <h3 className="heading-display text-lg font-black text-fg"> Support Tickets Queue</h3>
                  <p className="text-xs text-muted font-medium">User queries, dispute tickets, and platform support inquiries.</p>
                </div>

                <div className="flex items-center gap-2">
                  {["open", "all"].map(st => (
                    <button
                      key={st}
                      onClick={() => setTicketStatusFilter(st)}
                      className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                        ticketStatusFilter === st
                          ? "bg-primary text-white"
                          : "bg-surface2 text-muted hover:text-fg"
                      }`}
                    >
                      {st === "open" ? `Open (${openTicketsCount})` : `All (${tickets.length})`}
                    </button>
                  ))}
                </div>
              </div>

              {tickets.filter(t => ticketStatusFilter === "all" || t.status === "open").length === 0 ? (
                <div className="py-16 text-center bg-surface2/30 rounded-3xl border border-dashed border-border text-muted">
                  <div className="text-4xl mb-3"></div>
                  <h4 className="text-base font-black text-fg">Support queue completely clear!</h4>
                  <p className="text-xs text-muted mt-1 max-w-sm mx-auto">No pending tickets requiring admin attention.</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {tickets
                    .filter(t => ticketStatusFilter === "all" || t.status === "open")
                    .map((t) => (
                      <Card key={t._id} className="p-6 border border-border bg-surface hover:shadow-soft transition-all flex flex-col justify-between">
                        <div className="space-y-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="text-base font-black text-fg">{t.name}</div>
                              <div className="text-xs text-muted font-medium mt-0.5">{t.email}</div>
                            </div>
                            <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                              {t.category || "General"}
                            </span>
                          </div>

                          <div className="bg-surface2/60 p-4 rounded-2xl border border-border/40 text-xs font-medium leading-relaxed text-fg italic min-h-[80px]">
                            "{t.message}"
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 mt-4 border-t border-border/40 text-[10px] text-muted font-bold">
                          <span>{formatISTDate(t.createdAt)}</span>
                          {t.status === "open" ? (
                            <button
                              onClick={() => handleResolveTicket(t._id, "resolved")}
                              className="text-success font-black hover:underline uppercase tracking-wider cursor-pointer flex items-center gap-1"
                            >
                               Mark Resolved
                            </button>
                          ) : (
                            <span className="text-muted font-black uppercase"> Resolved</span>
                          )}
                        </div>
                      </Card>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: USER DIRECTORY & PLATFORM SETTINGS */}
      {/* ============================================================== */}
      {mainTab === "users" && (
        <div className="space-y-6">
          {/* Google Sync & System Card */}
          <Card className="p-6 border border-border bg-surface">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h4 className="text-base font-black text-fg flex items-center gap-2">
                  <span></span> Google Calendar Integration
                </h4>
                <p className="text-xs text-muted font-medium mt-1">
                  Connect Clarior system Google account to generate Google Meet links automatically for bookings.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                  googleStatus?.connected 
                    ? "bg-success/10 text-success border-success/20" 
                    : "bg-warning/10 text-warning border-warning/20"
                }`}>
                  {googleStatus?.connected ? "Connected" : "Not Connected"}
                </span>
                <Button 
                  size="sm" 
                  variant={googleStatus?.connected ? "secondary" : "primary"} 
                  onClick={connectGoogle} 
                  loading={googleLoading}
                  className="rounded-xl font-black text-xs"
                >
                  {googleStatus?.connected ? "Reconnect Google" : "Connect Google"}
                </Button>
              </div>
            </div>
          </Card>

          {/* User Search & Filters */}
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
            <div className="relative flex-1 max-w-md">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"></span>
              <input
                type="text"
                placeholder="Search user by name, email, or college..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-surface text-xs font-bold text-fg outline-none focus:border-primary"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto">
              {["all", "student", "senior", "alumni", "admin"].map(role => (
                <button
                  key={role}
                  onClick={() => setUserRoleFilter(role)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                    userRoleFilter === role
                      ? "bg-primary text-white"
                      : "bg-surface2 text-muted hover:text-fg"
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface2 text-[10px] font-black uppercase tracking-wider text-muted border-b border-border">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">College / Company</th>
                  <th className="p-4">Credits / Bal</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filteredUsers.map(u => (
                  <tr key={u._id} className="hover:bg-surface2/40 transition-colors">
                    <td className="p-4">
                      <div className="font-black text-fg">{u.name}</div>
                      <div className="text-[10px] text-muted">{u.email}</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                        u.role === "admin" ? "bg-muted/10 text-muted border-muted/20" :
                        u.role === "senior" ? "bg-accent/10 text-accent border-accent/20" :
                        u.role === "alumni" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                        "bg-primary/10 text-primary border-primary/20"
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-fg truncate max-w-[200px]">{u.college || "—"}</div>
                    </td>
                    <td className="p-4 font-bold text-fg">
                      {u.role === "student" ? `${u.callCredits ?? 0} Credits` : `₹${u.availableBalance ?? 0}`}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {u.role === "student" && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => setCreditModal({ isOpen: true, user: u, credits: 5 })}
                            className="rounded-lg text-[10px] font-black uppercase tracking-wider px-2.5 py-1"
                          >
                            + Credits
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            setConfirmConfig({
                              isOpen: true,
                              title: "Delete User",
                              message: `Are you sure you want to permanently delete user ${u.name}? All bookings and slots will be cancelled.`,
                              confirmText: "Delete User",
                              variant: "danger",
                              onConfirm: async () => {
                                try {
                                  await api.delete(`/admin/user/${u._id}`);
                                  setMsg({ type: "success", text: "User permanently deleted." });
                                  refresh();
                                } catch (e) {
                                  setMsg({ type: "error", text: e?.response?.data?.message || "Delete failed" });
                                } finally {
                                  setConfirmConfig(prev => ({ ...prev, isOpen: false }));
                                }
                              }
                            });
                          }}
                          className="rounded-lg text-[10px] font-black uppercase tracking-wider px-2.5 py-1 text-danger border-danger/20 hover:bg-danger/10"
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Grant Credits Modal */}
      {creditModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="w-full max-w-sm p-6 space-y-4 animate-scale-in">
            <h4 className="text-base font-black text-fg">Grant Call Credits</h4>
            <p className="text-xs text-muted font-medium">
              Add call credits directly to <strong>{creditModal.user?.name}</strong>'s wallet for booking sessions.
            </p>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-muted">Number of Credits</label>
              <input
                type="number"
                min="1"
                max="50"
                value={creditModal.credits}
                onChange={(e) => setCreditModal(prev => ({ ...prev, credits: Number(e.target.value) }))}
                className="w-full p-3 rounded-xl border border-border bg-surface text-sm font-bold text-fg outline-none focus:border-primary"
              />
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button variant="secondary" onClick={() => setCreditModal({ isOpen: false, user: null, credits: 5 })} size="sm" className="rounded-xl">
                Cancel
              </Button>
              <Button onClick={handleGrantCredits} size="sm" className="rounded-xl font-black">
                Confirm Grant
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Confirmation Modal */}
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
