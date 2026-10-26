'use client';

import { useRef } from 'react';

export default function MobileSheetHandle({
  title,
  collapsed,
  onChange,
}: {
  title: string;
  collapsed: boolean;
  onChange: (collapsed: boolean) => void;
}) {
  const startY = useRef<number | null>(null);
  const dragged = useRef(false);
  return (
    <button
      type="button"
      aria-label={`${collapsed ? 'Expand' : 'Collapse'} ${title} panel`}
      aria-expanded={!collapsed}
      className="day:bg-[#f4f1eb] day:text-[#302719] flex h-[52px] w-full touch-none flex-col items-center justify-center gap-1 bg-[#1b1511] text-sm font-semibold text-white/85"
      onPointerDown={(event) => {
        startY.current = event.clientY;
        dragged.current = false;
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerUp={(event) => {
        const delta = event.clientY - (startY.current ?? event.clientY);
        dragged.current = Math.abs(delta) > 24;
        if (dragged.current) onChange(delta > 0);
        startY.current = null;
      }}
      onPointerCancel={() => {
        startY.current = null;
        dragged.current = false;
      }}
      onClick={() => {
        if (!dragged.current) onChange(!collapsed);
      }}
    >
      <span
        aria-hidden="true"
        className="day:bg-[#8c7657] h-1 w-10 rounded-full bg-white/35"
      />
      <span>
        {title}
        <span className="ml-2 text-xs font-normal opacity-70">
          {collapsed ? 'Edit' : 'Preview'}
        </span>
      </span>
    </button>
  );
}
