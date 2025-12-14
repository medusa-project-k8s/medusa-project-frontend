"use client"

import { useEffect, useState } from "react"

const Hero = () => {
  // Add your background images here - add as many as you want!
  const backgroundImages = [
    "/hero-bg.jpg",
    "/hero-bg-2.jpg", // Add more images: hero-bg-2.jpg, hero-bg-3.jpg, etc.
    "/hero-bg-3.jpg",
  ]

  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Auto-rotate images every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === backgroundImages.length - 1 ? 0 : prevIndex + 1
      )
    }, 5000) // Change image every 5 seconds

    return () => clearInterval(interval)
  }, [backgroundImages.length])

  return (
    <div className="h-screen w-full border-b border-brand-accent/20 relative overflow-hidden">
      {/* Background images with fade transition */}
      {backgroundImages.map((image, index) => (
        <div
          key={index}
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out"
          style={{
            backgroundImage: `url('${image}')`,
            opacity: index === currentImageIndex ? 1 : 0,
            zIndex: index === currentImageIndex ? 1 : 0,
          }}
        />
      ))}
      
      {/* Content overlay */}
      <div className="absolute inset-0 z-10 flex flex-col justify-center items-center text-center small:p-32">
        <h1 className="text-6xl small:text-8xl md:text-9xl text-white font-normal tracking-widest leading-none drop-shadow-lg">
          Persephone brand
        </h1>
      </div>

      {/* Image indicators (dots) */}
      {backgroundImages.length > 1 && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 flex gap-2">
          {backgroundImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentImageIndex
                  ? "w-8 bg-white"
                  : "w-2 bg-white/50 hover:bg-white/75"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default Hero
