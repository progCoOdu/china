import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../utils/supabase'
import { Order } from '../types'

export default function OrderEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [link, setLink] = useState('')
  const [productType, setProductType] = useState('')
  const [color, setColor] = useState('')
  const [size, setSize] = useState('')
  const [priceCny, setPriceCny] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [error, setError] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    fetchOrder()
  }, [id])

  const fetchOrder = async () => {
    const { data } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', id)
      .single()
    setOrder(data)
    setLoading(false)
  }

  const addItem = async () => {
    if (!name || !link || !priceCny) {
      setError('Заполни наименование, ссылку и сумму')
      return
    }

    setAdding(true)
    setError(null)

    const { error } = await supabase.from('order_items').insert({
      order_id: id,
      name,
      link,
      product_type: productType || '—',
      color: color || '—',
      size: size || '—',
      price_cny: parseFloat(priceCny),
      weight_kg: null,
      quantity: parseInt(quantity) || 1,
    })

    if (error) {
      setError('Ошибка при добавлении товара')
    } else {
      setName('')
      setLink('')
      setProductType('')
      setColor('')
      setSize('')
      setPriceCny('')
      setQuantity('1')
      fetchOrder()
    }

    setAdding(false)
  }

  const deleteItem = async (itemId: string) => {
    if (deletingId !== itemId) {
      setDeletingId(itemId)
      return
    }
    await supabase.from('order_items').delete().eq('id', itemId)
    setDeletingId(null)
    fetchOrder()
  }

  if (loading) return <div style={{ padding: '24px', background: '#F5F0E8', minHeight: '100vh' }}>Загружаем...</div>
  if (!order) return <div style={{ padding: '24px', background: '#F5F0E8', minHeight: '100vh' }}>Заказ не найден</div>
  if (order.status !== 'new') return <div style={{ padding: '24px', background: '#F5F0E8', minHeight: '100vh' }}>Заказ уже нельзя редактировать</div>

  return (
    <div style={{ padding: '24px 20px', minHeight: '100vh', background: '#F5F0E8' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
        <button onClick={() => navigate(`/orders/${id}`)} style={backButtonStyle}>←</button>
        <div>
          <p style={{ fontSize: '14px', color: '#8A7F6E' }}>co.odu</p>
          <h1 style={{ fontSize: '20px', fontWeight: 700 }}>Редактировать заказ</h1>
        </div>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <p style={{ fontSize: '13px', color: '#8A7F6E', marginBottom: '10px' }}>
          Товары в заказе ({order.order_items?.length ?? 0})
        </p>
        {order.order_items?.map(item => (
          <div key={item.id} style={itemCardStyle}>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '13px', fontWeight: 600 }}>{item.name}</p>
              <p style={{ fontSize: '12px', color: '#8A7F6E', marginTop: '4px' }}>
                {item.price_cny} ¥ · {item.quantity} шт.
              </p>
            </div>
            <button
              onClick={() => deleteItem(item.id)}
              style={{
                ...removeButtonStyle,
                color: deletingId === item.id ? '#c0392b' : '#8A7F6E',
                fontWeight: deletingId === item.id ? 600 : 400,
              }}
            >
              {deletingId === item.id ? '⚠️' : '✕'}
            </button>
          </div>
        ))}
      </div>

      <div style={{ background: '#EDE5D0', borderRadius: '16px', padding: '16px', border: '1px solid #D4C9B0', marginBottom: '16px' }}>
        <p style={{ fontSize: '13px', fontWeight: 600, marginBottom: '14px' }}>+ Добавить товар</p>

        <div style={{ marginBottom: '12px' }}>
          <label style={labelStyle}>Наименование *</label>
          <input type="text" placeholder="Кроссовки Nike Air Max" value={name} onChange={e => setName(e.target.value)} style={inputStyle} />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={labelStyle}>Ссылка *</label>
          <input type="url" placeholder="https://..." value={link} onChange={e => setLink(e.target.value)} style={inputStyle} />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={labelStyle}>Тип товара</label>
          <input type="text" placeholder="Кроссовки, куртка... или —" value={productType} onChange={e => setProductType(e.target.value)} style={inputStyle} />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={labelStyle}>Цвет</label>
          <input type="text" placeholder="Чёрный, белый... или —" value={color} onChange={e => setColor(e.target.value)} style={inputStyle} />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={labelStyle}>Размер</label>
          <input type="text" placeholder="42, XL... или —" value={size} onChange={e => setSize(e.target.value)} style={inputStyle} />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={labelStyle}>Сумма в юанях *</label>
          <input type="number" placeholder="0" value={priceCny} onChange={e => setPriceCny(e.target.value)} style={inputStyle} />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>Количество</label>
          <input type="number" placeholder="1" value={quantity} onChange={e => setQuantity(e.target.value)} style={inputStyle} min="1" />
        </div>

        {error && <p style={{ color: '#c0392b', marginBottom: '12px', fontSize: '14px' }}>{error}</p>}

        <button onClick={addItem} disabled={adding} style={addButtonStyle}>
          {adding ? 'Добавляем...' : '+ Добавить'}
        </button>
      </div>

      <button onClick={() => navigate(`/orders/${id}`)} style={doneButtonStyle}>
        Готово
      </button>
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

const itemCardStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '12px 14px',
  background: '#EDE5D0',
  borderRadius: '12px',
  marginBottom: '8px',
  border: '1px solid #D4C9B0',
}

const removeButtonStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  fontSize: '16px',
  cursor: 'pointer',
  padding: '4px',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: '6px',
  fontWeight: 600,
  fontSize: '13px',
  color: '#1A1A1A',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px',
  borderRadius: '10px',
  border: '1px solid #D4C9B0',
  fontSize: '15px',
  outline: 'none',
  background: '#F5F0E8',
  color: '#1A1A1A',
  boxSizing: 'border-box',
}

const addButtonStyle: React.CSSProperties = {
  width: '100%',
  padding: '14px',
  borderRadius: '12px',
  border: '1px solid #1A1A1A',
  background: 'transparent',
  color: '#1A1A1A',
  fontSize: '15px',
  fontWeight: 600,
  cursor: 'pointer',
  boxSizing: 'border-box',
}

const doneButtonStyle: React.CSSProperties = {
  width: '100%',
  padding: '16px',
  borderRadius: '12px',
  border: 'none',
  background: '#1A1A1A',
  color: '#F5F0E8',
  fontSize: '16px',
  fontWeight: 600,
  cursor: 'pointer',
  boxSizing: 'border-box',
}
