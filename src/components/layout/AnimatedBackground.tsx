export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Blob 1 - Primary green */}
      <div className="animated-blob blob-1" />
      {/* Blob 2 - Mint/ash */}
      <div className="animated-blob blob-2" />
      {/* Blob 3 - Deep accent */}
      <div className="animated-blob blob-3" />
      {/* Blob 4 - Subtle green */}
      <div className="animated-blob blob-4" />
    </div>
  );
}
