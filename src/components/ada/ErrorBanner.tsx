interface ErrorBannerProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorBanner({
  message = 'Something went wrong. Please try again.',
  onRetry,
}: ErrorBannerProps) {
  return (
    <div className="mx-4 my-6 rounded-2xl bg-[#fff5f5] border border-[#f0d0d0] p-5 text-center">
      <p className="text-[#441316] text-sm font-medium mb-3">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="bg-[#441316] text-white text-sm font-medium px-5 py-2 rounded-full"
        >
          Retry
        </button>
      )}
    </div>
  );
}
