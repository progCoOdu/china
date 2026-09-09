import { useState } from 'react'
import { supabase } from '../utils/supabase'
import { getTelegramUser } from '../utils/telegram'
import { useNavigate } from 'react-router-dom'

export default function OrderForm() {
  const [link, setLink] = useState('')
  const [productType, setProductType] = useState('')
  const [color, setColor] = useState('')
  const [size, setSize] = useState('')
  const [priceCny, setPriceCny] = useState('')
  const [weightKg, setWeightKg] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const handleSubmit = async () => {
    if (!link || !priceCny || !weightKg) {
      setError('Заполни обязательные поля: ссылка, сумма и вес')
      return
    }

    const user = getTelegramUser()
    setLoading(true)
    setError(null)

    const { error } = await supabase.from('orders').insert({
      tg_user_id: user ? String(user.id) : 'anonymous',
      tg_username: user?.username ?? null,
      tg_first_name: user?.first_name ?? null,
      link,
      description: '',
      product_type: productType || '—',
      color: color || '—',
      size: size || '—',
      price_cny: parseFloat(priceCny),
      weight_kg: parseFloat(weightKg),
    })

    setLoading(false)

    if (error) {
      setError('Ошибка при отправке. Попробуй ещё раз.')
    } else {
      navigate('/orders')
    }
  }

  return (
    <div style={{ padding: '24px 20px', minHeight: '100vh', background: '#F5F0E8' }}>
      <p style={{ fontSize: '14px', color: '#8A7F6E', marginBottom: '4px' }}>co.odu</p>
      <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '28px' }}>Новый заказ</h1>

      <div style={{ marginBottom: '14px' }}>
        <label style={labelStyle}>Ссылка *</label>
        <input type="url" placeholder="https://..." value={link} onChange={e => setLink(e.target.value)} style={inputStyle} />
      </div>

      <div style={{ marginBottom: '14px' }}>
        <label style={labelStyle}>Тип товара</label>
        <input type="text" placeholder="Кроссовки, куртка... или —" value={productType} onChange={e => setProductType(e.target.value)} style={inputStyle} />
      </div>

      <div style={{ marginBottom: '14px' }}>
        <label style={labelStyle}>Цвет</label>
        <input type="text" placeholder="Чёрный, белый... или —" value={color} onChange={e => setColor(e.target.value)} style={inputStyle} />
      </div>

      <div style={{ marginBottom: '14px' }}>
        <label style={labelStyle}>Размер</label>
        <input type="text" placeholder="42, XL... или —" value={size} onChange={e => setSize(e.target.value)} style={inputStyle} />
      </div>

      <div style={{ marginBottom: '14px' }}>
        <label style={labelStyle}>Сумма в юанях *</label>
        <input type="number" placeholder="0" value={priceCny} onChange={e => setPriceCny(e.target.value)} style={inputStyle} />
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label style={labelStyle}>Примерный вес (кг) *</label>
        <input type="number" placeholder="0.5" value={weightKg} onChange={e => setWeightKg(e.target.value)} style={inputStyle} />
      </div>

      {error && <p style={{ color: '#c0392b', marginBottom: '12px', fontSize: '14px' }}>{error}</p>}

      <button onClick={handleSubmit} disabled={loading} style={buttonStyle}>
        {loading ? 'Отправляем...' : 'Отправить заявку'}
      </button>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: '6px',
  fontWeight: 600,
  fontSize: '14px',
  color: '#1A1A1A',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '14px',
  borderRadius: '12px',
  border: '1px solid #D4C9B0',
  fontSize: '16px',
  outline: 'none',
  background: '#EDE5D0',
  color: '#1A1A1A',
  boxSizing: 'border-box',
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
  boxSizing: 'border-box',
}
