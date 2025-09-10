"use client"

import type React from "react"
import { useRef, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"

const colors = [
  "#000000",
  "#808080",
  "#800000",
  "#808000",
  "#008000",
  "#008080",
  "#000080",
  "#800080",
  "#808040",
  "#004040",
  "#0080FF",
  "#004080",
  "#8000FF",
  "#804000",
  "#FFFFFF",
  "#C0C0C0",
  "#FF0000",
  "#FFFF00",
  "#00FF00",
  "#00FFFF",
  "#0000FF",
  "#FF00FF",
  "#FFFF80",
  "#00FF80",
  "#80FFFF",
  "#8080FF",
  "#FF0080",
  "#FF8040",
]

export default function Component() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const paletteCanvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [color, setColor] = useState("#000000")
  const [tool, setTool] = useState("brush")
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const [hoveredColor, setHoveredColor] = useState<string | null>(null)
  const [showPalette, setShowPalette] = useState(false)
  const [isDraggingPalette, setIsDraggingPalette] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext("2d")
    if (context) {
      context.fillStyle = "#FFFFFF"
      context.fillRect(0, 0, canvas.width, canvas.height)
    }
  }, [])

  useEffect(() => {
    if (showPalette) {
      const canvas = paletteCanvasRef.current
      const context = canvas?.getContext("2d")
      if (context && canvas) {
        const gradient = context.createLinearGradient(0, 0, canvas.width, 0)
        gradient.addColorStop(0, "#FF0000")
        gradient.addColorStop(0.17, "#FFFF00")
        gradient.addColorStop(0.33, "#00FF00")
        gradient.addColorStop(0.5, "#00FFFF")
        gradient.addColorStop(0.67, "#0000FF")
        gradient.addColorStop(0.83, "#FF00FF")
        gradient.addColorStop(1, "#FF0000")

        context.fillStyle = gradient
        context.fillRect(0, 0, canvas.width, canvas.height)
      }
    }
  }, [showPalette])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    const context = canvas?.getContext("2d")
    if (context) {
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      context.beginPath()
      context.moveTo(x, y)
      setIsDrawing(true)
    }
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    const canvas = canvasRef.current
    const context = canvas?.getContext("2d")
    if (context) {
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      context.lineTo(x, y)
      context.strokeStyle = tool === "eraser" ? "#FFFFFF" : color
      context.lineWidth = tool === "eraser" ? 20 : 2
      context.lineCap = "round"
      context.stroke()
    }
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const getColorFromPalette = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = paletteCanvasRef.current
    const context = canvas?.getContext("2d")
    if (context && canvas) {
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      const imageData = context.getImageData(x, y, 1, 1)
      const [r, g, b] = imageData.data
      const hex = `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`
      setColor(hex.toUpperCase())
    }
  }

  const startPaletteDrag = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDraggingPalette(true)
    getColorFromPalette(e)
  }

  const dragPalette = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDraggingPalette) {
      getColorFromPalette(e)
    }
  }

  const stopPaletteDrag = () => {
    setIsDraggingPalette(false)
  }

  const startDragging = (e: React.MouseEvent<HTMLDivElement>) => {
    setDragging(true)
    setPosition({
      x: e.clientX - (containerRef.current?.offsetLeft || 0),
      y: e.clientY - (containerRef.current?.offsetTop || 0),
    })
  }

  const onDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    if (dragging) {
      const left = e.clientX - position.x
      const top = e.clientY - position.y
      if (containerRef.current) {
        containerRef.current.style.left = `${left}px`
        containerRef.current.style.top = `${top}px`
      }
    }
  }

  const stopDragging = () => {
    setDragging(false)
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    const context = canvas?.getContext("2d")
    if (context && canvas) {
      context.fillStyle = "#FFFFFF"
      context.fillRect(0, 0, canvas.width, canvas.height)
    }
  }

  return (
    <div className="h-screen overflow-hidden" style={{ backgroundColor: "#001B3D" }}>
      <div
        ref={containerRef}
        className="absolute border-2 border-white shadow-md"
        style={{
          width: "800px",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          backgroundColor: "#F8FAFC",
        }}
      >
        <div
          className="text-white px-2 py-1 flex justify-between items-center cursor-move"
          style={{ backgroundColor: "#001B3D" }}
          onMouseDown={startDragging}
          onMouseMove={onDrag}
          onMouseUp={stopDragging}
          onMouseLeave={stopDragging}
        >
          <span>untitled - wvclb</span>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              className="h-5 w-5 p-0 min-w-0 text-white hover:bg-opacity-20"
              style={{ "--tw-bg-opacity": "0.2" } as React.CSSProperties}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#003366")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              _
            </Button>
            <Button
              variant="ghost"
              className="h-5 w-5 p-0 min-w-0 text-white"
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#003366")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              □
            </Button>
            <Button
              variant="ghost"
              className="h-5 w-5 p-0 min-w-0 text-white"
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#003366")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              ×
            </Button>
          </div>
        </div>
        <div className="px-2 py-1 text-sm" style={{ backgroundColor: "#E6F2FF", color: "#001B3D" }}>
          <span className="mr-4">file</span>
          <span className="mr-4">edit</span>
          <span className="mr-4">view</span>
          <span className="mr-4">image</span>
          <span className="mr-4">options</span>
          <span>help</span>
        </div>
        <div className="flex">
          <div className="w-8 p-0.5 border-r" style={{ backgroundColor: "#E6F2FF", borderColor: "#CBD5E1" }}>
            <Button
              variant="ghost"
              className={`w-7 h-7 p-0 min-w-0 mb-0.5 ${tool === "brush" ? "shadow-inner" : ""}`}
              style={{
                backgroundColor: tool === "brush" ? "#CBD5E1" : "transparent",
                borderColor: tool === "brush" ? "#001B3D" : "transparent",
                borderWidth: tool === "brush" ? "1px" : "0",
              }}
              onClick={() => setTool("brush")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5"
                style={{ color: "#001B3D" }}
              >
                <path d="M18 12l-8-8-6 6c-2 2-2 5 0 7s5 2 7 0l7-7" />
                <path d="M17 7l3 3" />
              </svg>
            </Button>
            <Button
              variant="ghost"
              className={`w-7 h-7 p-0 min-w-0 mb-0.5 ${tool === "eraser" ? "shadow-inner" : ""}`}
              style={{
                backgroundColor: tool === "eraser" ? "#CBD5E1" : "transparent",
                borderColor: tool === "eraser" ? "#001B3D" : "transparent",
                borderWidth: tool === "eraser" ? "1px" : "0",
              }}
              onClick={() => setTool("eraser")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5"
                style={{ color: "#001B3D" }}
              >
                <path d="M20 20H7L3 16C2 15 2 13 3 12L13 2L22 11L20 20Z" />
                <path d="M17 17L7 7" />
              </svg>
            </Button>
            <Button
              variant="ghost"
              className={`w-7 h-7 p-0 min-w-0 mb-0.5 ${showPalette ? "shadow-inner" : ""}`}
              style={{
                backgroundColor: showPalette ? "#CBD5E1" : "transparent",
                borderColor: showPalette ? "#001B3D" : "transparent",
                borderWidth: showPalette ? "1px" : "0",
              }}
              onClick={() => setShowPalette(!showPalette)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5"
                style={{ color: "#001B3D" }}
              >
                <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
                <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
                <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
                <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
                <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
              </svg>
            </Button>
            <Button
              variant="ghost"
              className="w-7 h-7 p-0 min-w-0 mb-0.5"
              style={{
                backgroundColor: "transparent",
                borderColor: "transparent",
                borderWidth: "0",
              }}
              onClick={clearCanvas}
              title="Erase All (Reset)"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5"
                style={{ color: "#001B3D" }}
              >
                <path d="M3 6h18" />
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                <line x1="10" y1="11" x2="10" y2="17" />
                <line x1="14" y1="11" x2="14" y2="17" />
              </svg>
            </Button>
          </div>
          <div
            className="flex-grow overflow-auto border"
            style={{ width: "724px", height: "500px", borderColor: "#CBD5E1" }}
          >
            <canvas
              ref={canvasRef}
              width={2000}
              height={2000}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseOut={stopDrawing}
            />
          </div>
        </div>
        <div className="flex p-1 border-t relative" style={{ backgroundColor: "#E6F2FF", borderColor: "#CBD5E1" }}>
          <div className="flex flex-wrap gap-1">
            {colors.map((c) => (
              <Button
                key={c}
                variant="ghost"
                className={`w-6 h-6 p-0 min-w-0 ${color === c ? "ring-2" : ""}`}
                style={
                  {
                    backgroundColor: c,
                    "--tw-ring-color": "#001B3D",
                  } as React.CSSProperties
                }
                onClick={() => setColor(c)}
                onMouseEnter={() => setHoveredColor(c)}
                onMouseLeave={() => setHoveredColor(null)}
              />
            ))}
          </div>
          {hoveredColor && (
            <div
              className="absolute bottom-full mb-1 px-2 py-1 text-xs rounded shadow-lg pointer-events-none z-10"
              style={{
                backgroundColor: "#001B3D",
                color: "#FFFFFF",
                left: "50%",
                transform: "translateX(-50%)",
              }}
            >
              {hoveredColor.toUpperCase()}
              <div
                className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0"
                style={{
                  borderLeft: "4px solid transparent",
                  borderRight: "4px solid transparent",
                  borderTop: "4px solid #001B3D",
                }}
              />
            </div>
          )}
          {showPalette && (
            <div
              className="absolute bottom-full mb-2 left-2 border-2 shadow-lg z-20"
              style={{
                backgroundColor: "#F8FAFC",
                borderColor: "#001B3D",
              }}
            >
              <div
                className="px-2 py-1 text-xs font-medium border-b cursor-move"
                style={{
                  backgroundColor: "#001B3D",
                  color: "#FFFFFF",
                  borderColor: "#CBD5E1",
                }}
              >
                Color Palette
              </div>
              <div className="p-2">
                <canvas
                  ref={paletteCanvasRef}
                  width={200}
                  height={30}
                  className="cursor-crosshair border"
                  style={{ borderColor: "#CBD5E1" }}
                  onMouseDown={startPaletteDrag}
                  onMouseMove={dragPalette}
                  onMouseUp={stopPaletteDrag}
                  onMouseLeave={stopPaletteDrag}
                />
                <div className="mt-2 text-xs text-center" style={{ color: "#001B3D" }}>
                  Click or drag to select color
                </div>
              </div>
            </div>
          )}
        </div>
        <div
          className="px-2 py-1 text-sm border-t"
          style={{ backgroundColor: "#E6F2FF", borderColor: "#CBD5E1", color: "#001B3D" }}
        >
          wvclb.com @2025 all rights reserved 
        </div>
      </div>
    </div>
  )
}
