import { useEffect, useState } from 'react'
import { supabase } from '../utils/supabase'
import { useNavigate } from 'react-router-dom'

interface Client {
  tg_user_id: string
  full_name: string | null
  tg_username: string | null
  phone: string | null
  order_count: number
}

export default function AdminClients() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchClients = async () => {
      const [profilesRes, ordersRes] = await Promise.all([
        supabase.from('profiles').select('*'),
        supabase.from('orders').select('tg_user_id'),
      ])

      if (!profilesRes.data) {
        setLoading(false)
        return
      }

      const orderCounts: Record<string, number> = {}
      ordersRes.data?.forEach(order => {
        orderCounts[order.tg_user_id] = (orderCounts[order.tg_user_id] ?? 0) + 1
      })

      const clientList: Client[] = profilesRes.data.map(profile => ({
        tg_user_id: profile.tg_user_id,
        full_name: profile.full_name ?? null,
        tg_username: profile.tg_username ?? null,
        phone: profile.phone ?? null,
        order_count: orderCounts[profile.tg_user_id] ?? 0,
      }))

      setClients(clientList)
      setLoading(false)
    }
    fetchClients()
  }, [])

  return (
    <div style={{ padding: '24px 20px', minHeight: '100vh', background: '#F5F0E8' }}>
      <p style={{ fontSize: '14px', color: '#8A7F6E', marginBottom: '4px' }}>co.odu</p>
      <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '4px' }}>Клиенты</h1>
      <p style={{ fontSize: '13px', color: '#8A7F6E', marginBottom: '24px' }}>
        Всего: {loading ? '...' : clients.length}
      </p>

      {loading && <p style={{ color: '#8A7F6E' }}>Загружаем...</p>}
      {!loading && clients.length === 0 && <p style={{ color: '#8A7F6E' }}>Клиентов пока нет</p>}

      {clients.map(client => (
        <div
          key={client.tg_user_id}
          style={{ ...cardStyle, cursor: client.order_count > 0 ? 'pointer' : 'default' }}
          onClick={() => client.order_count > 0 && navigate(`/admin/clients/${client.tg_user_id}`)}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '15px', fontWeight: 600, marginBottom: '4px' }}>
                {client.full_name ?? 'Аноним'}
              </p>
              {client.tg_username && (
                <p style={{ fontSize: '13px', color: '#8A7F6E', marginBottom: '2px' }}>@{client.tg_username}</p>
              )}
              {client.phone && (
                <p style={{ fontSize: '13px', color: '#8A7F6E' }}>{client.phone}</p>
              )}
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '13px', color: '#8A7F6E' }}>
                Заказов: {client.order_count}
              </p>
              {client.order_count > 0 && (
                <p style={{ fontSize: '12px', color: '#8A7F6E', marginTop: '4px' }}>
                  Открыть →
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

const cardStyle: React.CSSProperties = {
  padding: '16px',
  borderRadius: '14px',
  background: '#EDE5D0',
  marginBottom: '12px',
  border: '1px solid #D4C9B0',
}
