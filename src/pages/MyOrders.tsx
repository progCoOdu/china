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
        .select('*, order_items(*)')
        .eq('tg_user_id', tg_user_id)
        .order('created_at', { ascending: false })

      setOrders(data ?? [])
      setLoading(false)
    }

    fetchOrders()
  }, [])

  const statusLabel: Record<string, string> = {
    new: '🆕 Новый',
    accepted: '✅ Принят',
    declined: '❌ Отклонён',
    ordered: '🛒 Заказан',
    warehouse: '📦 На складе',
    transit_msk: '🚚 В пути MSK',
    transit_msq: '🚚 В пути MSQ',
    arrived: '🏁 Прибыл',
    ready: '🎉 Готов к выдаче',
  }

  return (
    <div style={{ padding: '24px 20px', minHeight: '100vh', background: '#F5F0E8' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
        <button onClick={() => navigate('/')} style={backButtonStyle}>←</button>
        <h1 style={{ fontSize: '22px', fontWeight: 700 }}>Мои заявки</h1>
      </div>

      {loading && <p style={{ color: '#8A7F6E' }}>Загружаем...</p>}

      {!loading && orders.length === 0 && (
        <p style={{ color: '#8A7F6E' }}>Заявок пока нет</p>
      )}

      {orders.map(order => (
        <div
          key={order.id}
          style={{ ...cardStyle, cursor: 'pointer' }}
          onClick={() => navigate(`/orders/${order.id}`)}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '13px', color: '#8A7F6E' }}>
              {new Date(order.created_at).toLocaleDateString('ru-RU')}
            </span>
            <span style={{ fontSize: '13px', fontWeight: 600 }}>
              {statusLabel[order.status] ?? order.status}
            </span>
          </div>
          <p style={{ fontSize: '13px', color: '#3A3A3A', marginBottom: '4px' }}>
            Товаров: {order.order_items?.length ?? 0}
          </p>
          {order.order_items?.slice(0, 2).map(item => (
            <p key={item.id} style={{ fontSize: '12px', color: '#8A7F6E' }}>
              — {item.name ?? item.link.slice(0, 30)}
            </p>
          ))}
          {(order.order_items?.length ?? 0) > 2 && (
            <p style={{ fontSize: '12px', color: '#8A7F6E' }}>
              и ещё {(order.order_items?.length ?? 0) - 2} товар(а)
            </p>
          )}
          <p style={{ fontSize: '12px', color: '#8A7F6E', marginTop: '8px', textAlign: 'right' }}>
            Открыть →
          </p>
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
}

const cardStyle: React.CSSProperties = {
  padding: '16px',
  borderRadius: '14px',
  background: '#EDE5D0',
  marginBottom: '12px',
  border: '1px solid #D4C9B0',
}
