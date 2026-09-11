import { useEffect, useState } from 'react'
import { supabase } from '../utils/supabase'
import { Order } from '../types'
import { useParams, useNavigate } from 'react-router-dom'

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

export default function AdminClientDetail() {
  const { userId } = useParams()
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [amountPaid, setAmountPaid] = useState<string>('')
  const [exchangeRate, setExchangeRate] = useState<number>(0.5)
  const [deliveryRate, setDeliveryRate] = useState<number>(25)
  const [clientName, setClientName] = useState<string>('')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [userId])

  const fetchData = async () => {
    const [ordersRes, settingsRes] = await Promise.all([
      supabase.from('orders').select('*, order_items(*)').eq('tg_user_id', userId).order('created_at', { ascending: false }),
      supabase.from('settings').select('*'),
    ])

    if (ordersRes.data) {
      setOrders(ordersRes.data)
      setClientName(ordersRes.data[0]?.tg_first_name ?? 'Аноним')
    }

    if (settingsRes.data) {
      const rate = settingsRes.data.find(s => s.id === 'exchange_rate')
      const delivery = settingsRes.data.find(s => s.id === 'delivery_rate')
      setExchangeRate(rate?.value ?? 0.5)
      setDeliveryRate(delivery?.value ?? 25)
    }

    setLoading(false)
  }

  const calcOrderTotal = (order: Order) => {
    if (order.total_byn) return order.total_byn
    const items = order.order_items ?? []
    const goodsCost = items.reduce((sum, item) => sum + (item.price_cny ?? 0) * exchangeRate, 0)
    const deliveryCost = items.reduce((sum, item) => sum + (item.weight_kg ?? 0) * deliveryRate, 0)
    return goodsCost + deliveryCost
  }

  const handleSavePaid = async (orderId: string) => {
    await supabase.from('orders').update({ amount_paid: parseFloat(amountPaid) }).eq('id', orderId)
    setEditingId(null)
    fetchData()
  }

  const updateStatus = async (orderId: string, status: string, tg_user_id: string, created_at: string) => {
    await supabase.from('orders').update({ status }).eq('id', orderId)

    try {
      await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tg_user_id,
          status,
          order_date: new Date(created_at).toLocaleDateString('ru-RU'),
        }),
      })
    } catch (e) {
      console.error('Notification error:', e)
    }

    fetchData()
  }

  const handleDelete = async (orderId: string) => {
    if (deletingId !== orderId) {
      setDeletingId(orderId)
      return
    }
    await supabase.from('order_items').delete().eq('order_id', orderId)
    await supabase.from('orders').delete().eq('id', orderId)
    setDeletingId(null)
    fetchData()
  }

  const activeOrders = orders.filter(o => o.status !== 'declined')
  const totalByn = activeOrders.reduce((sum, o) => sum + calcOrderTotal(o), 0)
  const totalPaid = activeOrders.reduce((sum, o) => sum + (o.amount_paid ?? 0), 0)
  const debt = totalByn - totalPaid

  if (loading) return <div style={{ padding: '24px', background: '#F5F0E8', minHeight: '100vh' }}>Загружаем...</div>

  return (
    <div style={{ padding: '24px 20px', minHeight: '100vh', background: '#F5F0E8' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
        <button onClick={() => navigate('/admin/clients')} style={backButtonStyle}>←</button>
        <div>
          <p style={{ fontSize: '14px', color: '#8A7F6E' }}>Клиент</p>
          <h1 style={{ fontSize: '20px', fontWeight: 700 }}>{clientName}</h1>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
        <div style={{ ...cardStyle, flex: 1 }}>
          <p style={labelStyle}>Итого</p>
          <p style={{ fontSize: '18px', fontWeight: 700 }}>{totalByn.toFixed(2)} BYN</p>
        </div>
        <div style={{ ...cardStyle, flex: 1 }}>
          <p style={labelStyle}>Долг</p>
          <p style={{ fontSize: '18px', fontWeight: 700, color: debt > 0 ? '#c0392b' : '#5A7A5A' }}>
            {debt.toFixed(2)} BYN
          </p>
        </div>
      </div>

      {orders.map(order => (
        <div key={order.id} style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: '#8A7F6E' }}>
              {new Date(order.created_at).toLocaleDateString('ru-RU')}
            </span>
            <span style={{ fontSize: '12px', color: '#8A7F6E' }}>
              {statusLabel[order.status] ?? order.status}
            </span>
          </div>

          <p style={{ fontSize: '13px', color: '#8A7F6E', marginBottom: '8px' }}>
            Товаров: {order.order_items?.length ?? 0}
          </p>

          {order.order_items?.map(item => (
            <div key={item.id} style={itemStyle}>
              <p style={{ fontSize: '13px', fontWeight: 600 }}>{item.name ?? '—'}</p>
              <p style={{ fontSize: '12px', color: '#8A7F6E' }}>{item.price_cny} ¥ · {item.weight_kg ?? '—'} кг</p>
              {order.status === 'arrived' && (
                <div style={{ marginTop: '8px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <label style={{ fontSize: '12px', color: '#8A7F6E' }}>Фактический вес (кг):</label>
                  <input
                    type="number"
                    placeholder={String(item.weight_kg ?? 0)}
                    style={{ ...inputStyle, width: '80px', padding: '4px 8px' }}
                    onBlur={async e => {
                      if (e.target.value) {
                        await supabase.from('order_items').update({ weight_kg: parseFloat(e.target.value) }).eq('id', item.id)
                        fetchData()
                      }
                    }}
                  />
                </div>
              )}
            </div>
          ))}

          <div style={{ marginTop: '12px' }}>
            <p style={{ fontSize: '12px', color: '#8A7F6E', marginBottom: '8px' }}>Статус:</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
              {Object.entries(statusLabel).map(([s, label]) => (
                <button
                  key={s}
                  onClick={() => updateStatus(order.id, s, order.tg_user_id, order.created_at)}
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

          <div style={{ padding: '12px', background: '#F5F0E8', borderRadius: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <p style={{ fontSize: '13px', fontWeight: 600 }}>Сумма: {calcOrderTotal(order).toFixed(2)} BYN</p>
              <p style={{ fontSize: '13px', color: '#8A7F6E' }}>Оплачено: {(order.amount_paid ?? 0).toFixed(2)} BYN</p>
            </div>

            {editingId === order.id ? (
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="number"
                  value={amountPaid}
                  onChange={e => setAmountPaid(e.target.value)}
                  placeholder="Сумма оплаты"
                  style={{ ...inputStyle, flex: 1 }}
                />
                <button onClick={() => handleSavePaid(order.id)} style={saveButtonStyle}>✓</button>
                <button onClick={() => setEditingId(null)} style={cancelButtonStyle}>✕</button>
              </div>
            ) : (
              <button
                onClick={() => { setEditingId(order.id); setAmountPaid(String(order.amount_paid ?? 0)) }}
                style={editButtonStyle}
              >
                Изменить оплату
              </button>
            )}
          </div>

          <button
            onClick={() => handleDelete(order.id)}
            style={{
              ...deleteButtonStyle,
              background: deletingId === order.id ? '#c0392b' : 'transparent',
              color: deletingId === order.id ? '#fff' : '#c0392b',
            }}
          >
            {deletingId === order.id ? '⚠️ Подтвердить удаление' : 'Удалить заказ'}
          </button>
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
  flexShrink: 0,
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

const labelStyle: React.CSSProperties = {
  fontSize: '13px',
  color: '#8A7F6E',
  marginBottom: '6px',
}

const inputStyle: React.CSSProperties = {
  padding: '8px 12px',
  borderRadius: '8px',
  border: '1px solid #D4C9B0',
  fontSize: '14px',
  outline: 'none',
  background: '#EDE5D0',
  color: '#1A1A1A',
  boxSizing: 'border-box',
}

const saveButtonStyle: React.CSSProperties = {
  padding: '8px 12px',
  borderRadius: '8px',
  border: 'none',
  background: '#1A1A1A',
  color: '#F5F0E8',
  fontSize: '14px',
  cursor: 'pointer',
}

const cancelButtonStyle: React.CSSProperties = {
  padding: '8px 12px',
  borderRadius: '8px',
  border: '1px solid #D4C9B0',
  background: 'transparent',
  fontSize: '14px',
  cursor: 'pointer',
}

const editButtonStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px',
  borderRadius: '8px',
  border: '1px solid #1A1A1A',
  background: 'transparent',
  color: '#1A1A1A',
  fontSize: '13px',
  cursor: 'pointer',
  boxSizing: 'border-box',
}

const deleteButtonStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px',
  borderRadius: '8px',
  border: '1px solid #c0392b',
  fontSize: '13px',
  cursor: 'pointer',
  marginTop: '8px',
  boxSizing: 'border-box',
}
