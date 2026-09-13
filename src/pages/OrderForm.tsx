import { useState, useEffect } from 'react'
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
  const [quantity, setQuantity] = useState('1')
  const [loading, setLoading] = useState(false)
  const [cartLoading, setCartLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const user = getTelegramUser()
  const tg_user_id = user ? String(user.id) : 'anonymous'

  useEffect(() => {
    loadCart()
  }, [])

  const loadCart = async () => {
    const { data } = await supabase
      .from('cart_items')
      .select('*')
      .eq('tg_user_id', tg_user_id)
      .order('created_at', { ascending: true })

    if (data && data.length > 0) {
      setItems(data.map(item => ({
        name: item.name,
        link: item.link,
        product_type: item.product_type,
        color: item.color,
        size: item.size,
        price_cny: item.price_cny,
        weight_kg: null,
        quantity: item.quantity,
      })))
    }
    setCartLoading(false)
  }

  const saveCartItem = async (item: DraftItem) => {
    await supabase.from('cart_items').insert({
      tg_user_id,
      name: item.name,
      link: item.link,
      product_type: item.product_type,
      color: item.color,
      size: item.size,
      price_cny: item.price_cny,
      quantity: item.quantity,
    })
  }

  const removeCartItem = async (index: number) => {
    const { data } = await supabase
      .from('cart_items')
      .select('id')
      .eq('tg_user_id', tg_user_id)
      .order('created_at', { ascending: true })

    if (data && data[index]) {
      await supabase.from('cart_items').delete().eq('id', data[index].id)
    }

    setItems(items.filter((_, i) => i !== index))
  }

  const clearCart = async () => {
    await supabase.from('cart_items').delete().eq('tg_user_id', tg_user_id)
  }

  const addItem = async () => {
    if (!name || !link || !priceCny) {
      setError('Заполни наименование, ссылку и сумму')
      return
    }

    const newItem: DraftItem = {
      name,
      link,
      product_type: productType || '—',
      color: color || '—',
      size: size || '—',
      price_cny: parseFloat(priceCny),
      weight_kg: null,
      quantity: parseInt(quantity) || 1,
    }

    await saveCartItem(newItem)
    setItems([...items, newItem])
    setName('')
    setLink('')
    setProductType('')
    setColor('')
    setSize('')
    setPriceCny('')
    setQuantity('1')
    setError(null)
  }

  const handleSubmit = async () => {
    if (items.length === 0) {
      setError('Добавь хотя бы один товар')
      return
    }

    setLoading(true)
    setError(null)

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        tg_user_id,
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

    if (itemsError) {
      setError('Ошибка при добавлении товаров')
      setLoading(false)
      return
    }

    await clearCart()
    setLoading(false)
    navigate('/orders')
  }

  if (cartLoading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#F5F0E8' }}>
      <p style={{ color: '#8A7F6E' }}>Загружаем корзину...</p>
    </div>
  )

  return (
    <div style={{ padding: '24px 20px', minHeight: '100vh', background: '#F5F0E8' }}>
      <p style={{ fontSize: '14px', color: '#8A7F6E', marginBottom: '4px' }}>co.odu</p>
      <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '28px' }}>Корзина</h1>

      {items.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <p style={{ fontSize: '13px', color: '#8A7F6E', marginBottom: '10px' }}>Товары в корзине ({items.length})</p>
          {items.map((item, i) => (
            <div key={i} style={itemCardStyle}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '13px', fontWeight: 600, color: '#1A1A1A' }}>{item.name}</p>
                <p style={{ fontSize: '12px', color: '#8A7F6E', marginTop: '4px' }}>
                  {item.price_cny} ¥ · {item.quantity} шт.
                </p>
              </div>
              <button onClick={() => removeCartItem(i)} style={removeButtonStyle}>✕</button>
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

        <div style={{ marginBottom: '12px' }}>
          <label style={labelStyle}>Сумма в юанях *</label>
          <input type="number" placeholder="0" value={priceCny} onChange={e => setPriceCny(e.target.value)} style={inputStyle} />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>Количество</label>
          <input type="number" placeholder="1" value={quantity} onChange={e => setQuantity(e.target.value)} style={inputStyle} min="1" />
        </div>

        {error && <p style={{ color: '#c0392b', marginBottom: '12px', fontSize: '14px' }}>{error}</p>}

        <button onClick={addItem} style={addButtonStyle}>
          + Добавить в корзину
        </button>
      </div>

      <button onClick={handleSubmit} disabled={loading || items.length === 0} style={{
        ...submitButtonStyle,
        opacity: items.length === 0 ? 0.5 : 1,
      }}>
        {loading ? 'Отправляем...' : `Оформить заказ (${items.length} товар${items.length === 1 ? '' : items.length < 5 ? 'а' : 'ов'})`}
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
