function LoadingSpinner() {
  return (
    <div className="flex items-center gap-2">
      <div className="w-4 h-4 border-2 border-current border-t-transparent animate-spin rounded-full" />
      <span>Processing...</span>
    </div>
  );
}

export default LoadingSpinner;
