import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { getTelegramUser } from './utils/telegram'
import { useEffect, useState } from 'react'
import { supabase } from './utils/supabase'
import NavBar from './components/NavBar'
import NavBarAdmin from './components/NavBarAdmin'
import Home from './pages/Home'
import OrderForm from './pages/OrderForm'
import MyOrders from './pages/MyOrders'
import OrderDetail from './pages/OrderDetail'
import Finance from './pages/Finance'
import Admin from './pages/Admin'
import AdminSettings from './pages/AdminSettings'
import AdminClients from './pages/AdminClients'
import AdminClientDetail from './pages/AdminClientDetail'
import Register from './pages/Register'
import ProfileSettings from './pages/ProfileSettings'

const ADMIN_TG_ID = '7675680438'

function App() {
  const user = getTelegramUser()
  const isAdmin = user ? String(user.id) === ADMIN_TG_ID : false
  const [registered, setRegistered] = useState<boolean | null>(null)

  useEffect(() => {
    if (isAdmin) {
      setRegistered(true)
      return
    }
    const checkProfile = async () => {
      const tg_user_id = user ? String(user.id) : 'anonymous'
      const { data } = await supabase.from('profiles').select('tg_user_id').eq('tg_user_id', tg_user_id).single()
      setRegistered(!!data)
    }
    checkProfile()
  }, [])

  if (registered === null) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#F5F0E8' }}>
      <p style={{ color: '#8A7F6E' }}>Загружаем...</p>
    </div>
  )

  if (!registered) return <Register onComplete={() => setRegistered(true)} />

  return (
    <BrowserRouter>
      <div style={{ paddingBottom: '80px' }}>
        <Routes>
          {isAdmin ? (
            <>
              <Route path="/" element={<Admin />} />
              <Route path="/admin/done" element={<Admin />} />
              <Route path="/admin/clients" element={<AdminClients />} />
              <Route path="/admin/clients/:userId" element={<AdminClientDetail />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
            </>
          ) : (
            <>
              <Route path="/" element={<Home />} />
              <Route path="/order" element={<OrderForm />} />
              <Route path="/orders" element={<MyOrders />} />
              <Route path="/orders/:id" element={<OrderDetail />} />
              <Route path="/finance" element={<Finance />} />
              <Route path="/settings" element={<ProfileSettings />} />
            </>
          )}
        </Routes>
      </div>
      {isAdmin ? <NavBarAdmin /> : <NavBar />}
    </BrowserRouter>
  )
}

export default App
