import Link from 'next/link';
import { ArrowRightIcon, PhoneIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import { homeFaqItems } from '#/app/_internal/home-content';

export default function HomeFooterSections() {
  return (
    <>
      {/* FAQ SECTION */}
      <section
        id="faq"
        aria-labelledby="home-faq-heading"
        className="day:border-[#e2dad0] day:bg-[#f8f6f0] relative scroll-mt-24 border-t border-white/10 bg-[#0d0c0b] py-20"
      >
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="day:text-[#8a651f] text-xs font-semibold tracking-widest text-[#cfac6c] uppercase">
              Frequently Asked Questions
            </span>
            <h2
              id="home-faq-heading"
              className="day:text-[#1d1a17] mt-2 font-serif text-3xl font-normal text-white sm:text-4xl lg:text-5xl"
            >
              Questions About Designing a Memorial
            </h2>
            <p className="day:text-[#625a51] mx-auto mt-4 max-w-2xl text-base leading-relaxed text-white/70">
              Clear answers about cemetery regulations, granite durability, saving your 3D draft, and ordering.
            </p>
          </div>

          <div className="mt-12 space-y-3">
            {homeFaqItems.map((item, index) => (
              <details
                key={item.question}
                open={index === 0}
                className="group day:border-[#e4ddd2] day:bg-white overflow-hidden rounded-sm border border-white/10 bg-[#141311] transition-colors"
              >
                <summary className="day:hover:bg-[#fbf9f5] day:text-[#1d1a17] flex cursor-pointer list-none items-center justify-between gap-4 p-5 text-left font-serif text-lg font-medium text-white transition-colors focus-visible:outline-2 focus-visible:outline-[#cfac6c] sm:text-xl [&::-webkit-details-marker]:hidden">
                  <span>{item.question}</span>
                  <span className="day:text-[#8a651f] ml-2 text-xl font-light text-[#cfac6c] transition-transform duration-200 group-open:rotate-45">
                    +
                  </span>
                </summary>
                <div className="day:border-[#eee7dc] border-t border-white/10 px-5 pt-3 pb-5">
                  <p className="day:text-[#625a51] text-base leading-relaxed text-white/70">
                    {item.answer}
                  </p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CONSULTATION CTA BANNER */}
      <section className="day:border-[#e2dad0] day:bg-[#ede7dc] border-t border-white/10 bg-[#161513] py-14">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <span className="day:text-[#8a651f] text-xs font-semibold tracking-widest text-[#cfac6c] uppercase">
            Need Guidance or Cemetery Bylaw Advice?
          </span>
          <h2 className="day:text-[#1d1a17] mt-2 font-serif text-2xl font-normal text-white sm:text-3xl lg:text-4xl">
            Speak with an Experienced Memorial Consultant
          </h2>
          <p className="day:text-[#625a51] mx-auto mt-3 max-w-2xl text-base text-white/70">
            We provide compassionate assistance, help verify difficult cemetery bylaws, and prepare custom technical architectural proofs at no obligation.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6 text-sm">
            <a
              href="tel:+16473880931"
              className="day:text-[#1d1a17] flex items-center gap-2 font-medium text-white transition-colors hover:text-[#cfac6c]"
            >
              <PhoneIcon className="day:text-[#8a651f] size-4 text-[#cfac6c]" />
              <span>North America: (+1) 647 388 0931</span>
            </a>
            <span className="hidden sm:inline text-white/30 day:text-[#b8ad9e]">·</span>
            <a
              href="tel:+61861910396"
              className="day:text-[#1d1a17] flex items-center gap-2 font-medium text-white transition-colors hover:text-[#cfac6c]"
            >
              <PhoneIcon className="day:text-[#8a651f] size-4 text-[#cfac6c]" />
              <span>Australia & UK: +61 8 6191 0396</span>
            </a>
            <span className="hidden sm:inline text-white/30 day:text-[#b8ad9e]">·</span>
            <a
              href="mailto:admin@forevershining.com.au"
              className="day:text-[#1d1a17] flex items-center gap-2 font-medium text-white transition-colors hover:text-[#cfac6c]"
            >
              <EnvelopeIcon className="day:text-[#8a651f] size-4 text-[#cfac6c]" />
              <span>admin@forevershining.com.au</span>
            </a>
          </div>

          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/select-product"
              prefetch={false}
              className="day:bg-[#1d1a17] day:text-white day:hover:bg-[#342e26] inline-flex min-h-12 items-center justify-center gap-2 rounded-sm bg-[#cfac6c] px-8 py-3 text-sm font-semibold text-[#181611] transition-colors hover:bg-[#e2c688]"
            >
              <span>Start Designing in 3D</span>
              <ArrowRightIcon className="size-4" />
            </Link>
            <Link
              href="/designs"
              className="day:border-[#b8ad9e] day:text-[#1d1a17] day:hover:bg-[#dfd7c9] inline-flex min-h-12 items-center justify-center rounded-sm border border-white/20 bg-transparent px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-white/5"
            >
              Browse Ready Designs
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
