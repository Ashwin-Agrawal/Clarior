import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Skeleton from "../components/ui/Skeleton";
import Footer from "../components/Footer";

function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [mentor, setMentor] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bookingMsg, setBookingMsg] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError("");
        setLoading(true);
        const userRes = await api.get("/users/seniors");
        const selected = userRes.data.seniors.find(
          (u) => u._id === id
        );
        setMentor(selected);

        const slotRes = await api.get(`/slots/senior/${id}`);
        setSlots(slotRes.data.slots || []);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load senior");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // 🔥 BOOKING
  const handleBooking = async (slotId) => {
    try {
      setBookingMsg("");
      if (!user) {
        return navigate("/login");
      }

      if (user.callCredits === 0) {
        return navigate("/buy-credits");
      }

      await api.post("/bookings", { slotId });

      setBookingMsg("Booking confirmed. Open Sessions to start when it begins.");
    } catch (err) {
      setBookingMsg(err?.response?.data?.message || "Booking failed");
    }
  };

  return (
    <>
      <Navbar />

      <div className="px-6 pt-10 pb-14 max-w-5xl mx-auto">
        {loading && (
          <div className="grid gap-4">
            <Skeleton className="h-40" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
        )}
        {!loading && error && (
          <div className="text-sm text-danger bg-surface2 border border-danger rounded-xl p-3">
            {error}
          </div>
        )}

        {!loading && mentor && (
          <Card className="p-7 mb-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center rounded-full bg-surface2 border border-border text-primary px-3 py-1 text-xs font-semibold mb-3">
                  Senior profile
                </div>
                <div className="mb-3">
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                      mentor.isVerified
                        ? "border border-success bg-surface2 text-success"
                        : "border border-amber-200 bg-amber-50 text-amber-700"
                    }`}
                  >
                    Verification: {mentor.isVerified ? "Verified" : "Pending"}
                  </span>
                </div>
                <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">{mentor.name}</h2>
                <p className="text-muted mt-2">
                  {mentor.college || "Top College"}
                </p>
              </div>

              <div className="text-right">
                <div className="text-xs text-muted">Rating</div>
                <div className="text-2xl font-bold">
                  {typeof mentor.rating === "number" ? mentor.rating.toFixed(1) : "New"}
                </div>
                <div className="text-xs text-muted">
                  {mentor.numReviews || 0} reviews
                </div>
              </div>
            </div>

            <p className="mt-5 text-fg leading-relaxed">
              {mentor.bio || "Experienced senior. Book a slot for honest, experience-based guidance."}
            </p>

            <div className="mt-5 grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="rounded-xl border border-border bg-surface2 p-3">
                <div className="text-xs text-muted">Session length</div>
                <div className="text-sm font-semibold mt-1">25 minutes</div>
              </div>
              <div className="rounded-xl border border-border bg-surface2 p-3">
                <div className="text-xs text-muted">Format</div>
                <div className="text-sm font-semibold mt-1">1:1 live call</div>
              </div>
              <div className="rounded-xl border border-border bg-surface2 p-3 col-span-2 md:col-span-1">
                <div className="text-xs text-muted">Best for</div>
                <div className="text-sm font-semibold mt-1">College + career guidance</div>
              </div>
            </div>

            {bookingMsg && (
              <div className="mt-5 text-sm text-fg border border-border rounded-xl bg-surface2 p-3">
                {bookingMsg}
              </div>
            )}
          </Card>
        )}

        {!loading && mentor && (
          <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
            <div>
              <h3 className="text-2xl font-extrabold tracking-tight">
                Available slots
              </h3>
              <p className="text-sm text-muted mt-1">
                Pick a time that works. You’ll manage start/confirm from Sessions.
              </p>
            </div>
            <Button
              variant="secondary"
              onClick={() => {
                if (!user) return navigate("/login");
                if (user.callCredits === 0) return navigate("/buy-credits");
              }}
            >
              Check credits
            </Button>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-4">
          {slots.map((slot) => (
            <Card
              key={slot._id}
              className="p-5 flex justify-between items-center"
            >
              <div>
                <div className="text-xs font-semibold text-muted">Slot</div>
                <div className="mt-1 font-semibold">
                  {new Date(slot.date).toLocaleDateString()} • {slot.time}
                </div>
              </div>

              <Button onClick={() => handleBooking(slot._id)}>
                Book
              </Button>
            </Card>
          ))}

          {!loading && mentor && slots.length === 0 && (
            <Card className="p-6">
              <div className="text-lg font-bold">No open slots</div>
              <div className="text-sm text-muted mt-2">
                This senior has no available times right now. Try again later or explore other seniors.
              </div>
            </Card>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Profile;