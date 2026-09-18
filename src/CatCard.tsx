export type Cat = {
  id: number
  name: string
  breed: string
  image: string
}

const shell =
  'w-full max-w-xs overflow-hidden rounded-2xl bg-white shadow-[0_1px_2px_rgb(23_23_23/0.04),0_12px_32px_-16px_rgb(23_23_23/0.18)] ring-1 ring-neutral-950/5 dark:bg-neutral-900 dark:ring-white/10'

const bone = 'bg-neutral-100 motion-safe:animate-pulse dark:bg-neutral-800'

export function CatCardSkeleton() {
  return (
    <article aria-busy="true" className={shell}>
      <span className="sr-only">Loading cat</span>
      <div className={`aspect-[4/5] ${bone}`} />
      <div className="p-5">
        <div className={`h-7 w-28 rounded-md ${bone}`} />
        <div className={`mt-0.5 h-5 w-16 rounded-md ${bone}`} />
      </div>
    </article>
  )
}

export function CatCard({ cat }: { cat: Cat }) {
  return (
    <article className={shell}>
      <div className="aspect-[4/5] bg-neutral-100 dark:bg-neutral-800">
        <img
          src={cat.image}
          alt={`${cat.name}, a ${cat.breed} cat`}
          className="size-full object-cover"
        />
      </div>
      <div className="flex items-baseline justify-between gap-4 p-5">
        <div>
          <h1 className="text-xl font-semibold tracking-tight capitalize">{cat.name}</h1>
          <p className="mt-0.5 text-sm text-muted-foreground capitalize">{cat.breed}</p>
        </div>
        <span className="font-mono text-xs text-muted-foreground tabular-nums">#{cat.id}</span>
      </div>
    </article>
  )
}
