const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Frontend Setup...\n');

// Check if key files exist
const filesToCheck = [
  'src/index.tsx',
  'src/App.tsx',
  'src/index.css',
  'tailwind.config.js',
  'postcss.config.js',
  'package.json'
];

let allFilesExist = true;

filesToCheck.forEach(file => {
  const exists = fs.existsSync(path.join(__dirname, file));
  console.log(`${exists ? '✅' : '❌'} ${file}`);
  if (!exists) allFilesExist = false;
});

// Check if TailwindCSS directives are in CSS
const cssContent = fs.readFileSync(path.join(__dirname, 'src/index.css'), 'utf8');
const hasTailwindDirectives = cssContent.includes('@tailwind base') && 
                              cssContent.includes('@tailwind components') && 
                              cssContent.includes('@tailwind utilities');

console.log(`${hasTailwindDirectives ? '✅' : '❌'} TailwindCSS directives in CSS`);

// Check package.json dependencies
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
const hasReact = packageJson.dependencies.react;
const hasTailwind = packageJson.devDependencies.tailwindcss;
const hasReactHotToast = packageJson.dependencies['react-hot-toast'];

console.log(`${hasReact ? '✅' : '❌'} React ${hasReact ? packageJson.dependencies.react : 'not found'}`);
console.log(`${hasTailwind ? '✅' : '❌'} TailwindCSS ${hasTailwind ? packageJson.devDependencies.tailwindcss : 'not found'}`);
console.log(`${hasReactHotToast ? '✅' : '❌'} React Hot Toast ${hasReactHotToast ? packageJson.dependencies['react-hot-toast'] : 'not found'}`);

console.log('\n🎯 Setup Status:');
if (allFilesExist && hasTailwindDirectives && hasReact && hasTailwind) {
  console.log('✅ Frontend setup is complete and ready!');
  console.log('\n🚀 To start the development server:');
  console.log('   npm start');
  console.log('\n🏗️  To build for production:');
  console.log('   npm run build');
} else {
  console.log('❌ Some issues found in setup. Please check the errors above.');
}