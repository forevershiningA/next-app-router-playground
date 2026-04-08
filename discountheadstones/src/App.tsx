import { shapes, materials, inscriptionColors, fonts, motifCategories, steps } from './data';

const DESIGN_URL = 'https://discountheadstones.com.au/design/html5/?product-id124';
const BASE = import.meta.env.BASE_URL;

export default function App() {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-800">
      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 border-b border-stone-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <a href={BASE} className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight text-stone-900">
              Discount<span className="text-gold">Headstones</span>
            </span>
            <span className="hidden text-xs font-medium text-stone-400 sm:inline">Australia</span>
          </a>
          <div className="hidden items-center gap-6 text-sm font-medium md:flex">
            <a href="#shapes" className="hover:text-gold transition-colors">Shapes</a>
            <a href="#materials" className="hover:text-gold transition-colors">Materials</a>
            <a href="#how-it-works" className="hover:text-gold transition-colors">How It Works</a>
            <a href="#features" className="hover:text-gold transition-colors">Features</a>
          </div>
          <a
            href={DESIGN_URL}
            className="rounded-lg bg-gold px-5 py-2 text-sm font-semibold text-stone-900 shadow-sm transition hover:bg-gold-dark hover:text-white"
          >
            Start Designing
          </a>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-stone-900 text-white">
        <div className="absolute inset-0 opacity-20">
          <div className="h-full w-full bg-cover bg-center" style={{ backgroundImage: `url('${BASE}textures/forever/l/African-Black.webp')` }} />
        </div>
        <div className="relative mx-auto flex max-w-7xl flex-col items-center px-4 py-24 text-center sm:px-6 sm:py-32 lg:px-8 lg:py-40">
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-gold">
            Australian Made &amp; Installed
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Traditional Engraved
            <br />
            Granite Headstones
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-stone-300">
            Design your own memorial headstone online. Choose from 11&nbsp;classic
            shapes, 25+ natural granites, custom inscriptions, and hundreds of
            decorative motifs&nbsp;— with an instant quote.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <a
              href={DESIGN_URL}
              className="rounded-lg bg-gold px-8 py-3.5 text-base font-bold text-stone-900 shadow-lg transition hover:bg-gold-dark hover:text-white"
            >
              Start Designing&ensp;→
            </a>
            <a
              href="#shapes"
              className="rounded-lg border border-stone-500 px-8 py-3.5 text-base font-semibold text-stone-200 transition hover:border-gold hover:text-gold"
            >
              Browse Shapes
            </a>
          </div>
        </div>
      </section>

      {/* ── Shapes Gallery ── */}
      <section id="shapes" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
            Headstone Shapes
          </h2>
          <p className="mt-3 text-stone-500">
            Click any shape to start designing your headstone
          </p>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {shapes.map((s) => (
            <a
              key={s.id}
              href={`${DESIGN_URL}&shape-id${s.shapeIndex}`}
              className="group flex flex-col items-center rounded-xl bg-white p-4 shadow-sm ring-1 ring-stone-200 transition hover:shadow-md hover:ring-gold"
            >
              <div className="flex h-28 w-28 items-center justify-center">
                <img
                  src={`${BASE}shapes/headstones/${s.svgFile}`}
                  alt={s.name}
                  className="h-full w-full object-contain opacity-80 transition group-hover:opacity-100"
                  loading="lazy"
                />
              </div>
              <span className="mt-3 text-center text-sm font-medium text-stone-700 group-hover:text-gold-dark">
                {s.name}
              </span>
            </a>
          ))}
        </div>
      </section>

      {/* ── Materials Gallery ── */}
      <section id="materials" className="bg-stone-100 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
              Granite &amp; Stone Colours
            </h2>
            <p className="mt-3 text-stone-500">
              Premium natural stone sourced from Australia and around the world
            </p>
          </div>

          <div className="mt-12 grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8">
            {materials.map((m) => (
              <a
                key={m.id}
                href={DESIGN_URL}
                className="group flex flex-col items-center gap-2 text-center"
              >
                <div className="aspect-square w-full overflow-hidden rounded-xl shadow-sm ring-1 ring-stone-200 transition group-hover:shadow-md group-hover:ring-gold">
                  <img
                    src={`${BASE}textures/forever/l/${m.textureFile}`}
                    alt={m.name}
                    className="h-full w-full object-cover transition group-hover:scale-110"
                    loading="lazy"
                  />
                </div>
                <span className="text-xs font-medium text-stone-600 group-hover:text-gold-dark">
                  {m.name}
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
            How It Works
          </h2>
          <p className="mt-3 text-stone-500">
            Design your headstone in five simple steps
          </p>
        </div>

        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {steps.map((s) => (
            <div key={s.num} className="relative rounded-xl bg-white p-6 shadow-sm ring-1 ring-stone-200">
              <span className="absolute -top-4 left-6 flex h-8 w-8 items-center justify-center rounded-full bg-gold text-sm font-bold text-stone-900">
                {s.num}
              </span>
              <h3 className="mt-2 font-semibold text-stone-900">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-500">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="bg-stone-900 py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Everything You Need to Personalise a Memorial
            </h2>
          </div>

          <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {/* Inscriptions */}
            <div className="rounded-xl border border-stone-700 p-6">
              <h3 className="text-lg font-semibold text-gold">Custom Inscriptions</h3>
              <p className="mt-3 text-sm leading-relaxed text-stone-400">
                10 professional fonts including Garamond, Chopin Script, and Great
                Vibes. Add as many lines as you need and position them freely on
                the stone.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {fonts.map((f) => (
                  <span key={f} className="rounded-full bg-stone-800 px-3 py-1 text-xs text-stone-300">
                    {f}
                  </span>
                ))}
              </div>
            </div>

            {/* Colours */}
            <div className="rounded-xl border border-stone-700 p-6">
              <h3 className="text-lg font-semibold text-gold">Inscription Colours</h3>
              <p className="mt-3 text-sm leading-relaxed text-stone-400">
                30+ colours to choose from, including classic gold gilding, silver
                gilding, and a wide palette of paints. Each colour is designed to
                contrast beautifully with your chosen granite.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {inscriptionColors.map((c) => (
                  <span
                    key={c.name}
                    title={c.name}
                    className="inline-block h-7 w-7 rounded-full border border-stone-600 shadow-inner"
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
              </div>
            </div>

            {/* Motifs */}
            <div className="rounded-xl border border-stone-700 p-6">
              <h3 className="text-lg font-semibold text-gold">Decorative Motifs</h3>
              <p className="mt-3 text-sm leading-relaxed text-stone-400">
                Hundreds of hand-drawn motifs across dozens of categories. Browse
                and add symbols that reflect your loved one's life.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {motifCategories.map((cat) => (
                  <span key={cat} className="rounded-full bg-stone-800 px-3 py-1 text-xs text-stone-300">
                    {cat}
                  </span>
                ))}
              </div>
            </div>

            {/* Sizes */}
            <div className="rounded-xl border border-stone-700 p-6">
              <h3 className="text-lg font-semibold text-gold">Flexible Sizing</h3>
              <p className="mt-3 text-sm leading-relaxed text-stone-400">
                Adjust width and height from 300&thinsp;mm to 1&thinsp;200&thinsp;mm to
                match your cemetery's regulations. Includes a matching granite
                base.
              </p>
            </div>

            {/* Pricing */}
            <div className="rounded-xl border border-stone-700 p-6">
              <h3 className="text-lg font-semibold text-gold">Instant Pricing</h3>
              <p className="mt-3 text-sm leading-relaxed text-stone-400">
                Every change you make updates the price in real time. No hidden
                fees — the quote includes the headstone, base, inscriptions, and
                motifs.
              </p>
            </div>

            {/* Quality */}
            <div className="rounded-xl border border-stone-700 p-6">
              <h3 className="text-lg font-semibold text-gold">Australian Quality</h3>
              <p className="mt-3 text-sm leading-relaxed text-stone-400">
                Traditionally engraved by skilled stonemasons. Sandblasted and
                painted lettering that won't fade for generations. Delivered and
                installed Australia-wide.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-gold/10 py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
            Ready to Design Your Headstone?
          </h2>
          <p className="mt-4 text-lg text-stone-600">
            Use our free online designer to create a personalised traditional
            engraved headstone. Get an instant quote — no obligation.
          </p>
          <a
            href={DESIGN_URL}
            className="mt-8 inline-block rounded-lg bg-gold px-10 py-4 text-lg font-bold text-stone-900 shadow-lg transition hover:bg-gold-dark hover:text-white"
          >
            Start Designing&ensp;→
          </a>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-stone-900 py-12 text-stone-400">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div>
              <span className="text-lg font-bold text-white">
                Discount<span className="text-gold">Headstones</span>
              </span>
              <p className="mt-1 text-sm">Traditional Engraved Granite Headstones — Australia</p>
            </div>
            <div className="flex gap-6 text-sm">
              <a href="#shapes" className="hover:text-gold transition-colors">Shapes</a>
              <a href="#materials" className="hover:text-gold transition-colors">Materials</a>
              <a href="#how-it-works" className="hover:text-gold transition-colors">How It Works</a>
              <a href={DESIGN_URL} className="hover:text-gold transition-colors">Design Tool</a>
            </div>
          </div>
          <div className="mt-8 border-t border-stone-800 pt-6 text-center text-xs text-stone-500">
            © {new Date().getFullYear()} Discount Headstones Australia. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
