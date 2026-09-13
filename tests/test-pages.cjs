const fs=require('fs'),vm=require('vm'),assert=require('assert'),E=require('../assets/js/planner-engine.js');
const memory=()=>{const data=new Map();return {getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)}};
const sessionStorage=memory(),localStorage=memory();
function page(screen){
 const html=fs.readFileSync(screen+'.html','utf8'),nodes={};
 const node=()=>({style:{},dataset:{},children:[],value:'',classList:{toggle(){},add(){}},setAttribute(){},addEventListener(type,fn){this[type]=fn},append(el){this.children.push(el)},querySelectorAll(){return []},querySelector(){return node()},focus(){},animate(){},textContent:'',innerHTML:''});
 for(const m of html.matchAll(/id="([^"]+)"/g))nodes[m[1]]=node();
 if(nodes['studio-form']){nodes['studio-form'].elements=Object.fromEntries(['destination','days','people','budget'].map(k=>[k,{value:({destination:'halong',days:3,people:2,budget:3000000})[k]}]));nodes['studio-form'].reset=()=>{};}
 const document={body:{dataset:{screen}},getElementById:id=>nodes[id]||null,querySelector:s=>s==='.destination-cover'&&screen==='plan'?node():null,querySelectorAll:()=>[],addEventListener(type,fn){this[type]=fn},createElement:node};
 const ctx={window:{TripPlannerEngine:E},document,sessionStorage,localStorage,location:{href:''},crypto:{randomUUID:()=> 'test-plan'},setTimeout:()=>0,clearTimeout(){},FormData:class{constructor(form){this.form=form}get(k){return this.form.elements[k].value}getAll(){return ['Ẩm thực','Biển']}},console};
 vm.runInNewContext(fs.readFileSync('assets/js/workspace.js','utf8'),ctx);
 return {nodes,ctx,click:id=>nodes[id].click(),draft:()=>JSON.parse(sessionStorage.getItem('tripmate.current-plan.v1')).plan};
}
let p=page('plan');p.nodes['studio-form'].elements.destination.value='danang';p.nodes['studio-form'].submit({preventDefault(){}});assert.equal(p.draft().input.destination,'danang');
const before=p.draft();let chat=page('chat');assert.equal(chat.draft().input.destination,'danang');chat.nodes['studio-chat-input'].value='Đổi địa điểm ngày 2';chat.nodes['studio-chat-form'].submit({preventDefault(){}});assert.notDeepEqual(chat.draft().days[1],before.days[1]);
chat.click('save-plan');assert.equal(JSON.parse(localStorage.getItem('tripmate.saved-plans.v1')).length,1);
let saved=page('saved');assert.match(saved.nodes['studio-saved'].innerHTML,/Đà Nẵng/);
saved.nodes['studio-saved'].click({target:{closest:s=>s==='[data-open]'?{dataset:{open:'test-plan'}}:null}});assert.equal(saved.ctx.location.href,'route.html?id=test-plan');
p=page('plan');assert.equal(p.draft().id,'test-plan');assert.deepEqual(p.draft().days[1],chat.draft().days[1]);
assert(!fs.readFileSync('plan.html','utf8').includes('id="studio-chat-form"'));
assert(!fs.readFileSync('chat.html','utf8').includes('id="studio-form"'));
assert(!fs.readFileSync('saved.html','utf8').includes('id="plan-page"'));
console.log('PASS: separate page markup; draft restored across pages; chat edits day; save, open, and restore preserved itinerary.');

