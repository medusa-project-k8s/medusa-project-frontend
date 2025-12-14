import Image from "next/image"

const AboutBlock = () => {
  return (
    <div className="w-full bg-brand-primary border-b border-brand-accent/20 pt-16 small:pt-24">
      <div className="content-container pb-16 small:pb-24">
        <div className="grid grid-cols-1 small:grid-cols-2 gap-8 small:gap-12 items-center">
          {/* Left side - Image */}
          <div className="relative w-full aspect-[4/5] small:aspect-square">
            <Image
              src="/about-image.jpg"
              alt="About"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </div>

          {/* Right side - Text */}
          <div className="flex flex-col gap-6">
            <h2 className="text-4xl small:text-5xl font-normal text-brand-accent-dark tracking-wide leading-tight">
              БУДЬ ИСКУССТВОМ
            </h2>
            <p className="text-base small:text-lg text-brand-accent-dark/70 leading-relaxed font-normal">
              Stonehart accessories and jewelry are handmade works of wearable art that allow you to express your own creativity. We want you to feel like a masterpiece when you wear our pieces. We encourage you to "be the art", and shake off the mundane. Our in-house designer and owner hand makes the "designer made" pieces, ensuring that each one is a one-of-a-kind. Our direct pieces are produced in small batches, using only the highest quality materials and sustainable practices. As a female-owned brand, we are committed to empowering women to embrace their individuality and dress for the faery gaze.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AboutBlock

