import { Skeleton } from '@/components/ui/skeleton'

export default function CommitmentsLoading() {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-2">
          <Skeleton className="h-7 w-44" />
          <Skeleton className="h-4 w-28" />
        </div>
        <Skeleton className="h-9 w-40" />
      </div>

      <div className="flex gap-3 mb-6">
        <Skeleton className="h-9 flex-1 max-w-sm" />
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-9 w-36" />
      </div>

      {[1, 2, 3].map((s) => (
        <div key={s} className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Skeleton className="h-2.5 w-2.5 rounded-full" />
            <Skeleton className="h-4 w-28" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2].map((c) => (
              <Skeleton key={c} className="h-24 rounded-lg" />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
