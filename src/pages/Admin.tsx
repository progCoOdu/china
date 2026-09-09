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
              {new
