import Link from 'next/link';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { homeFaqItems } from '#/app/_internal/home-content';

export default function HomeFooterSections() {
  return (
    <>
      <section className="relative overflow-hidden bg-[#eee9df] py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
            <div className="max-w-xl">
              <p className="text-xs font-semibold tracking-[0.12em] text-[#7b5a20]">
                A clear design process
              </p>
              <h2 className="mt-4 font-serif text-3xl leading-[1.16] text-pretty text-[#1d1a17] sm:text-5xl">
                How to Design Your Memorial Online
              </h2>
              <p className="mt-3 text-base leading-7 text-[#625a51]">
                Work through each decision at your own pace. The 3D preview
                updates as you choose the product, dimensions, wording, and
                personal details.
              </p>
              <Link
                href="/select-product"
                prefetch={false}
                className="mt-7 inline-flex min-h-11 w-fit items-center gap-2 rounded-sm bg-[#1d1a17] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#3a332c]"
              >
                Choose a memorial product
                <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>

            <ol className="grid border-t border-[#bdb4a6] sm:grid-cols-3 sm:border-l">
              {[
                {
                  title: 'Choose the memorial',
                  description:
                    'Compare headstones, plaques, monuments, urns, and pet memorials before opening the designer.',
                },
                {
                  title: 'Personalize the details',
                  description:
                    'Select the shape, material, size, inscription, portrait, motifs, and available accessories.',
                },
                {
                  title: 'Review before ordering',
                  description:
                    'Check the 3D preview and pricing, then save or share the proof with family before moving forward.',
                },
              ].map((step, index) => (
                <li
                  key={step.title}
                  className="border-r border-b border-[#bdb4a6] p-6 sm:min-h-64"
                >
                  <span
                    className="font-serif text-4xl text-[#9a742f]"
                    aria-hidden="true"
                  >
                    0{index + 1}
                  </span>
                  <h3 className="mt-4 text-base font-semibold text-[#1d1a17]">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[#625a51]">
                    {step.description}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>
      <section
        id="faq"
        aria-labelledby="home-faq-heading"
        className="day:border-stone-200 day:bg-[#f7f4ee] relative scroll-mt-24 border-t border-white/10 bg-[#11100e] py-20"
      >
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <div className="text-center">
            <p className="day:text-amber-800 text-xs font-semibold tracking-[0.12em] text-[#d0ad68]">
              Memorial design questions
            </p>
            <h2
              id="home-faq-heading"
              className="day:text-stone-900 mt-4 font-serif text-3xl leading-[1.16] text-pretty text-white sm:text-5xl"
            >
              Frequently Asked Questions About Designing a Memorial
            </h2>
            <p className="day:text-gray-600 mx-auto mt-4 max-w-2xl text-base leading-7 text-gray-300">
              Practical answers about personalisation, cemetery requirements,
              saving a design, and ordering from your region.
            </p>
          </div>

          <div className="mt-9 space-y-3">
            {homeFaqItems.map((item, index) => (
              <details
                key={item.question}
                open={index === 0}
                className="group day:border-stone-200 day:bg-white border-b border-white/15 bg-transparent px-4 py-5 first:border-t sm:px-5"
              >
                <summary className="day:text-gray-900 flex cursor-pointer list-none items-center justify-between gap-4 text-left text-base font-semibold text-white marker:content-none">
                  {item.question}
                  <span
                    className="text-xl leading-none text-[#cfac6c] transition-transform group-open:rotate-45"
                    aria-hidden="true"
                  >
                    +
                  </span>
                </summary>
                <p className="day:text-gray-600 mt-3 max-w-3xl text-sm leading-6 text-gray-300">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>
      {/* Support CTA */}
      <section className="day:border-gray-200 day:bg-white relative overflow-hidden border-t border-white/10 bg-[#101010] py-10">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="day:text-amber-700 text-xs font-semibold tracking-[0.22em] text-[#cfac6c] uppercase">
                Need a hand?
              </p>
              <h2 className="day:text-gray-900 mt-2 font-serif text-2xl leading-tight text-white sm:text-3xl">
                Get Help Choosing a Headstone, Plaque, or Memorial
              </h2>
              <p className="day:text-gray-600 mt-2 text-sm leading-6 text-gray-300">
                We can help with choosing a memorial, materials, wording, and
                the next step when you are ready.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:items-center">
              <Link
                href="/contact"
                className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[#cfac6c] px-5 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-[#d7b979]"
              >
                Contact us
              </Link>
              <Link
                href="/designs"
                className="day:border-gray-300 day:text-gray-800 day:hover:bg-gray-50 inline-flex min-h-11 items-center justify-center rounded-lg border border-white/15 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:border-[#cfac6c]/60 hover:bg-white/5"
              >
                Browse Designs
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
