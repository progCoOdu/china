import { BrowserRouter, Routes, Route } from 'react-router-dom'
import NavBar from './components/NavBar'
import Home from './pages/Home'
import OrderForm from './pages/OrderForm'
import MyOrders from './pages/MyOrders'
import Finance from './pages/Finance'
import Admin from './pages/Admin'

function App() {
  return (
    <BrowserRouter>
      <div style={{ paddingBottom: '80px' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/order" element={<OrderForm />} />
          <Route path="/orders" element={<MyOrders />} />
          <Route path="/finance" element={<Finance />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </div>
      <NavBar />
    </BrowserRouter>
  )
}

export default App
