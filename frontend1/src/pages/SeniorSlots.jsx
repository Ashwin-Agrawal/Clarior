import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import AppShell from "../components/AppShell";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

function parseSlotDateTime(slotDate, slotTime) {
  if (!slotDate || !slotTime) return null;
  const [h, m] = String(slotTime).split(":").map(Number);
  if (!Number.isInteger(h) || !Number.isInteger(m)) return null;
  const date = new Date(slotDate);
  date.setHours(h, m, 0, 0);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatTimeLabel(value) {
  if (!value) return "";
  const [h, m] = String(value).split(":").map(Number);
  if (!Number.isInteger(h) || !Number.isInteger(m)) return value;
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function SeniorSlots() {
  const { user } = useAuth();
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [mySlots, setMySlots] = useState([]);
  const [msg, setMsg] = useState("");
  const [openSlotId, setOpenSlotId] = useState(null);

  const load = async () => {
    setMsg("");
    try {
      const res = await api.get(`/slots/senior/${user?._id}`);
      setMySlots(res.data.slots || []);
    } catch (e) {
      setMsg(e?.response?.data?.message || "Failed to load slots");
    }
  };

  useEffect(() => {
    if (user?._id) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id]);

  const create = async () => {
    setMsg("");
    try {
      if (!date || !time) {
        setMsg("Please select date and time");
        return;
      }

      const slotDateTime = parseSlotDateTime(date, time);
      if (!slotDateTime) {
        setMsg("Please select a valid date and time");
        return;
      }

      if (slotDateTime.getTime() <= Date.now()) {
        setMsg("Past slot selection is not allowed");
        return;
      }
      await api.post("/slots", { date, time });
      setDate("");
      setTime("");
      setMsg("Slot created ✅");
      load();
    } catch (e) {
      setMsg(e?.response?.data?.message || "Failed to create slot");
    }
  };

  return (
    <AppShell
      title="Availability"
      subtitle="Create clean 25-minute slots for students to book."
    >
      <Card className="p-5">
        <div className="grid gap-4 md:grid-cols-3 md:items-end">
          <Input
            label="Date"
            type="date"
            min={new Date().toISOString().split("T")[0]}
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <Input
            label="Time"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            hint="Only future times are allowed."
          />
          <Button onClick={create}>Create slot</Button>
        </div>

        {msg && (
          <div className="mt-4 rounded-2xl border border-border bg-surface2 px-4 py-3 text-sm text-fg">
            {msg}
          </div>
        )}
      </Card>

      <div className="mt-6 flex items-center justify-between gap-3">
        <div>
          <div className="text-lg font-bold">My slots</div>
          <div className="text-sm text-muted">
            Click Open on any slot to view full status details.
          </div>
        </div>
        <Button variant="secondary" onClick={load}>
          Refresh
        </Button>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {mySlots.map((s) => {
          const slotDateTime = parseSlotDateTime(s.date, s.time);
          const isPast = slotDateTime ? slotDateTime.getTime() < Date.now() : false;
          const status = s.isBooked ? "Booked" : isPast ? "Past" : "Open";
          const isOpenCard = openSlotId === s._id;

          return (
            <Card key={s._id} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-muted">Slot</div>
                  <div className="mt-1 text-lg font-bold">
                    {new Date(s.date).toLocaleDateString()} • {formatTimeLabel(s.time)}
                  </div>
                </div>
                <Button
                  variant={isOpenCard ? "secondary" : "primary"}
                  onClick={() => setOpenSlotId(isOpenCard ? null : s._id)}
                >
                  {isOpenCard ? "Close" : "Open"}
                </Button>
              </div>

              <div className="mt-3 text-sm text-muted">
                Status:{" "}
                <span className="font-semibold text-fg">{status}</span>
              </div>

              {isOpenCard && (
                <div className="mt-3 rounded-xl border border-border bg-surface2 p-3 text-sm">
                  <div>
                    <span className="text-muted">Booked:</span>{" "}
                    <span className="font-semibold text-fg">{s.isBooked ? "Yes" : "No"}</span>
                  </div>
                  <div className="mt-1">
                    <span className="text-muted">Past:</span>{" "}
                    <span className="font-semibold text-fg">{isPast ? "Yes" : "No"}</span>
                  </div>
                  <div className="mt-1">
                    <span className="text-muted">Open status:</span>{" "}
                    <span className="font-semibold text-fg">{status === "Open" ? "Active" : "Not active"}</span>
                  </div>
                </div>
              )}
            </Card>
          );
        })}

        {mySlots.length === 0 && (
          <Card className="p-6">
            <div className="text-lg font-bold">No slots yet</div>
            <div className="mt-2 text-sm text-muted">
              Add your first slot above. Students will be able to book it immediately.
            </div>
          </Card>
        )}
      </div>
    </AppShell>
  );
}

export default SeniorSlots;

