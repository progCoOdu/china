import { BrowserRouter, Routes, Route } from 'react-router-dom'
import OrderForm from './pages/OrderForm'
import MyOrders from './pages/MyOrders'
import Admin from './pages/Admin'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<OrderForm />} />
        <Route path="/orders" element={<MyOrders />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
