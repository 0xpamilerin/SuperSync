const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

walkDir('./src/app', (filePath) => {
  if (filePath.endsWith('.tsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    content = content.replace(/<DropdownMenuTrigger asChild>\s*<Button([^>]*)>([\s\S]*?)<\/Button>\s*<\/DropdownMenuTrigger>/g, '<DropdownMenuTrigger$1>$2</DropdownMenuTrigger>');

    content = content.replace(/<Button([^>]*)asChild([^>]*)>\s*<Link\s+([^>]+)>([\s\S]*?)<\/Link>\s*<\/Button>/g, '<Link $3><Button$1$2>$4</Button></Link>');

    if (content !== original) {
      fs.writeFileSync(filePath, content);
      console.log('Updated', filePath);
    }
  }
});
