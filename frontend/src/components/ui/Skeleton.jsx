const Skeleton = ({ className }) => {
  return (
    <div className={`animate-pulse bg-slate-200 rounded-xl ${className}`}></div>
  );
};

export const StatCardSkeleton = () => (
  <div className="card-premium h-40 rounded-3xl p-6">
    <div className="flex justify-between items-start mb-4">
      <Skeleton className="h-10 w-10 rounded-2xl" />
      <Skeleton className="h-12 w-24" />
    </div>
    <Skeleton className="h-8 w-24 mb-3" />
    <Skeleton className="h-4 w-32" />
  </div>
);

export const ChartSkeleton = () => (
  <div className="card-premium h-96 rounded-3xl p-8">
    <div className="flex justify-between items-center mb-8">
      <div className="space-y-2">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-32" />
      </div>
      <Skeleton className="h-10 w-48 rounded-2xl" />
    </div>
    <Skeleton className="h-full w-full rounded-2xl" />
  </div>
);

export default Skeleton;
