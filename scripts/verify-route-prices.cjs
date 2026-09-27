const assert=require('node:assert/strict');
const E=require('../assets/js/planner-engine.js');
for(const route of E.routes){
 for(const people of [1,2,19,20,25,26,100]){
  const p=E.generate({routeId:route.id,destination:route.destinationIds[0],days:route.duration,people,budget:3000000,interests:['Văn hóa']});
  const c=E.costs(p);
  assert.ok(c.total>0,route.id);
  assert.equal(c.total,c.totalPerPerson*people);
  assert.equal(c.over,c.total>people*3000000);
  if(route.price.minPeople&&people<route.price.minPeople){
   assert.ok(c.price.estimated);assert.match(c.note,/Ước tính/);
  }else assert.equal(c.price,route.price);
  if(c.price.estimated){assert.match(c.note,/Ước tính/);assert.equal(c.totalPerPerson,c.price.max);}
 }
}
assert.equal(E.routes.filter(r=>r.price.estimated).length,8);
assert.equal(E.routes.filter(r=>r.estimatedPrice).length,3);
console.log('PASS: 16 routes have totals; 8 estimates, 3 small-group fallbacks, published group thresholds preserved.');
