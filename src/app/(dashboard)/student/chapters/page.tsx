"use client"

import * as React from "react"
import { Upload, FileText, X, Check, File, FileArchive } from "lucide-react"

import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { toast } from "@/hooks/use-toast"
import { getStudentChapters, createChapter } from "@/app/actions/chapters"

export default function ChapterUploadPage() {
  const [chapters, setChapters] = React.useState<any[]>([])
  const [dragActive, setDragActive] = React.useState(false)
  const [uploading, setUploading] = React.useState(false)
  const [progress, setProgress] = React.useState(0)
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null)
  const [selectedChapter, setSelectedChapter] = React.useState("1")

  const loadChapters = async () => {
    const data = await getStudentChapters()
    setChapters(data)
  }

  React.useEffect(() => {
    loadChapters()
  }, [])

  const handleDrag = function(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = function(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = function(e: React.ChangeEvent<HTMLInputElement>) {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = (file: File) => {
    if (file.type !== "application/pdf" && !file.type.includes("wordprocessingml") && !file.type.includes("msword")) {
      toast({ title: "Error", description: "Please upload PDF or DOCX files only.", type: "error" })
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "Error", description: "File is too large. Max 10MB.", type: "error" })
      return
    }
    setSelectedFile(file)
  }

  const uploadFile = async () => {
    if (!selectedFile) return
    setUploading(true)
    setProgress(25) // Fake initial progress
    
    try {
      const formData = new FormData()
      formData.append("file", selectedFile)
      
      setProgress(50)
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData
      })
      
      const uploadData = await res.json()
      setProgress(75)

      if (!res.ok) throw new Error(uploadData.error || "Upload failed")

      const chapterNumber = parseInt(selectedChapter, 10)
      const title = `Chapter ${chapterNumber}`

      const result = await createChapter({
        title,
        number: chapterNumber,
        fileUrl: uploadData.fileUrl,
        fileName: uploadData.originalName,
        fileSize: uploadData.size
      })

      if (result.success) {
        setProgress(100)
        toast({ title: "Success", description: "Chapter uploaded successfully", type: "success" })
        setSelectedFile(null)
        await loadChapters()
      } else {
        throw new Error(result.error)
      }
    } catch (error: any) {
      toast({ title: "Upload failed", description: error.message, type: "error" })
    } finally {
      setTimeout(() => {
        setUploading(false)
        setProgress(0)
      }, 500)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Group chapters by number
  const groupedChapters = chapters.reduce((acc: any, chapter) => {
    const num = chapter.number.toString()
    if (!acc[num]) acc[num] = []
    acc[num].push(chapter)
    return acc
  }, {})

  const availableTabs = Object.keys(groupedChapters).sort((a, b) => parseInt(b) - parseInt(a))

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED": return <Badge className="bg-secondary hover:bg-secondary text-white">Approved</Badge>
      case "PENDING": return <Badge variant="outline" className="text-warning border-warning bg-warning/10">Pending Review</Badge>
      case "CHANGES_REQUESTED": return <Badge variant="destructive">Changes Requested</Badge>
      default: return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Chapter Upload</h1>
        <p className="text-muted-foreground">Upload drafts for review or final approved chapters.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload File</CardTitle>
              <CardDescription>Drag and drop your document here.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Chapter</label>
                <Select value={selectedChapter} onValueChange={(val) => val && setSelectedChapter(val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a chapter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Chapter 1</SelectItem>
                    <SelectItem value="2">Chapter 2</SelectItem>
                    <SelectItem value="3">Chapter 3</SelectItem>
                    <SelectItem value="4">Chapter 4</SelectItem>
                    <SelectItem value="5">Chapter 5</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {!selectedFile ? (
                <div
                  className={cn(
                    "relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center transition-colors",
                    dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:bg-muted/50"
                  )}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    className="absolute inset-0 z-50 h-full w-full cursor-pointer opacity-0"
                    onChange={handleChange}
                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  />
                  <div className="rounded-full bg-primary/10 p-3 mb-4">
                    <Upload className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-sm font-semibold">Click or drag file to this area</h3>
                  <p className="text-xs text-muted-foreground mt-2">
                    Supports PDF and DOCX only. Maximum file size 10MB.
                  </p>
                </div>
              ) : (
                <div className="rounded-lg border p-4 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="rounded bg-muted p-3">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium line-clamp-1">{selectedFile.name}</p>
                      <p className="text-xs text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
                    </div>
                    {!uploading && (
                      <Button variant="ghost" size="icon" onClick={() => setSelectedFile(null)}>
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  {uploading && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Uploading...</span>
                        <span>{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  )}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                disabled={!selectedFile || uploading}
                onClick={uploadFile}
              >
                {uploading ? "Uploading..." : "Upload Document"}
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="space-y-6">
          <h3 className="text-lg font-semibold">Upload History</h3>
          
          {availableTabs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No chapters uploaded yet.</p>
          ) : (
            <Tabs defaultValue={availableTabs[0]} className="w-full">
              <TabsList className="w-full justify-start overflow-x-auto h-auto p-1 mb-4">
                {availableTabs.map((num) => (
                  <TabsTrigger key={num} value={num} className="px-4 py-2">
                    Chapter {num}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {availableTabs.map((num) => (
                <TabsContent key={num} value={num}>
                  <Card>
                    <CardContent className="p-0">
                      <div className="divide-y">
                        {groupedChapters[num].map((file: any) => (
                          <div key={file.id} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                            <div className="flex items-center gap-4">
                              <div className="rounded-full bg-primary/10 p-2">
                                <File className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <p className="text-sm font-medium">{file.fileName}</p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                  <Badge variant="secondary" className="px-1.5 py-0 rounded-sm text-[10px]">v{file.version}</Badge>
                                  <span>{formatFileSize(file.fileSize)}</span>
                                  <span>•</span>
                                  <span>{new Date(file.submittedAt).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              {getStatusBadge(file.status)}
                              <a href={file.fileUrl} download className={buttonVariants({ variant: "link", size: "sm", className: "h-auto p-0 text-xs" })}>Download file</a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
          )}
        </div>
      </div>
    </div>
  )
}
