const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const pages=new Set(['index.html','plan.html','chat.html','saved.html','workspace.html','route.html']);
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.woff':'font/woff'};
http.createServer((req,res)=>{
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);return res.end();}
 let route;try{route=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400);return res.end();}
 if(route==='/index.html'){res.writeHead(302,{Location:'/'});return res.end();}
 const relative=route==='/'?'index.html':route.slice(1);
 const target=path.resolve(__dirname,relative),assetRoot=path.resolve(__dirname,'assets')+path.sep;
 if((!pages.has(relative)&&!target.startsWith(assetRoot))||!fs.existsSync(target)||!fs.statSync(target).isFile()){res.writeHead(404);return res.end('Not found');}
 res.writeHead(200,{'Content-Type':types[path.extname(target)]||'application/octet-stream','Cache-Control':'no-cache'});
 if(req.method==='HEAD')return res.end();
 fs.createReadStream(target).pipe(res);
}).listen(4173,'127.0.0.1',()=>console.log('Local: http://127.0.0.1:4173'));

