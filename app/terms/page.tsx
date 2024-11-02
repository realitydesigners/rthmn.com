import { outfit, russo } from '@/fonts';

export default function TermsPage() {
  return (
    <div className="min-h-screen pt-24">
      <div className="container mx-auto px-4 md:px-8">
        <h1
          className={`text-russo my-12 text-center text-4xl text-white lg:text-5xl`}
        >
          Terms of Service
        </h1>
        <div className="relative mx-auto max-w-4xl">
          <div className="prose prose-invert max-w-none">
            <div className="mb-8 rounded-lg border border-gray-900 bg-gray-900/25 p-4 lg:p-8">
              <h2 className={`text-outfit mb-6 text-2xl font-bold text-white`}>
                1. Acceptance of Terms
              </h2>
              <p className={`text-outfit mb-6 text-gray-400`}>
                By accessing and using RTHMN's services, you agree to be bound
                by these Terms of Service. If you do not agree to these terms,
                please do not use our services.
              </p>
            </div>

            <div className="mb-8 rounded-lg border border-gray-900 bg-gray-900/25 p-4 lg:p-8">
              <h2 className={`text-outfit mb-6 text-2xl font-bold text-white`}>
                2. Service Description
              </h2>
              <p className={`text-outfit mb-6 text-gray-400`}>
                RTHMN provides real-time trading signals, pattern recognition,
                and market analysis tools. Our services are for informational
                purposes only and should not be considered financial advice.
              </p>
            </div>

            <div className="mb-8 rounded-lg border border-gray-900 bg-gray-900/25 p-4 lg:p-8">
              <h2 className={`text-outfit mb-6 text-2xl font-bold text-white`}>
                3. User Obligations
              </h2>
              <p className={`text-outfit mb-6 text-gray-400`}>
                Users must be at least 18 years old and provide accurate
                information when creating an account. You are responsible for
                maintaining the confidentiality of your account credentials.
              </p>
            </div>

            <div className="mb-8 rounded-lg border border-gray-900 bg-gray-900/25 p-4 lg:p-8">
              <h2 className={`text-outfit mb-6 text-2xl font-bold text-white`}>
                4. Limitation of Liability
              </h2>
              <p className={`text-outfit mb-6 text-gray-400`}>
                RTHMN is not liable for any financial losses incurred through
                the use of our services. Trading involves risk, and past
                performance does not guarantee future results.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
