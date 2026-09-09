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

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <button onClick={() => navigate('/')} style={backButtonStyle}>← Назад</button>
        <h1>Мои заявки</h1>
      </div>

      {loading && <p>Загружаем...</p>}

      {!loading && orders.length === 0 && (
        <p style={{ opacity: 0.6 }}>Заявок пока нет</p>
      )}

      {orders.map(order => (
        <div key={order.id} style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', opacity: 0.5 }}>
              {new Date(order.created_at).toLocaleDateString('ru-RU')}
            </span>
            <span style={{ fontSize: '13px', fontWeight: 600 }}>
              {statusLabel[order.status] ?? order.status}
            </span>
          </div>
          <a href={order.link} target="_blank" rel="noreferrer" style={{ color: '#2563eb', wordBreak: 'break-all' }}>
            {order.link}
          </a>
          <p style={{ marginTop: '8px', opacity: 0.8 }}>{order.description}</p>
        </div>
      ))}
    </div>
  )
}

const backButtonStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  fontSize: '16px',
  cursor: 'pointer',
  padding: 0,
}

const cardStyle: React.CSSProperties = {
  padding: '16px',
  borderRadius: '12px',
  border: '1px solid #e5e7eb',
  marginBottom: '12px',
}
