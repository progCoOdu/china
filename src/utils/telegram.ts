import { TelegramUser } from '../types'

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        initDataUnsafe: {
          user?: TelegramUser
        }
        expand: () => void
        close: () => void
      }
    }
  }
}

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
