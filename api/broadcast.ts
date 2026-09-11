import type { VercelRequest, VercelResponse } from '@vercel/node'

const BOT_TOKEN = '8342233216:AAH-O9yPiqk5tBxjlgg_89wzKtebG7nsLzQ'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { tg_user_id, message } = req.body

  if (!tg_user_id || !message) return res.status(400).json({ error: 'Missing fields' })

  const text = `*co.odu* — новости\n\n${message}`

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
