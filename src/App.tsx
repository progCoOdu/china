import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { getTelegramUser } from './utils/telegram'
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
            </>
          )}
        </Routes>
      </div>
      {isAdmin ? <NavBarAdmin /> : <NavBar />}
    </BrowserRouter>
  )
}

export default Appг
