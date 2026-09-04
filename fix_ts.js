const fs = require('fs');
const path = require('path');

// 1. Fix admin/assignments/page.tsx
let f1 = './src/app/(dashboard)/admin/assignments/page.tsx';
let c1 = fs.readFileSync(f1, 'utf8');
c1 = c1.replace(/onValueChange=\{setAssignMode\}/g, 'onValueChange={(val) => setAssignMode(val || "auto")}');
c1 = c1.replace(/onValueChange=\{setReviewerMode\}/g, 'onValueChange={(val) => setReviewerMode(val || "single")}');
fs.writeFileSync(f1, c1);
console.log('Fixed', f1);

// 2. Fix DropdownMenuTrigger variant
const filesToFix = [
  './src/app/(dashboard)/admin/students/page.tsx',
  './src/app/(dashboard)/admin/supervisors/page.tsx',
  './src/app/(dashboard)/student/documents/page.tsx'
];

filesToFix.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  if (!content.includes('import { buttonVariants } from "@/components/ui/button"')) {
    content = content.replace('import { Button } from "@/components/ui/button"', 'import { Button, buttonVariants } from "@/components/ui/button"');
  }
  content = content.replace(/<DropdownMenuTrigger variant="ghost" className="([^"]+)">/g, '<DropdownMenuTrigger className={buttonVariants({ variant: "ghost", className: "$1" })}>');
  fs.writeFileSync(f, content);
  console.log('Fixed', f);
});
