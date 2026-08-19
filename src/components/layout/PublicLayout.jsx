import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'

// Shared chrome for every public-facing route in Section 3 of the build
// guide. Admin routes use AdminLayout instead (separate nav, auth-gated).
export default function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
