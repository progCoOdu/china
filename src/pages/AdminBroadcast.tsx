import { useState } from 'react'
import { supabase } from '../utils/supabase'

export default function AdminBroadcast() {
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  const handleSend = async () => {
    if (!message.trim()) return

    setSending(true)
    setResult(null)

    const { data: profiles } = await supabase.from('profiles').select('tg_user_id')

    if (!profiles || profiles.length === 0) {
      setResult('Нет клиентов для рассылки')
      setSending(false)
      return
    }

    let sent = 0
    let failed = 0

    for (const profile of profiles) {
      try {
        const res = await fetch('/api/broadcast', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tg_user_id: profile.tg_user_id,
            message,
          }),
        })
        const data = await res.json()
        if (data.ok) sent++
        else failed++
      } catch {
        failed++
      }
    }

    setSending(false)
    setResult(`Отправлено: ${sent} ✅ Ошибок: ${failed} ❌`)
    setMessage('')
  }

  return (
    <div style={{ padding: '24px 20px', minHeight: '100vh', background: '#F5F0E8' }}>
      <p style={{ fontSize: '14px', color: '#8A7F6E', marginBottom: '4px' }}>co.odu</p>
      <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>Рассылка</h1>
      <p style={{ fontSize: '14px', color: '#8A7F6E', marginBottom: '28px' }}>
        Сообщение получат все зарегистрированные клиенты
      </p>

      <div style={cardStyle}>
        <label style={labelStyle}>Текст сообщения</label>
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="Привет! У нас новые поступления..."
          rows={6}
          style={{ ...inputStyle, resize: 'vertical' }}
        />

        {result && (
          <p style={{ fontSize: '14px', marginTop: '12px', fontWeight: 600 }}>{result}</p>
        )}

        <button
          onClick={handleSend}
          disabled={sending || !message.trim()}
          style={{
            ...buttonStyle,
            opacity: !message.trim() ? 0.5 : 1,
            marginTop: '16px',
          }}
        >
          {sending ? 'Отправляем...' : `📢 Отправить всем`}
        </button>
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
  fontSize: '13px',
  color: '#8A7F6E',
  marginBottom: '8px',
  fontWeight: 600,
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
