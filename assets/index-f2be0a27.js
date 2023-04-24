var E=Object.defineProperty;var p=(r,t,e)=>t in r?E(r,t,{enumerable:!0,configurable:!0,writable:!0,value:e}):r[t]=e;var l=(r,t,e)=>(p(r,typeof t!="symbol"?t+"":t,e),e);(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))n(s);new MutationObserver(s=>{for(const i of s)if(i.type==="childList")for(const o of i.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&n(o)}).observe(document,{childList:!0,subtree:!0});function e(s){const i={};return s.integrity&&(i.integrity=s.integrity),s.referrerPolicy&&(i.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?i.credentials="include":s.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function n(s){if(s.ep)return;s.ep=!0;const i=e(s);fetch(s.href,i)}})();const h="columns-resize-connected",a="columns-resize-active",u="columns-resize-growing",f="columns-resize-shrinking";class v{constructor(t,e,n,s=50){l(this,"elements");l(this,"minWidth");l(this,"width",0);l(this,"idx");l(this,"columns");l(this,"handleElements",[]);l(this,"id");this.id=t,this.elements=e,this.columns=n,this.idx=n.columns.length,this.minWidth=s,this.getWidth()}get next(){return this.columns.columns[this.idx+1]}get previous(){return this.columns.columns[this.idx-1]}get canShrink(){return this.width>this.minWidth}get nextShrinkable(){let t=this.next;for(;t&&!t.canShrink;)t=t.next;return t}get selfOrPreviousShrinkable(){let t=this;for(;t&&!t.canShrink;)t=t.previous;return t}get isLast(){return this.idx==this.columns.columns.length-1}getWidth(){const t=this.elements.map(n=>n.clientWidth),e=Math.max(...t);this.width=e}setWidthDiff(t,e=!1){this.width+=t;const n=e&&this.canShrink?"1":"0",s=e?"1":"0",i=`${this.width}px`;this.elements.forEach(o=>{o.style.flex=`${s} ${n} ${i}`})}connectHandlebars(){this.handleElements=[],this.elements.forEach(t=>{const e=t.querySelector("[data-resize-handle]");e&&(e.targetColumn=this,this.handleElements.push(e))}),this.handleElements.forEach(t=>{t.addEventListener("pointerdown",this.columns.onPointerDown)}),this.addElementsClass(h),this.addHandlebarsClass(h)}disconnectHandlebars(){this.handleElements.forEach(t=>{t.removeEventListener("pointerdown",this.columns.onPointerDown)}),this.removeElementsClass(h),this.removeHandlebarsClass(h)}addElementsClass(t){this.elements.forEach(e=>{e.classList.add(t)})}removeElementsClass(t){this.elements.forEach(e=>{e.classList.remove(t)})}addHandlebarsClass(t){this.handleElements.forEach(e=>{e.classList.add(t)})}removeHandlebarsClass(t){this.handleElements.forEach(e=>{e.classList.remove(t)})}}class C{constructor(t,e){l(this,"columns",[]);l(this,"rootElement");l(this,"opts");l(this,"targetColumn");l(this,"lastResizeEventX",0);l(this,"lastGrowingColumn");l(this,"lastShrinkingColumn");l(this,"initialWidths",new Map);l(this,"onPointerDown",t=>{this.columns.forEach(e=>{e.getWidth(),e.setWidthDiff(0)}),this.lastResizeEventX=t.clientX,this.targetColumn=t.target.targetColumn,document.addEventListener("pointerup",this.onPointerUp,{once:!0}),document.addEventListener("pointermove",this.onPointerMove),this.rootElement.classList.add(a),this.targetColumn.addHandlebarsClass(a)});l(this,"onPointerUp",()=>{var t;this.columns.forEach(e=>e.setWidthDiff(0,!0)),document.removeEventListener("pointermove",this.onPointerMove),this.rootElement.classList.remove(a),(t=this.targetColumn)==null||t.removeHandlebarsClass(a),this.handleColumnsClasses(null,null)});l(this,"onPointerMove",t=>{var o,d,m;const e=t.clientX-this.lastResizeEventX;let n,s;if(e<0?(n=(o=this.targetColumn)==null?void 0:o.selfOrPreviousShrinkable,s=(d=this.targetColumn)==null?void 0:d.next):(n=(m=this.targetColumn)==null?void 0:m.nextShrinkable,s=this.targetColumn),!n||!s)return;const i=Math.min(Math.abs(e),n.width-n.minWidth);n.setWidthDiff(-i),s.setWidthDiff(i),this.handleColumnsClasses(s,n),this.lastResizeEventX=t.clientX});this.rootElement=t,this.opts=e,this.init(),this.prepare(),this.connect()}init(){const{minWidthByColumnId:t={},defaultMinWidth:e=50}=this.opts||{};this.columns=[];const n=[...this.rootElement.querySelectorAll("[data-column-id]")];new Set(n.map(i=>i.dataset.columnId)).forEach(i=>{this.columns.push(new v(i,n.filter(o=>o.dataset.columnId==i),this,i in t?t[i]:e))})}handleInitialWidths(){const t=this.columns.map(e=>e.id);(this.initialWidths.size!=t.length||!t.every(e=>this.initialWidths.has(e)))&&(this.initialWidths.clear(),this.columns.forEach(e=>{this.initialWidths.set(e.id,e.width)}))}prepare(){Promise.all(this.columns.map(t=>new Promise(e=>{t.elements.forEach(n=>{n.style.boxSizing="border-box",n.style.overflow="hidden",n.style.minWidth=t.minWidth+"px"}),requestAnimationFrame(()=>{t.getWidth(),t.setWidthDiff(0,!0),e()})}))).then(()=>{this.handleInitialWidths()})}connect(){this.columns.forEach(t=>t.connectHandlebars()),this.rootElement.classList.add(h)}disconnect(){this.onPointerUp(),this.columns.forEach(t=>t.disconnectHandlebars()),this.rootElement.classList.remove(h)}reconnect(){this.disconnect(),this.init(),this.prepare(),this.connect()}reset(){this.columns.forEach(t=>{t.width=this.initialWidths.get(t.id),t.setWidthDiff(0,!0)})}handleColumnsClasses(t,e){var n,s,i,o;this.lastGrowingColumn!=t&&(t==null||t.addElementsClass(a),t==null||t.addElementsClass(u),(n=this.lastGrowingColumn)==null||n.removeElementsClass(u),this.lastGrowingColumn!=e&&((s=this.lastGrowingColumn)==null||s.removeElementsClass(a))),this.lastShrinkingColumn!=e&&(e==null||e.addElementsClass(a),e==null||e.addElementsClass(f),(i=this.lastShrinkingColumn)==null||i.removeElementsClass(f),this.lastShrinkingColumn!=t&&((o=this.lastShrinkingColumn)==null||o.removeElementsClass(a))),this.lastGrowingColumn=t,this.lastShrinkingColumn=e}}const c=new C(document.querySelector("#wrapper"),{defaultMinWidth:70,minWidthByColumnId:{name:40}});document.getElementById("disconnect").onclick=()=>{c.disconnect()};document.getElementById("reconnect").onclick=()=>{c.reconnect()};document.getElementById("reset").onclick=()=>{c.reset()};document.getElementById("colors-cbx").onchange=()=>{document.getElementById("wrapper").classList.toggle("colors")};