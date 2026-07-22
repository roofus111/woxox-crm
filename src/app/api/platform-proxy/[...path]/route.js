import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function getUpstreamBase() {
  // Prefer internal Docker URL in production compose
  return (
    process.env.CRM_PLATFORM_API_URL ||
    process.env.NEXT_PUBLIC_CRM_PLATFORM_API_URL ||
    'http://localhost:4001/api/v1'
  ).replace(/\/$/, '')
}

async function proxy(request, context) {
  const parts = context.params?.path
  const path = Array.isArray(parts) ? parts.join('/') : parts || ''
  const incomingUrl = new URL(request.url)
  const target = `${getUpstreamBase()}/${path}${incomingUrl.search}`

  const headers = new Headers()
  const contentType = request.headers.get('content-type')
  const authorization = request.headers.get('authorization')
  if (contentType) headers.set('content-type', contentType)
  if (authorization) headers.set('authorization', authorization)

  const init = {
    method: request.method,
    headers,
    duplex: 'half',
  }

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    init.body = await request.text()
  }

  try {
    const upstream = await fetch(target, init)
    const text = await upstream.text()
    return new NextResponse(text, {
      status: upstream.status,
      headers: {
        'content-type': upstream.headers.get('content-type') || 'application/json',
      },
    })
  } catch (err) {
    return NextResponse.json(
      {
        message: `Platform API unreachable at ${target}`,
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 502 }
    )
  }
}

export async function GET(request, context) {
  return proxy(request, context)
}

export async function POST(request, context) {
  return proxy(request, context)
}

export async function PATCH(request, context) {
  return proxy(request, context)
}

export async function PUT(request, context) {
  return proxy(request, context)
}

export async function DELETE(request, context) {
  return proxy(request, context)
}
