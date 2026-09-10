import { useEffect, useState } from 'react'
import { supabase } from '../utils/supabase'
import { Order } from '../types'
import { useNavigate } from 'react-router-dom'

interface Client {
  tg_user_id: string
  tg_first_name: string | null
  tg_username: string | null
  orders: Order[]
}

export default function AdminClients() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchClients = async () => {
      const { data } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .order('created_at', { ascending: false })

      if (!data) {
        setLoading(false)
        return
      }

      const clientMap: Record<string, Client> = {}
      data.forEach(order => {
        if (!clientMap[order.tg_user_id]) {
          clientMap[order.tg_user_id] = {
            tg_user_id: order.tg_user_id,
            tg_first_name: order.tg_first_name,
            tg_username: order.tg_username,
            orders: [],
          }
        }
        clientMap[order.tg_user_id].orders.push(order)
      })

      setClients(Object.values(clientMap))
      setLoading(false)
    }
    fetchClients()
  }, [])

  return (
    <div style={{ padding: '24px 20px', minHeight: '100vh', background: '#F5F0E8' }}>
      <p style={{ fontSize: '14px', color: '#8A7F6E', marginBottom: '4px' }}>co.odu</p>
      <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '28px' }}>Клиенты</h1>

      {loading && <p style={{ color: '#8A7F6E' }}>Загружаем...</p>}
      {!loading && clients.length === 0 && <p style={{ color: '#8A7F6E' }}>Клиентов пока нет</p>}

      {clients.map(client => (
        <div
          key={client.tg_user_id}
          style={{ ...cardStyle, cursor: 'pointer' }}
          onClick={() => navigate(`/admin/clients/${client.tg_user_id}`)}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: '15px', fontWeight: 600 }}>
                {client.tg_first_name ?? 'Аноним'}
              </p>
              {client.tg_username && (
                <p style={{ fontSize: '13px', color: '#8A7F6E' }}>@{client.tg_username}</p>
              )}
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '13px', color: '#8A7F6E' }}>
                Заказов: {client.orders.length}
              </p>
              <p style={{ fontSize: '12px', color: '#8A7F6E', marginTop: '2px' }}>
                Открыть →
              </p>
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
