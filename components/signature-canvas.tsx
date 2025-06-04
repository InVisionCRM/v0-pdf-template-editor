"use client"

import type React from "react"
import { useRef, useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Stage, Layer, Text as KonvaText } from "react-konva"
import Konva from "konva"

interface SignatureCanvasProps {
  value: string
  onChange: (value: string) => void
  allowTypedSignature?: boolean
  typedSignatureFont?: string
  canvasHeight?: string
  inputPlaceholder?: string
}

export default function SignatureCanvas({
  value,
  onChange,
  allowTypedSignature = false,
  typedSignatureFont = "Caveat, cursive",
  canvasHeight = "h-32",
  inputPlaceholder = "Type your name"
}: SignatureCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const typedSignatureStageRef = useRef<Konva.Stage>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [mode, setMode] = useState<"draw" | "type">("draw")
  const [typedName, setTypedName] = useState<string>("")

  useEffect(() => {
    if (mode === "draw") {
      const canvas = canvasRef.current
      if (!canvas || !canvas.parentElement) return

      const newWidth = canvas.parentElement.offsetWidth
      const newHeight = canvas.parentElement.offsetHeight

      if (canvas.width !== newWidth || canvas.height !== newHeight) {
        canvas.width = newWidth > 0 ? newWidth : 300
        canvas.height = newHeight > 0 ? newHeight : 128
      }

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.lineWidth = 2
      ctx.lineCap = "round"
      ctx.strokeStyle = "#000"

      if (value && value.startsWith("data:image/")) {
        const img = new Image()
        img.crossOrigin = "anonymous"
        img.onload = () => {
          if (canvasRef.current) {
            const imgAspectRatio = img.width / img.height
            const canvasAspectRatio = canvas.width / canvas.height
            let drawWidth, drawHeight, offsetX, offsetY

            if (imgAspectRatio > canvasAspectRatio) {
              drawWidth = canvas.width
              drawHeight = canvas.width / imgAspectRatio
            } else {
              drawHeight = canvas.height
              drawWidth = canvas.height * imgAspectRatio
            }

            offsetX = (canvas.width - drawWidth) / 2
            offsetY = (canvas.height - drawHeight) / 2

            ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight)
          }
        }
        img.src = value
      }
    } else {
      if (!typedName) {
        onChange("")
      }
    }
  }, [value, mode, canvasHeight])

  useEffect(() => {
    if (mode === "type" && allowTypedSignature) {
      if (!typedName) {
        if (typedSignatureStageRef.current) {
          const stage = typedSignatureStageRef.current
          const layer = stage.getLayers()[0]
          if (layer) {
            layer.destroyChildren()
            layer.draw()
          }
        }
        onChange("")
        return
      }

      const stage = typedSignatureStageRef.current
      if (stage) {
        let textNode = stage.findOne("KonvaText") as Konva.Text
        if (!textNode) {
          const layer = stage.getLayers()[0] || new Konva.Layer()
          textNode = new Konva.Text({
            fontFamily: typedSignatureFont,
            fontSize: 40,
            fill: "#000000",
            width: stage.width(),
            height: stage.height(),
            align: "center",
            verticalAlign: "middle",
            padding: 10,
          })
          layer.add(textNode)
          if (!stage.getLayers().includes(layer)) {
            stage.add(layer)
          }
        }
        textNode.text(typedName)
        textNode.fill("#000000")
        stage.getLayers()[0]?.draw()

        setTimeout(() => {
          if (typedSignatureStageRef.current && typedName) {
            const dataUrl = typedSignatureStageRef.current.toDataURL({ mimeType: "image/png", quality: 1, pixelRatio: 2 })
            onChange(dataUrl)
          } else if (!typedName) {
            onChange("")
          }
        }, 50)
      }
    }
  }, [typedName, mode, allowTypedSignature, onChange, typedSignatureFont])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (mode !== "draw") return
    e.preventDefault()
    setIsDrawing(true)
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.beginPath()
    const { x, y } = getEventPosition(e, canvas)
    ctx.moveTo(x, y)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (mode !== "draw" || !isDrawing) return
    e.preventDefault()
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const { x, y } = getEventPosition(e, canvas)
    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const stopDrawing = () => {
    if (mode !== "draw" || !isDrawing) return
    setIsDrawing(false)
    const canvas = canvasRef.current
    if (!canvas) return

    const dataUrl = canvas.toDataURL("image/png")
    onChange(dataUrl)
  }

  const clearSignature = useCallback(() => {
    if (mode === "draw") {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext("2d")
      if (!ctx) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      onChange("")
    } else if (mode === "type" && allowTypedSignature) {
      setTypedName("")
    }
  }, [mode, allowTypedSignature, onChange])

  const getEventPosition = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
    canvas: HTMLCanvasElement,
  ) => {
    const rect = canvas.getBoundingClientRect()
    if ("touches" in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      }
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      }
    }
  }

  const handleModeChange = (newMode: "draw" | "type") => {
    setMode(newMode)
    if (newMode === "draw") {
      setTypedName("")
    } else {
      const canvas = canvasRef.current
      if (canvas) {
        const ctx = canvas.getContext("2d")
        ctx?.clearRect(0, 0, canvas.width, canvas.height)
      }
    }
    onChange("")
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || mode !== "draw" || !canvas.parentElement) return

    const parentElement = canvas.parentElement

    const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect
        if ((canvas.width !== width || canvas.height !== height) && width > 0 && height > 0) {
          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext("2d")
          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            ctx.lineWidth = 2
            ctx.lineCap = "round"
            ctx.strokeStyle = "#000"
            if (value && value.startsWith("data:image/")) {
              const img = new Image()
              img.crossOrigin = "anonymous"
              img.onload = () => {
                if (canvasRef.current) {
                  const imgAspectRatio = img.width / img.height
                  const canvasAspectRatio = canvas.width / canvas.height
                  let drawWidth, drawHeight, offsetX, offsetY

                  if (imgAspectRatio > canvasAspectRatio) {
                    drawWidth = canvas.width
                    drawHeight = canvas.width / imgAspectRatio
                  } else {
                    drawHeight = canvas.height
                    drawWidth = canvas.height * imgAspectRatio
                  }

                  offsetX = (canvas.width - drawWidth) / 2
                  offsetY = (canvas.height - drawHeight) / 2

                  ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight)
                }
              }
              img.src = value
            }
          }
        }
      }
    })

    resizeObserver.observe(parentElement)
    return () => resizeObserver.disconnect()
  }, [value, mode])

  return (
    <div className="space-y-2">
      {allowTypedSignature && (
        <div className="flex space-x-2 mb-2">
          <Button
            type="button"
            variant={mode === "draw" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => handleModeChange("draw")}
          >
            Draw
          </Button>
          <Button
            type="button"
            variant={mode === "type" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => handleModeChange("type")}
          >
            Type
          </Button>
        </div>
      )}

      {mode === "draw" ? (
        <Card className="p-1 bg-gray-50">
          <canvas
            ref={canvasRef}
            className={`w-full ${canvasHeight} border border-gray-200 bg-white rounded-sm cursor-crosshair`}
            style={{ touchAction: "none" }}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
        </Card>
      ) : (
        allowTypedSignature && (
          <div className="space-y-2">
            <Input
              type="text"
              placeholder={inputPlaceholder}
              value={typedName}
              onChange={(e) => setTypedName(e.target.value)}
              className="bg-white border-gray-300 text-black"
            />
            <Card className={`p-1 bg-gray-50 w-full ${canvasHeight} flex items-center justify-center overflow-hidden`}>
              <div className={`w-full ${canvasHeight} bg-white rounded-sm flex items-center justify-center`} ref={(node) => {
                if (node && typedSignatureStageRef.current) {
                  const stage = typedSignatureStageRef.current
                  const newWidth = node.offsetWidth
                  const newHeight = node.offsetHeight
                  if (stage.width() !== newWidth || stage.height() !== newHeight) {
                    stage.width(newWidth > 0 ? newWidth : 300)
                    stage.height(newHeight > 0 ? newHeight : 128)
                    const textNode = stage.findOne('KonvaText') as Konva.Text
                    if (textNode) {
                      textNode.width(stage.width())
                      textNode.height(stage.height())
                    }
                  }
                }
              }}>
                <Stage
                  ref={typedSignatureStageRef}
                  width={300}
                  height={128}
                  className="bg-white"
                >
                  <Layer>
                  </Layer>
                </Stage>
              </div>
            </Card>
          </div>
        )
      )}
      <div className="flex justify-end">
        <Button type="button" variant="outline" size="sm" onClick={clearSignature}>
          Clear
        </Button>
      </div>
    </div>
  )
}

SignatureCanvas.displayName = "SignatureCanvas"
