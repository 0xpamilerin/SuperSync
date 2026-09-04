"use client"

import * as React from "react"
import { Upload, FileText, CheckCircle2, AlertCircle, Download, X } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

const MOCK_PARSED_DATA = [
  { name: "Alice Johnson", email: "alice.j@ui.edu.ng", matric: "182001", department: "Computer Science" },
  { name: "Bob Williams", email: "bob.w@ui.edu.ng", matric: "182002", department: "Computer Science" },
  { name: "Charlie Davis", email: "charlie.d@ui.edu.ng", matric: "182003", department: "Computer Science" },
]
import { uploadStudentsCSV } from "@/app/actions/admin"

export default function BulkUploadStudentsPage() {
  const [file, setFile] = React.useState<File | null>(null)
  const [isParsing, setIsParsing] = React.useState(false)
  const [parsedData, setParsedData] = React.useState<any[] | null>(null)
  const [csvContent, setCsvContent] = React.useState<string>("")
  const [isUploading, setIsUploading] = React.useState(false)
  const [uploadSuccess, setUploadSuccess] = React.useState(false)
  const [uploadErrors, setUploadErrors] = React.useState<string[]>([])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)
      
      const reader = new FileReader()
      reader.onload = (event) => {
        const text = event.target?.result as string
        setCsvContent(text)
        handleParse(text)
      }
      reader.readAsText(selectedFile)
    }
  }

  const handleParse = (text: string) => {
    setIsParsing(true)
    const lines = text.split("\n").map(l => l.trim()).filter(l => l.length > 0)
    // Assuming first line is header
    const data = []
    for (let i = 1; i < lines.length && i <= 10; i++) { // show up to 10 for preview
      const [name, email, matric, department] = lines[i].split(",").map(s => s.trim())
      if (name && email) {
        data.push({ name, email, matric, department })
      }
    }
    setParsedData(data)
    setIsParsing(false)
  }

  const handleUpload = async () => {
    setIsUploading(true)
    setUploadErrors([])
    try {
      const result = await uploadStudentsCSV(csvContent)
      if (result.success) {
        setUploadSuccess(true)
        if (result.errors && result.errors.length > 0) {
           setUploadErrors(result.errors)
        }
      } else {
        setUploadErrors([result.error || "Unknown error occurred"])
      }
    } catch (e: any) {
      setUploadErrors([e.message])
    }
    setIsUploading(false)
  }

  const handleReset = () => {
    setFile(null)
    setParsedData(null)
    setCsvContent("")
    setUploadSuccess(false)
    setUploadErrors([])
  }

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bulk Upload Students</h1>
          <p className="text-muted-foreground">Import student records via CSV.</p>
        </div>
        <Link href="/admin/students"><Button variant="outline" >Back to Students</Button></Link>
      </div>

      {uploadErrors.length > 0 && !uploadSuccess && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Upload Failed</AlertTitle>
          <AlertDescription>
            <ul className="list-disc pl-5 mt-2">
              {uploadErrors.slice(0, 5).map((err, i) => <li key={i}>{err}</li>)}
              {uploadErrors.length > 5 && <li>...and {uploadErrors.length - 5} more errors</li>}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {!uploadSuccess ? (
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload CSV</CardTitle>
              <CardDescription>
                Download the template, fill it with student data, and upload it here.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-6">
                <Button variant="secondary" className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Download Template
                </Button>
              </div>

              {!file ? (
                <div className="border-2 border-dashed rounded-lg p-12 text-center hover:bg-muted/50 transition-colors">
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Click to upload or drag and drop</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    CSV files only. Format: Name, Email, Matric Number, Department
                  </p>
                  <Button onClick={() => document.getElementById('csv-upload')?.click()}>
                    Select File
                  </Button>
                  <input 
                    id="csv-upload" 
                    type="file" 
                    accept=".csv" 
                    className="hidden" 
                    onChange={handleFileChange}
                  />
                </div>
              ) : (
                <div className="border rounded-lg p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-3 rounded-full text-primary">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-medium">{file.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {(file.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={handleReset}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {isParsing && (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p>Parsing CSV file...</p>
              </CardContent>
            </Card>
          )}

          {parsedData && !isParsing && (
            <Card>
              <CardHeader>
                <CardTitle>Preview Data</CardTitle>
                <CardDescription>
                  Found {parsedData.length} records. Please review before importing.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Matric Number</TableHead>
                        <TableHead>Department</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {parsedData.map((row, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-medium">{row.name}</TableCell>
                          <TableCell>{row.email}</TableCell>
                          <TableCell>{row.matric}</TableCell>
                          <TableCell>{row.department}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-4 border-t p-6">
                <Button variant="outline" onClick={handleReset} disabled={isUploading}>Cancel</Button>
                <Button onClick={handleUpload} disabled={isUploading}>
                  {isUploading ? "Importing..." : "Confirm & Import"}
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
      ) : (
        <Card className="text-center p-12">
          <CardContent className="space-y-6">
            <div className="mx-auto w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight">Upload Successful</h2>
              <p className="text-muted-foreground">
                Successfully imported {parsedData?.length} students. They will receive invitation emails shortly.
              </p>
            </div>
            <div className="flex justify-center gap-4 pt-4">
              <Button variant="outline" onClick={handleReset}>Upload Another</Button>
              <Link href="/admin/students"><Button >View All Students</Button></Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
