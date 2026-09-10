export interface OrderItem {
  id: string
  order_id: string
  name: string | null
  link: string
  product_type: string | null
  color: string | null
  size: string | null
  price_cny: number | null
  weight_kg: number | null
  created_at: string
}

export interface Order {
  id: string
  tg_user_id: string
  tg_username: string | null
  tg_first_name: string | null
  status: string
  amount_paid: number
  total_byn: number | null
  created_at: string
  order_items?: OrderItem[]
}

export interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  language_code?: string
}

export interface Setting {
  id: string
  value: number
}
