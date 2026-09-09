import { useState } from 'react'
import { supabase } from '../utils/supabase'
import { getTelegramUser } from '../utils/telegram'
import { useNavigate } from 'react-router-dom'

export default function OrderForm() {
  const [link, setLink] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const handleSubmit = async () => {
    if (!link || !description) {
      setError('Заполни все поля')
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
      description,
    })

    setLoading(false)

    if (error) {
      setError('Ошибка при отправке. Попробуй ещё раз.')
    } else {
      navigate('/orders')
    }
  }

  return (
    <div style={{ padding: '24px', minHeight: '100vh', background: '#F5F0E8' }}>
      <h1 style={{ marginBottom: '4px', fontSize: '28px', fontWeight: 700 }}>co.odu</h1>
      <p style={{ marginBottom: '28px', color: '#8A7F6E', fontSize: '14px' }}>Заказ из Китая</p>

      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '14px' }}>Ссылка</label>
        <input
          type="url"
          placeholder="https://..."
          value={link}
          onChange={e => setLink(e.target.value)}
          style={inputStyle}
        />
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '14px' }}>Описание</label>
        <textarea
          placeholder="Что заказать, размер, цвет, количество..."
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={5}
          style={{ ...inputStyle, resize: 'vertical' }}
        />
      </div>

      {error && <p style={{ color: '#c0392b', marginBottom: '12px', fontSize: '14px' }}>{error}</p>}

      <button onClick={handleSubmit} disabled={loading} style={buttonStyle}>
        {loading ? 'Отправляем...' : 'Отправить заявку'}
      </button>

      <button onClick={() => navigate('/orders')} style={secondaryButtonStyle}>
        Мои заявки
      </button>
    </div>
  )
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
  marginBottom: '12px',
}

const secondaryButtonStyle: React.CSSProperties = {
  width: '100%',
  padding: '16px',
  borderRadius: '12px',
  border: '1px solid #1A1A1A',
  background: 'transparent',
  color: '#1A1A1A',
  fontSize: '16px',
  cursor: 'pointer',
}
