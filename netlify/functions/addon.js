const { routeRequest } = require('../../addonRouter')

function stripNetlifyFunctionPrefix(pathname) {
  const prefix = '/.netlify/functions/addon'
  if (!pathname) return '/'
  if (pathname === prefix) return '/'
  if (pathname.startsWith(prefix + '/')) return pathname.slice(prefix.length + 1)
  return pathname.startsWith('/') ? pathname.slice(1) : pathname
}

exports.handler = async (event) => {
  const method = event.httpMethod || 'GET'
  const pathname = stripNetlifyFunctionPrefix(event.path || '/')
  const query = event.queryStringParameters || {}

  const host = (event.headers && (event.headers['x-forwarded-host'] || event.headers.host)) || ''
  const proto = (event.headers && (event.headers['x-forwarded-proto'] || 'https')) || 'https'
  const baseUrl = host ? `${proto}://${host}` : ''

  return routeRequest({ method, pathname, query, baseUrl })
}

