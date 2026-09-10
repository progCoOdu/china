import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../utils/supabase'
import { Order } from '../types'

const statusList = [
  { key: 'new', label: 'Новый' },
  { key: 'accepted', label: 'Принят' },
  { key: 'ordered', label: 'Заказан' },
  { key: 'warehouse', label: 'На складе' },
  { key: 'transit_msk', label: 'В пути MSK' },
  { key: 'transit_msq', label: 'В пути MSQ' },
  { key: 'arrived', label: 'Прибыл' },
  { key: 'ready', label: 'Готов к выдаче' },
]

export default function OrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)
  const [confirmCancel, setConfirmCancel] = useState(false)

  useEffect(() => {
    const fetchOrder = async () => {
      const { data } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('id', id)
        .single()
      setOrder(data)
      setLoading(false)
    }
    fetchOrder()
  }, [id])

  const handleCancel = async () => {
    if (!confirmCancel) {
      setConfirmCancel(true)
      return
    }
    setCancelling(true)
    await supabase.from('orders').update({ status: 'declined' }).eq('id', id)
    navigate('/orders')
  }

  if (loading) return <div style={{ padding: '24px', background: '#F5F0E8', minHeight: '100vh' }}>Загружаем...</div>
  if (!order) return <div style={{ padding: '24px', background: '#F5F0E8', minHeight: '100vh' }}>Заказ не найден</div>

  const currentIndex = statusList.findIndex(s => s.key === order.status)
  const isDeclined = order.status === 'declined'

  return (
    <div style={{ padding: '24px 20px', minHeight: '100vh', background: '#F5F0E8' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
        <button onClick={() => navigate('/orders')} style={backButtonStyle}>←</button>
        <div>
          <p style={{ fontSize: '14px', color: '#8A7F6E' }}>co.odu</p>
          <h1 style={{ fontSize: '20px', fontWeight: 700 }}>Заказ от {new Date(order.created_at).toLocaleDateString('ru-RU')}</h1>
        </div>
      </div>

      {isDeclined ? (
        <div style={{ ...cardStyle, background: '#f5e8e8', border: '1px solid #e8c4c4', marginBottom: '24px' }}>
          <p style={{ fontWeight: 600, color: '#c0392b' }}>❌ Заказ отклонён</p>
        </div>
      ) : (
        <div style={{ ...cardStyle, marginBottom: '24px' }}>
          <p style={{ fontSize: '13px', color: '#8A7F6E', marginBottom: '14px' }}>Прогресс заказа</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '12px' }}>
            {statusList.map((s, i) => (
              <div key={s.key} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{
                  width: '100%',
                  height: '4px',
                  borderRadius: '2px',
                  background: i <= currentIndex ? '#1A1A1A' : '#D4C9B0',
                }} />
              </div>
            ))}
          </div>
          <p style={{ fontSize: '13px', fontWeight: 600 }}>
            {statusList[currentIndex]?.label ?? order.status}
          </p>
          {currentIndex < statusList.length - 1 && (
            <p style={{ fontSize: '12px', color: '#8A7F6E', marginTop: '4px' }}>
              Следующий этап: {statusList[currentIndex + 1]?.label}
            </p>
          )}
        </div>
      )}

      <div style={cardStyle}>
        <p style={{ fontSize: '13px', color: '#8A7F6E', marginBottom: '12px' }}>
          Товаров: {order.order_items?.length ?? 0}
        </p>
        {order.order_items?.map(item => (
          <div key={item.id} style={itemStyle}>
            <p style={{ fontSize: '14px', fontWeight: 600, color: '#1A1A1A' }}>{item.name ?? '—'}</p>
            <a href={item.link} target="_blank" rel="noreferrer" style={{ color: '#8A7F6E', fontSize: '12px', wordBreak: 'break-all' }}>
              {item.link.length > 40 ? item.link.slice(0, 40) + '...' : item.link}
            </a>
            <div style={{ display: 'flex', gap: '12px', marginTop: '6px', flexWrap: 'wrap' }}>
              {item.product_type && item.product_type !== '—' && (
                <span style={tagStyle}>{item.product_type}</span>
              )}
              {item.color && item.color !== '—' && (
                <span style={tagStyle}>{item.color}</span>
              )}
              {item.size && item.size !== '—' && (
                <span style={tagStyle}>{item.size}</span>
              )}
            </div>
            <p style={{ fontSize: '12px', color: '#8A7F6E', marginTop: '6px' }}>
              {item.price_cny} ¥ · {item.weight_kg} кг
            </p>
          </div>
        ))}
      </div>

      {!isDeclined && order.status === 'new' && (
        <button
          onClick={handleCancel}
          disabled={cancelling}
          style={{
            ...cancelButtonStyle,
            background: confirmCancel ? '#c0392b' : 'transparent',
            color: confirmCancel ? '#fff' : '#c0392b',
          }}
        >
          {confirmCancel ? '⚠️ Подтвердить отмену' : 'Отменить заказ'}
        </button>
      )}
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
  padding: '12px',
  borderRadius: '10px',
  background: '#F5F0E8',
  marginBottom: '8px',
  border: '1px solid #D4C9B0',
}

const tagStyle: React.CSSProperties = {
  fontSize: '11px',
  padding: '3px 8px',
  borderRadius: '6px',
  background: '#D4C9B0',
  color: '#1A1A1A',
}

const cancelButtonStyle: React.CSSProperties = {
  width: '100%',
  padding: '14px',
  borderRadius: '12px',
  border: '1px solid #c0392b',
  fontSize: '15px',
  fontWeight: 600,
  cursor: 'pointer',
  marginTop: '8px',
  boxSizing: 'border-box',
}
