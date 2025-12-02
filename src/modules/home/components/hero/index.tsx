import { Github } from "@medusajs/icons"
import { Button, Heading } from "@medusajs/ui"

const Hero = () => {
  return (
    <div 
      className="h-[75vh] w-full border-b border-brand-accent/20 relative bg-cover bg-center"
      style={{
        backgroundImage: "url('https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=2070&auto=format&fit=crop')",
      }}
    >
      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60"></div>
      
      <div className="absolute inset-0 z-10 flex flex-col justify-center items-center text-center small:p-32 gap-6">
        <span>
          <Heading
            level="h1"
            className="text-5xl leading-tight text-white font-bold drop-shadow-lg"
          >
            Elevate Your Style
          </Heading>
          <Heading
            level="h2"
            className="text-2xl leading-10 text-brand-primary font-light mt-4"
          >
            Discover Premium Fashion & Lifestyle
          </Heading>
        </span>
        <Button 
          variant="secondary"
          className="mt-4 bg-brand-secondary hover:bg-brand-accent text-white border-none text-lg px-8 py-6"
        >
          Shop Collection
        </Button>
      </div>
    </div>
  )
}

export default Hero
