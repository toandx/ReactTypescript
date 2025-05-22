Command to dev React Project with ViteJS:
1. Create project: npm create vite demoVite
npm create vite
2. Install lib: npm install
3. Deploy server: npm run dev
4. Build static HTML, JS, CSS file to ./dist folder from React Project: npm run build

You cannot open /dist/index.html directly in Chrome Web Browser, because Relative path to JS/CSS file are broken
-> Solution is Installing a simple static server: npm install -g serve
Deploy static server from dist: serve dist

