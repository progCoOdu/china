import { useEffect, useState } from 'react'
import { supabase } from '../utils/supabase'

export default function AdminSettings() {
  const [exchangeRate, setExchangeRate] = useState<string>('')
  const [deliveryRate, setDeliveryRate] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase.from('settings').select('*')
      if (data) {
        const rate = data.find(s => s.id === 'exchange_rate')
        const delivery = data.find(s => s.id === 'delivery_rate')
        setExchangeRate(rate?.value?.toString() ?? '')
        setDeliveryRate(delivery?.value?.toString() ?? '')
      }
      setLoading(false)
    }
    fetchSettings()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setSuccess(false)

    await supabase.from('settings').upsert({ id: 'exchange_rate', value: parseFloat(exchangeRate) })
    await supabase.from('settings').upsert({ id: 'delivery_rate', value: parseFloat(deliveryRate) })

    setSaving(false)
    setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
  }

  return (
    <div style={{ padding: '24px 20px', minHeight: '100vh', background: '#F5F0E8' }}>
      <p style={{ fontSize: '14px', color: '#8A7F6E', marginBottom: '4px' }}>co.odu</p>
      <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '28px' }}>Настройки</h1>

      {loading ? <p style={{ color: '#8A7F6E' }}>Загружаем...</p> : (
        <>
          <div style={cardStyle}>
            <label style={labelStyle}>Курс юань → BYN</label>
            <input
              type="number"
              value={exchangeRate}
              onChange={e => setExchangeRate(e.target.value)}
              style={inputStyle}
              step="0.01"
            />
            <p style={{ fontSize: '12px', color: '#8A7F6E', marginTop: '6px' }}>
              Сейчас: 1 ¥ = {exchangeRate} BYN
            </p>
          </div>

          <div style={cardStyle}>
            <label style={labelStyle}>Тариф доставки (BYN/кг)</label>
            <input
              type="number"
              value={deliveryRate}
              onChange={e => setDeliveryRate(e.target.value)}
              style={inputStyle}
              step="0.5"
            />
            <p style={{ fontSize: '12px', color: '#8A7F6E', marginTop: '6px' }}>
              Сейчас: {deliveryRate} BYN за кг
            </p>
          </div>

          {success && (
            <p style={{ color: '#5A7A5A', marginBottom: '12px', fontWeight: 600 }}>
              ✅ Сохранено!
            </p>
          )}

          <button onClick={handleSave} disabled={saving} style={buttonStyle}>
            {saving ? 'Сохраняем...' : 'Сохранить'}
          </button>
        </>
      )}
    </div>
  )
}

const cardStyle: React.CSSProperties = {
  background: '#EDE5D0',
  borderRadius: '16px',
  padding: '20px',
  marginBottom: '16px',
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
  fontSize: '16px',
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
