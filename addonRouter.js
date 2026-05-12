const DEMO_SERIES_ID = 'sxex:demo'

const demoSeriesMeta = {
  id: DEMO_SERIES_ID,
  type: 'series',
  name: 'SxEx Demo Series',
  description: 'Demo series that provides SxxExx episodes for testing Continue Watching.',
  videos: [
    {
      id: 'sxex:demo:s01e01',
      title: 'Episode 1',
      season: 1,
      episode: 1
    },
    {
      id: 'sxex:demo:s01e02',
      title: 'Episode 2',
      season: 1,
      episode: 2
    },
    {
      id: 'sxex:demo:s01e03',
      title: 'Episode 3',
      season: 1,
      episode: 3
    }
  ]
}

const demoStreamUrl =
  'https://distribution.bbb3d.renderfarming.net/video/mp4/bbb_sunflower_1080p_30fps_normal.mp4'

function jsonResponse(body, statusCode = 200, extraHeaders = {}) {
  return {
    statusCode,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET,OPTIONS',
      'access-control-allow-headers': 'content-type',
      ...extraHeaders
    },
    body: body === undefined ? '' : JSON.stringify(body)
  }
}

function notFound() {
  return jsonResponse({ error: 'Not found' }, 404)
}

function toMetaPreview(meta) {
  return {
    id: meta.id,
    type: meta.type,
    name: meta.name,
    poster: meta.poster,
    background: meta.background,
    description: meta.description
  }
}

function parseStremioPath(pathname) {
  const cleaned = (pathname || '').replace(/\/+$/, '')
  if (!cleaned) return { kind: 'root' }

  const parts = cleaned.split('/').filter(Boolean)
  if (parts.length === 1 && parts[0] === 'manifest.json') return { kind: 'manifest' }

  if (parts.length === 3 && parts[0] === 'catalog') {
    const [_, type, idFile] = parts
    const id = idFile.endsWith('.json') ? idFile.slice(0, -5) : idFile
    return { kind: 'catalog', type, id }
  }

  if (parts.length === 3 && parts[0] === 'meta') {
    const [_, type, idFile] = parts
    const id = idFile.endsWith('.json') ? idFile.slice(0, -5) : idFile
    return { kind: 'meta', type, id }
  }

  if (parts.length === 3 && parts[0] === 'stream') {
    const [_, type, idFile] = parts
    const id = idFile.endsWith('.json') ? idFile.slice(0, -5) : idFile
    return { kind: 'stream', type, id }
  }

  return { kind: 'unknown' }
}

function buildManifest(baseUrl) {
  return {
    id: 'community.sxex.demo',
    version: '0.0.1',
    name: 'SxEx Demo',
    description: 'Demo addon that exposes a series with SxxExx episodes.',
    resources: ['catalog', 'meta', 'stream'],
    types: ['series'],
    catalogs: [
      {
        type: 'series',
        id: 'sxex',
        name: 'SxEx',
        extra: [{ name: 'search', isRequired: false }]
      }
    ],
    behaviorHints: {
      configurable: false
    },
    contactEmail: '',
    logo: '',
    background: ''
  }
}

function handleCatalog({ type, id, query }) {
  if (type !== 'series' || id !== 'sxex') return notFound()

  const search = (query && (query.search || query.query)) ? String(query.search || query.query) : ''
  if (search && !demoSeriesMeta.name.toLowerCase().includes(search.toLowerCase())) {
    return jsonResponse({ metas: [] })
  }

  return jsonResponse({ metas: [toMetaPreview(demoSeriesMeta)] })
}

function handleMeta({ type, id }) {
  if (type !== 'series') return notFound()

  if (id === DEMO_SERIES_ID) {
    return jsonResponse({ meta: demoSeriesMeta })
  }

  return notFound()
}

function handleStream({ type, id }) {
  if (type !== 'series') return notFound()

  const isEpisode = demoSeriesMeta.videos.some((v) => v.id === id)
  if (!isEpisode) return jsonResponse({ streams: [] })

  return jsonResponse({
    streams: [
      {
        name: 'Demo',
        title: 'Big Buck Bunny (demo stream)',
        url: demoStreamUrl,
        behaviorHints: {
          bingeGroup: DEMO_SERIES_ID
        }
      }
    ]
  })
}

function routeRequest({ method, pathname, query, baseUrl }) {
  if (method === 'OPTIONS') return jsonResponse(undefined, 204)

  const parsed = parseStremioPath(pathname)
  if (parsed.kind === 'root') return jsonResponse(buildManifest(baseUrl))
  if (parsed.kind === 'manifest') return jsonResponse(buildManifest(baseUrl))
  if (parsed.kind === 'catalog') return handleCatalog({ ...parsed, query })
  if (parsed.kind === 'meta') return handleMeta(parsed)
  if (parsed.kind === 'stream') return handleStream(parsed)

  return notFound()
}

module.exports = {
  routeRequest
}

