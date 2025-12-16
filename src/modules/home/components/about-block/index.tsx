import Image from "next/image"

const AboutBlock = () => {
  return (
    <div className="w-full bg-brand-primary border-b border-brand-accent/20 pt-16 small:pt-24">
      <div className="content-container pb-16 small:pb-24">
        <div className="grid grid-cols-1 small:grid-cols-2 gap-8 small:gap-12 items-stretch px-4 small:px-6">
          {/* Left side - Image */}
          <div className="relative w-full aspect-[3/4] small:aspect-[2/3]">
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
          <div className="flex flex-col gap-6 justify-center text-center">
            <h2 className="text-4xl small:text-5xl font-normal text-brand-accent-dark tracking-wide leading-tight">
              PERSEPHONE
            </h2>
            <div className="flex flex-col gap-5 text-base small:text-lg text-brand-accent-dark/80 leading-relaxed font-normal">
              <p>
                Ми бренд, що народився з любові до казок, жіночих образів та нестримних почуттів.
              </p>
              <p>
                Образ Персефони — богині весни й королеви підземного світу — став для нас символом жіночої природи: світлої й темної, ніжної й сильної, мрійливої та владної водночас.
              </p>
              <p>
                Наші сукні — це колаж з епох, десятиліть і стилів, зібраних у цілісну форму, що відзеркалює внутрішній стан. Вінтажні сукні та пеньюари, мереживо й легкі тканини стали основою естетики бренду — інтимної, делікатної, без вульгарності. Ми створюємо силуети, які не обмежують, а обіймають тіло з любов'ю й увагою до кожної деталі.
              </p>
              <p className="font-semibold text-brand-accent-dark mt-2">
                PERSEPHONE — це не про моду. Це про свободу.
              </p>
              <p className="font-semibold text-brand-accent-dark">
                Про прийняття кожної своєї сторони — ніжної, волевої, пристрасної та мрійливої.
              </p>
              <p className="italic text-brand-accent-dark mt-2">
                Бо кожна жінка — як богиня. Її багатогранність і є її сила.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AboutBlock

