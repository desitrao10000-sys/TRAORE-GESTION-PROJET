import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const folders = await db.folder.findMany({
      orderBy: { order: 'asc' }
    })
    return NextResponse.json({ success: true, data: folders })
  } catch (error) {
    console.error('Error fetching folders:', error)
    return NextResponse.json({ success: false, error: 'Erreur lors de la récupération des dossiers' }, { status: 500 })
  }
}
