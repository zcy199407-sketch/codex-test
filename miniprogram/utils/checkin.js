const KEY = 'checkin-assistant-v1'
function dateKey(now) {
 const d = new Date(now)
 return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')
}
function initial() { return { name: '', records: [] } }
function validate(s) {
 return !!(s && typeof s.name==='string' && Array.isArray(s.records) && s.records.every(r=>r && typeof r.id==='string' && typeof r.name==='string' && typeof r.date==='string' && typeof r.time==='string' && ['activity','in','out'].includes(r.type)))
}
function checkIn(state,type,now) {
 if(!state.name.trim()) throw new Error('请先填写姓名')
 if(!['activity','in','out'].includes(type)) throw new Error('签到类型无效')
 const date=dateKey(now), name=state.name.trim()
 const today=state.records.filter(r=>r.date===date && r.name===name)
 if(today.some(r=>r.type===type)) throw new Error('今天已经完成这项签到')
 if(type==='out' && !today.some(r=>r.type==='in')) throw new Error('请先完成上班打卡')
 const d=new Date(now)
 const time=[d.getHours(),d.getMinutes(),d.getSeconds()].map(v=>String(v).padStart(2,'0')).join(':')
 return {...state,records:[{id:String(now)+'-'+type,name,date,time,type},...state.records]}
}
const labels={activity:'活动签到',in:'上班打卡',out:'下班打卡'}
function csv(records) {
 const cell=v=>'"'+String(v).replace(/^[=+@\-\t\r]/,"'$&").replace(/"/g,'""')+'"'
 return '\ufeff'+[['姓名','日期','时间','类型'],...records.map(r=>[r.name,r.date,r.time,labels[r.type]])].map(row=>row.map(cell).join(',')).join('\r\n')
}
const checkinModel={KEY,dateKey,initial,validate,checkIn,labels,csv}
if (typeof module !== 'undefined' && module.exports) module.exports=checkinModel
else globalThis.CheckinModel=checkinModel

