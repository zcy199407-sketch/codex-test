// Rebuild the downloadable page with Node.js; using the page needs no Node.js.
const fs = require('node:fs')
const path = require('node:path')
const root = path.resolve(__dirname, '..')
const read = name => fs.readFileSync(path.join(root, name), 'utf8')
const inlineScript = name => '<script>\n' + read(name).replace(/<\/script/gi, '<\\/script') + '\n</script>'
let html = read('index.html')
html = html.replace('<link rel="stylesheet" href="styles.css">', '<style>\n' + read('styles.css') + '\n</style>')
for (const source of ['miniprogram/utils/checkin.js', 'course-model.js', 'web.js']) {
  html = html.replace(new RegExp('^[ \\t]*<script defer src="' + source.replace(/[.]/g, '\\.') + '"></script>\\n', 'm'), '')
}
html = html.replace('class="brand" href="./"', 'class="brand" href="#"')
// Inline scripts must run after the page elements have been parsed.
html = html.replace('</body>', inlineScript('miniprogram/utils/checkin.js') + '\n' + inlineScript('course-model.js') + '\n' + inlineScript('web.js') + '\n</body>')
fs.writeFileSync(path.join(root, 'checkin.html'), html)
console.log('Created checkin.html — a self-contained page, no server required.')
