import { useState } from 'react'
import { supabase } from '../utils/supabase'
import { getTelegramUser } from '../utils/telegram'
import { OrderItem } from '../types'
import { useNavigate } from 'react-router-dom'

type DraftItem = Omit<OrderItem, 'id' | 'order_id' | 'created_at'>

export default function OrderForm() {
  const [items, setItems] = useState<DraftItem[]>([])
  const [name, setName] = useState('')
  const [link, setLink] = useState('')
  const [productType, setProductType] = useState('')
  const [color, setColor] = useState('')
  const [size, setSize] = useState('')
  const [priceCny, setPriceCny] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const addItem = () => {
    if (!name || !link || !priceCny) {
      setError('Заполни наименование, ссылку и сумму')
      return
    }
    setItems([...items, {
      name,
      link,
      product_type: productType || '—',
      color: color || '—',
      size: size || '—',
      price_cny: parseFloat(priceCny),
      weight_kg: null,
    }])
    setName('')
    setLink('')
    setProductType('')
    setColor('')
    setSize('')
    setPriceCny('')
    setError(null)
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (items.length === 0) {
      setError('Добавь хотя бы один товар')
      return
    }

    const user = getTelegramUser()
    setLoading(true)
    setError(null)

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        tg_user_id: user ? String(user.id) : 'anonymous',
        tg_username: user?.username ?? null,
        tg_first_name: user?.first_name ?? null,
      })
      .select()
      .single()

    if (orderError || !order) {
      setError('Ошибка при создании заказа')
      setLoading(false)
      return
    }

    const { error: itemsError } = await supabase.from('order_items').insert(
      items.map(item => ({ ...item, order_id: order.id }))
    )

    setLoading(false)

    if (itemsError) {
      setError('Ошибка при добавлении товаров')
    } else {
      navigate('/orders')
    }
  }

  return (
    <div style={{ padding: '24px 20px', minHeight: '100vh', background: '#F5F0E8' }}>
      <p style={{ fontSize: '14px', color: '#8A7F6E', marginBottom: '4px' }}>co.odu</p>
      <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '28px' }}>Новый заказ</h1>

      {items.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <p style={{ fontSize: '13px', color: '#8A7F6E', marginBottom: '10px' }}>Товары в заказе ({items.length})</p>
          {items.map((item, i) => (
            <div key={i} style={itemCardStyle}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '13px', fontWeight: 600, color: '#1A1A1A' }}>{item.name}</p>
                <p style={{ fontSize: '12px', color: '#8A7F6E', marginTop: '4px' }}>
                  {item.price_cny} ¥
                </p>
              </div>
              <button onClick={() => removeItem(i)} style={removeButtonStyle}>✕</button>
            </div>
          ))}
        </div>
      )}

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

        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>Сумма в юанях *</label>
          <input type="number" placeholder="0" value={priceCny} onChange={e => setPriceCny(e.target.value)} style={inputStyle} />
        </div>

        {error && <p style={{ color: '#c0392b', marginBottom: '12px', fontSize: '14px' }}>{error}</p>}

        <button onClick={addItem} style={addButtonStyle}>
          + Добавить в заказ
        </button>
      </div>

      <button onClick={handleSubmit} disabled={loading || items.length === 0} style={{
        ...submitButtonStyle,
        opacity: items.length === 0 ? 0.5 : 1,
      }}>
        {loading ? 'Отправляем...' : `Отправить заказ (${items.length} товар${items.length === 1 ? '' : items.length < 5 ? 'а' : 'ов'})`}
      </button>
    </div>
  )
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

const submitButtonStyle: React.CSSProperties = {
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
  color: '#8A7F6E',
  padding: '4px',
}
