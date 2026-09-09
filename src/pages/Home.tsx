import { useEffect, useState } from 'react'
import { supabase } from '../utils/supabase'
import { getTelegramUser } from '../utils/telegram'
import { Order } from '../types'
import { useNavigate } from 'react-router-dom'

export default function Home() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const user = getTelegramUser()

  useEffect(() => {
    const fetchOrders = async () => {
      const tg_user_id = user ? String(user.id) : 'anonymous'
      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('tg_user_id', tg_user_id)
        .in('status', ['new', 'in_progress'])
        .order('created_at', { ascending: false })
      setOrders(data ?? [])
      setLoading(false)
    }
    fetchOrders()
  }, [])

  const statusLabel: Record<string, string> = {
    new: '🆕 Новая',
    in_progress: '⚙️ В работе',
    done: '✅ Готово',
  }

  return (
    <div style={{ padding: '24px 20px', minHeight: '100vh', background: '#F5F0E8' }}>
      <p style={{ fontSize: '14px', color: '#8A7F6E', marginBottom: '4px' }}>co.odu</p>
      <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '28px' }}>
        Привет, {user?.first_name ?? 'друг'} 👋
      </h1>

      <div style={cardStyle}>
        <p style={cardLabelStyle}>Активных заказов</p>
        <p style={{ fontSize: '36px', fontWeight: 700 }}>{loading ? '...' : orders.length}</p>
      </div>

      {!loading && orders.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <p style={{ fontSize: '13px', color: '#8A7F6E', marginBottom: '10px' }}>Статусы</p>
          {orders.map(order => (
            <div key={order.id} style={orderRowStyle}>
              <span style={{ fontSize: '13px', color: '#3A3A3A', flex: 1 }} >
                {order.link.length > 30 ? order.link.slice(0, 30) + '...' : order.link}
              </span>
              <span style={{ fontSize: '12px', color: '#8A7F6E' }}>
                {statusLabel[order.status]}
              </span>
            </div>
          ))}
        </div>
      )}

      <div style={{ ...cardStyle, background: '#1A1A1A' }}>
        <p style={{ ...cardLabelStyle, color: '#8A8A8A' }}>Долг</p>
        <p style={{ fontSize: '28px', fontWeight: 700, color: '#F5F0E8' }}>—</p>
        <p style={{ fontSize: '12px', color: '#8A8A8A', marginTop: '4px' }}>Появится в v1.2</p>
      </div>

      <button onClick={() => navigate('/order')} style={buttonStyle}>
        + Новый заказ
      </button>
    </div>
  )
}

const cardStyle: React.CSSProperties = {
  background: '#EDE5D0',
  borderRadius: '16px',
  padding: '20px',
  marginBottom: '16px',
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
