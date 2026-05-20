'use client';

interface Props {
  orderId: string;
  cancelOrderAction: (formData: FormData) => Promise<void>;
}

export function CancelOrderButton({ orderId, cancelOrderAction }: Props) {
  return (
    <form action={cancelOrderAction}>
      <input type="hidden" name="orderId" value={orderId} />
      <button
        type="submit"
        onClick={(e) => { if (!confirm('Cancel this order?')) e.preventDefault(); }}
        className="rounded border border-red-300 bg-white px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:bg-gray-800 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
      >
        Cancel Order
      </button>
    </form>
  );
}
