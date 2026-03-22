import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Persephone Brand Terms of Use",
}

export default function TermsOfUse() {
  return (
    <div className="py-12">
      <div className="content-container max-w-3xl">
        <h1 className="text-2xl-semi mb-8">Terms of Use</h1>
        <div className="text-base-regular space-y-4">
          <p>
            Welcome to Persephone Brand. By accessing our website and making purchases, you agree to be bound by these terms.
          </p>
          <h2 className="text-large-semi mt-6 mb-3">Use of Website</h2>
          <p>
            You agree to use this website only for lawful purposes and in accordance with these terms.
          </p>
          <h2 className="text-large-semi mt-6 mb-3">Orders and Payment</h2>
          <p>
            By placing an order, you represent that you are authorized to use the payment method you provide. We reserve the right to refuse or cancel orders.
          </p>
          <h2 className="text-large-semi mt-6 mb-3">Shipping and Returns</h2>
          <p>
            All purchases are subject to our shipping and return policies as described at checkout.
          </p>
          <h2 className="text-large-semi mt-6 mb-3">Limitation of Liability</h2>
          <p>
            Persephone Brand shall not be liable for any indirect, incidental, or consequential damages arising from your use of this website.
          </p>
          <h2 className="text-large-semi mt-6 mb-3">Changes to Terms</h2>
          <p>
            We reserve the right to modify these terms at any time. Continued use of the website constitutes acceptance of modified terms.
          </p>
        </div>
      </div>
    </div>
  )
}
