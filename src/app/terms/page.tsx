import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-900 mb-8 inline-block">← Home</Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>
        <div className="bg-white rounded-2xl border border-gray-200 p-8 space-y-6 text-sm text-gray-600 leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Service</h2>
            <p>CareerAI provides AI-powered career analysis tools on a pay-per-use token basis. Results are AI-generated and should be used as guidance, not guarantees.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Tokens</h2>
            <p>Token packs are non-refundable. Tokens never expire. The Lifetime Deal includes a 30-day money-back guarantee.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Acceptable Use</h2>
            <p>You agree not to abuse the platform, reverse-engineer AI outputs, or use the service for any unlawful purpose.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Limitation of Liability</h2>
            <p>CareerAI is not liable for career decisions made based on AI analysis. Our tools provide data-driven insights but cannot guarantee employment outcomes.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
