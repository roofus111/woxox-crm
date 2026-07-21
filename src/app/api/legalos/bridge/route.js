import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/libs/auth'

/**
 * Server-side SSO: CRM session → LegalOS JWT via shared bridge secret.
 * POST /api/legalos/bridge
 */
export async function POST() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })
  }

  const legalosApi = process.env.LEGALOS_API_URL || 'http://localhost:4000'
  const bridgeSecret = process.env.CRM_BRIDGE_SECRET || 'woxox-crm-legalos-dev-bridge'

  try {
    const res = await fetch(`${legalosApi}/api/v1/auth/crm-bridge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bridgeSecret,
        email: session.user.email,
        name: session.user.name || session.user.email,
        crmUserId: String(session.user.id || session.user.email),
        role: session.user.role || 'user',
        workspaceId: process.env.LEGALOS_WORKSPACE_ID || '000000000000000000000001'
      })
    })

    const json = await res.json()

    if (!res.ok) {
      return NextResponse.json(
        { success: false, error: json?.error?.message || 'LegalOS bridge failed', details: json },
        { status: res.status }
      )
    }

    return NextResponse.json({
      success: true,
      data: json.data,
      legalosWebUrl: process.env.NEXT_PUBLIC_LEGALOS_WEB_URL || 'http://localhost:3001'
    })
  } catch (e) {
    return NextResponse.json(
      {
        success: false,
        error: e instanceof Error ? e.message : 'Bridge unreachable — start LegalOS API on :4000'
      },
      { status: 502 }
    )
  }
}
