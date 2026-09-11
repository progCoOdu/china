import { useEffect, useState } from 'react'
import { supabase } from '../utils/supabase'
import { getTelegramUser } from '../utils/telegram'
import { Order } from '../types'
import { useNavigate } from 'react-router-dom'

const statusList = [
  { key: 'new', label: 'Новый' },
  { key: 'accepted', label: 'Принят' },
  { key: 'ordered', label: 'Заказан' },
  { key: 'warehouse', label: 'Склад' },
  { key: 'transit_msk', label: 'MSK' },
  { key: 'transit_msq', label: 'MSQ' },
  { key: 'arrived', label: 'Прибыл' },
  { key: 'ready', label: 'Готов' },
]

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
          <p style={{ fontSize: '13px', color: '#8A7F6E', marginBottom: '10px' }}>Мои заказы</p>
          {orders.map(order => {
            const currentIndex = statusList.findIndex(s => s.key === order.status)
            return (
              <div key={order.id} style={{ ...cardStyle, cursor: 'pointer', marginBottom: '12px' }} onClick={() => navigate(`/orders/${order.id}`)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '13px', color: '#3A3A3A', fontWeight: 600 }}>
                    {order.order_items?.length ?? 0} товар(а)
                  </span>
                  <span style={{ fontSize: '12px', color: '#8A7F6E' }}>
                    {new Date(order.created_at).toLocaleDateString('ru-RU')}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '3px', marginBottom: '8px' }}>
                  {statusList.map((s, i) => (
                    <div key={s.key} style={{
                      flex: 1,
                      height: '4px',
                      borderRadius: '2px',
                      background: i <= currentIndex ? '#1A1A1A' : '#D4C9B0',
                    }} />
                  ))}
                </div>
                <p style={{ fontSize: '12px', color: '#8A7F6E' }}>
                  {statusList[currentIndex]?.label ?? order.status}
                  {currentIndex < statusList.length - 1 && ` → ${statusList[currentIndex + 1]?.label}`}
                </p>
              </div>
            )
          })}
        </div>
      )}

      {!loading && (
        <div style={{ ...cardStyle, marginBottom: '16px' }}>
          <p style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Как это работает?</p>
          {[
            { icon: '🔍', title: 'Находишь товар', desc: 'Выбираешь товар на любом китайском сайте — Taobao, 1688, Poizon и других.' },
            { icon: '📋', title: 'Оформляешь заявку', desc: 'Вставляешь ссылку, указываешь цвет, размер и стоимость в юанях.' },
            { icon: '📦', title: 'Мы заказываем', desc: 'Выкупаем товар, доставляем на склад в Китае и везём в Беларусь.' },
            { icon: '🎉', title: 'Забираешь', desc: 'Получаешь уведомление когда заказ готов к выдаче.' },
          ].map((step, i) => (
            <div key={i} style={{ display: 'flex', gap: '14px', marginBottom: i < 3 ? '16px' : 0, paddingBottom: i < 3 ? '16px' : 0, borderBottom: i < 3 ? '1px solid #D4C9B0' : 'none' }}>
              <span style={{ fontSize: '24px', flexShrink: 0 }}>{step.icon}</span>
              <div>
                <p style={{ fontSize: '14px', fontWeight: 600, marginBottom: '4px' }}>{step.title}</p>
                <p style={{ fontSize: '13px', color: '#8A7F6E' }}>{step.desc}</p>
              </div>
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
