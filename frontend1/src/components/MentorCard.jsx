import { useNavigate } from "react-router-dom";
import Button from "./ui/Button";

function getAvatarGradient(name = "") {
  const gradients = [
    "from-violet-500 to-indigo-500",
    "from-rose-500 to-pink-500",
    "from-teal-500 to-emerald-500",
    "from-amber-500 to-orange-500",
    "from-blue-500 to-cyan-500",
    "from-fuchsia-500 to-purple-500",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return gradients[Math.abs(hash) % gradients.length];
}

function StarRating({ rating }) {
  const num = typeof rating === "number" ? rating : null;
  if (!num) return <span className="text-xs font-semibold text-muted bg-surface2 px-2 py-0.5 rounded-full border border-border">New</span>;
  
  const roundedRating = Math.round(num);
  return (
    <div className="flex flex-col items-end gap-0.5">
      <div className="flex gap-0.5 text-warning">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg 
            key={star} 
            width="10" 
            height="10" 
            fill={star <= roundedRating ? "#f59e0b" : "rgba(var(--muted), 0.3)"} 
            viewBox="0 0 24 24"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        ))}
      </div>
      <span className="text-[10px] font-black text-fg leading-none mt-0.5">
        {num.toFixed(1)} Rating
      </span>
    </div>
  );
}

function ArrowRightIcon() {
  return (
    <svg className="h-4 w-4 transition-transform group-hover/cta:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-6-6 6 6-6 6" />
    </svg>
  );
}

function MentorCard({ mentor }) {
  const navigate = useNavigate();
  const gradient = getAvatarGradient(mentor.name);
  const sessions = mentor.sessionsCompleted || 0;
  const initials = mentor.name?.trim().split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "?";

  const domainColor = {
    Engineering: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-400/10 dark:text-blue-200 dark:border-blue-300/20",
    Medical:     "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-400/10 dark:text-rose-200 dark:border-rose-300/20",
    Commerce:    "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-400/10 dark:text-amber-200 dark:border-amber-300/20",
    Arts:        "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-400/10 dark:text-violet-200 dark:border-violet-300/20",
    Law:         "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-400/10 dark:text-teal-200 dark:border-teal-300/20",
  };
  const tagClass = domainColor[mentor.domain] || "bg-surface2 text-muted border-border";

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/profile/${mentor._id}`)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          navigate(`/profile/${mentor._id}`);
        }
      }}
      className={`group relative rounded-[32px] border bg-surface shadow-card hover:shadow-2xl hover:-translate-y-2 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-all duration-300 cursor-pointer overflow-hidden ${
        mentor.isVerified 
          ? "border-primary/30 bg-gradient-to-br from-surface to-primary/2 hover:border-primary" 
          : "border-border hover:border-primary/40"
      }`}
    >
      {/* Top accent stripe */}
      <div className={`h-1.5 w-full bg-gradient-to-r ${mentor.isVerified ? "from-primary via-accent to-primary" : gradient}`} />

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-gradient-to-br from-primary/15 via-accent/15 to-primary/10 text-sm font-bold text-primary shadow-sm">
              {initials}
            </div>
            <div>
              <h3 className="text-base font-bold text-fg group-hover:text-primary transition-colors leading-tight">
                {mentor.name}
              </h3>
              <p className="text-xs text-muted mt-0.5 leading-4">
                {mentor.college || "Top College"}
                {mentor.branch ? ` · ${mentor.branch}` : ""}
              </p>
            </div>
          </div>
          <StarRating rating={mentor.rating} />
        </div>

        {/* Tags */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {mentor.isVerified && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-success/10 border border-success/25 text-success text-xs font-semibold">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Verified
            </span>
          )}
          {mentor.activeSlotsCount === 0 ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-danger/10 border border-danger/25 text-danger text-xs font-semibold">
              No Slots Available
            </span>
          ) : typeof mentor.activeSlotsCount === "number" ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-semibold">
              {mentor.activeSlotsCount} slot{mentor.activeSlotsCount !== 1 ? 's' : ''} available
            </span>
          ) : null}
          {mentor.domain && mentor.domain !== "Other" && (
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${tagClass}`}>
              {mentor.domain}
            </span>
          )}
          {mentor.year && (
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-surface2 border border-border text-muted">
              {mentor.year}{['th','st','nd','rd'][mentor.year <= 3 && mentor.year !== 0 ? mentor.year : 0] || 'th'} year
            </span>
          )}
        </div>

        {/* Bio */}
        <p className="mt-3 text-sm text-muted line-clamp-2 leading-6 min-h-[48px]">
          {mentor.bio || "Experienced senior ready to guide you through your academic journey with personalized advice and real-world insights."}
        </p>

        {/* Stats row */}
        <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3">
          <div className="flex items-center gap-3 text-xs text-muted">
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {sessions} sessions
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              20 min
            </span>
          </div>
          <span className="text-xs font-black text-primary bg-primary/10 border border-primary/20 rounded-full px-3 py-1 shadow-sm">
            ₹69 / session
          </span>
        </div>

        {/* CTA */}
        <div className="mt-6">
          <Button
            onClick={(e) => { e.stopPropagation(); navigate(`/profile/${mentor._id}`); }}
            className="w-full rounded-2xl font-bold text-sm py-3.5"
          >
            View Profile
            <ArrowRightIcon />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default MentorCard;
