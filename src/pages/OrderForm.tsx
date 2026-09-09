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
    <div style={{ padding: '24px' }}>
      <h1 style={{ marginBottom: '8px' }}>Заказ из Китая</h1>
      <p style={{ marginBottom: '24px', opacity: 0.6 }}>Вставь ссылку и опиши что нужно</p>

      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}>Ссылка</label>
        <input
          type="url"
          placeholder="https://..."
          value={link}
          onChange={e => setLink(e.target.value)}
          style={inputStyle}
        />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}>Описание</label>
        <textarea
          placeholder="Что заказать, размер, цвет, количество..."
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={5}
          style={{ ...inputStyle, resize: 'vertical' }}
        />
      </div>

      {error && <p style={{ color: 'red', marginBottom: '12px' }}>{error}</p>}

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
  padding: '12px',
  borderRadius: '10px',
  border: '1px solid #ddd',
  fontSize: '16px',
  outline: 'none',
}

const buttonStyle: React.CSSProperties = {
  width: '100%',
  padding: '14px',
  borderRadius: '10px',
  border: 'none',
  background: '#2563eb',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 600,
  cursor: 'pointer',
  marginBottom: '12px',
}

const secondaryButtonStyle: React.CSSProperties = {
  width: '100%',
  padding: '14px',
  borderRadius: '10px',
  border: '1px solid #ddd',
  background: 'transparent',
  fontSize: '16px',
  cursor: 'pointer',
}
