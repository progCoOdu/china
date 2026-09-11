import type { VercelRequest, VercelResponse } from '@vercel/node'

const BOT_TOKEN = '8342233216:AAH-O9yPiqk5tBxjlgg_89wzKtebG7nsLzQ'

const statusLabel: Record<string, string> = {
  accepted: '✅ Ваш заказ принят! Мы начинаем работу.',
  declined: '❌ К сожалению, ваш заказ отклонён. Свяжитесь с менеджером.',
  ordered: '🛒 Товар заказан у поставщика.',
  warehouse: '📦 Товар прибыл на склад в Китае.',
  transit_msk: '🚚 Товар в пути в Москву.',
  transit_msq: '🚚 Товар в пути в Минск.',
  arrived: '🏁 Товар прибыл в Минск! Скоро свяжемся с вами.',
  ready: '🎉 Ваш заказ готов к выдаче! Ожидаем вас.',
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { tg_user_id, status, order_date } = req.body

  const message = statusLabel[status]
  if (!message) return res.status(400).json({ error: 'Unknown status' })

  const text = `*co.odu* — обновление заказа\n\nЗаказ от ${order_date}\n\n${message}`

  const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: tg_user_id,
      text,
      parse_mode: 'Markdown',
    }),
  })

  const data = await response.json()

  if (!data.ok) return res.status(500).json({ error: data.description })

  return res.status(200).json({ ok: true })
}
