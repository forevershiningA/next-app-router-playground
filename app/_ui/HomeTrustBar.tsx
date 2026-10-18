'use client';

import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  ChatBubbleLeftRightIcon,
  ClipboardDocumentCheckIcon,
  CubeIcon,
  TruckIcon,
} from '@heroicons/react/24/outline';

const benefits = [
  {
    label: 'Carefully arranged delivery',
    icon: TruckIcon,
    description:
      'Delivery is planned around your memorial and its destination. For heavy headstones, freight may be arranged to a commercial address or local depot. We confirm delivery options and available installation support before production begins.',
  },
  {
    label: 'Cemetery approval guidance',
    icon: ClipboardDocumentCheckIcon,
    description:
      'Each cemetery has its own rules for dimensions, materials, and installation. Share its written requirements with our team so we can help you understand the options. Your cemetery must approve the final design and installation plan before you order.',
  },
  {
    label: 'Natural granite & bronze',
    icon: CubeIcon,
    description:
      'Explore natural granite memorials and bronze plaques in a range of styles and finishes. The material you choose affects the appearance, lettering, and available design details. Our team can help you compare options for your memorial and its setting.',
  },
  {
    label: 'Support at every step',
    icon: ChatBubbleLeftRightIcon,
    description:
      'You can contact our team for help choosing a product, personalizing the inscription, or understanding pricing. If you have already started, send us your design link or order reference. We can help you work through the details and decide on the next step at your own pace.',
  },
];

function TrustBenefit({ benefit }: { benefit: (typeof benefits)[number] }) {
  const tooltipId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [position, setPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const isOpen = position !== null;
  const Icon = benefit.icon;

  function cancelClose() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }

  function openTooltip() {
    cancelClose();
    const bounds = triggerRef.current?.getBoundingClientRect();
    if (!bounds) return;
    const width = Math.min(360, window.innerWidth - 24);
    setPosition({
      top: bounds.bottom + 8,
      left: Math.max(
        12,
        Math.min(
          bounds.left + bounds.width / 2 - width / 2,
          window.innerWidth - width - 12,
        ),
      ),
    });
  }

  function closeTooltip() {
    cancelClose();
    setPosition(null);
  }

  function scheduleClose() {
    cancelClose();
    closeTimer.current = setTimeout(() => setPosition(null), 120);
  }

  useEffect(
    () => () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    },
    [],
  );

  useLayoutEffect(() => {
    if (!isOpen) return;
    const trigger = triggerRef.current?.getBoundingClientRect();
    const tooltip = tooltipRef.current?.getBoundingClientRect();
    if (!trigger || !tooltip) return;
    const above = trigger.top - tooltip.height - 8;
    const top =
      above >= 12
        ? above
        : Math.max(
            12,
            Math.min(
              trigger.bottom + 8,
              window.innerHeight - tooltip.height - 12,
            ),
          );
    setPosition((current) =>
      current && current.top !== top ? { ...current, top } : current,
    );
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const close = () => setPosition(null);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    const onPointerDown = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !triggerRef.current?.contains(event.target) &&
        !tooltipRef.current?.contains(event.target)
      )
        close();
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('resize', close);
    const onScroll = (event: Event) => {
      if (
        event.target instanceof Node &&
        tooltipRef.current?.contains(event.target)
      )
        return;
      close();
    };
    window.addEventListener('scroll', onScroll, true);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('resize', close);
      window.removeEventListener('scroll', onScroll, true);
    };
  }, [isOpen]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-describedby={isOpen ? tooltipId : undefined}
        onPointerEnter={(event) => {
          if (event.pointerType === 'mouse') openTooltip();
        }}
        onPointerLeave={(event) => {
          if (event.pointerType === 'mouse') scheduleClose();
        }}
        onFocus={(event) => {
          if (event.currentTarget.matches(':focus-visible')) openTooltip();
        }}
        onBlur={closeTooltip}
        onClick={() => {
          if (isOpen) closeTooltip();
          else openTooltip();
        }}
        className="flex min-h-11 items-center gap-3 rounded-sm text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8a651f] lg:justify-center"
      >
        <Icon
          aria-hidden="true"
          className="h-5 w-5 shrink-0 text-[#8a651f]"
          strokeWidth={1.5}
        />
        <span className="text-sm leading-5 font-medium underline decoration-[#bdb4a6] decoration-dotted underline-offset-4">
          {benefit.label}
        </span>
      </button>
      {position &&
        createPortal(
          <div
            ref={tooltipRef}
            id={tooltipId}
            role="tooltip"
            onPointerEnter={cancelClose}
            onPointerLeave={(event) => {
              if (event.pointerType === 'mouse') scheduleClose();
            }}
            style={{ top: position.top, left: position.left }}
            className="day:border-stone-300 day:bg-[#f7f4ee] day:text-stone-900 fixed z-[10000] max-h-[calc(100dvh-24px)] w-[min(360px,calc(100vw-24px))] overflow-y-auto rounded-sm border border-[#cfac6c]/50 bg-[#1d1a17] p-4 text-left text-sm font-normal tracking-normal text-white normal-case shadow-xl"
          >
            <p className="mb-2 font-semibold">{benefit.label}</p>
            <p className="day:text-stone-600 leading-6 text-white/80">
              {benefit.description}
            </p>
          </div>,
          document.body,
        )}
    </>
  );
}

export default function HomeTrustBar() {
  return (
    <section
      aria-label="Our service and materials"
      className="border-b border-[#d8cdb9] bg-[#f7f4ee] text-[#514a43]"
    >
      <ul className="mx-auto grid max-w-7xl grid-cols-1 gap-x-6 gap-y-4 px-6 py-5 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
        {benefits.map((benefit) => (
          <li key={benefit.label} className="flex lg:justify-center">
            <TrustBenefit benefit={benefit} />
          </li>
        ))}
      </ul>
    </section>
  );
}
