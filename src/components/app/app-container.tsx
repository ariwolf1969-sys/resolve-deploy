'use client'

import { useEffect, useSyncExternalStore } from 'react'
import { useAppStore, AppView } from '@/store/app-store'

function useHasMounted() {
  return useSyncExternalStore(
    (cb) => { cb(); return () => {} },
    () => true,
    () => false
  )
}
import SplashScreen from './splash-screen'
import HomeScreen from './home-screen'
import ProfileScreen from './profile-screen'
import EditProfileScreen from './edit-profile-screen'
import ProProfileScreen from './pro-profile-screen'
import RegisterProScreen from './register-pro-screen'
import ProductsScreen from './products-screen'
import QuotesScreen from './quotes-screen'
import CreateQuoteScreen from './create-quote-screen'
import QuoteDetailScreen from './quote-detail-screen'
import PaymentsScreen from './payments-screen'
import ChatListScreen from './chat-list-screen'
import ChatScreen from './chat-screen'
import SearchOverlay from './search-overlay'

export default function AppContainer() {
  const { currentView, token, viewParams } = useAppStore()
  const mounted = useHasMounted()

  // Validate token on mount
  useEffect(() => {
    if (!mounted) return
    let cancelled = false
    const validateToken = async () => {
      if (token && currentView === 'splash') {
        try {
          const res = await fetch('/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` },
          })
          if (res.ok && !cancelled) {
            const user = await res.json()
            useAppStore.getState().setUser(user)
            useAppStore.getState().setView('home')
          } else if (!res.ok && !cancelled) {
            useAppStore.getState().logout()
          }
        } catch {
          // Stay on splash screen
        }
      }
    }
    validateToken()
    return () => { cancelled = true }
  }, [mounted, token, currentView])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-blue-600">Resolvé</h1>
          <p className="text-sm text-gray-400 mt-2">Cargando...</p>
        </div>
      </div>
    )
  }

  const renderView = () => {
    switch (currentView) {
      case 'splash':
        return <SplashScreen />
      case 'home':
        return <HomeScreen />
      case 'profile':
        return <ProfileScreen />
      case 'edit-profile':
        return <EditProfileScreen />
      case 'pro-profile':
        return <ProProfileScreen proId={viewParams.proId as string} />
      case 'register-pro':
        return <RegisterProScreen />
      case 'products':
        return <ProductsScreen />
      case 'quotes':
        return <QuotesScreen />
      case 'create-quote':
        return <CreateQuoteScreen />
      case 'quote-detail':
        return <QuoteDetailScreen quoteId={viewParams.quoteId as string} />
      case 'payments':
        return <PaymentsScreen />
      case 'chat-list':
        return <ChatListScreen />
      case 'chat':
        return <ChatScreen threadId={viewParams.threadId as string} />
      case 'search':
        return <SearchOverlay initialProfession={viewParams.profession as string} />
      default:
        return <HomeScreen />
    }
  }

  return <>{renderView()}</>
}
