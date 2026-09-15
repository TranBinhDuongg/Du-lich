const fs=require('node:fs'),path=require('node:path');
const out=path.resolve(__dirname,'dist');
fs.mkdirSync(out,{recursive:true});

// HTML pages
const pages=['index.html','plan.html','chat.html','saved.html','workspace.html','route.html'];
for(const file of pages){
  const src=path.join(__dirname,file);
  if(fs.existsSync(src))fs.copyFileSync(src,path.join(out,file));
  else console.warn('Skipping missing file:',file);
}

// assets folder (css, js, images, fonts)
const assetsSrc=path.join(__dirname,'assets');
if(fs.existsSync(assetsSrc))fs.cpSync(assetsSrc,path.join(out,'assets'),{recursive:true});

// data folder
const dataSrc=path.join(__dirname,'data');
if(fs.existsSync(dataSrc))fs.cpSync(dataSrc,path.join(out,'data'),{recursive:true});

console.log('Static build ready: dist/');
