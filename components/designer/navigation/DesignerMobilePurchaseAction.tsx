interface DesignerMobilePurchaseActionProps {
  onPurchase: () => void;
}

export default function DesignerMobilePurchaseAction({
  onPurchase,
}: DesignerMobilePurchaseActionProps) {
  return (
    <button
      type="button"
      onClick={onPurchase}
      className="border-primary/40 bg-primary/10 hover:bg-primary/20 flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left text-base font-light text-white transition-colors lg:hidden"
    >
      <svg
        className="h-5 w-5 shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13 5.4 5M7 13l-2 2h13M9 19.5h.01M17 19.5h.01"
        />
      </svg>
      <span>Proceed to Purchase</span>
    </button>
  );
}
