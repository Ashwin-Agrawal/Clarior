import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SiteContainer from "../components/layout/SiteContainer";
import useSEO from "../hooks/useSEO";

function Terms() {
  useSEO({
    title: "Terms of Service",
    description: "Read Clarior's Terms of Service, refund policies, and user code of conduct."
  });

  return (
    <>
      <Navbar />
      <main className="bg-bg min-h-screen">
        <div className="relative overflow-hidden bg-[#1a3a8f] py-16">
          <div className="relative max-w-4xl mx-auto px-6 text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Terms of Service
            </h1>
            <p className="mt-2 text-blue-100 text-sm">
              Last updated: June 9, 2026
            </p>
          </div>
        </div>

        <SiteContainer className="py-16 max-w-3xl">
          <div className="space-y-8 text-fg leading-relaxed">
            <section className="space-y-3">
              <h2 className="text-xl font-bold">1. Agreement to Terms</h2>
              <p className="text-muted text-sm">
                By accessing or using Clarior, you agree to comply with and be bound by these Terms of Service. If you do not agree, please do not use the platform.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold">2. Student Accounts & Bookings</h2>
              <ul className="list-disc pl-6 text-muted text-sm space-y-1">
                <li>Students buy credits to book 25-minute video calls with verified seniors.</li>
                <li>One credit allows booking one session. Credits never expire and are non-transferable.</li>
                <li>Refund Policy: If a session does not take place due to mentor absence or you are highly unsatisfied with the advice, you can request a credit refund within 24 hours of the scheduled time by contacting support.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold">3. Senior Mentorship & Guidelines</h2>
              <ul className="list-disc pl-6 text-muted text-sm space-y-1">
                <li>Seniors must undergo a verification process (submitting LinkedIn profile, college, domain details) before hosting sessions.</li>
                <li>Seniors earn ₹52 per completed call. Payouts are made to the registered UPI ID.</li>
                <li>Seniors must provide honest, unbiased guidance and act respectfully. Failure to comply or receiving multiple low ratings (&lt; 2.5 stars) will result in permanent termination of the mentor account.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold">4. User Conduct</h2>
              <p className="text-muted text-sm">
                Users must respect each other during video calls. Abuse, harassment, inappropriate behavior, sharing of personal contact info, or attempt to bypass the platform's booking/payment system is strictly prohibited and will result in immediate ban without refund.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold">5. Limitations of Liability</h2>
              <p className="text-muted text-sm">
                Clarior acts as a peer-to-peer connection platform. The guidance shared by seniors represents their personal opinions and experiences. Clarior is not responsible for any academic or career decisions made based on these peer sessions.
              </p>
            </section>
          </div>
        </SiteContainer>
      </main>
      <Footer />
    </>
  );
}

export default Terms;
