const http = require('http')
const { URL } = require('url')
const { routeRequest } = require('./addonRouter')

const port = Number(process.env.PORT || 7000)

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host || '127.0.0.1'}`)
  const pathname = url.pathname === '/' ? '/' : url.pathname.replace(/^\//, '')
  const query = Object.fromEntries(url.searchParams.entries())
  const baseUrl = `http://127.0.0.1:${port}`

  const response = await routeRequest({
    method: req.method || 'GET',
    pathname,
    query,
    baseUrl
  })

  res.statusCode = response.statusCode || 200
  Object.entries(response.headers || {}).forEach(([k, v]) => {
    if (v !== undefined) res.setHeader(k, v)
  })
  res.end(response.body || '')
})

server.listen(port, '127.0.0.1', () => {
  process.stdout.write(`Addon running at http://127.0.0.1:${port}/manifest.json\n`)
})

