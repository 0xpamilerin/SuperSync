const fs = require('fs');
const path = require('path');

const basePath = path.join(__dirname, 'src/app/(dashboard)');

const routes = {
  student: [
    'profile',
    'topics',
    'proposal',
    'chapters',
    'feedback',
    'progress',
    'meetings',
    'documents',
    'notifications'
  ],
  supervisor: [
    'students',
    'topics',
    'chapters',
    'feedback',
    'meetings',
    'reports',
    'notifications'
  ],
  admin: [
    'students',
    'supervisors',
    'assignments',
    'sessions',
    'departments',
    'reports',
    'announcements',
    'settings'
  ]
};

Object.entries(routes).forEach(([role, pages]) => {
  pages.forEach(page => {
    const dirPath = path.join(basePath, role, page);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    const filePath = path.join(dirPath, 'page.tsx');
    if (!fs.existsSync(filePath)) {
      const componentName = role.charAt(0).toUpperCase() + role.slice(1) + page.charAt(0).toUpperCase() + page.slice(1) + 'Page';
      const content = `export default function ${componentName}() {
  return (
    <div className="flex flex-col gap-4 p-8">
      <h1 className="text-2xl font-bold capitalize">${page}</h1>
      <p className="text-muted-foreground">This is the ${role} ${page} page. Implementation coming soon.</p>
    </div>
  );
}
`;
      fs.writeFileSync(filePath, content);
    }
  });
});

console.log("Scaffolding complete.");
