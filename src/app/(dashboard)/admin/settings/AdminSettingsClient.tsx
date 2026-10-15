"use client"

import * as React from "react"
import { Save, Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { updateSystemSettings } from "@/app/actions/admin"
import { toast } from "@/hooks/use-toast"

export function AdminSettingsClient({ initialSettings }: { initialSettings: Record<string, string> }) {
  const [isSaving, setIsSaving] = React.useState(false)
  const [savedSuccess, setSavedSuccess] = React.useState(false)

  const [form, setForm] = React.useState({
    deptName: initialSettings["deptName"] || "Computer Science",
    facultyName: initialSettings["facultyName"] || "Faculty of Science",
    institutionName: initialSettings["institutionName"] || "University of Ibadan",
    allowRegistration: initialSettings["allowRegistration"] !== "false",
    allowTopicSubmission: initialSettings["allowTopicSubmission"] !== "false",
    allowAutoAssignment: initialSettings["allowAutoAssignment"] !== "false"
  })

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setIsSaving(true)
    setSavedSuccess(false)

    try {
      const res = await updateSystemSettings({
        deptName: form.deptName,
        facultyName: form.facultyName,
        institutionName: form.institutionName,
        allowRegistration: String(form.allowRegistration),
        allowTopicSubmission: String(form.allowTopicSubmission),
        allowAutoAssignment: String(form.allowAutoAssignment)
      })

      if (res.success) {
        setSavedSuccess(true)
        toast({ title: "Settings Saved", description: "System preferences updated successfully.", type: "success" })
        setTimeout(() => setSavedSuccess(false), 3000)
      } else {
        toast({ title: "Failed to Update", description: res.error || "Failed to update settings", variant: "destructive" })
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to update settings", variant: "destructive" })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto w-full">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">System Settings</h1>
          <p className="text-muted-foreground">Configure global system parameters and preferences.</p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-1.5 text-sm text-green-600 bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-lg">
            <Check className="h-4 w-4" />
            <span>Settings saved successfully!</span>
          </div>
        )}
      </div>

      <Tabs defaultValue="general">
        <TabsList className="grid w-full sm:w-[400px] grid-cols-2 mb-8">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="features">Features & Policies</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Department & Institution Details</CardTitle>
              <CardDescription>Update the official institutional metadata used on exports and review documents.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="dept-name">Primary Department Name</Label>
                <Input 
                  id="dept-name" 
                  value={form.deptName} 
                  onChange={(e) => setForm({ ...form, deptName: e.target.value })} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="faculty-name">Faculty Name</Label>
                <Input 
                  id="faculty-name" 
                  value={form.facultyName} 
                  onChange={(e) => setForm({ ...form, facultyName: e.target.value })} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="institution-name">Institution / University Name</Label>
                <Input 
                  id="institution-name" 
                  value={form.institutionName} 
                  onChange={(e) => setForm({ ...form, institutionName: e.target.value })} 
                />
              </div>
            </CardContent>
            <CardFooter className="border-t pt-6">
              <Button onClick={() => handleSave()} disabled={isSaving}>
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? "Saving Changes..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="features" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Platform Feature Toggles</CardTitle>
              <CardDescription>Enable or restrict student actions and automated allocation algorithms.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Student Registration</Label>
                  <p className="text-sm text-muted-foreground">Allow new student accounts to register for project supervision.</p>
                </div>
                <Switch 
                  checked={form.allowRegistration} 
                  onCheckedChange={(checked) => setForm({ ...form, allowRegistration: checked })} 
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Topic Proposal Submission</Label>
                  <p className="text-sm text-muted-foreground">Allow students to submit new topics for departmental and supervisor review.</p>
                </div>
                <Switch 
                  checked={form.allowTopicSubmission} 
                  onCheckedChange={(checked) => setForm({ ...form, allowTopicSubmission: checked })} 
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Automated Assignment Engine</Label>
                  <p className="text-sm text-muted-foreground">Allow automated batch allocations based on capacity and department constraints.</p>
                </div>
                <Switch 
                  checked={form.allowAutoAssignment} 
                  onCheckedChange={(checked) => setForm({ ...form, allowAutoAssignment: checked })} 
                />
              </div>
            </CardContent>
            <CardFooter className="border-t pt-6">
              <Button onClick={() => handleSave()} disabled={isSaving}>
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? "Saving Changes..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
