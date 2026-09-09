import { useEffect, useState } from 'react'
import { supabase } from '../utils/supabase'
import { getTelegramUser } from '../utils/telegram'
import { Order } from '../types'

const ADMIN_TG_ID = '7675680438'

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

  if (loading) return <div style={{ padding: '24px', background: '#F5F0E8', minHeight: '100vh' }}>Загружаем...</div>

  if (!allowed) return <div style={{ padding: '24px', background: '#F5F0E8', minHeight: '100vh' }}>⛔ Доступ запрещён</div>

  return (
    <div style={{ padding: '24px', minHeight: '100vh', background: '#F5F0E8' }}>
      <h1 style={{ marginBottom: '4px', fontSize: '22px', fontWeight: 700 }}>Админ панель</h1>
      <p style={{ marginBottom: '28px', color: '#8A7F6E', fontSize: '14px' }}>co.odu — заявки из Китая</p>

      {orders.length === 0 && <p style={{ color: '#8A7F6E' }}>Заявок пока нет</p>}

      {orders.map(order => (
        <div key={order.id} style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontWeight: 600, fontSize: '14px' }}>
              {order.tg_first_name ?? 'Аноним'} {order.tg_username ? `@${order.tg_username}` : ''}
            </span>
            <span style={{ fontSize: '13px', color: '#8A7F6E' }}>
              {new Date(order.created_at).toLocaleDateString('ru-RU')}
            </span>
          </div>

          <a href={order.link} target="_blank" rel="noreferrer" style={{ color: '#1A1A1A', wordBreak: 'break-all', fontSize: '14px' }}>
            {order.link}
          </a>

          <p style={{ marginTop: '8px', marginBottom: '14px', color: '#3A3A3A', fontSize: '14px' }}>{order.description}</p>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['new', 'in_progress', 'done'].map(s => (
              <button
                key={s}
                onClick={() => updateStatus(order.id, s)}
                style={{
                  ...statusButtonStyle,
                  background: order.status === s ? '#1A1A1A' : '#F5F0E8',
                  color: order.status === s ? '#F5F0E8' : '#1A1A1A',
                  border: `1px solid ${order.status === s ? '#1A1A1A' : '#D4C9B0'}`,
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
  borderRadius: '14px',
  background: '#EDE5D0',
  marginBottom: '12px',
  border: '1px solid #D4C9B0',
}

const statusButtonStyle: React.CSSProperties = {
  padding: '8px 12px',
  borderRadius: '8px',
  fontSize: '13px',
  cursor: 'pointer',
  fontWeight: 500,
}
