import type { Metadata } from "next";
import Link from "next/link";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://aiskillscore.com";

export const metadata: Metadata = {
  title: "Terms of Service — AISkillScore",
  description:
    "Terms of service for AISkillScore. Token-based pricing, AI career tool usage policies, refund terms, and limitation of liability.",
  alternates: {
    canonical: `${APP_URL}/terms`,
  },
  openGraph: {
    title: "Terms of Service — AISkillScore",
    description: "Token-based pricing, AI career tool usage policies, and refund terms.",
    url: `${APP_URL}/terms`,
  },
  twitter: {
    card: "summary",
    title: "Terms of Service — AISkillScore",
    description: "Token-based pricing, AI career tool usage policies, and refund terms.",
  },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-900 mb-8 inline-block">← Home</Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>
        <p className="text-xs text-gray-400 mb-6">Last updated: February 14, 2026</p>
        <div className="bg-white rounded-2xl border border-gray-200 p-8 space-y-6 text-sm text-gray-600 leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">1. Service Description</h2>
            <p>AISkillScore (&quot;we,&quot; &quot;us,&quot; &quot;our&quot;) provides AI-powered career analysis tools at <a href="https://aiskillscore.com" className="text-blue-600 hover:underline">aiskillscore.com</a>. Our platform offers 11 career intelligence tools on a pay-per-use token basis. Results are AI-generated and should be used as guidance, not guarantees of employment outcomes.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">2. Account &amp; Eligibility</h2>
            <p>You must be at least 16 years old to use AISkillScore. You are responsible for maintaining the confidentiality of your account credentials. Each new account receives 5 free tokens upon signup, plus 3 daily credits that reset every 24 hours.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">3. Tokens &amp; Pricing</h2>
            <p>AISkillScore operates on a token-based pricing model. Tokens are purchased in packs:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Starter Pack:</strong> 50 tokens — $5.00</li>
              <li><strong>Pro Pack:</strong> 200 tokens — $15.00</li>
              <li><strong>Power Pack:</strong> 600 tokens — $39.00</li>
              <li><strong>Lifetime Deal:</strong> 100 tokens/month — $49.00 (early bird) or $79.00</li>
            </ul>
            <p className="mt-2">Purchased tokens never expire. Token costs per tool range from 0 (free tools) to 10 tokens, as displayed on each tool page before use. All prices are in USD.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">4. Refunds &amp; Cancellations</h2>
            <p><strong>Token packs (Starter, Pro, Power):</strong> Eligible for a full refund within 14 days of purchase if no tokens from the pack have been used. Once any tokens from a purchased pack are consumed, the purchase is non-refundable.</p>
            <p className="mt-2"><strong>Lifetime Deal:</strong> Includes a 30-day money-back guarantee from the date of purchase. If you are not satisfied, you may request a full refund within 30 days regardless of token usage.</p>
            <p className="mt-2"><strong>Free tokens and daily credits:</strong> These are provided at no cost and are not eligible for refund or cash value.</p>
            <p className="mt-2"><strong>How to request a refund:</strong> Email <a href="mailto:support@aiskillscore.com" className="text-blue-600 hover:underline">support@aiskillscore.com</a> with your account email and reason for the request. Refunds are processed within 5–10 business days to the original payment method.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">5. Payments</h2>
            <p>All payments are processed securely by <a href="https://stripe.com" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Stripe</a>. We do not store your credit card information. By making a purchase, you agree to Stripe&apos;s <a href="https://stripe.com/legal" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Terms of Service</a>. Charges will appear as &quot;AISKILLSCORE&quot; on your bank statement.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">6. Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Abuse the platform or exploit free tokens/daily credits through multiple accounts</li>
              <li>Reverse-engineer, scrape, or systematically extract AI outputs</li>
              <li>Use the service for any unlawful purpose or to discriminate against individuals</li>
              <li>Resell, redistribute, or commercially repurpose AI-generated results</li>
              <li>Submit malicious content designed to manipulate AI outputs</li>
            </ul>
            <p className="mt-2">We reserve the right to suspend or terminate accounts that violate these terms.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">7. Intellectual Property</h2>
            <p>AI-generated results are provided for your personal use. You may use results in your job applications, resumes, and professional documents. The AISkillScore platform, branding, and proprietary analysis methods remain our intellectual property.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">8. Disclaimer of Warranties</h2>
            <p>AISkillScore is provided &quot;as is&quot; without warranties of any kind. AI analysis is based on current models and data and may not reflect all aspects of your career situation. We do not guarantee the accuracy, completeness, or reliability of AI-generated content.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">9. Limitation of Liability</h2>
            <p>AISkillScore is not liable for career decisions made based on AI analysis. Our tools provide data-driven insights but cannot guarantee employment outcomes. In no event shall our total liability exceed the amount you paid to us in the 12 months preceding the claim.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">10. Dispute Resolution</h2>
            <p>If you have a billing dispute or are unsatisfied with a purchase, please contact us at <a href="mailto:support@aiskillscore.com" className="text-blue-600 hover:underline">support@aiskillscore.com</a> before initiating a chargeback. We are committed to resolving issues promptly and fairly.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">11. Changes to Terms</h2>
            <p>We may update these terms from time to time. Significant changes will be communicated via email to registered users. Continued use of the service after changes constitutes acceptance of the updated terms.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">12. Contact</h2>
            <p>For questions, support, or refund requests:</p>
            <ul className="list-none mt-2 space-y-1">
              <li>Email: <a href="mailto:support@aiskillscore.com" className="text-blue-600 hover:underline">support@aiskillscore.com</a></li>
              <li>Website: <a href="https://aiskillscore.com" className="text-blue-600 hover:underline">aiskillscore.com</a></li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
