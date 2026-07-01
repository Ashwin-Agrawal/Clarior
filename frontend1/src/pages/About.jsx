import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SiteContainer from "../components/layout/SiteContainer";
import useSEO from "../hooks/useSEO";

function About() {
  useSEO({
    title: "About Us",
    description: "Learn about Clarior's mission to make college decisions transparent through peer guidance."
  });

  return (
    <>
      <Navbar />
      <main className="bg-bg min-h-screen">
        {/* Hero Banner */}
        <div className="relative overflow-hidden bg-[#1a3a8f] py-20">
          <div className="relative max-w-4xl mx-auto px-6 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#2563eb] border border-[#3b82f6] px-4 py-1.5 text-xs font-semibold text-white mb-4">
              Our Mission
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Democratizing college clarity.
            </h1>
            <p className="mt-4 text-blue-100 text-lg max-w-2xl mx-auto leading-relaxed">
              We believe every aspirant deserves real, unbiased information directly from students on the inside.
            </p>
          </div>
        </div>

        {/* Content */}
        <SiteContainer className="py-16 max-w-3xl">
          <div className="space-y-10 text-fg leading-relaxed">
            <section className="space-y-4">
              <h2 className="text-2xl font-bold">Why Clarior?</h2>
              <p className="text-muted">
                Choosing a college or branch is one of the most critical decisions of a student's life. Yet, most information available online is either marketing brochures, generic articles, or highly biased forums.
              </p>
              <p className="text-muted">
                Clarior was built to change that. We connect college aspirants and juniors directly with verified seniors from top institutions worldwide. This allows for honest, peer-to-peer conversations where you can get answers to your specific doubts.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold">Our Core Values</h2>
              <div className="grid gap-6 sm:grid-cols-2 mt-4">
                <div className="p-6 rounded-2xl border border-border bg-surface shadow-soft">
                  <div className="text-2xl mb-2">🛡️</div>
                  <h3 className="font-bold text-base mb-1">Authenticity First</h3>
                  <p className="text-sm text-muted">We manually verify all seniors on our platform via their college ID card and LinkedIn profiles.</p>
                </div>
                <div className="p-6 rounded-2xl border border-border bg-surface shadow-soft">
                  <div className="text-2xl mb-2">⚖️</div>
                  <h3 className="font-bold text-base mb-1">Affordable Pricing</h3>
                  <p className="text-sm text-muted">We keep the price low at ₹69 per session to ensure every student can access quality mentorship.</p>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold">How it started</h2>
              <p className="text-muted">
                Founded by students who realized how difficult it is to get genuine college feedback, Clarior is on a mission to build the largest community of student mentors globally.
              </p>
            </section>
          </div>
        </SiteContainer>
      </main>
      <Footer />
    </>
  );
}

export default About;
