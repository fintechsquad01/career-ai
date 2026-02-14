import type { Metadata } from "next";
import Link from "next/link";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://aiskillscore.com";

export const metadata: Metadata = {
  title: "Privacy Policy — AISkillScore",
  description:
    "How AISkillScore protects your data. AES-256 encryption, no data selling, GDPR compliant, auto-delete after 90 days. AI processing with no data retention.",
  alternates: {
    canonical: `${APP_URL}/privacy`,
  },
  openGraph: {
    title: "Privacy Policy — AISkillScore",
    description: "AES-256 encryption, no data selling, GDPR compliant, auto-delete after 90 days.",
    url: `${APP_URL}/privacy`,
  },
  twitter: {
    card: "summary",
    title: "Privacy Policy — AISkillScore",
    description: "AES-256 encryption, no data selling, GDPR compliant, auto-delete after 90 days.",
  },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-900 mb-8 inline-block">← Home</Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
        <p className="text-xs text-gray-400 mb-6">Last updated: February 14, 2026</p>
        <div className="bg-white rounded-2xl border border-gray-200 p-8 space-y-6 text-sm text-gray-600 leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">1. Data We Collect</h2>
            <p>We collect information you provide directly:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Account data:</strong> Name, email address (via signup or Google OAuth)</li>
              <li><strong>Career data:</strong> Resume text, job descriptions, LinkedIn URLs you paste into our tools</li>
              <li><strong>Payment data:</strong> Processed by Stripe — we never store your credit card number</li>
              <li><strong>Usage data:</strong> Tool usage, token transactions, anonymous product analytics</li>
            </ul>
            <p className="mt-2">We do not sell, rent, or trade your personal data to third parties.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">2. How We Use Your Data</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>To provide AI-powered career analysis via our 11 tools</li>
              <li>To manage your account, tokens, and transaction history</li>
              <li>To send transactional emails (welcome, purchase confirmation)</li>
              <li>To improve our product through anonymous, aggregated analytics</li>
            </ul>
            <p className="mt-2">We do not use your resume or career data for AI model training. Your data is processed in real-time and not retained by our AI providers.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">3. Data Security</h2>
            <p>All data is encrypted at rest using AES-256 on Supabase&apos;s infrastructure. Data in transit is protected by TLS 1.3. AI processing happens via secure API calls to OpenRouter/Google Gemini with no data retention on AI provider servers. Payment processing is handled by Stripe (PCI DSS Level 1 compliant).</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">4. Third-Party Services</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Supabase:</strong> Database and authentication (EU/US hosting)</li>
              <li><strong>Stripe:</strong> Payment processing — <a href="https://stripe.com/privacy" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Privacy Policy</a></li>
              <li><strong>Google Gemini (via OpenRouter):</strong> AI processing — no data retention</li>
              <li><strong>PostHog:</strong> Anonymous product analytics — <a href="https://posthog.com/privacy" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Privacy Policy</a></li>
              <li><strong>Vercel:</strong> Website hosting — <a href="https://vercel.com/legal/privacy-policy" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Privacy Policy</a></li>
            </ul>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">5. Data Retention</h2>
            <p>Your data is automatically deleted after 90 days of account inactivity. Tool results are retained for your convenience in the History page. You can export or permanently delete all your data at any time from Settings.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">6. Your Rights</h2>
            <p>Regardless of your location, you have the right to:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Access:</strong> View all data we hold about you</li>
              <li><strong>Export:</strong> Download your data in a portable format</li>
              <li><strong>Delete:</strong> Permanently erase your account and all associated data</li>
              <li><strong>Rectify:</strong> Correct inaccurate personal information</li>
              <li><strong>Object:</strong> Opt out of non-essential data processing</li>
            </ul>
            <p className="mt-2">Exercise these rights via the Settings page, or email <a href="mailto:privacy@aiskillscore.com" className="text-blue-600 hover:underline">privacy@aiskillscore.com</a>. We respond to all requests within 30 days.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">7. Cookies</h2>
            <p>We use essential cookies for authentication and session management only. PostHog collects anonymous product analytics (no personal identifiers). We do not use advertising or tracking cookies.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">8. Children&apos;s Privacy</h2>
            <p>AISkillScore is not intended for users under the age of 16. We do not knowingly collect data from children. If you believe a child has created an account, please contact us and we will delete it promptly.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">9. Changes to This Policy</h2>
            <p>We may update this privacy policy from time to time. Significant changes will be communicated via email. The &quot;last updated&quot; date at the top of this page reflects the most recent revision.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">10. Contact</h2>
            <p>For privacy-related questions or data requests:</p>
            <ul className="list-none mt-2 space-y-1">
              <li>Privacy: <a href="mailto:privacy@aiskillscore.com" className="text-blue-600 hover:underline">privacy@aiskillscore.com</a></li>
              <li>Support: <a href="mailto:support@aiskillscore.com" className="text-blue-600 hover:underline">support@aiskillscore.com</a></li>
              <li>Website: <a href="https://aiskillscore.com" className="text-blue-600 hover:underline">aiskillscore.com</a></li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
