import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-900 mb-8 inline-block">← Home</Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
        <div className="bg-white rounded-2xl border border-gray-200 p-8 space-y-6 text-sm text-gray-600 leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Data Collection</h2>
            <p>We collect the information you provide (name, email, resume text, job descriptions) solely to deliver AI-powered career analysis. We do not sell your data.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Data Security</h2>
            <p>All data is encrypted at rest using AES-256. AI processing happens via API calls with no data retention on AI provider servers.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Data Retention</h2>
            <p>Your data is automatically deleted after 90 days of account inactivity. You can export or delete your data at any time from Settings.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Your Rights (GDPR)</h2>
            <p>You have the right to access, export, and delete all your personal data. Use the Settings page to exercise these rights, or contact us at privacy@careerai.com.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Cookies</h2>
            <p>We use essential cookies for authentication only. We use PostHog for anonymous product analytics. No advertising cookies.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
