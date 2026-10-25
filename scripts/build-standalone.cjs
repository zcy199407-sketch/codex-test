// Developer-only build: generated pages need no build tools or external assets.
const fs=require('node:fs')
const path=require('node:path')
const root=path.resolve(__dirname,'..')
const read=name=>fs.readFileSync(path.join(root,name),'utf8')
const sources=['miniprogram/utils/checkin.js','course-model.js','storage.js','web.js']
function build(template){
 let html=read(template).replace('<link rel="stylesheet" href="styles.css">','<style>\n'+read('styles.css')+'\n</style>')
 for(const source of sources)html=html.replace('<script defer src="'+source+'"></script>','')
 html=html.replace('class="brand" href="./"','class="brand" href="index.html"')
 return html.replace('</body>',sources.map(name=>'<script>\n'+read(name).replace(/<\/script/gi,'<\\/script')+'\n</script>').join('\n')+'\n</body>')
}
const student=build('templates/student.html')
const outputs={'index.html':student,'checkin.html':student,'admin.html':build('templates/admin.html')}
const upload=path.join(root,'pages-upload')
fs.mkdirSync(upload,{recursive:true})
for(const [name,html] of Object.entries(outputs)){
 fs.writeFileSync(path.join(root,name),html)
 fs.writeFileSync(path.join(upload,name),html)
}
console.log('Built index.html (student), admin.html (admin), checkin.html (compatible student entry)')
