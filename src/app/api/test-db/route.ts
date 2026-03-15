import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Test read
    const taskCount = await db.task.count()
    
    // Test write - create a test comment
    const testComment = await db.comment.create({
      data: {
        content: 'Test comment ' + new Date().toISOString(),
        authorName: 'System Test'
      }
    })
    
    // Delete the test comment
    await db.comment.delete({
      where: { id: testComment.id }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Database is fully functional (read and write)',
      taskCount
    })
  } catch (error) {
    console.error('Database test error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error instanceof Error ? error.stack : null
    }, { status: 500 })
  }
}
