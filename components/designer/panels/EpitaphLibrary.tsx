'use client';

import { useId, useState } from 'react';
import { BookOpenIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { EPITAPH_CATEGORIES } from '#/lib/epitaphs';
import { DesignerOptionButton } from '#/components/designer/ui/DesignerControl';

type CategoryId = (typeof EPITAPH_CATEGORIES)[number]['id'];

export default function EpitaphLibrary({
  value,
  onInsert,
}: {
  value: string;
  onInsert: (text: string) => void;
}) {
  const contentId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const [categoryId, setCategoryId] = useState<CategoryId>('short');
  const [pendingText, setPendingText] = useState<string | null>(null);
  const category = EPITAPH_CATEGORIES.find((item) => item.id === categoryId)!;
  const optionClass = 'rounded-md px-3 py-1.5 text-xs font-semibold';

  const insert = (text: string) => {
    onInsert(text);
    setPendingText(null);
    setIsOpen(false);
  };

  return (
    <div className="mt-3">
      <DesignerOptionButton
        selected={isOpen}
        aria-expanded={isOpen}
        aria-controls={contentId}
        onClick={() => {
          setIsOpen(!isOpen);
          setPendingText(null);
        }}
        className="flex w-full items-center justify-between gap-2 rounded-lg px-3.5 py-2.5 text-xs font-semibold"
      >
        <span className="flex items-center gap-2">
          <BookOpenIcon className="h-4 w-4" aria-hidden="true" />
          Browse epitaphs
        </span>
        <ChevronDownIcon
          className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </DesignerOptionButton>

      {isOpen && (
        <div id={contentId} className="mt-3 space-y-3">
          <div
            role="group"
            aria-label="Epitaph categories"
            className="flex flex-wrap gap-2"
          >
            {EPITAPH_CATEGORIES.map((item) => (
              <DesignerOptionButton
                key={item.id}
                selected={categoryId === item.id}
                variant="solid"
                onClick={() => {
                  setCategoryId(item.id);
                  setPendingText(null);
                }}
                className={optionClass}
              >
                {item.label}
              </DesignerOptionButton>
            ))}
          </div>
          <ul
            aria-label={`${category.label} epitaphs`}
            className="max-h-72 space-y-2.5 overflow-y-auto overscroll-contain pr-1 custom-scrollbar"
          >
            {category.texts.map((text) => (
              <li
                key={text}
                className="rounded-xl border border-white/10 bg-white/[0.04] p-3.5 day:border-[#dfd7ca] day:bg-white day:shadow-sm"
              >
                <p className="font-serif text-sm leading-relaxed text-white day:text-[#1a1714]">
                  {text}
                </p>
                {pendingText === text ? (
                  <div
                    role="group"
                    aria-label="Insert epitaph"
                    className="mt-2.5 space-y-2 border-t border-white/10 pt-2.5 day:border-[#dfd7ca]"
                  >
                    <p className="font-sans text-xs text-stone-300 day:text-[#6a6156]">
                      Your text field already contains text.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <DesignerOptionButton
                        selected={false}
                        variant="solid"
                        className={optionClass}
                        onClick={() => insert(text)}
                      >
                        Replace
                      </DesignerOptionButton>
                      <DesignerOptionButton
                        selected={false}
                        className={optionClass}
                        onClick={() =>
                          insert(
                            value.trim()
                              ? `${value.trimEnd()}\n\n${text}`
                              : text,
                          )
                        }
                      >
                        Append
                      </DesignerOptionButton>
                      <DesignerOptionButton
                        selected={false}
                        className={optionClass}
                        onClick={() => setPendingText(null)}
                      >
                        Cancel
                      </DesignerOptionButton>
                    </div>
                  </div>
                ) : (
                  <DesignerOptionButton
                    selected={false}
                    className={`${optionClass} mt-2.5`}
                    onClick={() =>
                      value.trim() ? setPendingText(text) : insert(text)
                    }
                  >
                    Use text
                  </DesignerOptionButton>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
