import { useNavigate } from "react-router-dom";

function LocationIcon({ className = "h-4 w-4" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2.4" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
    </svg>
  );
}

function ArrowRightIcon({ className = "h-4 w-4" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2.8" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
    </svg>
  );
}

function CollegeCard({ college, index = 0 }) {
  const navigate = useNavigate();
  const { _id, name, type, image, established, city, state, seniorCount = 0 } = college;

  // Render type badges with tailored color palettes
  const getTypeBadgeStyles = (t) => {
    switch (t?.toLowerCase()) {
      case "government":
        return "bg-success/10 text-success border-success/20";
      case "private":
        return "bg-primary/10 text-primary border-primary/20";
      case "new-gen":
        return "bg-accent/10 text-accent border-accent/20";
      default:
        return "bg-surface2 text-muted border-border";
    }
  };

  return (
    <div
      onClick={() => navigate(`/college/${_id}`)}
      className="bg-surface/50 border border-border/80 backdrop-blur-md rounded-[28px] overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-card hover:border-primary/25 group cursor-pointer flex flex-col h-full animate-fade-up"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Premium College Banner */}
      <div className="relative overflow-hidden aspect-[16/10] bg-surface2">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          loading="lazy"
          onError={(e) => {
            e.target.src = "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=800&auto=format&fit=crop";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />

        {/* Floating Metadata Overlays */}
        {established && (
          <span className="absolute top-4 left-4 bg-black/45 text-white backdrop-blur-md px-3.5 py-1.5 rounded-full text-[11px] font-black tracking-wide border border-white/10 uppercase">
            Est. {established}
          </span>
        )}
        <span className={`absolute top-4 right-4 backdrop-blur-md px-3.5 py-1.5 rounded-full text-[11px] font-black tracking-wide border uppercase ${getTypeBadgeStyles(type)}`}>
          {type}
        </span>
      </div>

      {/* College Info Body */}
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-lg font-black text-fg group-hover:text-primary transition-colors line-clamp-2 leading-snug">
          {name}
        </h3>

        <div className="flex items-center gap-1.5 text-muted text-sm font-bold mt-2.5">
          <LocationIcon className="h-4 w-4 text-primary" />
          <span>{city}, {state}</span>
        </div>

        {/* Footer showing senior count */}
        <div className="mt-6 pt-4 flex items-center justify-between border-t border-border/40">
          <div className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${seniorCount > 0 ? "bg-success animate-pulse" : "bg-muted/40"}`} />
            <span className={`text-xs font-black uppercase tracking-wider ${seniorCount > 0 ? "text-fg" : "text-muted"}`}>
              {seniorCount > 0 ? `${seniorCount} Verified Seniors` : "No Seniors Registered"}
            </span>
          </div>
          <span className="h-9 w-9 rounded-full bg-surface2 group-hover:bg-primary group-hover:text-white flex items-center justify-center text-muted transition-all duration-300 border border-border group-hover:border-primary">
            <ArrowRightIcon className="h-4 w-4" />
          </span>
        </div>
      </div>
    </div>
  );
}

export default CollegeCard;
