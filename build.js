const fs=require('node:fs'),path=require('node:path');
const out=path.resolve(__dirname,'dist');
fs.mkdirSync(out,{recursive:true});
for(const file of ['index.html','plan.html','chat.html','saved.html','workspace.html','route.html'])fs.copyFileSync(path.join(__dirname,file),path.join(out,file));
fs.cpSync(path.join(__dirname,'assets'),path.join(out,'assets'),{recursive:true});
console.log('Static build ready: dist/');
