import { useState } from 'react'
import { supabase } from '../utils/supabase'
import { getTelegramUser } from '../utils/telegram'

interface Props {
  onComplete: () => void
}

export default function Register({ onComplete }: Props) {
  const [fullName, setFullName] = useState('')
  const [city, setCity] = useState('')
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const user = getTelegramUser()

  const handleSubmit = async () => {
    if (!fullName || !city || !phone) {
      setError('Заполни имя, город и телефон')
      return
    }

    setLoading(true)
    setError(null)

    const { error } = await supabase.from('profiles').insert({
      tg_user_id: user ? String(user.id) : 'anonymous',
      full_name: fullName,
      city,
      address,
      phone,
      tg_username: user?.username ?? null,
    })

    setLoading(false)

    if (error) {
      setError('Ошибка при сохранении. Попробуй ещё раз.')
    } else {
      onComplete()
    }
  }

  return (
    <div style={{ padding: '24px 20px', minHeight: '100vh', background: '#F5F0E8', display: 'flex', flexDirection: 'column' }}>
      <p style={{ fontSize: '14px', color: '#8A7F6E', marginBottom: '4px' }}>co.odu</p>
      <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>Добро пожаловать!</h1>
      <p style={{ fontSize: '14px', color: '#8A7F6E', marginBottom: '28px' }}>
        Заполни данные для оформления заказов
      </p>

      <div style={{ marginBottom: '14px' }}>
        <label style={labelStyle}>Имя и фамилия *</label>
        <input
          type="text"
          placeholder="Иван Иванов"
          value={fullName}
          onChange={e => setFullName(e.target.value)}
          style={inputStyle}
        />
      </div>

      <div style={{ marginBottom: '14px' }}>
        <label style={labelStyle}>Город *</label>
        <input
          type="text"
          placeholder="Минск"
          value={city}
          onChange={e => setCity(e.target.value)}
          style={inputStyle}
        />
      </div>

      <div style={{ marginBottom: '14px' }}>
        <label style={labelStyle}>Адрес доставки</label>
        <input
          type="text"
          placeholder="ул. Ленина, д. 1, кв. 1"
          value={address}
          onChange={e => setAddress(e.target.value)}
          style={inputStyle}
        />
      </div>

      <div style={{ marginBottom: '28px' }}>
        <label style={labelStyle}>Номер телефона *</label>
        <input
          type="tel"
          placeholder="+375 XX XXX XX XX"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          style={inputStyle}
        />
      </div>

      {error && <p style={{ color: '#c0392b', marginBottom: '12px', fontSize: '14px' }}>{error}</p>}

      <button onClick={handleSubmit} disabled={loading} style={buttonStyle}>
        {loading ? 'Сохраняем...' : 'Начать работу →'}
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
