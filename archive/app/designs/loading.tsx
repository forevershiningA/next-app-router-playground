export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-4">
        <div className="h-16 w-16 animate-spin rounded-full border-[6px] border-gray-300 border-t-blue-600" />
        <div className="text-xl font-medium text-gray-700">Loading designs...</div>
      </div>
    </div>
  );
}
