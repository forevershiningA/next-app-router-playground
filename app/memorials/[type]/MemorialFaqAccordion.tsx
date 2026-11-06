'use client';

import { useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import type { CategoryFaq } from '#/lib/memorial-category-details';

export default function MemorialFaqAccordion({ faqs }: { faqs: CategoryFaq[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="space-y-3">
      {faqs.map((faq, index) => {
        const isOpen = openIndex === index;
        return (
          <div
            key={faq.question}
            className="day:border-[#e4ddd2] day:bg-white overflow-hidden rounded-sm border border-white/10 bg-[#141311] transition-colors"
          >
            <button
              type="button"
              onClick={() => toggle(index)}
              className="day:hover:bg-[#fbf9f5] flex w-full items-center justify-between gap-4 p-5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-[#cfac6c]"
              aria-expanded={isOpen}
            >
              <span className="day:text-[#1d1a17] font-serif text-lg font-medium text-white sm:text-xl">
                {faq.question}
              </span>
              <ChevronDownIcon
                className={`day:text-[#8a651f] size-5 shrink-0 text-[#cfac6c] transition-transform duration-200 ${
                  isOpen ? 'rotate-180' : ''
                }`}
                aria-hidden="true"
              />
            </button>
            {isOpen && (
              <div className="day:border-[#eee7dc] border-t border-white/10 px-5 pt-3 pb-5">
                <p className="day:text-[#625a51] text-base leading-7 text-gray-300">
                  {faq.answer}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
