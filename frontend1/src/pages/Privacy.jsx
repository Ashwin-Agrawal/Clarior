import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SiteContainer from "../components/layout/SiteContainer";
import useSEO from "../hooks/useSEO";

function Privacy() {
  useSEO({
    title: "Privacy Policy",
    description: "Read Clarior's Privacy Policy to understand how we protect and handle your personal data."
  });

  return (
    <>
      <Navbar />
      <main className="bg-bg min-h-screen">
        <div className="relative overflow-hidden bg-[#1a3a8f] py-16">
          <div className="relative max-w-4xl mx-auto px-6 text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Privacy Policy
            </h1>
            <p className="mt-2 text-blue-100 text-sm">
              Last updated: June 9, 2026
            </p>
          </div>
        </div>

        <SiteContainer className="py-16 max-w-3xl">
          <div className="space-y-8 text-fg leading-relaxed">
            <section className="space-y-3">
              <h2 className="text-xl font-bold">1. Information We Collect</h2>
              <p className="text-muted text-sm">
                We collect personal information that you provide directly to us when you create an account, apply as a senior, or make payments. This includes your name, email address, phone number, college name, branch, year of study, UPI ID (for payouts), and payment transaction details.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold">2. How We Use Your Information</h2>
              <p className="text-muted text-sm">
                We use the information we collect to:
              </p>
              <ul className="list-disc pl-6 text-muted text-sm space-y-1">
                <li>Verify your enrollment status and identity for senior applications.</li>
                <li>Process payments and payouts via secure payment gateways (Razorpay).</li>
                <li>Facilitate Google Meet session link generation.</li>
                <li>Send transactional updates regarding your bookings and payouts.</li>
                <li>Ensure safety, platform integrity, and prevent fraudulent actions.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold">3. Data Sharing & Third-Party Services</h2>
              <p className="text-muted text-sm">
                We do not sell your personal data. We share your information only with essential service providers like payment gateways (Razorpay) to process transactions, and Google OAuth to schedule Google Meet links for calls.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold">4. Security</h2>
              <p className="text-muted text-sm">
                We implement strict security measures to safeguard your personal information against unauthorized access, alteration, disclosure, or destruction. However, no electronic transmission or storage method is 100% secure.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold">5. Contact Us</h2>
              <p className="text-muted text-sm">
                If you have any questions or concerns about this Privacy Policy, feel free to contact us at support@clarior.in.
              </p>
            </section>
          </div>
        </SiteContainer>
      </main>
      <Footer />
    </>
  );
}

export default Privacy;
