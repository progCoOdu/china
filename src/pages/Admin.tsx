import { useEffect, useState } from 'react'
import { supabase } from '../utils/supabase'
import { getTelegramUser } from '../utils/telegram'
import { Order } from '../types'

const ADMIN_TG_ID = '7675680438' // сюда вставим твой ID

export default function Admin() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [allowed, setAllowed] = useState(false)

  useEffect(() => {
    const user = getTelegramUser()
    if (!user || String(user.id) !== ADMIN_TG_ID) {
      setLoading(false)
      return
    }
    setAllowed(true)
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })

    setOrders(data ?? [])
    setLoading(false)
  }

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('orders').update({ status }).eq('id', id)
    fetchOrders()
  }

  const statusLabel: Record<string, string> = {
    new: '🆕 Новая',
    in_progress: '⚙️ В работе',
    done: '✅ Готово',
  }

  if (loading) return <div style={{ padding: '24px' }}>Загружаем...</div>

  if (!allowed) return <div style={{ padding: '24px' }}>⛔ Доступ запрещён</div>

  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ marginBottom: '24px' }}>Админ панель</h1>

      {orders.length === 0 && <p style={{ opacity: 0.6 }}>Заявок пока нет</p>}

      {orders.map(order => (
        <div key={order.id} style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontWeight: 600 }}>
              {order.tg_first_name ?? 'Аноним'} {order.tg_username ? `@${order.tg_username}` : ''}
            </span>
            <span style={{ fontSize: '13px', opacity: 0.5 }}>
              {new Date(order.created_at).toLocaleDateString('ru-RU')}
            </span>
          </div>

          <a href={order.link} target="_blank" rel="noreferrer" style={{ color: '#2563eb', wordBreak: 'break-all' }}>
            {order.link}
          </a>

          <p style={{ marginTop: '8px', marginBottom: '12px', opacity: 0.8 }}>{order.description}</p>

          <div style={{ display: 'flex', gap: '8px' }}>
            {['new', 'in_progress', 'done'].map(s => (
              <button
                key={s}
                onClick={() => updateStatus(order.id, s)}
                style={{
                  ...statusButtonStyle,
                  background: order.status === s ? '#2563eb' : '#f3f4f6',
                  color: order.status === s ? '#fff' : '#000',
                }}
              >
                {statusLabel[s]}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

const cardStyle: React.CSSProperties = {
  padding: '16px',
  borderRadius: '12px',
  border: '1px solid #e5e7eb',
  marginBottom: '12px',
}

const statusButtonStyle: React.CSSProperties = {
  padding: '6px 10px',
  borderRadius: '8px',
  border: 'none',
  fontSize: '13px',
  cursor: 'pointer',
}
