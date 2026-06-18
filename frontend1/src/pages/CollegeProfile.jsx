import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import MentorCard from "../components/MentorCard";
import SiteContainer from "../components/layout/SiteContainer";
import Button from "../components/ui/Button";
import useSEO from "../hooks/useSEO";

function SearchIcon({ className = "h-5 w-5" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2.4" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="7.5" />
      <path strokeLinecap="round" d="m20 20-3.8-3.8" />
    </svg>
  );
}

function LocationIcon({ className = "h-5 w-5" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2.4" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
    </svg>
  );
}

function CalendarIcon({ className = "h-5 w-5" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2.4" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
    </svg>
  );
}

function AcademicIcon({ className = "h-5 w-5" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2.4" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.9c2.783 0 5.437-.72 7.731-2.006a60.438 60.438 0 0 0-.49-6.347m-15.482 0a48.47 48.47 0 0 1 7.74-2.006m0 0a48.47 48.47 0 0 1 7.74 2.006M4.26 10.147l7.74-2.006m0 0v-5.61m0 5.61 7.74 2.006M12 2.525l7.74 2.006m0 0-7.74 2.006m0 0L4.26 4.531 12 2.525Z" />
    </svg>
  );
}

function BackIcon({ className = "h-4 w-4" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2.8" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
    </svg>
  );
}

function CollegeProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [college, setCollege] = useState(null);
  const [seniors, setSeniors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [search, setSearch] = useState("");
  const [domainFilter, setDomainFilter] = useState("All");
  const [branchFilter, setBranchFilter] = useState("All");

  const domainList = useMemo(() => {
    const d = new Set(seniors.map((s) => s.domain).filter(Boolean));
    return ["All", ...Array.from(d).sort()];
  }, [seniors]);

  const branchList = useMemo(() => {
    const b = new Set(seniors.map((s) => s.branch).filter(Boolean));
    return ["All", ...Array.from(b).sort()];
  }, [seniors]);

  const filteredSeniors = useMemo(() => {
    return seniors.filter((s) => {
      const matchSearch =
        !search.trim() ||
        s.name.toLowerCase().includes(search.trim().toLowerCase());
      const matchDomain = domainFilter === "All" || s.domain === domainFilter;
      const matchBranch = branchFilter === "All" || s.branch === branchFilter;
      return matchSearch && matchDomain && matchBranch;
    });
  }, [seniors, search, domainFilter, branchFilter]);

  const clearFilters = () => {
    setSearch("");
    setDomainFilter("All");
    setBranchFilter("All");
  };

  useEffect(() => {
    const fetchCollegeDetails = async () => {
      try {
        setLoading(true);
        setError(false);
        const res = await api.get(`/colleges/${id}`);
        setCollege(res.data.college);
        setSeniors(res.data.seniors || []);
      } catch (err) {
        console.error("Failed to load college details", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchCollegeDetails();
  }, [id]);

  // Handle SEO metadata dynamically based on loaded college
  const seoTitle = college ? `${college.name} Seniors` : "College Profile";
  const seoDesc = college
    ? `Connect and schedule sessions with verified seniors from ${college.name} studying in ${college.city}, ${college.state}.`
    : "View details of top colleges and discover verified mentors.";
  useSEO(seoTitle, seoDesc);

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="bg-bg min-h-screen pt-24 pb-16 flex flex-col justify-center items-center">
          <div className="h-12 w-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          <p className="text-muted mt-4 font-bold text-sm uppercase tracking-wider">Loading Profile details…</p>
        </main>
        <Footer />
      </>
    );
  }

  if (error || !college) {
    return (
      <>
        <Navbar />
        <main className="bg-bg min-h-screen pt-24 pb-16">
          <SiteContainer>
            <div className="text-center py-20 bg-surface/50 border border-border/80 rounded-[32px] max-w-lg mx-auto">
              <div className="text-5xl mb-6">🏫</div>
              <h2 className="text-2xl font-black text-fg mb-3">College Not Found</h2>
              <p className="text-muted max-w-xs mx-auto mb-8">
                The college profile you are looking for does not exist or could not be loaded.
              </p>
              <Button onClick={() => navigate("/explore")} variant="primary" className="rounded-full px-8">
                Back to Explore
              </Button>
            </div>
          </SiteContainer>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="bg-bg min-h-screen pb-32">
        {/* Dynamic Hero Campus Image Header */}
        <section className="relative h-56 md:h-80 w-full overflow-hidden rounded-b-[40px] md:rounded-b-[56px] shadow-lg">
          <img
            src={college.image}
            alt={college.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1600&auto=format&fit=crop";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-black/20" />
        </section>

        {/* Profile Info Header overlapping the banner */}
        <SiteContainer className="relative -mt-20 md:-mt-28 z-10">
          <div className="bg-surface/80 border border-border/60 backdrop-blur-xl rounded-[40px] p-8 md:p-10 shadow-hero shadow-primary/5 animate-fade-up">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-4 w-full">
                {/* Back button and Badge row */}
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => navigate("/explore")}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-surface2/60 backdrop-blur border border-border text-xs font-bold text-muted hover:text-fg hover:border-primary/40 hover:scale-105 active:scale-95 transition-all shadow-sm cursor-pointer"
                  >
                    <BackIcon className="h-4 w-4 text-primary" />
                    Back to Explore
                  </button>
                  <span className="inline-block px-3.5 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-black uppercase tracking-wider">
                    {college.type} College
                  </span>
                </div>

                {/* College Title */}
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-fg leading-tight tracking-tight pt-2">
                  {college.name}
                </h1>
                {college.affiliated_to && (
                  <p className="text-sm md:text-base font-bold text-muted mt-1 leading-relaxed">
                    Affiliated to {college.affiliated_to}
                  </p>
                )}

                {/* Quick details */}
                <div className="flex flex-wrap gap-3 mt-4">
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-primary/5 border border-primary/15 text-xs font-black uppercase tracking-wider text-primary">
                    <LocationIcon className="h-4 w-4" />
                    {college.city}, {college.state}
                  </span>
                  {college.established && (
                    <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-accent/5 border border-accent/15 text-xs font-black uppercase tracking-wider text-accent">
                      <CalendarIcon className="h-4 w-4" />
                      Est. {college.established}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-success/5 border border-success/15 text-xs font-black uppercase tracking-wider text-success">
                    <AcademicIcon className="h-4 w-4" />
                    {seniors.length > 0 ? `${seniors.length} Verified Senior${seniors.length !== 1 ? 's' : ''}` : "No Seniors Registered"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </SiteContainer>

        {/* Content Layout Grid */}
        <SiteContainer className="mt-12">
          {/* Seniors Directory List */}
          <div className="space-y-8 animate-fade-up delay-100">
            <div className="text-center max-w-xl mx-auto space-y-3">
              <h2 className="text-xs font-black text-primary uppercase tracking-[0.25em]">
                Seniors Directory
              </h2>
              <p className="text-2xl font-black text-fg tracking-tight">
                Search & Filter Mentors
              </p>
              <p className="text-sm text-muted">
                Find the right senior based on their study domain or branch specialization.
              </p>
            </div>

            {/* Search and Filters Hub */}
            {seniors.length > 0 && (
              <div className="bg-surface/50 border border-border/80 rounded-[36px] p-6 md:p-8 space-y-6 shadow-soft max-w-4xl mx-auto backdrop-blur-md">
                {/* Search Bar */}
                <div className="max-w-2xl mx-auto">
                  <div className="relative group">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors">
                      <SearchIcon className="h-5 w-5" />
                    </span>
                    <input
                      type="text"
                      placeholder="Search seniors by name..."
                      className="w-full h-14 pl-14 pr-6 rounded-2xl border border-border bg-surface2/60 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-sm sm:text-base font-black text-fg hover:border-primary/25"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                </div>

                {/* Filter 1: Domain Pills */}
                {domainList.length > 2 && (
                  <div className="flex flex-col items-center gap-3">
                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-muted">Filter by Domain</span>
                    <div className="flex flex-wrap justify-center gap-2">
                      {domainList.map((domain) => (
                        <button
                          key={domain}
                          onClick={() => setDomainFilter(domain)}
                          className={`px-5 py-2.5 rounded-full text-[11px] font-black tracking-wider transition-all duration-300 cursor-pointer uppercase ${
                            domainFilter === domain
                              ? "bg-gradient-to-r from-blue-600 to-sky-500 text-white border-transparent shadow-md shadow-blue-500/20 scale-[1.03]"
                              : "bg-surface border border-border text-muted hover:border-primary/40 hover:text-fg"
                          }`}
                        >
                          {domain === "All" ? "All Domains" : domain}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Filter 2: Branch Pills */}
                {branchList.length > 2 && (
                  <div className="flex flex-col items-center gap-3 w-full">
                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-muted">Filter by Branch</span>
                    <div className="flex gap-2 overflow-x-auto scrollbar-hide max-w-full py-1.5 px-4 justify-start sm:justify-center w-full">
                      {branchList.map((branch) => (
                        <button
                          key={branch}
                          onClick={() => setBranchFilter(branch)}
                          className={`px-4 py-2 rounded-full text-[10px] font-black tracking-wider transition-all duration-300 cursor-pointer flex-shrink-0 uppercase ${
                            branchFilter === branch
                              ? "bg-gradient-to-r from-blue-600 to-sky-500 text-white border-transparent shadow-md shadow-blue-500/20"
                              : "bg-surface border border-border text-muted hover:border-primary/40 hover:text-fg"
                          }`}
                        >
                          {branch === "All" ? "All Branches" : branch}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {(search.trim() || domainFilter !== "All" || branchFilter !== "All") && (
                  <div className="flex justify-center pt-2">
                    <button
                      onClick={clearFilters}
                      className="text-xs font-black text-muted hover:text-primary transition-colors uppercase tracking-widest underline decoration-2 underline-offset-4 cursor-pointer"
                    >
                      Clear All Filters
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Seniors Directory List */}
            {filteredSeniors.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
                {filteredSeniors.map((mentor) => (
                  <MentorCard key={mentor._id} mentor={mentor} />
                ))}
              </div>
            ) : (
              <div className="py-20 text-center bg-surface/30 border border-border/60 rounded-[32px] p-8 max-w-2xl mx-auto animate-scale-in">
                <div className="text-4xl mb-4">💬</div>
                <h3 className="text-xl font-black text-fg">No seniors registered yet</h3>
                <p className="text-muted mt-2 max-w-sm mx-auto text-sm leading-relaxed">
                  {seniors.length === 0
                    ? `Be the first one to share details or tell your friends from ${college.name} to apply as a mentor!`
                    : "No matching seniors found. Try clearing filters or tweaking search queries."}
                </p>
                {seniors.length === 0 ? (
                  <Button onClick={() => navigate("/become-mentor")} variant="secondary" className="mt-6 rounded-full px-6 text-xs font-black">
                    Become a Mentor
                  </Button>
                ) : (
                  <Button onClick={clearFilters} variant="secondary" className="mt-6 rounded-full px-6 text-xs font-black">
                    Clear Filters
                  </Button>
                )}
              </div>
            )}
          </div>
        </SiteContainer>
      </main>
      <Footer />
    </>
  );
}

export default CollegeProfile;
