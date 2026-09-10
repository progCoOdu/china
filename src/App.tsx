import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { getTelegramUser } from './utils/telegram'
import NavBar from './components/NavBar'
import NavBarAdmin from './components/NavBarAdmin'
import Home from './pages/Home'
import OrderForm from './pages/OrderForm'
import MyOrders from './pages/MyOrders'
import Finance from './pages/Finance'
import Admin from './pages/Admin'
import AdminSettings from './pages/AdminSettings'

const ADMIN_TG_ID = '7675680438'

function App() {
  const user = getTelegramUser()
  const isAdmin = user ? String(user.id) === ADMIN_TG_ID : false

  return (
    <BrowserRouter>
      <div style={{ paddingBottom: '80px' }}>
        <Routes>
          {isAdmin ? (
            <>
              <Route path="/" element={<Admin />} />
              <Route path="/admin/done" element={<Admin />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
            </>
          ) : (
            <>
              <Route path="/" element={<Home />} />
              <Route path="/order" element={<OrderForm />} />
              <Route path="/orders" element={<MyOrders />} />
              <Route path="/finance" element={<Finance />} />
            </>
          )}
        </Routes>
      </div>
      {isAdmin ? <NavBarAdmin /> : <NavBar />}
    </BrowserRouter>
  )
}

export default App
