import { useEffect, useMemo, useState } from "react";
import AppShell from "../components/AppShell";
import api from "../services/api";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleStatus, setGoogleStatus] = useState(null);
  const [msg, setMsg] = useState("");

  const loadGoogleStatus = async () => {
    try {
      const res = await api.get("/google/status");
      setGoogleStatus(res.data || null);
    } catch (e) {
      // Don't block admin page if Google status fails
      setGoogleStatus({ connected: false, error: true });
    }
  };

  const refresh = async () => {
    setMsg("");
    setLoading(true);
    try {
      const [usersRes, pendingRes] = await Promise.all([
        api.get("/admin/users"),
        api.get("/admin/pending-seniors"),
      ]);
      setUsers(usersRes.data?.users || []);
      setPending(pendingRes.data?.seniors || []);
      await loadGoogleStatus();
    } catch (e) {
      setMsg(e?.response?.data?.message || "Failed to load admin data");
    } finally {
      setLoading(false);
    }
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
    setMsg("");
    try {
      await api.patch(`/admin/verify/${id}`);
      setMsg("Senior approved.");
      refresh();
    } catch (e) {
      setMsg(e?.response?.data?.message || "Approve failed");
    }
  };

  const reject = async (id) => {
    setMsg("");
    try {
      await api.delete(`/admin/user/${id}`);
      setMsg("User deleted.");
      refresh();
    } catch (e) {
      setMsg(e?.response?.data?.message || "Reject failed");
    }
  };

  const connectGoogle = async () => {
    setMsg("");
    setGoogleLoading(true);
    try {
      const res = await api.get("/google/auth-url");
      const url = res.data?.url;
      if (!url) {
        setMsg("Google auth URL missing. Check backend Google env setup.");
        return;
      }
      // Open OAuth consent in new tab/window
      window.open(url, "_blank", "noopener,noreferrer");
      setMsg("Google OAuth opened. Finish consent, then click Refresh.");
    } catch (e) {
      setMsg(e?.response?.data?.message || "Failed to start Google OAuth");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <AppShell title="Admin" subtitle="Verify seniors and manage the platform.">
      <div className="flex justify-end">
        <Button variant="secondary" onClick={refresh} disabled={loading}>
          {loading ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {msg && (
        <div className="mt-4 rounded-2xl border border-border bg-surface2 px-4 py-3 text-sm text-fg">
          {msg}
        </div>
      )}

      <div className="mt-6 grid gap-4 md:grid-cols-4">
        <Card className="p-5">
          <div className="text-xs font-semibold text-muted">Total users</div>
          <div className="mt-2 text-2xl font-extrabold">{stats.total}</div>
        </Card>
        <Card className="p-5">
          <div className="text-xs font-semibold text-muted">Students</div>
          <div className="mt-2 text-2xl font-extrabold">{stats.students}</div>
        </Card>
        <Card className="p-5">
          <div className="text-xs font-semibold text-muted">Seniors</div>
          <div className="mt-2 text-2xl font-extrabold">{stats.seniors}</div>
        </Card>
        <Card className="p-5">
          <div className="text-xs font-semibold text-muted">Admins</div>
          <div className="mt-2 text-2xl font-extrabold">{stats.admins}</div>
        </Card>
      </div>

      <div className="mt-6">
        <Card className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-lg font-extrabold tracking-tight">
                Google Meet (platform account)
              </div>
              <div className="text-sm text-muted mt-1">
                Connect once so the backend can generate Meet links automatically for future bookings.
              </div>
              <div className="mt-2 text-sm">
                Status:{" "}
                <span
                  className={
                    googleStatus?.connected
                      ? "font-semibold text-emerald-400"
                      : "font-semibold text-amber-400"
                  }
                >
                  {googleStatus?.connected ? "Connected" : "Not connected"}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2 min-w-[180px]">
              <Button onClick={connectGoogle} disabled={googleLoading}>
                {googleLoading ? "Opening..." : "Connect Google"}
              </Button>
              <Button
                variant="secondary"
                onClick={loadGoogleStatus}
                disabled={googleLoading || loading}
              >
                Refresh status
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-8">
        <div className="text-xl font-extrabold tracking-tight">Pending seniors</div>
        <div className="text-sm text-muted mt-1">
          Approve to verify and unlock sessions. Reject deletes the user.
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {pending.map((s) => (
            <Card key={s._id} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-lg font-bold">{s.name}</div>
                  <div className="text-sm text-muted mt-1">
                    {s.college || "—"} • {s.domain || "—"} • {s.branch || "—"}
                  </div>
                  <div className="text-xs text-muted mt-1">
                    Email: {s.email || "—"}
                  </div>
                  <div className="text-xs text-muted mt-1">
                    Phone: {s.phone || "—"}
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-xl border border-border bg-surface2 px-3 py-2">
                      <div className="text-xs font-semibold text-muted">Year</div>
                      <div className="mt-0.5 font-semibold">
                        {typeof s.year === "number" ? s.year : "—"}
                      </div>
                    </div>
                    <div className="rounded-xl border border-border bg-surface2 px-3 py-2">
                      <div className="text-xs font-semibold text-muted">CGPA</div>
                      <div className="mt-0.5 font-semibold">
                        {typeof s.cgpa === "number" ? s.cgpa : "—"}
                      </div>
                    </div>
                  </div>

                  {(s.bio || s.linkedin || s.upiId) && (
                    <div className="mt-3 space-y-2 text-sm">
                      {s.bio && (
                        <div>
                          <div className="text-xs font-semibold text-muted">Bio</div>
                          <div className="mt-1 text-fg/90 whitespace-pre-wrap">
                            {s.bio}
                          </div>
                        </div>
                      )}

                      {s.linkedin && (
                        <div>
                          <div className="text-xs font-semibold text-muted">LinkedIn</div>
                          <a
                            href={s.linkedin}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-1 inline-block text-primary underline underline-offset-4 break-all"
                          >
                            {s.linkedin}
                          </a>
                        </div>
                      )}

                      {s.upiId && (
                        <div>
                          <div className="text-xs font-semibold text-muted">UPI</div>
                          <div className="mt-1 font-semibold">{s.upiId}</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 min-w-[140px]">
                  <Button onClick={() => approve(s._id)}>Approve</Button>
                  <Button variant="secondary" onClick={() => reject(s._id)}>
                    Reject
                  </Button>
                </div>
              </div>
            </Card>
          ))}

          {!loading && pending.length === 0 && (
            <Card className="p-6">
              <div className="text-lg font-bold">No pending seniors</div>
              <div className="text-sm text-muted mt-2">
                You’re all caught up.
              </div>
            </Card>
          )}
        </div>
      </div>
    </AppShell>
  );
}

export default AdminDashboard;

