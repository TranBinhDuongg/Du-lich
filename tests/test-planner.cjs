const assert=require('node:assert/strict'),E=require('../assets/js/planner-engine.js');
const v={destination:'danang',days:3,people:2,budget:3000000,interests:['Ẩm thực','Check-in']};
const plan=E.generate(v);assert.equal(plan.days.length,3);assert.equal(plan.days[0].activities.length,3);
assert(plan.days[0].activities.every(x=>v.interests.includes(x.tag)));
assert.equal(E.costs(E.generate({...v,days:1})).perPerson.stay,0);
assert.equal(E.costs(plan).total,E.costs(plan).totalPerPerson*2);
const changed=E.command(plan,'Tôi muốn đổi địa điểm ngày 2.');
assert.notDeepEqual(changed.plan.days[1],plan.days[1]);assert.deepEqual(changed.plan.days[0],plan.days[0]);
const cheaper=E.command(plan,'Có thể giảm chi phí không?');assert(E.costs(cheaper.plan).total<E.costs(plan).total);
assert(E.costs(E.reduceCost(cheaper.plan)).total<=E.costs(cheaper.plan).total);
assert(E.command(null,'Đổi ngày 2').reply.includes('trước'));
assert.throws(()=>E.command(plan,'Đổi ngày 20'));
assert.equal(E.command(plan,'Xin chào'),null);
for(const destination of Object.keys(E.destinations))for(let days=1;days<=14;days++)for(const people of [1,2,20]){
 const p=E.generate({...v,destination,days,people});const c=E.costs(p);
 assert.equal(c.total,Object.values(c.perPerson).reduce((a,b)=>a+b,0)*people);
 assert(E.costs(E.reduceCost(p)).total<=c.total);
 assert.equal(p.days.length,days);
}
for(const invalid of [{days:0},{days:1.5},{days:15},{people:0},{budget:NaN},{budget:-1},{destination:'nope'},{interests:[]}]){
 assert.throws(()=>E.generate({...v,...invalid}));
}
console.log('PASS: 420 destination/day/group combinations, budget totals, preference matching, day edits, chat commands, savings and validation.');

