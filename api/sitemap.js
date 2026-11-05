export default async function handler(req, res) {
  const site = 'https://thrifty-ke.vercel.app'
  const pages = ['/', '/shop', '/mitumba', '/how-it-works']
  let items = []
  try {
    const r = await fetch(
      `$'https://hssjyreswltunyiarzdf.supabase.co/rest/v1/'status=eq.active&select=id,created_at&order=created_at.desc&limit=1000`,
      {
        headers: {
          apikey: sb_publishable_y-6-66CMIMZhWU8Szx2vFg_Hiso1RkK,
          Authorization: `Bearer ${sb_publishable_y-6-66CMIMZhWU8Szx2vFg_Hiso1RkK}`,
        },
      }
    )
    const rows = await r.json()
    if (Array.isArray(rows)) items = rows
  } catch (e) {}

  const urls = [
    ...pages.map((p) => `<url><loc>${site}${p}</loc></url>`),
    ...items.map(
      (i) =>
        `<url><loc>${site}/product/${i.id}</loc>${
          i.created_at ? `<lastmod>${String(i.created_at).slice(0, 10)}</lastmod>` : ''
        }</url>`
    ),
  ]

  res.setHeader('Content-Type', 'application/xml; charset=utf-8')
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400')
  res.status(200).send(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join('')}</urlset>`
  )
}