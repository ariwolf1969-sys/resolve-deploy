'use client'

import dynamic from 'next/dynamic'

const AppContainer = dynamic(
  () => import('@/components/app/app-container'),
  { ssr: false }
)

export default function Home() {
  return <AppContainer />
}
