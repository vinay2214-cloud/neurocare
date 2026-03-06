export default function LoadingSkeleton({ rows = 3, className = '' }) {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="h-6 bg-nc-grey-pale rounded-xl2 mb-2" style={{ width: `${80 - i * 15}%` }} />
          <div className="h-4 bg-nc-grey-pale rounded-xl2" style={{ width: `${60 - i * 10}%` }} />
        </div>
      ))}
    </div>
  );
}
