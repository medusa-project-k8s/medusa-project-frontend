import Image from "next/image"

const InstagramBlock = () => {
  return (
    <div className="w-full relative border-b border-brand-accent/20">
      <div className="relative w-full h-[600px] small:h-[700px] overflow-hidden">
        {/* Background Image */}
        <Image
          src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1920&q=80"
          alt="Instagram"
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
        
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/20" />
        
        {/* Centered Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-4 z-10">
          <p className="text-white text-sm small:text-base font-normal text-center max-w-md">
            Tag us in your story and take 10% off
          </p>
          <a
            href="https://www.instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white text-brand-accent-dark px-8 py-3 text-base font-semibold tracking-wide hover:bg-white/90 transition-colors"
          >
            Follow us on Instagram
          </a>
        </div>
      </div>
    </div>
  )
}

export default InstagramBlock
