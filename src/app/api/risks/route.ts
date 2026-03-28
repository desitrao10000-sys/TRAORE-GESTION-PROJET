import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    
    const where = projectId ? { projectId } : {}
    
    const risks = await db.risk.findMany({
      where,
      include: {
        Project: true
      },
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json({ success: true, data: risks })
  } catch (error) {
    console.error('Error fetching risks:', error)
    return NextResponse.json({ success: false, error: 'Erreur lors de la récupération des risques' }, { status: 500 })
  }
}
