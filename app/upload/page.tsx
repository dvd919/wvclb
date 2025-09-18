"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Upload, Music, User, FileAudio } from "lucide-react"

export default function UploadPage() {
  const [songName, setSongName] = useState("")
  const [userName, setUserName] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check if file is mp3 or wav
      const allowedTypes = ["audio/mpeg", "audio/wav", "audio/wave"]
      const fileExtension = file.name.split('.').pop()?.toLowerCase()
      
      if (allowedTypes.includes(file.type) || fileExtension === "mp3" || fileExtension === "wav") {
        setSelectedFile(file)
        setUploadStatus("idle")
      } else {
        alert("Please select an MP3 or WAV file")
        e.target.value = ""
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!songName.trim() || !userName.trim() || !selectedFile) {
      alert("Please fill in all fields and select a file")
      return
    }

    setIsUploading(true)
    setUploadStatus("idle")

    try {
      // Create FormData for file upload
      const formData = new FormData()
      formData.append("songName", songName.trim())
      formData.append("userName", userName.trim())
      formData.append("audioFile", selectedFile)

      // Upload to API
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setUploadStatus("success")
        setSongName("")
        setUserName("")
        setSelectedFile(null)
        
        // Reset file input
        const fileInput = document.getElementById("audioFile") as HTMLInputElement
        if (fileInput) fileInput.value = ""
      } else {
        throw new Error(result.error || 'Upload failed')
      }
      
    } catch (error) {
      console.error("Upload error:", error)
      setUploadStatus("error")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-indigo-600 hover:text-indigo-800 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Upload Your Music</h1>
          <p className="text-gray-600">Share your musical creation with the world</p>
        </div>

        {/* Upload Form */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Song Name Input */}
              <div>
                <label htmlFor="songName" className="block text-sm font-medium text-gray-700 mb-2">
                  <Music className="w-4 h-4 inline mr-2" />
                  Song Name
                </label>
                <input
                  type="text"
                  id="songName"
                  value={songName}
                  onChange={(e) => setSongName(e.target.value)}
                  placeholder="Enter your song title"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  required
                />
              </div>

              {/* User Name Input */}
              <div>
                <label htmlFor="userName" className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Your Name
                </label>
                <input
                  type="text"
                  id="userName"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Enter your name or artist name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  required
                />
              </div>

              {/* File Upload */}
              <div>
                <label htmlFor="audioFile" className="block text-sm font-medium text-gray-700 mb-2">
                  <FileAudio className="w-4 h-4 inline mr-2" />
                  Audio File (MP3 or WAV)
                </label>
                <div className="relative">
                  <input
                    type="file"
                    id="audioFile"
                    accept=".mp3,.wav,audio/mpeg,audio/wav"
                    onChange={handleFileChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    required
                  />
                </div>
                {selectedFile && (
                  <p className="mt-2 text-sm text-gray-600">
                    Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>

              {/* Upload Button */}
              <Button
                type="submit"
                disabled={isUploading || !songName.trim() || !userName.trim() || !selectedFile}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-6 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? (
                  <>
                    <Upload className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Song
                  </>
                )}
              </Button>

              {/* Status Messages */}
              {uploadStatus === "success" && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 font-medium">✅ Upload successful!</p>
                  <p className="text-green-600 text-sm">Your song has been uploaded successfully.</p>
                </div>
              )}

              {uploadStatus === "error" && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 font-medium">❌ Upload failed</p>
                  <p className="text-red-600 text-sm">There was an error uploading your file. Please try again.</p>
                </div>
              )}
            </form>
          </div>

          {/* File Requirements */}
          <div className="mt-6 bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">File Requirements</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Supported formats: MP3, WAV</li>
              <li>• Maximum file size: 100MB</li>
              <li>• Ensure your audio is properly mixed and mastered</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
