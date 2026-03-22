import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Persephone Brand Privacy Policy",
}

export default function PrivacyPolicy() {
  return (
    <div className="py-12">
      <div className="content-container max-w-3xl">
        <h1 className="text-2xl-semi mb-8">Privacy Policy</h1>
        <div className="text-base-regular space-y-4">
          <p>
            At Persephone Brand, we respect your privacy and are committed to protecting your personal information.
          </p>
          <h2 className="text-large-semi mt-6 mb-3">Information We Collect</h2>
          <p>
            We collect information you provide directly to us, including your name, email address, phone number, and payment information when you make a purchase or create an account.
          </p>
          <h2 className="text-large-semi mt-6 mb-3">How We Use Your Information</h2>
          <p>
            We use the information we collect to process orders, communicate with you about your purchases, and improve our services.
          </p>
          <h2 className="text-large-semi mt-6 mb-3">Data Security</h2>
          <p>
            We implement appropriate technical and organizational measures to protect your personal information against unauthorized access.
          </p>
          <h2 className="text-large-semi mt-6 mb-3">Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy, please contact us at support@persephonebrand.com.
          </p>
        </div>
      </div>
    </div>
  )
}
