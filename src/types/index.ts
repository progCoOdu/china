export interface Order {
  id: string
  tg_user_id: string
  tg_username: string | null
  tg_first_name: string | null
  link: string
  description: string
  status: 'new' | 'in_progress' | 'done'
  created_at: string
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
