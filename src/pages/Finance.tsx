import { useEffect, useState } from 'react'
import { supabase } from '../utils/supabase'
import { getTelegramUser } from '../utils/telegram'
import { Order } from '../types'

export default function Finance() {
  const [exchangeRate, setExchangeRate] = useState<number | null>(null)
  const [deliveryRate, setDeliveryRate] = useState<number | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const user = getTelegramUser()
      const tg_user_id = user ? String(user.id) : 'anonymous'

      const [settingsRes, ordersRes] = await Promise.all([
        supabase.from('settings').select('*'),
        supabase.from('orders').select('*, order_items(*)').eq('tg_user_id', tg_user_id).order('created_at', { ascending: false }),
      ])

      if (settingsRes.data) {
        const rate = settingsRes.data.find(s => s.id === 'exchange_rate')
        const delivery = settingsRes.data.find(s => s.id === 'delivery_rate')
        setExchangeRate(rate?.value ?? null)
        setDeliveryRate(delivery?.value ?? null)
      }

      setOrders(ordersRes.data ?? [])
      setLoading(false)
    }
    fetchData()
  }, [])

  const calcOrderTotal = (order: Order) => {
    if (order.total_byn) return order.total_byn
    if (!exchangeRate || !deliveryRate) return 0
    const items = order.order_items ?? []
    const goodsCost = items.reduce((sum, item) => sum + (item.price_cny ?? 0) * exchangeRate, 0)
    const deliveryCost = items.reduce((sum, item) => sum + (item.weight_kg ?? 0) * deliveryRate, 0)
    return goodsCost + deliveryCost
  }

  const activeOrders = orders.filter(o => o.status !== 'declined')
  const totalByn = activeOrders.reduce((sum, o) => sum + calcOrderTotal(o), 0)
  const totalPaid = activeOrders.reduce((sum, o) => sum + (o.amount_paid ?? 0), 0)
  const debt = totalByn - totalPaid

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
      <p style={{ fontSize: '14px', color: '#8A7F6E', marginBottom: '4px' }}>co.odu</p>
      <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '28px' }}>Финансы</h1>

      {loading ? <p style={{ color: '#8A7F6E' }}>Загружаем...</p> : (
        <>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <div style={{ ...cardStyle, flex: 1 }}>
              <p style={labelStyle}>Итого</p>
              <p style={valueStyle}>{totalByn.toFixed(2)} BYN</p>
            </div>
            <div style={{ ...cardStyle, flex: 1 }}>
              <p style={labelStyle}>Оплачено</p>
              <p style={valueStyle}>{totalPaid.toFixed(2)} BYN</p>
            </div>
          </div>

          <div style={{ ...cardStyle, background: debt > 0 ? '#1A1A1A' : '#EDE5D0', marginBottom: '24px' }}>
            <p style={{ ...labelStyle, color: debt > 0 ? '#8A8A8A' : '#8A7F6E' }}>Задолженность</p>
            <p style={{ fontSize: '32px', fontWeight: 700, color: debt > 0 ? '#F5F0E8' : '#1A1A1A' }}>
              {debt.toFixed(2)} BYN
            </p>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <p style={{ fontSize: '13px', color: '#8A7F6E', marginBottom: '10px' }}>Тарифы</p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ ...cardStyle, flex: 1 }}>
                <p style={labelStyle}>Курс юань</p>
                <p style={{ fontSize: '16px', fontWeight: 600 }}>1 ¥ = {exchangeRate} BYN</p>
              </div>
              <div style={{ ...cardStyle, flex: 1 }}>
                <p style={labelStyle}>Доставка</p>
                <p style={{ fontSize: '16px', fontWeight: 600 }}>{deliveryRate} BYN/кг</p>
              </div>
            </div>
          </div>

          {activeOrders.length > 0 && (
            <div>
              <p style={{ fontSize: '13px', color: '#8A7F6E', marginBottom: '10px' }}>По заказам</p>
              {activeOrders.map(order => (
                <div key={order.id} style={cardStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '13px', color: '#8A7F6E' }}>
                      {new Date(order.created_at).toLocaleDateString('ru-RU')}
                    </span>
                    <span style={{ fontSize: '12px', color: '#8A7F6E' }}>
                      {statusLabel[order.status] ?? order.status}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ fontSize: '15px', fontWeight: 600 }}>{calcOrderTotal(order).toFixed(2)} BYN</p>
                      <p style={{ fontSize: '12px', color: '#8A7F6E' }}>Оплачено: {(order.amount_paid ?? 0).toFixed(2)} BYN</p>
                    </div>
                    {(order.amount_paid ?? 0) >= calcOrderTotal(order) && calcOrderTotal(order) > 0 ? (
                      <span style={{ fontSize: '12px', color: '#5A7A5A', fontWeight: 600 }}>✅ Оплачен</span>
                    ) : (
                      <span style={{ fontSize: '12px', color: '#c0392b', fontWeight: 600 }}>
                        Долг: {(calcOrderTotal(order) - (order.amount_paid ?? 0)).toFixed(2)} BYN
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

const cardStyle: React.CSSProperties = {
  background: '#EDE5D0',
  borderRadius: '16px',
  padding: '20px',
  marginBottom: '0',
  border: '1px solid #D4C9B0',
}

const labelStyle: React.CSSProperties = {
  fontSize: '13px',
  color: '#8A7F6E',
  marginBottom: '8px',
}

const valueStyle: React.CSSProperties = {
  fontSize: '22px',
  fontWeight: 700,
  color: '#1A1A1A',
}
