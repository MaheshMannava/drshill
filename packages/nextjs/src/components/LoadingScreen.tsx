export function LoadingScreen() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-[#1E3A8A] via-[#1E40AF] to-[#F97316]">
      <div className="relative w-48 h-48 animate-pulse">
        <img
          src="/images/tempo-image-20250211T150855775Z.png"
          alt="Dr. Shill Logo"
          className="w-full h-full object-contain"
        />
      </div>
    </div>
  );
}
