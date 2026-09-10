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

tsx
import { useEffect, useState } from 'react'
import { supabase } from '../utils/supabase'
import { getTelegramUser } from '../utils/telegram'
import { Profile } from '../types'

export default function ProfileSettings() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [fullName, setFullName] = useState('')
  const [city, setCity] = useState('')
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const user = getTelegramUser()

  useEffect(() => {
    const fetchProfile = async () => {
      const tg_user_id = user ? String(user.id) : 'anonymous'
      const { data } = await supabase.from('profiles').select('*').eq('tg_user_id', tg_user_id).single()
      if (data) {
        setProfile(data)
        setFullName(data.full_name ?? '')
        setCity(data.city ?? '')
        setAddress(data.address ?? '')
        setPhone(data.phone ?? '')
      }
      setLoading(false)
    }
    fetchProfile()
  }, [])

  const handleSave = async () => {
    if (!fullName || !city || !phone) {
      setError('Заполни имя, город и телефон')
      return
    }

    setSaving(true)
    setError(null)

    const tg_user_id = user ? String(user.id) : 'anonymous'
    await supabase.from('profiles').upsert({
      tg_user_id,
      full_name: fullName,
      city,
      address,
      phone,
      tg_username: user?.username ?? null,
    })

    setSaving(false)
    setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
  }

  if (loading) return <div style={{ padding: '24px', background: '#F5F0E8', minHeight: '100vh' }}>Загружаем...</div>

  return (
    <div style={{ padding: '24px 20px', minHeight: '100vh', background: '#F5F0E8' }}>
      <p style={{ fontSize: '14px', color: '#8A7F6E', marginBottom: '4px' }}>co.odu</p>
      <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '28px' }}>Настройки</h1>

      <div style={{ ...cardStyle, marginBottom: '24px' }}>
        <p style={{ fontSize: '13px', color: '#8A7F6E', marginBottom: '16px', fontWeight: 600 }}>Личные данные</p>

        <div style={{ marginBottom: '12px' }}>
          <label style={labelStyle}>Имя и фамилия *</label>
          <input type="text" placeholder="Иван Иванов" value={fullName} onChange={e => setFullName(e.target.value)} style={inputStyle} />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={labelStyle}>Город *</label>
          <input type="text" placeholder="Минск" value={city} onChange={e => setCity(e.target.value)} style={inputStyle} />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={labelStyle}>Адрес доставки</label>
          <input type="text" placeholder="ул. Ленина, д. 1, кв. 1" value={address} onChange={e => setAddress(e.target.value)} style={inputStyle} />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>Телефон *</label>
          <input type="tel" placeholder="+375 XX XXX XX XX" value={phone} onChange={e => setPhone(e.target.value)} style={inputStyle} />
        </div>

        {error && <p style={{ color: '#c0392b', marginBottom: '12px', fontSize: '14px' }}>{error}</p>}
        {success && <p style={{ color: '#5A7A5A', marginBottom: '12px', fontWeight: 600 }}>✅ Сохранено!</p>}

        <button onClick={handleSave} disabled={saving} style={buttonStyle}>
          {saving ? 'Сохраняем...' : 'Сохранить'}
        </button>
      </div>

      <div style={cardStyle}>
        <p style={{ fontSize: '13px', color: '#8A7F6E', marginBottom: '16px', fontWeight: 600 }}>FAQ</p>
        {[
          { q: 'Как сделать заказ?', a: 'Перейди во вкладку "Заказать", добавь товары из китайских магазинов и отправь заявку.' },
          { q: 'Как считается стоимость?', a: 'Стоимость товара в юанях × курс + вес × тариф доставки.' },
          { q: 'Когда платить за доставку?', a: 'Стоимость доставки рассчитывается по факту прибытия товара.' },
          { q: 'Как узнать статус заказа?', a: 'Статус заказа отображается на главной и в разделе "Заказы".' },
        ].map((item, i) => (
          <div key={i} style={{ marginBottom: i < 3 ? '16px' : 0, paddingBottom: i < 3 ? '16px' : 0, borderBottom: i < 3 ? '1px solid #D4C9B0' : 'none' }}>
            <p style={{ fontSize: '14px', fontWeight: 600, marginBottom: '6px' }}>{item.q}</p>
            <p style={{ fontSize: '13px', color: '#8A7F6E' }}>{item.a}</p>
          </div>
        ))}
      </div>

      <div style={{ ...cardStyle, marginTop: '12px' }}>
        <p style={{ fontSize: '13px', color: '#8A7F6E', marginBottom: '12px', fontWeight: 600 }}>Контакты</p>
        <a href="https://t.me/cargoodubot" target="_blank" rel="noreferrer" style={linkStyle}>
          💬 Написать менеджеру
        </a>
        <p style={{ fontSize: '12px', color: '#8A7F6E', marginTop: '16px' }}>
          Разработано by co.odu
        </p>
      </div>
    </div>
  )
}

const cardStyle: React.CSSProperties = {
  background: '#EDE5D0',
  borderRadius: '16px',
  padding: '20px',
  border: '1px solid #D4C9B0',
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

const buttonStyle: React.CSSProperties = {
  width: '100%',
  padding: '14px',
  borderRadius: '12px',
  border: 'none',
  background: '#1A1A1A',
  color: '#F5F0E8',
  fontSize: '15px',
  fontWeight: 600,
  cursor: 'pointer',
  boxSizing: 'border-box',
}

const linkStyle: React.CSSProperties = {
  display: 'block',
  padding: '12px',
  borderRadius: '10px',
  background: '#F5F0E8',
  color: '#1A1A1A',
  textDecoration: 'none',
  fontSize: '14px',
  fontWeight: 600,
  textAlign: 'center',
  border: '1px solid #D4C9B0',
}
