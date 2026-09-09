import { TelegramUser } from '../types'

export const tg = window.Telegram?.WebApp

export const getTelegramUser = (): TelegramUser | null => {
  const user = tg?.initDataUnsafe?.user
  if (!user) return null
  return user as TelegramUser
}

export const expandApp = () => {
  tg?.expand()
}

export const closeApp = () => {
  tg?.close()
}
