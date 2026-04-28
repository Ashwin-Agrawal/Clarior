import Navbar from "../components/Navbar";

function MentorGuidelines() {
  return (
    <>
      <Navbar />
      <div className="p-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Clarior – Mentor Terms &amp; Guidelines</h1>
        <p className="text-gray-600 mb-8">Clarior is built on trust. Please read carefully.</p>

        <div className="space-y-8">
          <section className="bg-white border rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-3">1. Core Principles</h2>
            <ul className="list-disc pl-6 text-gray-800 space-y-1">
              <li>Mentors provide honest, unbiased, experience-based guidance.</li>
              <li>False, misleading, or promotional information is strictly prohibited.</li>
            </ul>
          </section>

          <section className="bg-white border rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-3">2. Quality &amp; Accountability</h2>
            <ul className="list-disc pl-6 text-gray-800 space-y-1">
              <li>Students submit ratings, reviews, and feedback after every session.</li>
              <li>Mentor activity is monitored to ensure quality and reliability.</li>
            </ul>
          </section>

          <section className="bg-white border rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-3">3. Performance Policy</h2>
            <p className="text-gray-800 mb-2">If any of the following occurs:</p>
            <ul className="list-disc pl-6 text-gray-800 space-y-1">
              <li>Three ratings fall below 2.5 stars, or</li>
              <li>Repeated feedback indicates biased or incorrect guidance</li>
            </ul>
            <p className="text-gray-800 mt-3">
              Your account will be permanently removed from the platform. Rejoining will not be allowed.
            </p>
          </section>

          <section className="bg-white border rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-3">4. Why These Rules Exist</h2>
            <ul className="list-disc pl-6 text-gray-800 space-y-1">
              <li>Students receive genuine and reliable guidance</li>
              <li>The platform maintains trust and credibility</li>
            </ul>
          </section>

          <section className="bg-white border rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-3">Session Guidelines</h2>
            <h3 className="font-semibold mt-2">5. Session Duration</h3>
            <p className="text-gray-800">Each session must be 25 minutes (±2 minutes).</p>

            <h3 className="font-semibold mt-4">6. Session Tracking</h3>
            <p className="text-gray-800">
              The timer starts when the session begins on the platform. The student confirms session initiation at the start.
            </p>

            <h3 className="font-semibold mt-4">7. Earnings</h3>
            <p className="text-gray-800">Mentors earn ₹52 per successfully completed session.</p>

            <h3 className="font-semibold mt-4">8. Availability</h3>
            <p className="text-gray-800">Mentors set their own available time slots with full flexibility.</p>

            <h3 className="font-semibold mt-4">9. Safety &amp; Reporting</h3>
            <p className="text-gray-800">
              Mentors can report student misconduct or inappropriate behavior. Clarior aims to keep the environment safe and respectful.
            </p>
          </section>

          <section className="bg-white border rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-3">Session Flow</h2>
            <ol className="list-decimal pl-6 text-gray-800 space-y-1">
              <li>Mentor sets available time slots</li>
              <li>Student selects and books a slot</li>
              <li>Meeting link and schedule are generated automatically</li>
              <li>At the start, the student confirms session initiation on the platform</li>
              <li>The session is conducted normally</li>
              <li>After completion, both student and mentor submit feedback and rating</li>
              <li>Payment is processed within 2 hours to the registered UPI ID or bank account</li>
            </ol>
          </section>

          <section className="bg-white border rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-3">Final Note</h2>
            <p className="text-gray-800">
              Clarior helps students make better decisions through real and honest guidance. Maintaining integrity and authenticity is essential.
            </p>
          </section>
        </div>
      </div>
    </>
  );
}

export default MentorGuidelines;

