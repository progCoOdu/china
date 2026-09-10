import { useEffect, useState } from 'react'
import { supabase } from '../utils/supabase'
import { getTelegramUser } from '../utils/telegram'
import { Order } from '../types'
import { useNavigate } from 'react-router-dom'

export default function Home() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [exchangeRate, setExchangeRate] = useState<number>(0.5)
  const [deliveryRate, setDeliveryRate] = useState<number>(25)
  const navigate = useNavigate()
  const user = getTelegramUser()

  useEffect(() => {
    const fetchData = async () => {
      const tg_user_id = user ? String(user.id) : 'anonymous'

      const [ordersRes, settingsRes] = await Promise.all([
        supabase.from('orders').select('*, order_items(*)').eq('tg_user_id', tg_user_id).not('status', 'in', '("declined","ready")').order('created_at', { ascending: false }),
        supabase.from('settings').select('*'),
      ])

      if (settingsRes.data) {
        const rate = settingsRes.data.find(s => s.id === 'exchange_rate')
        const delivery = settingsRes.data.find(s => s.id === 'delivery_rate')
        setExchangeRate(rate?.value ?? 0.5)
        setDeliveryRate(delivery?.value ?? 25)
      }

      setOrders(ordersRes.data ?? [])
      setLoading(false)
    }
    fetchData()
  }, [])

  const calcGoods = (order: Order) => {
    const items = order.order_items ?? []
    return items.reduce((sum, item) => sum + (item.price_cny ?? 0) * exchangeRate, 0)
  }

  const calcDelivery = (order: Order) => {
    const items = order.order_items ?? []
    const hasWeight = items.some(item => item.weight_kg !== null && item.weight_kg !== undefined)
    if (!hasWeight) return 0
    return items.reduce((sum, item) => sum + (item.weight_kg ?? 0) * deliveryRate, 0)
  }

  const totalByn = orders.reduce((sum, o) => sum + calcGoods(o) + calcDelivery(o), 0)
  const totalPaid = orders.reduce((sum, o) => sum + (o.amount_paid ?? 0), 0)
  const debt = totalByn - totalPaid

  const statusLabel: Record<string, string> = {
    new: '🆕 Новый',
    accepted: '✅ Принят',
    ordered: '🛒 Заказан',
    warehouse: '📦 На складе',
    transit_msk: '🚚 В пути MSK',
    transit_msq: '🚚 В пути MSQ',
    arrived: '🏁 Прибыл',
    ready: '🎉 Готов к выдаче',
  }

  return (
    <div style={{ padding: '24px 20px', minHeight: '100vh', background: '#F5F0E8' }}>
      <p style={{ fontSize: '14px', color: '#8A7F6E', marginBottom: '4px' }}>co.odu</p>
      <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '28px' }}>
        Привет, {user?.first_name ?? 'друг'} 👋
      </h1>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
        <div style={cardStyle}>
          <p style={cardLabelStyle}>Активных заказов</p>
          <p style={{ fontSize: '36px', fontWeight: 700 }}>{loading ? '...' : orders.length}</p>
        </div>
        <div style={{ ...cardStyle, background: debt > 0 ? '#1A1A1A' : '#EDE5D0' }}>
          <p style={{ ...cardLabelStyle, color: debt > 0 ? '#8A8A8A' : '#8A7F6E' }}>Долг</p>
          <p style={{ fontSize: '24px', fontWeight: 700, color: debt > 0 ? '#F5F0E8' : '#1A1A1A' }}>
            {loading ? '...' : `${debt.toFixed(2)}`}
          </p>
          <p style={{ fontSize: '11px', color: debt > 0 ? '#8A8A8A' : '#8A7F6E' }}>BYN</p>
        </div>
      </div>

      {!loading && orders.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <p style={{ fontSize: '13px', color: '#8A7F6E', marginBottom: '10px' }}>Статусы</p>
          {orders.map(order => (
            <div key={order.id} style={orderRowStyle} onClick={() => navigate(`/orders/${order.id}`)}>
              <span style={{ fontSize: '13px', color: '#3A3A3A' }}>
                {order.order_items?.length ?? 0} товар(а) · {new Date(order.created_at).toLocaleDateString('ru-RU')}
              </span>
              <span style={{ fontSize: '12px', color: '#8A7F6E' }}>
                {statusLabel[order.status] ?? order.status}
              </span>
            </div>
          ))}
        </div>
      )}

      <button onClick={() => navigate('/order')} style={buttonStyle}>
        + Новый заказ
      </button>
    </div>
  )
}

const cardStyle: React.CSSProperties = {
  flex: 1,
  background: '#EDE5D0',
  borderRadius: '16px',
  padding: '20px',
  border: '1px solid #D4C9B0',
}

const cardLabelStyle: React.CSSProperties = {
  fontSize: '13px',
  color: '#8A7F6E',
  marginBottom: '8px',
}

const orderRowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '10px 14px',
  background: '#EDE5D0',
  borderRadius: '10px',
  marginBottom: '8px',
  border: '1px solid #D4C9B0',
  cursor: 'pointer',
}

const buttonStyle: React.CSSProperties = {
  width: '100%',
  padding: '16px',
  borderRadius: '12px',
  border: 'none',
  background: '#1A1A1A',
  color: '#F5F0E8',
  fontSize: '16px',
  fontWeight: 600,
  cursor: 'pointer',
  marginTop: '8px',
  boxSizing: 'border-box',
}
