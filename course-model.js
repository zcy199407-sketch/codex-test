(function(root){
'use strict'
const base=typeof module!=='undefined'&&module.exports?require('./miniprogram/utils/checkin'):root.CheckinModel
const courses=[{id:'calligraphy',name:'书法',room:'书画教室',icon:'书'},{id:'dance',name:'舞蹈',room:'舞蹈教室',icon:'舞'},{id:'vocal',name:'声乐',room:'音乐教室',icon:'乐'}]
const learners=[{id:'demo01',name:'测试学员01'},{id:'demo02',name:'测试学员02'},{id:'demo03',name:'测试学员03'},{id:'demo04',name:'测试学员04'},{id:'demo05',name:'测试学员05'}]
function initial(now=Date.now()){
 const yesterday=new Date(now);yesterday.setDate(yesterday.getDate()-1)
 return {learnerId:'demo01',records:[
 {learnerId:'demo02',courseId:'calligraphy',date:base.dateKey(now),time:'09:00:00'},
 {learnerId:'demo03',courseId:'dance',date:base.dateKey(now),time:'09:10:00'},
 {learnerId:'demo04',courseId:'vocal',date:base.dateKey(now),time:'09:20:00'},
 {learnerId:'demo05',courseId:'calligraphy',date:base.dateKey(yesterday),time:'09:05:00'}
 ]}
}
function validate(s){return !!(s&&learners.some(l=>l.id===s.learnerId)&&Array.isArray(s.records)&&s.records.every(r=>r&&learners.some(l=>l.id===r.learnerId)&&courses.some(c=>c.id===r.courseId)&&/^\d{4}-\d{2}-\d{2}$/.test(r.date)&&/^\d{2}:\d{2}:\d{2}$/.test(r.time)))}
function sign(s,courseId,now=Date.now()){
 if(!courses.some(c=>c.id===courseId))throw new Error('请先选择课程')
 if(!learners.some(l=>l.id===s.learnerId))throw new Error('请选择虚构测试学员')
 const date=base.dateKey(now)
 if(s.records.some(r=>r.learnerId===s.learnerId&&r.courseId===courseId&&r.date===date))throw new Error('该学员今天已完成本课程签到')
 const d=new Date(now),time=[d.getHours(),d.getMinutes(),d.getSeconds()].map(n=>String(n).padStart(2,'0')).join(':')
 return {...s,records:[{learnerId:s.learnerId,courseId,date,time},...s.records]}
}
function stats(records,now=Date.now()){return courses.map(c=>({...c,total:records.filter(r=>r.courseId===c.id).length,today:records.filter(r=>r.courseId===c.id&&r.date===base.dateKey(now)).length,people:new Set(records.filter(r=>r.courseId===c.id).map(r=>r.learnerId)).size}))}
function csv(records){
 const cell=v=>'"'+String(v).replace(/"/g,'""')+'"'
 return '\ufeff'+[['测试学员','课程','日期','时间'],...records.map(r=>[learners.find(l=>l.id===r.learnerId).name,courses.find(c=>c.id===r.courseId).name,r.date,r.time])].map(row=>row.map(cell).join(',')).join('\r\n')
}
const api={courses,learners,initial,validate,sign,stats,csv,dateKey:base.dateKey}
if(typeof module!=='undefined'&&module.exports)module.exports=api
else root.CourseModel=api
})(globalThis)

