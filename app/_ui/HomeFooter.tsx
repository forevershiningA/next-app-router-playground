import Image from 'next/image';
import Link from 'next/link';

export default function HomeFooter() {
  return (
    <footer className="day:bg-gray-100 day:border-gray-200 relative border-t border-[#d4af37]/20 bg-[#050402]">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:py-20">
        <div className="day:text-gray-900 grid grid-cols-1 gap-10 text-white sm:grid-cols-2 lg:grid-cols-[1fr_0.75fr_0.85fr_2.1fr]">
          <div>
            <div className="flex items-center gap-3 font-serif text-2xl">
              <span className="tracking-wide">Forever Shining</span>
            </div>
            <Image
              src="/webp/forever-logo.webp"
              alt="Forever Shining - Design Online"
              width={200}
              height={120}
              className="mt-4 h-[100px] w-auto select-none"
              sizes="167px"
              draggable={false}
            />
            <p className="day:text-gray-600 mt-4 text-sm text-white/70">
              Crafting lasting tributes for families around the world since
              2005.
            </p>
            <div className="mt-6 flex items-center gap-3 text-sm">
              <a
                href="https://www.instagram.com/forevershiningaus/"
                target="_blank"
                rel="noreferrer"
                aria-label="Forever Shining on Instagram"
                className="day:border-gray-300 day:text-gray-500 day:hover:border-amber-500 day:hover:text-amber-600 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-white/20 text-white/80 transition-colors hover:border-[#d4af37] hover:text-[#d4af37]"
              >
                <span aria-hidden="true">IG</span>
              </a>
              <a
                href="https://www.facebook.com/ForeverShiningAustralia/"
                target="_blank"
                rel="noreferrer"
                aria-label="Forever Shining on Facebook"
                className="day:border-gray-300 day:text-gray-500 day:hover:border-amber-500 day:hover:text-amber-600 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-white/20 text-white/80 transition-colors hover:border-[#d4af37] hover:text-[#d4af37]"
              >
                <span aria-hidden="true">FB</span>
              </a>
              <a
                href="https://www.pinterest.com/forevershining1/"
                target="_blank"
                rel="noreferrer"
                aria-label="Forever Shining on Pinterest"
                className="day:border-gray-300 day:text-gray-500 day:hover:border-amber-500 day:hover:text-amber-600 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-white/20 text-white/80 transition-colors hover:border-[#d4af37] hover:text-[#d4af37]"
              >
                <span aria-hidden="true">PI</span>
              </a>
              <a
                href="https://twitter.com/ForeverShiningA"
                target="_blank"
                rel="noreferrer"
                aria-label="Forever Shining on X"
                className="day:border-gray-300 day:text-gray-500 day:hover:border-amber-500 day:hover:text-amber-600 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-white/20 text-white/80 transition-colors hover:border-[#d4af37] hover:text-[#d4af37]"
              >
                <span aria-hidden="true">X</span>
              </a>
              <a
                href="https://www.youtube.com/@forevershining/featured"
                target="_blank"
                rel="noreferrer"
                aria-label="Forever Shining on YouTube"
                className="day:border-gray-300 day:text-gray-500 day:hover:border-amber-500 day:hover:text-amber-600 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-white/20 text-white/80 transition-colors hover:border-[#d4af37] hover:text-[#d4af37]"
              >
                <span aria-hidden="true">YT</span>
              </a>
            </div>
          </div>

          <div>
            <p className="day:text-amber-700 font-serif text-sm tracking-[0.4em] text-[#f3d48f] uppercase">
              Memorials
            </p>
            <ul className="day:text-gray-600 mt-4 space-y-2 text-sm text-white/70">
              <li>
                <Link
                  href="/memorials"
                  className="day:hover:text-gray-900 cursor-pointer font-medium transition-colors hover:text-white"
                >
                  All Memorials Catalog
                </Link>
              </li>
              <li>
                <Link
                  href="/memorials/headstones"
                  className="day:hover:text-gray-900 cursor-pointer transition-colors hover:text-white"
                >
                  Headstones
                </Link>
              </li>
              <li>
                <Link
                  href="/memorials/plaques"
                  className="day:hover:text-gray-900 cursor-pointer transition-colors hover:text-white"
                >
                  Plaques
                </Link>
              </li>
              <li>
                <Link
                  href="/memorials/urns"
                  className="day:hover:text-gray-900 cursor-pointer transition-colors hover:text-white"
                >
                  Urns
                </Link>
              </li>
              <li>
                <Link
                  href="/memorials/full-monuments"
                  className="day:hover:text-gray-900 cursor-pointer transition-colors hover:text-white"
                >
                  Full Monuments
                </Link>
              </li>
              <li>
                <Link
                  href="/memorials/pet-memorials"
                  className="day:hover:text-gray-900 cursor-pointer transition-colors hover:text-white"
                >
                  Pet Memorials
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="day:text-amber-700 font-serif text-sm tracking-[0.4em] text-[#f3d48f] uppercase">
              Help & Guides
            </p>
            <ul className="day:text-gray-600 mt-4 space-y-2 text-sm text-white/70">
              <li>
                <a
                  href="#video-tutorials"
                  className="day:hover:text-gray-900 cursor-pointer transition-colors hover:text-white"
                >
                  Video Tutorials
                </a>
              </li>
              <li>
                <a
                  href="#how-it-works"
                  className="day:hover:text-gray-900 cursor-pointer transition-colors hover:text-white"
                >
                  How it Works
                </a>
              </li>
              <li>
                <Link
                  href="/designs/guide/pricing"
                  className="day:hover:text-gray-900 cursor-pointer transition-colors hover:text-white"
                >
                  Pricing Guide
                </Link>
              </li>
              <li>
                <Link
                  href="/designs/guide/buying-guide"
                  className="day:hover:text-gray-900 cursor-pointer transition-colors hover:text-white"
                >
                  Buying Guide
                </Link>
              </li>
              <li>
                <a
                  href="#faq"
                  className="day:hover:text-gray-900 cursor-pointer transition-colors hover:text-white"
                >
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          <div className="lg:min-w-0">
            <p className="day:text-amber-700 font-serif text-sm tracking-[0.4em] text-[#f3d48f] uppercase">
              Get in Touch
            </p>
            <div className="day:text-gray-600 mt-4 text-sm text-white/80">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <a
                    href="tel:+16473880931"
                    className="day:text-gray-900 day:hover:text-amber-600 cursor-pointer text-lg font-semibold text-white transition-colors hover:text-[#f3d48f]"
                  >
                    (+1) 647 388 0931
                  </a>
                  <p className="day:text-gray-600 mt-2 text-white/70">
                    <a
                      href="mailto:admin@bronze-plaque.com"
                      className="day:hover:text-amber-600 cursor-pointer transition-colors hover:text-[#f3d48f]"
                    >
                      admin@bronze-plaque.com
                    </a>
                  </p>
                  <p className="day:text-gray-600 mt-2 leading-relaxed text-white/70">
                    1101 Eagle Ridge Drive
                    <br />
                    Oshawa Ontario L1K 0L8
                  </p>
                </div>
                <div className="day:border-gray-200 border-t border-white/10 pt-3 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-5">
                  <a
                    href="tel:+61861910396"
                    className="day:text-gray-900 day:hover:text-amber-600 cursor-pointer text-lg font-semibold text-white transition-colors hover:text-[#f3d48f]"
                  >
                    +61 8 6191 0396
                  </a>
                  <p className="day:text-gray-600 mt-2 text-white/70">
                    <a
                      href="mailto:admin@forevershining.com.au"
                      className="day:hover:text-amber-600 cursor-pointer transition-colors hover:text-[#f3d48f]"
                    >
                      admin@forevershining.com.au
                    </a>
                  </p>
                  <p className="day:text-gray-600 mt-2 leading-relaxed text-white/70">
                    1/44 Port Kembla Dve
                    <br />
                    Bibra Lake WA 6163
                  </p>
                </div>
              </div>
              <p className="day:text-gray-500 mt-4 leading-relaxed text-white/60">
                Serving families across the United States and Canada, with
                international support available for Australia and Europe.
              </p>
            </div>
          </div>
        </div>

        <div className="day:border-gray-200 day:text-gray-500 mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-white/60 md:flex-row">
          <p>© 2026 Forever Shining. All rights reserved.</p>
          <div className="day:text-gray-600 flex items-center gap-4 text-sm text-white/70">
            <Link
              href="/privacy"
              className="day:hover:text-gray-900 cursor-pointer transition-colors hover:text-white"
            >
              Privacy Policy
            </Link>
            <span className="day:text-gray-300 text-white/40">|</span>
            <Link
              href="/terms"
              className="day:hover:text-gray-900 cursor-pointer transition-colors hover:text-white"
            >
              Terms &amp; Conditions
            </Link>
            <span className="day:text-gray-300 text-white/40">|</span>
            <a
              href="/sitemap.xml"
              className="day:hover:text-gray-900 cursor-pointer transition-colors hover:text-white"
            >
              Sitemap
            </a>
          </div>
        </div>

        <div className="day:text-gray-400 mt-4 flex flex-col items-center justify-between gap-3 text-[11px] text-white/45 md:flex-row">
          <div className="flex flex-wrap items-center gap-2">
            <span className="day:text-gray-500 text-white/55">Partners:</span>
            <a
              href="https://www.bronze-plaque.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="day:hover:text-gray-700 cursor-pointer hover:text-white"
            >
              Bronze-Plaque.com
            </a>
            <span>•</span>
            <a
              href="https://headstonesdesigner.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="day:hover:text-gray-700 cursor-pointer hover:text-white"
            >
              HeadstonesDesigner.com
            </a>
            <span>•</span>
            <a
              href="https://www.forevershining.com.au/"
              target="_blank"
              rel="noopener noreferrer"
              className="day:hover:text-gray-700 cursor-pointer hover:text-white"
            >
              Forever Shining Australia
            </a>
          </div>
          <div className="day:text-gray-500 flex items-center gap-3 text-white/55">
            <span className="tracking-widest">VISA</span>
            <span className="tracking-widest">MC</span>
            <span className="tracking-widest">PayPal</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
