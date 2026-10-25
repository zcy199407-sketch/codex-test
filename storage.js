(function(root){
  'use strict'
  const model=typeof module!=='undefined'&&module.exports?require('./course-model'):root.CourseModel
  const KEY='qhyun-class-demo-v1'
  const LEGACY_KEY='culture-palace-demo-v1'
  function createStore(storage){
    function parse(key){
      const raw=storage.getItem(key)
      if(raw===null)return null
      const state=JSON.parse(raw)
      if(!model.validate(state))throw new Error('本地记录格式异常')
      return state
    }
    function load(){
      const current=parse(KEY),legacy=parse(LEGACY_KEY)
      if(!current&&!legacy)return model.initial()
      const base=current||legacy
      const seen=new Set()
      const records=[]
      for(const r of [...base.records,...(current&&legacy?legacy.records:[])]){
        const identity=JSON.stringify([r.learnerId,r.courseId,r.date,r.time])
        if(!seen.has(identity)){seen.add(identity);records.push(r)}
      }
      records.sort((a,b)=>(b.date+' '+b.time).localeCompare(a.date+' '+a.time))
      return {...base,records}
    }
    function save(next){
      if(!model.validate(next))throw new Error('本地记录格式异常')
      storage.setItem(KEY,JSON.stringify(next))
      return next
    }
    return {load,save}
  }
  const api={KEY,LEGACY_KEY,createStore}
  if(typeof module!=='undefined'&&module.exports)module.exports=api
  else root.CheckinStorage=api
})(globalThis)
