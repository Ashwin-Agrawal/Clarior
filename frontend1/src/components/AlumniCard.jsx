import { useNavigate } from "react-router-dom";

function BriefcaseIcon({ className = "h-4 w-4" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.694m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  );
}

function AcademicIcon({ className = "h-4 w-4" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.9c2.783 0 5.437-.72 7.731-2.006a60.438 60.438 0 0 0-.49-6.347m-15.482 0a48.47 48.47 0 0 1 7.74-2.006m0 0a48.47 48.47 0 0 1 7.74 2.006M4.26 10.147l7.74-2.006m0 0v-5.61m0 5.61 7.74 2.006M12 2.525l7.74 2.006m0 0-7.74 2.006m0 0L4.26 4.531 12 2.525Z" />
    </svg>
  );
}

function VerifiedCheckIcon({ className = "h-4 w-4" }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  );
}

function StarIcon({ className = "h-3.5 w-3.5" }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

function ArrowUpRightIcon({ className = "h-4 w-4" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25" />
    </svg>
  );
}

function formatExperience(joiningDate) {
  if (!joiningDate) return null;
  const join = new Date(joiningDate);
  const now = new Date();
  if (isNaN(join.getTime())) return null;
  const diffMonths = (now.getFullYear() - join.getFullYear()) * 12 + (now.getMonth() - join.getMonth());
  if (diffMonths <= 0) return "Recent Join";
  const years = Math.floor(diffMonths / 12);
  const remMonths = diffMonths % 12;
  if (years === 0) return `${remMonths} mo${remMonths > 1 ? "s" : ""} exp`;
  if (remMonths === 0) return `${years}+ yrs exp`;
  return `${years}.${Math.min(remMonths, 9)} yrs exp`;
}

export default function AlumniCard({ alumni, index = 0 }) {
  const navigate = useNavigate();
  const user = alumni.user || {};
  const userId = user._id || alumni._id;

  const initials = user.name
    ? user.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
    : "AL";

  const expText = formatExperience(alumni.joiningDate);
  const price = alumni.sessionPrice || 250;
  const ratingVal = user.rating || alumni.rating || 5.0;
  const reviewCount = user.numReviews || alumni.numReviews || 0;

  const handleCardClick = () => {
    navigate(`/profile/${userId}`);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`View mentor profile for ${user.name || "Alumni Mentor"}`}
      onClick={handleCardClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleCardClick();
        }
      }}
      className="bg-surface border border-border/80 rounded-[28px] p-6 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-card hover:border-primary/30 group cursor-pointer flex flex-col justify-between h-full animate-fade-up relative overflow-hidden"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Top Ambient Glow */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-36 h-36 bg-primary/5 rounded-full blur-2xl pointer-events-none group-hover:bg-primary/10 transition-colors" />

      <div>
        {/* Header row: Avatar, Name, Verified badge & Role tag */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3.5">
            {/* Avatar */}
            <div className="relative">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-primary/15 via-accent/15 to-primary/5 border border-primary/20 flex items-center justify-center text-primary font-black text-base shadow-xs group-hover:border-primary/40 transition-colors">
                {user.avatar && user.avatar.startsWith("http") ? (
                  <img src={user.avatar} alt={user.name} className="h-full w-full object-cover rounded-2xl" />
                ) : (
                  <span>{initials}</span>
                )}
              </div>
              <span className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full bg-success border-2 border-surface shadow-xs" title="Verified Alumni" />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-base font-black text-fg group-hover:text-primary transition-colors leading-tight">
                  {user.name || "Alumni Mentor"}
                </h3>
                <VerifiedCheckIcon className="h-4 w-4 text-primary shrink-0" />
              </div>
              <p className="text-xs font-bold text-fg/80 mt-0.5">
                {alumni.currentJobTitle}
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="inline-flex items-center gap-1 text-[11px] font-black text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-md">
                  <BriefcaseIcon className="h-3 w-3" />
                  {alumni.currentCompany}
                </span>
                {expText && (
                  <span className="text-[10px] font-bold text-muted bg-surface2 border border-border px-1.5 py-0.5 rounded-md">
                    {expText}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Rating Pill */}
          <div className="flex items-center gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-xl text-xs font-black shrink-0 shadow-xs">
            <StarIcon className="h-3.5 w-3.5" />
            <span>{Number(ratingVal).toFixed(1)}</span>
            {reviewCount > 0 && (
              <span className="text-[10px] text-muted font-bold">({reviewCount})</span>
            )}
          </div>
        </div>

        {/* Education track */}
        <div className="mb-3.5 pt-3 border-t border-border/50 text-xs flex items-center gap-2 text-muted font-medium">
          <AcademicIcon className="h-4 w-4 text-muted/70 shrink-0" />
          {alumni.isCollegeDropout ? (
            <span className="inline-flex items-center gap-1 font-bold text-fg/90 bg-surface2 border border-border/80 px-2 py-0.5 rounded-md text-[11px]">
              College Dropout Track
            </span>
          ) : (
            <span className="truncate">
              <strong className="text-fg/90 font-bold">{alumni.degree}</strong>
              {alumni.specialization && <span> · {alumni.specialization}</span>}
              {alumni.college && <span className="text-muted">, {alumni.college}</span>}
            </span>
          )}
        </div>

        {/* Bio */}
        {alumni.bio && (
          <p className="text-xs text-muted leading-relaxed line-clamp-2 mb-4 font-normal">
            {alumni.bio}
          </p>
        )}
      </div>

      {/* Footer / Booking Actions */}
      <div className="pt-4 border-t border-border/60 flex items-center justify-between gap-3 mt-2">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted">Session Fee</div>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-black text-fg">₹{price}</span>
            <span className="text-[11px] font-bold text-muted">/ 20 min</span>
          </div>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/profile/${userId}`);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-primary text-primary-fg text-xs font-black uppercase tracking-wider transition-all duration-200 hover:shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] cursor-pointer shadow-xs"
        >
          <span>Book Call</span>
          <ArrowUpRightIcon className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
