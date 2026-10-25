const {test}=require('node:test')
const assert=require('node:assert/strict')
const model=require('../course-model')
const {KEY,LEGACY_KEY,createStore}=require('../storage')
const now=new Date(2026,9,25,10).getTime()
function memory(entries={}){
 const data=new Map(Object.entries(entries))
 return {getItem:key=>data.has(key)?data.get(key):null,setItem:(key,value)=>data.set(key,value)}
}
test('new installation shares one canonical data store',()=>{
 const local=memory(),student=createStore(local),admin=createStore(local)
 student.save(student.load())
 const before=admin.load().records.length
 student.save(model.sign(student.load(),'calligraphy',now))
 assert.equal(admin.load().records.length,before+1)
})
test('legacy records and selected identity are retained without touching the old key',()=>{
 const legacy={...model.initial(now),learnerId:'demo05'},raw=JSON.stringify(legacy)
 const local=memory({[LEGACY_KEY]:raw}),store=createStore(local)
 assert.deepEqual(store.load(),{...legacy,records:[...legacy.records].sort((a,b)=>(b.date+' '+b.time).localeCompare(a.date+' '+a.time))})
 store.save(store.load())
 assert.equal(local.getItem(LEGACY_KEY),raw)
 assert.equal(JSON.parse(local.getItem(KEY)).records.length,4)
})
test('both historical stores merge exact duplicates once and preserve unique history',()=>{
 const legacy=model.initial(now)
 const current=model.sign(legacy,'dance',now)
 const local=memory({[KEY]:JSON.stringify(current),[LEGACY_KEY]:JSON.stringify(legacy)})
 const store=createStore(local)
 assert.equal(store.load().records.length,5)
 store.save(store.load())
 assert.equal(store.load().records.length,5)
})
test('damaged records are not replaced by demo seeds',()=>{
 const local=memory({[KEY]:'broken',[LEGACY_KEY]:JSON.stringify(model.initial(now))})
 assert.throws(()=>createStore(local).load())
 assert.equal(local.getItem(KEY),'broken')
})
test('empty stored records remain empty and do not reseed',()=>{
 const empty={learnerId:'demo01',records:[]},local=memory({[KEY]:JSON.stringify(empty)})
 assert.deepEqual(createStore(local).load(),empty)
})
