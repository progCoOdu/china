import { useEffect, useState } from 'react'
import { supabase } from '../utils/supabase'
import { getTelegramUser } from '../utils/telegram'
import { Order } from '../types'
import { useNavigate } from 'react-router-dom'

export default function MyOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchOrders = async () => {
      const user = getTelegramUser()
      const tg_user_id = user ? String(user.id) : 'anonymous'

      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('tg_user_id', tg_user_id)
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

  const statusColor: Record<string, string> = {
    new: '#8A7F6E',
    in_progress: '#C8A96E',
    done: '#5A7A5A',
  }

  return (
    <div style={{ padding: '24px', minHeight: '100vh', background: '#F5F0E8' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
        <button onClick={() => navigate('/')} style={backButtonStyle}>←</button>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700 }}>Мои заявки</h1>
        </div>
      </div>

      {loading && <p style={{ color: '#8A7F6E' }}>Загружаем...</p>}

      {!loading && orders.length === 0 && (
        <p style={{ color: '#8A7F6E' }}>Заявок пока нет</p>
      )}

      {orders.map(order => (
        <div key={order.id} style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '13px', color: '#8A7F6E' }}>
              {new Date(order.created_at).toLocaleDateString('ru-RU')}
            </span>
            <span style={{ fontSize: '13px', fontWeight: 600, color: statusColor[order.status] ?? '#8A7F6E' }}>
              {statusLabel[order.status] ?? order.status}
            </span>
          </div>
          <a href={order.link} target="_blank" rel="noreferrer" style={{ color: '#1A1A1A', wordBreak: 'break-all', fontSize: '14px' }}>
            {order.link}
          </a>
          <p style={{ marginTop: '8px', color: '#3A3A3A', fontSize: '14px' }}>{order.description}</p>
        </div>
      ))}
    </div>
  )
}

const backButtonStyle: React.CSSProperties = {
  background: '#EDE5D0',
  border: 'none',
  fontSize: '18px',
  cursor: 'pointer',
  width: '36px',
  height: '36px',
  borderRadius: '10px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}

const cardStyle: React.CSSProperties = {
  padding: '16px',
  borderRadius: '14px',
  background: '#EDE5D0',
  marginBottom: '12px',
  border: '1px solid #D4C9B0',
}
