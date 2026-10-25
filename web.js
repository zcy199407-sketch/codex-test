(() => {
'use strict'
const m=window.CourseModel,storage=window.CheckinStorage,$=id=>document.getElementById(id)
let state=m.initial(),store,ready=true,courseId='',view=document.body.dataset.page,timer
function announce(text,error=false){clearTimeout(timer);$('message').textContent=text;$('message').className=error?'error':'';$('message').hidden=false;if(!error)timer=setTimeout(()=>$('message').hidden=true,4500)}
try{
 store=storage.createStore(window.localStorage)
 state=store.load()
 store.save(state)
}catch{ready=false;announce('本地存储不可用或记录损坏，已停用写入以保护原有数据。请检查浏览器设置。',true)}
function save(next){if(!ready)throw new Error('本地存储不可用');store.save(next);state=next;render()}
function selected(){return state.records.filter(r=>(view==='admin'||r.learnerId===state.learnerId)&&($('filter').value==='all'||r.courseId===$('filter').value))}
if(view==='student')for(const l of m.learners){const o=document.createElement('option');o.value=l.id;o.textContent=l.name;$('learner').appendChild(o)}
for(const c of m.courses){
 if(view==='student'){
 const label=document.createElement('label');label.className='course-option'
 const radio=document.createElement('input');radio.type='radio';radio.name='course';radio.value=c.id
 const icon=document.createElement('span');icon.className='course-icon';icon.textContent=c.icon
 const title=document.createElement('strong');title.textContent=c.name
 const room=document.createElement('small');room.textContent=c.room+' · 演示课程'
 label.append(radio,icon,title,room);$('courses').appendChild(label)
 radio.addEventListener('change',()=>{courseId=c.id;render()})
 }
 const option=document.createElement('option');option.value=c.id;option.textContent=c.name;$('filter').appendChild(option)
}
function render(){
 const now=new Date(),date=m.dateKey(now)
 $('date').textContent=now.toLocaleDateString('zh-CN',{month:'long',day:'numeric',weekday:'long'})
 $('clock').textContent=now.toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit',hour12:false})
 if(view==='student'){
 $('learner').value=state.learnerId;$('learner').disabled=!ready
 const own=state.records.filter(r=>r.learnerId===state.learnerId),today=own.filter(r=>r.date===date)
 $('total').textContent=own.length;$('days').textContent=new Set(own.map(r=>r.courseId)).size;$('today-count').textContent=today.length
 const course=m.courses.find(c=>c.id===courseId),done=today.some(r=>r.courseId===courseId)
 $('course-sign').disabled=!ready||!course||done
 $('course-sign').textContent=done?'✓ 今日该课程已签到':course?'确认签到 · '+course.name:'请先选择课程'
 $('course-hint').textContent=course?'已选择：'+course.name+' · 每日一次':'尚未选择课程'
 $('identity-hint').textContent=ready?'当前身份：'+m.learners.find(l=>l.id===state.learnerId).name+'（虚构）':'本地存储异常，签到已停用。'
 }
 $('records-title').textContent=view==='admin'?'全部测试学员签到记录':'我的课程签到记录'
 $('scope-hint').textContent=(view==='admin'?'全部测试学员':'当前测试学员')+' · 导出当前筛选结果'
 if(view==='admin'){
 $('course-stats').replaceChildren()
 for(const s of m.stats(state.records)){
  const card=document.createElement('article');card.className='course-stat';card.dataset.course=s.id
  const h=document.createElement('h3');h.textContent=s.name
  card.append(h)
  for(const [label,value] of [['今日签到',s.today],['累计人次',s.total],['参与人数',s.people]]){
   const line=document.createElement('p'),number=document.createElement('strong');line.append(label+' ');number.textContent=value;line.append(number);card.append(line)
  }
  $('course-stats').append(card)
 }
 }
 const records=selected();$('record-count').textContent=records.length+' 条';$('empty').hidden=records.length>0;$('export').disabled=!records.length
 const fragment=document.createDocumentFragment()
 for(const r of records){
  const row=document.createElement('tr')
  for(const value of [m.learners.find(l=>l.id===r.learnerId).name,m.courses.find(c=>c.id===r.courseId).name,r.date,r.time]){
   const td=document.createElement('td');td.textContent=value;row.append(td)
  }
  const td=document.createElement('td'),badge=document.createElement('span');badge.className='done';badge.textContent='已签到';td.append(badge);row.append(td);fragment.append(row)
 }
 $('records').replaceChildren(fragment)
}
if(view==='student'){
$('learner').addEventListener('change',()=>{try{save({...store.load(),learnerId:$('learner').value})}catch{render();announce('身份切换保存失败，请检查浏览器存储。',true)}})
$('course-sign').addEventListener('click',()=>{try{save(m.sign({...store.load(),learnerId:state.learnerId},courseId));announce('课程签到成功！此记录仅供虚构数据演示。')}catch(e){announce(e.name==='QuotaExceededError'?'本地存储空间不足，签到未保存。':e.message,true)}})
}
$('filter').addEventListener('change',render)
$('export').addEventListener('click',()=>{
 const records=selected();if(!records.length)return
 const url=URL.createObjectURL(new Blob([m.csv(records)],{type:'text/csv;charset=utf-8;'})),a=document.createElement('a')
 a.href=url;a.download='青禾云课签到-虚构测试数据-'+m.dateKey(Date.now())+'.csv';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)
 announce('已导出当前筛选范围的虚构测试记录。')
})
function refresh(){
 try{state=store.load();render()}
 catch{ready=false;render();announce('本地记录读取失败，已停用写入。原记录没有被覆盖。',true)}
}
window.addEventListener('storage',e=>{if(e.key===storage.KEY||e.key===storage.LEGACY_KEY||e.key===null)refresh()})
window.addEventListener('pageshow',refresh)
document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh()})
render();setInterval(refresh,30000)
})()
