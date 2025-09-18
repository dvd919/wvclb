import { NextResponse } from 'next/server'
import { getAllTracks } from '@/lib/database'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const genre = searchParams.get('genre')

    // Get all tracks (mock + uploaded)
    let allTracks = await getAllTracks()

    // Apply search filter
    if (search) {
      allTracks = allTracks.filter(track =>
        track.songName.toLowerCase().includes(search.toLowerCase()) ||
        track.userName.toLowerCase().includes(search.toLowerCase())
      )
    }

    // Apply genre filter
    if (genre && genre !== 'all') {
      allTracks = allTracks.filter(track => track.genre === genre)
    }
    
    return NextResponse.json({
      success: true,
      tracks: allTracks,
      total: allTracks.length
    })

  } catch (error) {
    console.error('Error fetching tracks:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
