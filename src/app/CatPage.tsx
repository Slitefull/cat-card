import { getRouteApi } from '@tanstack/react-router'
import { CatStack } from '@/features/cats/CatStack'

const route = getRouteApi('/')

export function CatPage() {
  return <CatStack initial={route.useLoaderData()} />
}
