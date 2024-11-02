import { outfit, russo } from '@/fonts';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen pt-24">
      <div className="container mx-auto px-4 md:px-8">
        <h1
          className={`text-russo my-12 text-center text-4xl text-white lg:text-5xl`}
        >
          Privacy Policy
        </h1>
        <div className="relative mx-auto max-w-4xl">
          <div className="prose prose-invert max-w-none">
            <div className="mb-8 rounded-lg border border-gray-900 bg-gray-900/25 p-4 lg:p-8">
              <h2 className={`text-outfit mb-6 text-2xl font-bold text-white`}>
                1. Information Collection
              </h2>
              <p className={`text-outfit mb-6 text-gray-400`}>
                We collect information you provide directly to us, including but
                not limited to your name, email address, and trading
                preferences. We also automatically collect certain information
                about your device and usage of our services.
              </p>
            </div>

            <div className="mb-8 rounded-lg border border-gray-900 bg-gray-900/25 p-4 lg:p-8">
              <h2 className={`text-outfit mb-6 text-2xl font-bold text-white`}>
                2. Use of Information
              </h2>
              <p className={`text-outfit mb-6 text-gray-400`}>
                We use the information we collect to provide, maintain, and
                improve our services, communicate with you, and protect against
                fraudulent or illegal activity.
              </p>
            </div>

            <div className="mb-8 rounded-lg border border-gray-900 bg-gray-900/25 p-4 lg:p-8">
              <h2 className={`text-outfit mb-6 text-2xl font-bold text-white`}>
                3. Data Security
              </h2>
              <p className={`text-outfit mb-6 text-gray-400`}>
                We implement appropriate technical and organizational measures
                to protect your personal information against unauthorized
                access, alteration, disclosure, or destruction.
              </p>
            </div>

            <div className="mb-8 rounded-lg border border-gray-900 bg-gray-900/25 p-4 lg:p-8">
              <h2 className={`text-outfit mb-6 text-2xl font-bold text-white`}>
                4. Cookie Policy
              </h2>
              <p className={`text-outfit mb-6 text-gray-400`}>
                We use cookies and similar tracking technologies to enhance your
                experience on our platform. You can control cookie preferences
                through your browser settings.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
