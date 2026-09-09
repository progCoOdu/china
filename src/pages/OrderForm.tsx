import { useState } from 'react'
import { supabase } from '../utils/supabase'
import { getTelegramUser } from '../utils/telegram'
import { OrderItem } from '../types'
import { useNavigate } from 'react-router-dom'

type DraftItem = Omit<OrderItem, 'id' | 'order_id' | 'created_at'>

export default function OrderForm() {
  const [items, setItems] = useState<DraftItem[]>([])
  const [link, setLink] = useState('')
  const [productType, setProductType] = useState('')
  const [color, setColor] = useState('')
  const [size, setSize] = useState('')
  const [priceCny, setPriceCny] = useState('')
  const [weightKg, setWeightKg] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const addItem = () => {
    if (!link || !priceCny || !weightKg) {
      setError('Заполни ссылку, сумму и вес')
      return
    }
    setItems([...items, {
      link,
      product_type: productType || '—',
      color: color || '—',
      size: size || '—',
      price_cny: parseFloat(priceCny),
      weight_kg: parseFloat(weightKg),
    }])
    setLink('')
    setProductType('')
    setColor('')
    setSize('')
    setPriceCny('')
    setWeightKg('')
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
                <p style={{ fontSize: '13px', color: '#3A3A3A', wordBreak: 'break-all' }}>
                  {item.link.length > 35 ? item.link.slice(0, 35) + '...' : item.link}
                </p>
                <p style={{ fontSize: '12px', color: '#8A7F6E', marginTop: '4px' }}>
                  {item.price_cny} ¥ · {item.weight_kg} кг
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
          <label style={labelStyle}>Ссылка *</label>
          <input type="url" placeholder="https://..." value={link} onChange={e => setLink(e.target.value)} style={inputStyle} />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={labelStyle}>Тип товара</label>
          <input type="text" placeholder="Кроссовки, куртка... или —" value={productType} onChange={e => setProductType(e.target.value)} style={inputStyle} />
        </div>
