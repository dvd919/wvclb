import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { addTrack, Track } from '@/lib/database'
import { parseFile } from 'music-metadata'

// Create uploads directory if it doesn't exist
const uploadsDir = join(process.cwd(), 'public', 'uploads')
if (!existsSync(uploadsDir)) {
  await mkdir(uploadsDir, { recursive: true })
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    const songName = formData.get('songName') as string
    const userName = formData.get('userName') as string
    const audioFile = formData.get('audioFile') as File

    if (!songName || !userName || !audioFile) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/wave']
    const fileExtension = audioFile.name.split('.').pop()?.toLowerCase()
    
    if (!allowedTypes.includes(audioFile.type) && fileExtension !== 'mp3' && fileExtension !== 'wav') {
      return NextResponse.json(
        { error: 'Invalid file type. Only MP3 and WAV files are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size (100MB limit)
    const maxSize = 100 * 1024 * 1024 // 100MB in bytes
    if (audioFile.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 100MB.' },
        { status: 400 }
      )
    }

    // Generate unique filename
    const timestamp = Date.now()
    const sanitizedSongName = songName.replace(/[^a-zA-Z0-9]/g, '_')
    const sanitizedUserName = userName.replace(/[^a-zA-Z0-9]/g, '_')
    const fileName = `${sanitizedUserName}_${sanitizedSongName}_${timestamp}.${fileExtension}`
    
    // Save file to uploads directory
    const filePath = join(uploadsDir, fileName)
    const bytes = await audioFile.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Calculate duration from audio file
    let duration = '0:00'
    try {
      const metadata = await parseFile(filePath)
      if (metadata.format.duration) {
        const totalSeconds = Math.round(metadata.format.duration)
        const minutes = Math.floor(totalSeconds / 60)
        const seconds = totalSeconds % 60
        duration = `${minutes}:${seconds.toString().padStart(2, '0')}`
      }
    } catch (error) {
      console.warn('Could not parse audio duration:', error)
    }

    // Create track data
    const trackData: Track = {
      id: timestamp,
      songName: songName.trim(),
      userName: userName.trim(),
      fileName: fileName,
      filePath: `/uploads/${fileName}`,
      fileSize: `${(audioFile.size / 1024 / 1024).toFixed(1)} MB`,
      duration: duration,
      uploadDate: new Date().toISOString().split('T')[0],
      genre: 'Unknown' // You could add genre selection to the form
    }

    // Save track to database
    await addTrack(trackData)

    return NextResponse.json({
      success: true,
      message: 'File uploaded successfully',
      file: trackData
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
