export default async function handler(req, res) {
  const id = String(req.query.id || '')
  const site = 'https://thrifty-ke.vercel.app'

  if (!/^[a-zA-Z0-9-]+$/.test(id)) {
    res.status(400).send('Bad request')
    return
  }

  const esc = (s) =>
    String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')

  let item = null
  try {
    const r = await fetch(
      `${https://hssjyreswltunyiarzdf.supabase.co/rest/v1/}/rest/v1/listings?id=eq.${id}&select=title,description,price,image_urls`,
      {
        headers: {
          apikey: sb_publishable_y-6-66CMIMZhWU8Szx2vFg_Hiso1RkK,
          Authorization: `Bearer ${sb_publishable_y-6-66CMIMZhWU8Szx2vFg_Hiso1RkK}`,
        },
      }
    )
    const rows = await r.json()
    item = Array.isArray(rows) ? rows[0] : null
  } catch (e) {}

  const url = `${site}/product/${id}`
  const title = item
    ? `${item.title} - KSh ${Number(item.price).toLocaleString()}`
    : 'Thrifty - buy and sell pre-owned items safely'
  const desc = item
    ? (item.description || 'Escrow-protected on Thrifty.').slice(0, 160)
    : 'Kenya\'s escrow-protected marketplace for pre-owned items.'
  const image = item && item.image_urls && item.image_urls[0] ? item.image_urls[0] : ''

  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600')
  res.status(200).send(`<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta property="og:type" content="product">
<meta property="og:site_name" content="Thrifty">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${esc(url)}">
${image ? `<meta property="og:image" content="${esc(image)}">` : ''}
<meta name="twitter:card" content="${image ? 'summary_large_image' : 'summary'}">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
${image ? `<meta name="twitter:image" content="${esc(image)}">` : ''}
<meta http-equiv="refresh" content="0;url=${esc(url)}">
</head>
<body><a href="${esc(url)}">${esc(title)}</a></body>
</html>`)
}