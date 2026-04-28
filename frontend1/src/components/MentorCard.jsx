import { useNavigate } from "react-router-dom";

function MentorCard({ mentor }) {
  const navigate = useNavigate();
  const rating = typeof mentor.rating === "number" ? mentor.rating.toFixed(1) : "New";
  const sessionsCompleted = mentor.sessionsCompleted || 0;

  return (
    <div className="p-6 border border-border rounded-2xl bg-surface shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-xl font-semibold tracking-tight group-hover:text-primary transition-colors">
              {mentor.name}
            </h3>
            {mentor.isVerified && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-surface2 border border-success text-success text-xs font-medium">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Verified
              </span>
            )}
          </div>
          <p className="text-muted text-sm">
            {mentor.college || "Top College"} • {mentor.branch || "Engineering"}
          </p>
        </div>

        <div className="text-right bg-surface2 border border-border rounded-xl px-3 py-2">
          <div className="text-xs text-muted">Rating</div>
          <div className="font-semibold text-fg flex items-center gap-1">
            {rating}
            <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
        </div>
      </div>

      <p className="text-muted mt-4 line-clamp-3 min-h-[72px] leading-relaxed">
        {mentor.bio || "Experienced senior ready to guide you through your academic journey with personalized advice and real-world insights."}
      </p>

      <div className="mt-4 flex items-center justify-between text-xs text-muted">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {sessionsCompleted} sessions
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            25 min calls
          </span>
        </div>
        <div className="text-primary font-medium">
          ₹{import.meta.env.VITE_PAYOUT_AMOUNT || 52}/session
        </div>
      </div>

      <button
        onClick={() => navigate(`/profile/${mentor._id}`)}
        className="mt-5 w-full bg-primary hover:opacity-95 text-primaryFg py-3 rounded-xl font-medium transition-all duration-200 hover:shadow-md"
      >
        View Profile & Book
      </button>
    </div>
  );
}

export default MentorCard;