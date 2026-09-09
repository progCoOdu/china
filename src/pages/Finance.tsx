import { useEffect, useState } from 'react'
import { supabase } from '../utils/supabase'

export default function Finance() {
  const [exchangeRate, setExchangeRate] = useState<number | null>(null)
  const [deliveryRate, setDeliveryRate] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase.from('settings').select('*')
      if (data) {
        const rate = data.find(s => s.id === 'exchange_rate')
        const delivery = data.find(s => s.id === 'delivery_rate')
        setExchangeRate(rate?.value ?? null)
        setDeliveryRate(delivery?.value ?? null)
      }
      setLoading(false)
    }
    fetchSettings()
  }, [])

  return (
    <div style={{ padding: '24px 20px', minHeight: '100vh', background: '#F5F0E8' }}>
      <p style={{ fontSize: '14px', color: '#8A7F6E', marginBottom: '4px' }}>co.odu</p>
      <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '28px' }}>Финансы</h1>

      {loading ? <p style={{ color: '#8A7F6E' }}>Загружаем...</p> : (
        <>
          <div style={cardStyle}>
            <p style={labelStyle}>Курс юань → BYN</p>
            <p style={valueStyle}>1 ¥ = {exchangeRate} BYN</p>
          </div>

          <div style={cardStyle}>
            <p style={labelStyle}>Доставка</p>
            <p style={valueStyle}>{deliveryRate} BYN / кг</p>
          </div>

          <div style={{ ...cardStyle, background: '#1A1A1A' }}>
            <p style={{ ...labelStyle, color: '#8A8A8A' }}>Итого к оплате</p>
            <p style={{ fontSize: '28px', fontWeight: 700, color: '#F5F0E8' }}>—</p>
            <p style={{ fontSize: '12px', color: '#8A8A8A', marginTop: '4px' }}>Появится в v1.3</p>
          </div>
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
  fontSize: '13px',
  color: '#8A7F6E',
  marginBottom: '8px',
}

const valueStyle: React.CSSProperties = {
  fontSize: '28px',
  fontWeight: 700,
  color: '#1A1A1A',
}
