import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import MentorCard from "../components/MentorCard";
import SiteContainer from "../components/layout/SiteContainer";
import Button from "../components/ui/Button";
import useSEO from "../hooks/useSEO";

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
        <section className="relative h-[280px] md:h-[400px] w-full overflow-hidden bg-surface2">
          <img
            src={college.image}
            alt={college.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1600&auto=format&fit=crop";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-bg via-black/35 to-black/10 pointer-events-none" />

          {/* Floating Back Navigation */}
          <div className="absolute top-24 left-4 md:left-8">
            <button
              onClick={() => navigate("/explore")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-black/40 text-white backdrop-blur-md border border-white/10 text-xs font-black uppercase tracking-wider hover:bg-black/60 transition-all shadow-lg"
            >
              <BackIcon />
              Explore
            </button>
          </div>

          {/* College Name & Details overlay */}
          <div className="absolute bottom-0 inset-x-0 pb-8">
            <SiteContainer>
              <div className="max-w-4xl animate-fade-up">
                <span className="inline-block px-3 py-1 rounded-full bg-primary/20 text-primary border border-primary/25 text-xs font-black uppercase tracking-wider mb-3 backdrop-blur-md">
                  {college.type} College
                </span>
                <h1 className="text-3xl md:text-5xl font-black text-white leading-tight tracking-tight shadow-text">
                  {college.name}
                </h1>
              </div>
            </SiteContainer>
          </div>
        </section>

        {/* Content Layout Grid */}
        <SiteContainer className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Side: College Metadata Card */}
          <div className="lg:col-span-4 space-y-6 animate-fade-up">
            <div className="bg-surface/50 border border-border/80 backdrop-blur-md rounded-[28px] p-6 shadow-card">
              <h2 className="text-sm font-black text-muted uppercase tracking-[0.2em] mb-6">
                College Information
              </h2>

              <ul className="space-y-5">
                <li className="flex items-start gap-4">
                  <span className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
                    <LocationIcon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-xs font-black text-muted uppercase tracking-wider">Location</h3>
                    <p className="text-fg font-bold text-sm mt-0.5">{college.city}, {college.state}</p>
                  </div>
                </li>

                {college.established && (
                  <li className="flex items-start gap-4">
                    <span className="p-2.5 rounded-xl bg-accent/10 text-accent border border-accent/20">
                      <CalendarIcon className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="text-xs font-black text-muted uppercase tracking-wider">Established</h3>
                      <p className="text-fg font-bold text-sm mt-0.5">{college.established}</p>
                    </div>
                  </li>
                )}

                <li className="flex items-start gap-4">
                  <span className="p-2.5 rounded-xl bg-success/10 text-success border border-success/20">
                    <AcademicIcon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-xs font-black text-muted uppercase tracking-wider">Seniors Available</h3>
                    <p className="text-fg font-bold text-sm mt-0.5">
                      {seniors.length > 0 ? `${seniors.length} Verified Senior${seniors.length !== 1 ? 's' : ''}` : "No Seniors Registered"}
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Side: Seniors Directory List */}
          <div className="lg:col-span-8 space-y-6 animate-fade-up delay-100">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black text-muted uppercase tracking-[0.2em]">
                Seniors from this college
              </h2>
            </div>

            {seniors.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {seniors.map((mentor) => (
                  <MentorCard key={mentor._id} mentor={mentor} />
                ))}
              </div>
            ) : (
              <div className="py-20 text-center bg-surface/30 border border-border/60 rounded-[32px] p-8">
                <div className="text-4xl mb-4">💬</div>
                <h3 className="text-xl font-black text-fg">No seniors registered yet</h3>
                <p className="text-muted mt-2 max-w-sm mx-auto text-sm leading-relaxed">
                  Be the first one to share details or tell your friends from {college.name} to apply as a mentor!
                </p>
                <Button onClick={() => navigate("/become-mentor")} variant="secondary" className="mt-6 rounded-full px-6 text-xs font-black">
                  Become a Mentor
                </Button>
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
