import { useEffect, useState } from 'react'
import { supabase } from '../utils/supabase'
import { getTelegramUser } from '../utils/telegram'
import { Order } from '../types'

const ADMIN_TG_ID = '7675680438'

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
      .select('*, order_items(*)')
      .order('created_at', { ascending: false })
    setOrders(data ?? [])
    setLoading(false)
  }

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('orders').update({ status }).eq('id', id)
    fetchOrders()
  }

  if (loading) return <div style={{ padding: '24px', background: '#F5F0E8', minHeight: '100vh' }}>Загружаем...</div>
  if (!allowed) return <div style={{ padding: '24px', background: '#F5F0E8', minHeight: '100vh' }}>⛔ Доступ запрещён</div>

    return (
    <div style={{ padding: '24px 20px', minHeight: '100vh', background: '#F5F0E8' }}>
      <p style={{ fontSize: '14px', color: '#8A7F6E', marginBottom: '4px' }}>co.odu</p>
      <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '28px' }}>Админ панель</h1>

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

          <p style={{ fontSize: '13px', color: '#8A7F6E', marginBottom: '10px' }}>
            Товаров: {order.order_items?.length ?? 0}
          </p>

          {order.order_items?.map(item => (
            <div key={item.id} style={itemStyle}>
              <a href={item.link} target="_blank" rel="noreferrer" style={{ color: '#1A1A1A', fontSize: '13px', wordBreak: 'break-all' }}>
                {item.link.length > 35 ? item.link.slice(0, 35) + '...' : item.link}
              </a>
              <p style={{ fontSize: '12px', color: '#8A7F6E', marginTop: '4px' }}>
                {item.product_type} · {item.color} · {item.size}
              </p>
              <p style={{ fontSize: '12px', color: '#8A7F6E', marginTop: '2px' }}>
                {item.price_cny} ¥ · {item.weight_kg} кг
              </p>
            </div>
          ))}

          <div style={{ marginTop: '12px' }}>
            <p style={{ fontSize: '12px', color: '#8A7F6E', marginBottom: '8px' }}>Статус:</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {Object.entries(statusLabel).map(([s, label]) => (
                <button
                  key={s}
                  onClick={() => updateStatus(order.id, s)}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '12px',
                    cursor: 'pointer',
                    background: order.status === s ? '#1A1A1A' : '#F5F0E8',
                    color: order.status === s ? '#F5F0E8' : '#1A1A1A',
                    fontWeight: order.status === s ? 600 : 400,
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
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

const itemStyle: React.CSSProperties = {
  padding: '10px',
  borderRadius: '10px',
  background: '#F5F0E8',
  marginBottom: '8px',
  border: '1px solid #D4C9B0',
}
