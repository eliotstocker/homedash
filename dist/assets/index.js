var Ue=Object.getPrototypeOf;var He=Reflect.get;var ve=(t,e,i)=>He(Ue(t),i,e);import{a as $,c as $e,b as W,d as qe,w as Ve,i as u,n as a,e as J,s as O,f as B,x as l,g as G,t as g,h as _e,j as Ye,T as Xe,k as We,l as be}from"./vendor.js";(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))r(s);new MutationObserver(s=>{for(const o of s)if(o.type==="childList")for(const n of o.addedNodes)n.tagName==="LINK"&&n.rel==="modulepreload"&&r(n)}).observe(document,{childList:!0,subtree:!0});function i(s){const o={};return s.integrity&&(o.integrity=s.integrity),s.referrerPolicy&&(o.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?o.credentials="include":s.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function r(s){if(s.ep)return;s.ep=!0;const o=i(s);fetch(s.href,o)}})();class I{getState(){return this.state}getMeta(){return this.meta}getPrefs(){return this.prefs}setState(e){Object.entries(e).forEach(([i,r])=>{this.state[i]=r})}setPrefs(e){Object.entries(e).forEach(([i,r])=>{this.prefs[i]=r})}static fromObject(e){const i=Object.create(I.prototype);return Object.assign(i,e)}toObject(){return{type:this.type,name:this.name,label:this.label,id:this.id,meta:this.meta,state:this.state,prefs:this.prefs,ingroup:this.ingroup}}}class Je{constructor(e,i){this.eventListeners={deviceUpdates:[],roomRefresh:[]},this.server=e,this.token=i,this.pollInterval=1e4,this.server.endsWith("/")||(this.server+="/")}addEventListener(e,i){this.eventListeners[e].push(i)}setDeviceValue(e,i,r){return $.post(this.server+"device/"+e+"?access_token="+this.token,{attribute:i,value:r}).then(this.quickPoll.bind(this))}setGroupValue(e,i,r){return $.post(this.server+"group/"+e.id+"?access_token="+this.token,{devices:e.devices,attribute:i,value:r}).then(this.quickPoll.bind(this))}setRoomPref(e,i,r){return $.post(this.server+"room/"+e+"?access_token="+this.token,{attribute:i,value:r}).then(this.quickPoll.bind(this))}init(){return $.get(this.server+"home?access_token="+this.token).then(e=>e.data).then(e=>this.rawData=e).then(()=>(this.homeData=this.formatDevices(this.filterUnknownDevices(this.rawData)),this.createSession()))}createSession(){return $.post(this.server+"session?access_token="+this.token).then(e=>e.data).then(({id:e})=>this.session=e).then(()=>{this.pollTimeout=setTimeout(this.pollSession.bind(this),this.pollInterval)})}quickPoll(){}pollSession(){return clearTimeout(this.pollTimeout),$.get(this.server+"session/"+this.session+"?access_token="+this.token).then(e=>e.data).then(({changes:e})=>{Object.keys(e).length>0&&(Object.entries(e).map(([i,r])=>this.setStateByDeviceId(parseInt(i),r)),this.eventListeners.deviceUpdates.forEach(i=>i(Object.keys(e).map(r=>parseInt(r)))))}).then(()=>{this.pollTimeout=setTimeout(this.pollSession.bind(this),this.pollInterval)}).catch(()=>{this.pollTimeout=setTimeout(this.pollSession.bind(this),this.pollInterval)})}setStateByDeviceId(e,i){const r=this.getDeviceById(e);r&&Object.assign(r.state,i)}getDeviceById(e){const i=this.homeData.devices.find(r=>r.id==e);return i||(console.log("cant find device",e),null)}filterUnknownDevices(e){return{...e,rooms:e.rooms.map(i=>({...i,devices:i.devices.filter(({type:r})=>r!=="unknown")}))}}getGroupId(e,i){var o;const r=parseInt((o=Object.entries(e.groupIds).find(([n,h])=>h===i))==null?void 0:o[0]);if(r)return{id:r,new:!1};let s=5e3;for(;Object.keys(e.groupIds).includes(s.toString());)s++;return e.groupIds[s]=i,{id:s,new:!0}}formatDevices(e){const i=e.rooms.flatMap(o=>this.generateGroupsForRoom(o.devices,e)),r=this.assignDevicesToGroups(e.rooms.flatMap(({devices:o})=>o),i),s=e.rooms.map(o=>this.generateRoomFromData(o,i));return{...e,devices:r,groups:i,rooms:s}}generateGroupsForRoom(e,i){const r=e.reduce((s,o)=>{const n=o.label.replace(/\s([\d-_]+)$/,""),h=s.find(d=>o.type===d.type&&d.label===n);if(h&&(o.ingroup=h.id,h.devices.push(o.id)),n!=o.label&&e.some(d=>d.label.match(RegExp(`${n}\\s([\\d\\-_]+)$`)))){const d=this.getGroupId(i,n),f={label:n,type:o.type,id:d.id,devices:[o.id],persisted:!d.new};o.ingroup=f.id,s.push(f)}return s},[]).filter(s=>s.devices.length>1);return r.filter(({persisted:s})=>!s).map(this.persistGroup.bind(this)),r}generateRoomFromData(e,i){const r=[...new Set(e.devices.map(n=>i.find(h=>h.devices.includes(n.id))).filter(n=>n))],o=[...e.devices.filter(n=>!i.find(h=>h.devices.includes(n.id))),...r].map(({id:n})=>n).sort((n,h)=>{if(e.prefs.order){const d=e.prefs.order.indexOf(n),f=e.prefs.order.indexOf(h);return d<0?1:f<0?-1:d-f}return 0});return{...e,devices:o}}assignDevicesToGroups(e,i){return e.map(r=>{const s=i.find(({devices:o})=>o.includes(r.id));return s&&(r.ingroup=s.id),r})}persistGroup(e){return $.post(this.server+"group?access_token="+this.token,{id:e.id,name:e.label})}updateDevicesByRoom(e){return $.get(this.server+`room/${e}?access_token=`+this.token).then(i=>i.data).then(i=>{const r=i.devices,s=this.generateRoomFromData(i,this.homeData.groups);console.log("room updated"),this.eventListeners.roomRefresh.forEach(o=>o(r,s))})}getHome(){if(!this.homeData)throw new Error("Provided not initialised");return this.homeData.home}getRooms(){if(!this.homeData)throw new Error("Provided not initialised");return this.homeData.rooms}getDevices(){return this.homeData.devices}getGroups(){return this.homeData.groups}refreshRoom(e){return this.updateDevicesByRoom(e)}}var ne=(t=>(t.deviceUpdates="deviceUpdates",t.roomRefresh="roomRefresh",t))(ne||{});const ke=$e();ke.startListening({actionCreator:"app",effect:async t=>{const e=Pe();switch(t.type){case"app/setRoom":e.room=t.payload;break;case"app/setFullscreen":e.fullscreen=t.payload;break}Ke(e)}});function Pe(){const t=window.location.search.substring(1);if(t.length<1)return{};var e=t.split("&");return e.length<1?{}:e.reduce((i,r)=>{const[s,o]=r.split("=");return{...i,[decodeURIComponent(s)]:Qe(decodeURIComponent(o||""))}},{})}function Qe(t){if(isFinite(t))return parseInt(t);const e=t.toLowerCase();return e=="true"||e=="false"?e=="true":ae[t]!=null?ae[t]:t}function Ke(t){const e=window.location.pathname;window.history.pushState(null,"Room",e+"?"+Ze(t))}function Ze(t){return Object.entries(t).map(([e,i])=>`${encodeURIComponent(e)}=${encodeURIComponent(i)}`).join("&")}var ae=(t=>(t[t.dateTime=0]="dateTime",t[t.minimal=1]="minimal",t[t.full=2]="full",t[t.calendar=3]="calendar",t))(ae||{});const et={fullscreen:!1,room:0,...Pe()},Ce=W({name:"app",initialState:et,reducers:{setRoom(t,e){t.room=e.payload}}}),{setRoom:tt}=Ce.actions,it=Ce.reducer,rt={name:"Loading...",baseUrl:"",tempScale:"c",lastUpdate:Date.now(),location:{longitude:0,latitude:0},sunrise:Date.now(),sunset:Date.now()},De=W({name:"home",initialState:rt,reducers:{initHome(t,e){Object.assign(t,e.payload)},homeUpdated(t){t.lastUpdate=Date.now()}}}),{initHome:st,homeUpdated:ot}=De.actions,nt=De.reducer,at=[],Oe=W({name:"rooms",initialState:at,reducers:{roomAdd(t,e){t.push(structuredClone(e.payload))},roomRefresh(t,e){const i=t.find(({id:r})=>r==e.payload.id);if(!i){this.roomAdd(t,e);return}Object.entries(e.payload).forEach(([r,s])=>{i[r]=s})},swapDeviceOrder(t,e){console.log(t);const i=t.find(({id:o})=>o==e.payload.roomId);console.log(i,e.payload.roomId);const r=e.payload.swapDevices,s=i.devices;console.log(s.indexOf(r[0]),s.indexOf(r[1])),s[s.indexOf(r[0])]=s.splice(s.indexOf(r[1]),1,s[s.indexOf(r[0])])[0],console.log(s),i.devices=s}}}),{roomAdd:lt,roomRefresh:ct,swapDeviceOrder:dt}=Oe.actions,ht=Oe.reducer,pt=[],Se=W({name:"devices",initialState:pt,reducers:{deviceAdd(t,e){t.push(structuredClone(e.payload))},deviceRefresh(t,e){const i=t.find(({id:r})=>r==e.payload.id);if(!i){this.deviceAdd(t,e);return}Object.entries(e.payload).forEach(([r,s])=>{i[r]=s})},setDeviceState(t,e){let i=t.find(({id:r})=>r==e.payload.device);Object.assign(i.state,e.payload.state)},updateDeviceState(t,e){let i=t.find(({id:r})=>r==e.payload.device);i&&Object.assign(i.state,e.payload.state)},setDevicePrefs(t,e){let i=t.find(({id:r})=>r==e.payload.device);i&&Object.assign(i.prefs,e.payload.prefs)}}}),{deviceAdd:ut,deviceRefresh:gt,setDeviceState:ye,updateDeviceState:mt,setDevicePrefs:ft}=Se.actions,vt=Se.reducer,bt=[],Ee=W({name:"groups",initialState:bt,reducers:{groupAdd(t,e){t.push(structuredClone(e.payload))},setGroupState(t,e){t.find(({id:i})=>i==e.payload.group)}}}),{groupAdd:yt,setGroupState:Yi}=Ee.actions,wt=Ee.reducer;class Q{constructor(e,i,r){this.devices=[],this.persisted=!1,this.label=e,this.type=i,this.id=r||Math.floor(Math.random()*999),r&&(this.persisted=!0)}getMeta(){return this.devices.reduce((e,{meta:i})=>Object.entries(i).reduce((r,[s,o])=>s in r?o?{...r,[s]:o}:r:{...r,[s]:o},e),{})}getState(){const e=this.devices.reduce((i,r)=>Object.entries(r.state).reduce((s,[o,n])=>(s[o]||(s[o]=[]),s[o].push(n),s),i),{});return Object.fromEntries(Object.entries(e).map(([i,r])=>[i,this.getStateValue(r)]))}getPrefs(){return{}}getStateValue(e){if(typeof e[0]=="number")return Math.round(e.reduce((i,r)=>i+r,0)/e.length);if(typeof e[0]=="boolean")return e.reduce((i,r)=>i||r,!1);if(typeof e[0]=="string")return e.reduce((i,r)=>i=="on"||r=="on"?"on":r=="off"?i:r,"off")}static fromObject(e,i){if(!e)return null;const r=Object.create(Q.prototype);return Object.assign(r,{...e,devices:e.devices.map(s=>I.fromObject(i.find(({id:o})=>o==s)))})}toObject(){return{type:this.type,label:this.label,id:this.id,devices:this.devices.map(({id:e})=>e),persisted:this.persisted}}}class he{static fromObject(e,i,r){if(!e)return null;let s=Object.create(he.prototype);return Object.assign(s,{...e,devices:e.devices.map(o=>{const n=r.find(({id:d})=>d==o);if(n)return Q.fromObject(n,i);const h=i.find(({id:d})=>d==o);if(h)return I.fromObject(h);throw new Error(`device: '${o}' not found`)})})}toObject(){return{name:this.name,id:this.id,devices:this.devices.map(e=>e.id),prefs:this.prefs}}}var le=(t=>(t.stateSet="stateSet",t.prefSet="prefSet",t))(le||{});const ce={stateSet:[],prefSet:[]},Le=$e();function we(t,e){ce[t].push(e)}Le.startListening({actionCreator:"devices",effect:async t=>{switch(t.type){case"devices/setDeviceState":ce.stateSet.forEach(e=>{e(t.payload.device,t.payload.state)});break;case"devices/setDevicePrefs":ce.prefSet.forEach(e=>{e(t.payload.device,t.payload.prefs)})}}});const c=qe({reducer:{app:it,home:nt,rooms:ht,devices:vt,groups:wt},middleware:t=>t().prepend(Le.middleware,ke.middleware)});function xt(t){return c.dispatch(st(t.getHome())),t.getRooms().forEach(e=>{c.dispatch(lt(e))}),t.getDevices().forEach(e=>{c.dispatch(ut(e))}),t.getGroups().forEach(e=>{c.dispatch(yt(e))}),c}function $t(t){c.dispatch(ot()),t.forEach(e=>{St(ze(e.id),e.getState())&&c.dispatch(mt({device:e.id,state:e.getState()}))})}function _t(t){t.forEach(e=>{c.dispatch(gt(e))})}function kt(t){c.dispatch(ct(t))}function Pt(t){c.dispatch(tt(t))}function pe(t){const{rooms:e,devices:i,groups:r}=c.getState();return he.fromObject(e.find(s=>s.id==t),i,r)}function Ct(t){const{devices:e,groups:i}=c.getState();return Q.fromObject(i.find(r=>r.id==t),e)}function Dt(t,e){c.dispatch(dt({roomId:t,swapDevices:e}))}function ze(t){return I.fromObject(c.getState().devices.find(e=>e.id==t))}function Ie(t,e){const i=c.getState().devices;if(!i.find(({id:s})=>s==t)){i.filter(({ingroup:o})=>o==t).forEach(o=>{c.dispatch(ye({device:o.id,state:Object.fromEntries(e)}))});return}c.dispatch(ye({device:t,state:Object.fromEntries(e)}))}function Ot(t,e){c.dispatch(ft({device:t,prefs:e}))}function St(t,e){const i=Object.assign({},t.state,e);return JSON.stringify(i)!==JSON.stringify(t.state)}function Et(t,e){const i=Ve(c.getState,t);c.subscribe(i(e))}var Lt=Object.defineProperty,zt=Object.getOwnPropertyDescriptor,A=(t,e,i,r)=>{for(var s=r>1?void 0:r?zt(e,i):e,o=t.length-1,n;o>=0;o--)(n=t[o])&&(s=(r?n(e,i,s):n(s))||s);return r&&s&&Lt(e,i,s),s};let w=class extends J(c)(O){constructor(){super(...arguments),this.tileRef=B(),this.initilised=!1,this.receiving=!1}get item(){return ze(parseInt(this.id))}get home(){return c.getState().home}get meta(){return this.item.getMeta()}render(){return l`<div ${G(this.tileRef)} class="tile ${this.constructor.name} ${this.state}">
          ${this.renderInner()}
        </div>`}renderInner(){return l`<div class="name">${this.name}</div>`}getTileElement(){return this.shadowRoot.querySelector("div")}getTileSize(){const t=this.getTileElement();return[parseInt(getComputedStyle(t).getPropertyValue("width")),parseInt(getComputedStyle(t).getPropertyValue("height"))]}updated(t){const e=Array.from(t.keys()).filter(i=>!this.constructor.ignoredProperties.includes(i)&&!i.startsWith("_"));if(e.length>0&&this.initilised&&!this.receiving){const i=new Map(e.map(r=>[r,this[r]]));Ie(parseInt(this.id,10),i)}this.initilised=!0}getDisplayName(){return this.room&&this.name.startsWith(this.room+" ")?this.name.substring(this.room.length+1).toLowerCase().startsWith("and")?this.name:this.name.substring(this.room.length+1):this.name}stateChanged(t){this.receiving=!0;const e=t.devices.find(({id:r})=>r==this.id);let i;if(e)i=I.fromObject(e);else{const r=t.groups.find(({id:s})=>s==this.id);i=Q.fromObject(r,t.devices)}Object.entries(i.getState()).forEach(([r,s])=>{this[r]=s}),Object.entries(i.getPrefs()).forEach(([r,s])=>{this[r]=s}),setTimeout(()=>{this.receiving=!1},20)}};w.ignoredProperties=["style","name","room","meta","home","updating","item","meta"];w.styles=u`
    @import url("https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200");
    .icon {
        font-family: 'Material Symbols Outlined';
        font-weight: normal;
        font-style: normal;
        font-size: 24px;
        line-height: 1;
        letter-spacing: normal;
        text-transform: none;
        display: inline-block;
        white-space: nowrap;
        word-wrap: normal;
        direction: ltr;
        -webkit-font-feature-settings: 'liga';
        -webkit-font-smoothing: antialiased;
        font-variation-settings:
            'FILL' 1,
            'wght' 400,
            'GRAD' 0,
            'opsz' 24
    }
    .icon.clear {
        font-variation-settings:
            'FILL' 0,
            'wght' 400,
            'GRAD' 0,
            'opsz' 24
    }
    
    .tile {
        background: rgb(0,0,0);
        background: linear-gradient(270deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.05) 100%);
        width: 100%;
        height: 100%;
        border-radius: var(--tile-roundness);
        overflow: hidden;
        color: var(--tile-text-color);
        box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
        display: inline-block;
        vertical-align: top;
        flex-grow: 0;
        flex-shrink: 1;
        flex-basis: auto;
        align-self: auto;
    }

    .tile .name {
        display: inline-block;
        font-size: var(--tile-name-size);
    }`;A([a()],w.prototype,"name",2);A([a()],w.prototype,"room",2);A([a()],w.prototype,"state",2);A([a({type:Boolean})],w.prototype,"updating",2);A([a()],w.prototype,"style",2);w=A([g("tile-base")],w);var It=Object.defineProperty,Rt=Object.getOwnPropertyDescriptor,jt=Object.getPrototypeOf,Tt=Reflect.get,S=(t,e,i,r)=>{for(var s=r>1?void 0:r?Rt(e,i):e,o=t.length-1,n;o>=0;o--)(n=t[o])&&(s=(r?n(e,i,s):n(s))||s);return r&&s&&It(e,i,s),s},Mt=(t,e,i)=>Tt(jt(t),i,e);let p=class extends w{constructor(){super(),this.editing=!1,this.moving=!1,this.resizing=!1,this.resizeHandleRef=B(),this.width=1,this.height=1,this.editableMouseDown=this.editableMouseDown.bind(this),this.editableMove=this.editableMove.bind(this),this.editableMoveEnd=this.editableMoveEnd.bind(this),this.resizableMouseDown=this.resizableMouseDown.bind(this),this.resiziableDrag=this.resiziableDrag.bind(this),this.resiziableDragEnd=this.resiziableDragEnd.bind(this)}connectedCallback(){super.connectedCallback(),this.addEventListener("mousedown",this.editableMouseDown)}attachProxyToWindow(t){const[e,i]=this.getTileSize();this.proxy=document.createElement("tile-proxy"),this.proxy.width=e,this.proxy.height=i,document.body.appendChild(this.proxy),this.proxy.setMouseOffset(t)}editableMouseDown(t){!this.editing||this.resizing||(this.tileRef.value.classList.add("editing"),this.attachProxyToWindow(t),this.moving=!0,t.preventDefault(),t.stopPropagation(),window.addEventListener("mousemove",this.editableMove),window.addEventListener("mouseup",this.editableMoveEnd))}editableMove(t){this.proxy.setProxyPosition(t),this.parentElement.getRootNode().host.checkProxyIntersection(this.proxy,this)}editableMoveEnd(t){window.removeEventListener("mousemove",this.editableMove),window.removeEventListener("mouseup",this.editableMoveEnd),this.moving=!1,t.preventDefault(),t.stopPropagation(),this.tileRef.value.classList.remove("editing"),document.body.removeChild(this.proxy)}resizableMouseDown(t){!this.editing||this.moving||(this.resizing=!0,t.preventDefault(),t.stopPropagation(),window.addEventListener("mousemove",this.resiziableDrag),window.addEventListener("mouseup",this.resiziableDragEnd))}resiziableDrag(t){const e=this.resizeHandleRef.value.getBoundingClientRect(),i=t.clientX-e.right,r=t.clientY-e.bottom;i>100&&this.width<2?this.width=2:i<-100&&this.width>1&&(this.width=1),r>50&&this.height<2?this.height=2:r<-50&&this.height>1&&(this.height=1)}resiziableDragEnd(t){window.removeEventListener("mousemove",this.resiziableDrag),window.removeEventListener("mouseup",this.resiziableDragEnd),this.resizing=!1,t.preventDefault(),t.stopPropagation()}disconnectedCallback(){this.removeEventListener("mousedown",this.editableMouseDown),super.disconnectedCallback()}render(){return this.editing?l`<div class="edit-overlay">
                <div class="resize-handle ${this.moving?"moving":""}" @mousedown=${this.resizableMouseDown} ${G(this.resizeHandleRef)}></div>
            </div>${super.render()}`:super.render()}};p.ignoredProperties=[...Mt(p,p,"ignoredProperties"),"editing","moving","resizing"];p.styles=[w.styles,u`
        :host {
            position: relative;
        }

        :host([width="2"]) {
            grid-column-end: span 2;
        }

        :host([height="2"]) {
            grid-row-end: span 2;
        }

        .edit-overlay {
            position: absolute;
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
            cursor: move;
            z-index: 999;
            border: 1px dashed rgba(0,0,0,0.5);
            box-sizing: border-box;
        }

        .tile.editing {
            opacity: 0.1;
            border: 1px dashed black;
            box-sizing: border-box;
        }

        .resize-handle {
            width: 15px;
            height: 0;
            padding-top: 10%;
            overflow: hidden;
            position: absolute;
            bottom: 4px;
            right: 4px;
            cursor: se-resize;
            z-index: 999;
        }

        .resize-handle:after {
            content: "";
            display: block;
            width: 0;
            height: 0;
            margin-top:-500px;
            
            border-top: 500px solid transparent;
            border-right: 500px solid rgba(128, 128, 128, 0.5);
        }

        .resize-handle.moving {
            display: none;
        }
    `];S([a({type:Boolean})],p.prototype,"editing",2);S([a({type:Boolean})],p.prototype,"moving",2);S([a({type:Boolean})],p.prototype,"resizing",2);S([a({attribute:!1})],p.prototype,"onItemReorder",2);S([a({attribute:!1})],p.prototype,"onItemResize",2);S([a({type:Number,reflect:!0})],p.prototype,"width",2);S([a({type:Number,reflect:!0})],p.prototype,"height",2);p=S([g("tile-editable")],p);var Ft=Object.defineProperty,Bt=Object.getOwnPropertyDescriptor,N=(t,e,i,r)=>{for(var s=r>1?void 0:r?Bt(e,i):e,o=t.length-1,n;o>=0;o--)(n=t[o])&&(s=(r?n(e,i,s):n(s))||s);return r&&s&&Ft(e,i,s),s};let k=class extends p{constructor(){super(...arguments),this.fill=!0,this.useImage=!1,this.imageRef=B(),this.imagePollInterval=0}renderInner(){return l`<div class="button">
        <span class="icon">videocam</span>
      </div>
      <div class="name">${this.getDisplayName()}</div>
      ${this.renderCamera()}`}renderCamera(){return this.useVideo()?l`<video autoplay muted src="${this.stream}" class="${this.fill?"fill":""}">`:l`<img ${G(this.imageRef)} src="${this.parseUrl()}" class="${this.fill?"fill":""}"/>`}useVideo(){return this.stream&&this.stream.startsWith("http")&&!this.useImage}parseUrl(){return this.b64image?`data:image/jpeg;base64,${this.b64image}`:this.image.startsWith("<")?/src=(.+?)\s/g.exec(this.image)[1]:this.image}connectedCallback(){super.connectedCallback(),clearInterval(this.imagePollInterval),!this.useVideo()&&!this.b64image&&(this.imagePollInterval=setInterval(this.imageIntervalRefresh.bind(this),1e4))}disconnectedCallback(){super.disconnectedCallback(),clearInterval(this.imagePollInterval)}imageIntervalRefresh(){const t=new URL(this.imageRef.value.src);t.searchParams.set("q",new Date().getTime().toString()),this.imageRef.value.src=t.toString()}};k.styles=[p.styles,u`.tile {
        position: relative;
    }
    
    .tile img {
        background: #333333;
        width: 100%;
        height: 100%;
        position: absolute;
        z-index: -1;
        top: 0;
        left: 0;
        object-fit: contain;
    }

    .tile video {
        background: #333333;
        width: 100%;
        height: 100%;
        position: absolute;
        z-index: -1;
        top: 0;
        left: 0;
        object-fit: contain;
    }

    .tile .fill {
      object-fit: cover;
    }
    
    .tile .button {
        background: var(--tile-button-background);
        width: var(--tile-button-size);
        height: var(--tile-button-size);
        margin: 8px;
        border-radius: 50%;
        text-align: center;
        display: inline-block;
        vertical-align: middle;
    }
    
    .tile .button .icon {
        font-size: var(--tile-icon-size);
        line-height: var(--tile-button-size)
    }
    
    .tile .name {
        display: inline-block;
        font-size: var(--tile-name-size);
        text-shadow: 0 0 3px rgba(0,0,0,0.5);
    }`];N([a()],k.prototype,"fill",2);N([a()],k.prototype,"useImage",2);N([a()],k.prototype,"image",2);N([a()],k.prototype,"stream",2);N([a()],k.prototype,"b64image",2);k=N([g("tile-camera")],k);var Gt=Object.defineProperty,At=Object.getOwnPropertyDescriptor,U=(t,e,i,r)=>{for(var s=r>1?void 0:r?At(e,i):e,o=t.length-1,n;o>=0;o--)(n=t[o])&&(s=(r?n(e,i,s):n(s))||s);return r&&s&&Gt(e,i,s),s};let P=class extends O{constructor(){super(...arguments),this.size=120,this.progress=0,this.min=0,this.max=360,this.width=4,this.circle=B()}updated(){if(this.circle.value){const e=this.circle.value.r.baseVal.value*2*Math.PI;this.circle.value.style.strokeDasharray=`${e} ${e}`,this.circle.value.style.strokeDashoffset=`${e}`;const i=this.max-this.min,r=e-this.progress/100*(i/360)*e;this.circle.value.style.strokeDashoffset=r,this.min!=0&&(this.circle.value.style.transform=`rotate(${this.min-90}deg)`)}}render(){return l`<svg
            class="progress-ring"
            width="${this.size}"
            height="${this.size}">
            <circle
                class="progress-ring__circle"
                stroke="white"
                stroke-width="${this.width}"
                fill="transparent"
                r="${this.size/2-this.width}"
                cx="${this.size/2}"
                cy="${this.size/2}"
                ${G(this.circle)}/>
        </svg>`}};P.styles=u`
    .progress-ring {
  
    }
    
    .progress-ring__circle {
      transition: 0.35s stroke-dashoffset;
      transform: rotate(-90deg);
      transform-origin: 50% 50%;
    }`;U([a({type:Number})],P.prototype,"size",2);U([a({type:Number})],P.prototype,"progress",2);U([a({type:Number})],P.prototype,"min",2);U([a({type:Number})],P.prototype,"max",2);U([a({type:Number})],P.prototype,"width",2);P=U([g("circular-progress")],P);var Nt=Object.defineProperty,Ut=Object.getOwnPropertyDescriptor,Re=(t,e,i,r)=>{for(var s=r>1?void 0:r?Ut(e,i):e,o=t.length-1,n;o>=0;o--)(n=t[o])&&(s=(r?n(e,i,s):n(s))||s);return r&&s&&Nt(e,i,s),s};let M=class extends p{renderInner(){return l`
      <div class="button">
        <span class="icon">thermometer</span>
      </div>
      <div class="name">${this.getDisplayName()}</div>
      <div class="temp">
        <span class="value">${this.temp}º${this.home.tempScale}</span>
      </div>
      <circular-progress progress="${this.progressForTemp(this.temp)}" min="-110" max="110" size="150" width="6"/>`}progressForTemp(t){return t>35?100:t<5?0:(t-5)/30*100}};M.styles=[p.styles,u`
    .tile img {
      background: #333333;
      width: 100%;
      height: 100%;
      position: absolute;
      z-index: -1;
      top: 0;
      left: 0;
      object-fit: contain;
    }
    
    .tile .button {
      background: var(--tile-button-background);
      width: var(--tile-button-size);
      height: var(--tile-button-size);
      margin: 8px;
      border-radius: 50%;
      text-align: center;
      display: inline-block;
      vertical-align: middle;
    }
    
    .tile .button .icon {
      font-size: var(--tile-icon-size);
      line-height: var(--tile-button-size);
    }
    
    .tile .name {
      max-width: 50%;
      vertical-align: middle;
    }
    
    .tile .temp {
      text-align: center;
      display: inline-block;
      width: 100%;
      font-weight: 600;
      margin-top: -8px;
    }
    
    .tile .temp .value {
        vertical-align: middle;
    }
    
    .tile circular-progress {
      display: none;
    }
    
    :host([height="2"]) .tile circular-progress {
      display: block;
    }

    :host([height="2"]) .tile .temp {
        display: block;
        margin-top: 55px;
    }

    .tile circular-progress {
      position: absolute;
      z-index: -1;
      left: 50%;
      top: 60%;
      opacity: 0.75;
      transform: translate(-50%, -50%);
    }`];Re([a({type:Number})],M.prototype,"temp",2);M=Re([g("tile-temp")],M);var Ht=Object.defineProperty,qt=Object.getOwnPropertyDescriptor,ue=(t,e,i,r)=>{for(var s=r>1?void 0:r?qt(e,i):e,o=t.length-1,n;o>=0;o--)(n=t[o])&&(s=(r?n(e,i,s):n(s))||s);return r&&s&&Ht(e,i,s),s};let V=class extends M{constructor(){super(...arguments),this.meta={heat:!1,cool:!1,modes:[]}}renderInner(){return l`
      <div class="button">
        <span class="icon">thermostat</span>
      </div>
      <div class="name">${this.getDisplayName()}</div>
      <div class="temp">
        <span class="icon left">arrow_left</span>
        <span class="value">${this.temp}º${this.home.tempScale}</span>
        <span class="icon right">arrow_right</span>
      </div>
      <div class="state">${this.state}</div>
      <div class="mode">${this.mode}</div>
      <circular-progress progress="${this.progressForTemp(this.temp)}" min="-110" max="110" size="150" width="6"/>`}};V.styles=[M.styles,u`
    .tile .temp .icon {
        vertical-align: middle;
        font-size: 35px;
        margin: 0 -8px;
    }
    
    .tile .temp .icon:hover {
        color: #FFFFFF;
        text-shadow: 0 0 5px #FFFFFF;
        cursor: pointer;
    }
    
    .tile .mode {
      background: rgba(0, 0, 0, 0.1);
      padding: 2px 8px;
      display: inline-block;
      border-radius: 3px;
      border: 1px solid rgba(0, 0, 0, 0.2);
      position: absolute;
      top: 8px;
      right: 8px;
      font-size: 10px;
      text-transform: uppercase;
    }
    
    .tile .mode:hover {
        background: rgba(255, 255, 255, 0.1);
        cursor: pointer;
    }
    
    .tile .state {
      position: absolute;
      bottom: 8px;
      right: 8px;
      text-align: center;
      font-size: 11px;
      opacity: 0.75;
    }

    :host([height="2"]) .tile .temp {
        display: block;
        margin-top: 35px;
    }

    :host([height="2"]) .tile .mode {
        position: relative;
        margin-top: 10px;
        left: 50%;
        right: auto;
        top: auto;
        transform: translateX(-50%);
    }`];ue([a({attribute:!1})],V.prototype,"meta",2);ue([a()],V.prototype,"mode",2);V=ue([g("tile-hvac")],V);var Vt=Object.defineProperty,Yt=Object.getOwnPropertyDescriptor,Xt=(t,e,i,r)=>{for(var s=r>1?void 0:r?Yt(e,i):e,o=t.length-1,n;o>=0;o--)(n=t[o])&&(s=(r?n(e,i,s):n(s))||s);return r&&s&&Vt(e,i,s),s};const q=class q extends p{constructor(){super(),this.boundMouseDown=this._mouseDown.bind(this),this.boundMouseUp=this._mouseUp.bind(this),this.addEventListener("mousedown",this.boundMouseDown),this.addEventListener("mouseup",this.boundMouseUp),this.addEventListener("touchstart",this.boundMouseDown),this.addEventListener("touchend",this.boundMouseUp)}clicked(){}longClicked(){}clamp(e,i,r){return e>r?r:e<i?i:e}_mouseDown(e){this.editing||(this.preventMouseEmulation(e),this.longClickTimeout=setTimeout(this._onLongClick.bind(this),250))}_mouseUp(e){this.preventMouseEmulation(e),this.longClickComplete||(clearTimeout(this.longClickTimeout),this.clicked()),this.longClickComplete=!1}_onLongClick(){this.longClickComplete=!0,this.onLongClick&&this.onLongClick(this.id),this.longClicked()}preventMouseEmulation(e){if(e.type.startsWith("touch"))try{e.preventDefault()}catch{}}};q.ignoredProperties=[...ve(q,q,"ignoredProperties"),"onLongClick"];let C=q;Xt([a({attribute:!1})],C.prototype,"onLongClick",2);class se extends C{constructor(){super(...arguments),this.dragLevelChanging=!1}dragStart(){throw new Error("dragStart must be overridden for a Draggable Component Control")}dragging(e){}dragEnd(e){throw new Error("dragEnd must be overridden for a Draggable Component Control")}clamp(e,i,r){return e>r?r:e<i?i:e}_mouseDown(e){this.preventMouseEmulation(e),e.preventDefault(),e instanceof TouchEvent&&e.changedTouches?this.dragStartAbsolutePosition=[e.changedTouches[0].clientX,e.changedTouches[0].clientY]:e instanceof MouseEvent&&(this.dragStartAbsolutePosition=[e.clientX,e.clientY]),this.dragEventHandlers={mousemove:this._onDrag.bind(this),mouseup:this._onDragEnd.bind(this)},window.addEventListener("mousemove",this.dragEventHandlers.mousemove),window.addEventListener("mouseup",this.dragEventHandlers.mouseup),window.addEventListener("touchmove",this.dragEventHandlers.mousemove),window.addEventListener("touchend",this.dragEventHandlers.mouseup),this.dragStart(),super._mouseDown(e)}_getPercentageFromEvent(e){const i=this.getTileSize()[0];let r;return e instanceof TouchEvent&&e.changedTouches?r=e.changedTouches[0].clientX-this.dragStartAbsolutePosition[0]:e instanceof MouseEvent&&(r=e.clientX-this.dragStartAbsolutePosition[0]),this.dragLevelChanging=!0,r/i}_onDrag(e){if(this.preventMouseEmulation(e),e instanceof TouchEvent&&e.changedTouches){let i=e.changedTouches[0].clientX-this.dragStartAbsolutePosition[0];if(i<10&&i>0||i<0&&i>-10)return}this.dragging(this._getPercentageFromEvent(e)),this.longClickComplete=!1,clearTimeout(this.longClickTimeout)}_onDragEnd(e){this.preventMouseEmulation(e),window.removeEventListener("mousemove",this.dragEventHandlers.mousemove),window.removeEventListener("mouseup",this.dragEventHandlers.mouseup),window.removeEventListener("touchmove",this.dragEventHandlers.mousemove),window.removeEventListener("touchend",this.dragEventHandlers.mouseup),this.dragLevelChanging&&this._dragEnded(this._getPercentageFromEvent(e)),this.longClickComplete=!1}_mouseUp(e){this.preventMouseEmulation(e),this.dragLevelChanging?(e.preventDefault(),this.longClickComplete=!1):super._mouseUp(e)}_dragEnded(e){this.dragLevelChanging=!1,this.dragEnd(e)}}var Wt=Object.defineProperty,Jt=Object.getOwnPropertyDescriptor,Qt=Object.getPrototypeOf,Kt=Reflect.get,E=(t,e,i,r)=>{for(var s=r>1?void 0:r?Jt(e,i):e,o=t.length-1,n;o>=0;o--)(n=t[o])&&(s=(r?n(e,i,s):n(s))||s);return r&&s&&Wt(e,i,s),s},Zt=(t,e,i)=>Kt(Qt(t),i,e);let b=class extends se{constructor(){super(...arguments),this.meta={color:!1,ct:!1,level:!1}}renderProgress(){return this.state=="on"?l`<div class="progress" style="right: ${100-this._localLevel}%; background: ${this.getBackgroundColor()}"></div>`:null}renderInner(){return l`
      <div class="button">
        <span class="icon ${this.state!="on"?"clear":""}">lightbulb</span>
      </div>
      ${this.renderProgress()}
      <div class="name">${this.getDisplayName()}</div>
      <div class="level">${this.state=="on"?this._localLevel+"%":"off"}</div>`}dragStart(){this.state==="on"&&(this.dragStartLevel=this.level)}dragging(t){this.state==="on"&&(this._localLevel=this.clamp(Math.round(this.dragStartLevel+t*100),0,100))}dragEnd(t){if(this.state!=="on")return;const e=this.clamp(Math.round(this.dragStartLevel+t*100),0,100);this.level=e}updated(t){super.updated(t),t.has("level")&&(this._localLevel=this.level)}clicked(){this.state=this.state=="on"?"off":"on"}getBackgroundColor(){if(this.meta.color&&this.mode=="RGB")return`hsl(${this.hue}, ${this.saturation}%, ${this.level/2}%)`;if(this.meta.ct){const{r:t,g:e,b:i}=b.colorTemperatureToRGB(this.ct);return`rgb(${t}, ${e}, ${i})`}else return"#ffb500"}static colorTemperatureToRGB(t){let e=t/100,i,r,s;return e<=66?(i=255,r=e,r=99.4708025861*Math.log(r)-161.1195681661,e<=19?s=0:(s=e-10,s=138.5177312231*Math.log(s)-305.0447927307)):(i=e-60,i=329.698727446*Math.pow(i,-.1332047592),r=e-60,r=288.1221695283*Math.pow(r,-.0755148492),s=255),{r:this.clamp(i,0,255),g:this.clamp(r,0,255),b:this.clamp(s,0,255)}}static clamp(t,e,i){return t<e?e:t>i?i:t}};b.ignoredProperties=[...Zt(b,b,"ignoredProperties")];b.styles=[se.styles,u`.tile {
        position: relative;
        transition: all 0.3s cubic-bezier(.25,.8,.25,1);
    }

    .tile:hover {
        box-shadow: 0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23);
        background: rgba(255, 255, 255, 0.1);
        color: var(--tile-text-inverse);
        cursor: pointer;
    }

    .tile .progress {
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        background: #ffb500;
        z-index: -1;
        opacity: 0.75
    }

    .tile .button {
        background: var(--tile-button-background);
        width: var(--tile-button-size);
        height: var(--tile-button-size);
        margin: 8px;
        border-radius: 50%;
        text-align: center;
        display: inline-block;
        vertical-align: middle;
    }

    .tile .button .icon {
        font-size: var(--tile-icon-size);
        line-height: var(--tile-button-size)
    }

    .tile .level {
        position: absolute;
        bottom: 8px;
        right: 8px;
        font-size: 11px;
        opacity: 0.75;
    }`];E([a({attribute:!1})],b.prototype,"meta",2);E([a({type:Number})],b.prototype,"level",2);E([a({type:Number})],b.prototype,"_localLevel",2);E([a()],b.prototype,"mode",2);E([a({type:Number})],b.prototype,"hue",2);E([a({type:Number})],b.prototype,"saturation",2);E([a({type:Number})],b.prototype,"ct",2);b=E([g("tile-light")],b);var ei=Object.defineProperty,ti=Object.getOwnPropertyDescriptor,ii=(t,e,i,r)=>{for(var s=r>1?void 0:r?ti(e,i):e,o=t.length-1,n;o>=0;o--)(n=t[o])&&(s=(r?n(e,i,s):n(s))||s);return r&&s&&ei(e,i,s),s};let de=class extends C{clicked(){this.state=this.state=="locked"?"unlocked":"locked"}renderInner(){return l`
      <div class="button">
        <span class="icon">${this.getIcon()}</span>
      </div>
      <div class="name">${this.getDisplayName()}</div>
      <div class="state">${this.state}</div>`}getIcon(){return this.state=="locked"?"door_front":"door_open"}};de.styles=[C.styles,u`.tile {
      position: relative;
      transition: all 0.3s cubic-bezier(.25,.8,.25,1);
    }
    
    .tile:hover {
        box-shadow: 0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23);
        background: rgba(255, 255, 255, 0.1);
        color: var(--tile-text-inverse);
    }
    
    .tile .button {
        background: var(--tile-button-background);
        width: var(--tile-button-size);
        height: var(--tile-button-size);
        margin: 8px;
        border-radius: 50%;
        text-align: center;
        display: inline-block;
        vertical-align: middle;
    }
    
    .tile .button .icon {
        font-size: var(--tile-icon-size);
        line-height: var(--tile-button-size)
    }
    
    .tile.unlocked {
        background: rgba(var(--tile-default-active-color), 0.75);
    }
    
    .tile.unlocked:hover {
        background: rgba(var(--tile-default-active-color), 1);
    }
    
    .tile .name {
        display: inline-block;
        font-size: var(--tile-name-size);
    }
    
    .tile .state {
        font-size: 10px;
        margin: -14px 0 0 45px;
        opacity: 0.75;
    }`];de=ii([g("tile-lock")],de);var ri=Object.defineProperty,si=Object.getOwnPropertyDescriptor,je=(t,e,i,r)=>{for(var s=r>1?void 0:r?si(e,i):e,o=t.length-1,n;o>=0;o--)(n=t[o])&&(s=(r?n(e,i,s):n(s))||s);return r&&s&&ri(e,i,s),s};let ee=class extends p{renderBackground(){var t;return(t=this.data)!=null&&t.image?l`<img class="background" src="${this.data.image}" referrerpolicy="no-referrer"></img>
      <img
        class="art"
        src="${this.data.image}"
        referrerpolicy="no-referrer"
      />`:l`<div class="defaultBackground"></div`}renderInner(){var t,e,i;return l`
      ${this.renderBackground()}
      <div class="button">
        <img
          src="${this.getIcon((t=this.data)==null?void 0:t.app)}"
        />
      </div>
      <div class="name">${this.getDisplayName()}</div>
      <div class="controls playing">
        <span class="icon back-btn"> fast_rewind </span>
        <span class="icon play-pause-btn ${this.state=="playing"?"":"material-symbols-outlined"}" @click=${this.toggleState}>
          ${this.state=="playing"?"pause":"play_arrow"}
        </span>
        <span class="icon next-btn"> fast_forward </span>
      </div>
      <div class="info">
        <div class="title">${(e=this.data)==null?void 0:e.title}</div>
        <div class="subtitle">${(i=this.data)==null?void 0:i.artist}</div>
      </div>
      <div class="seek-container">
        <input type="range" class="seek-bar"/>
      </div>`}toggleState(){this.state=="playing"?this.state="paused":this.state=="paused"&&(this.state="playing")}getIcon(t){switch(t){case"YouTube":return"https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg";case"Disney+":return"https://upload.wikimedia.org/wikipedia/commons/3/3e/Disney%2B_logo.svg";case"Netflix":return"https://upload.wikimedia.org/wikipedia/commons/0/0c/Netflix_2015_N_logo.svg";case"Prime Video":return"https://upload.wikimedia.org/wikipedia/commons/d/de/Amazon_icon.png";case"BBC iPlayer":return"https://upload.wikimedia.org/wikipedia/commons/3/39/BBC_iPlayer_2021_%28symbol%29.svg";case"All 4":return"https://upload.wikimedia.org/wikipedia/commons/0/0e/Channel_4_logo_2015.svg";case"ITV Player":return"https://en.wikipedia.org/wiki/ITV_plc#/media/File:ITV_logo_2013.svg"}return"https://upload.wikimedia.org/wikipedia/commons/7/7b/Octicons-playback-play.svg"}};ee.styles=[p.styles,u`.tile {
        position: relative;
        background: transparent;
        color: var(--tile-text-color);
    }

    .tile .defaultBackground {
      position:absolute;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      background: linear-gradient(270deg, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.05) 100%);
    }
    
    .tile .background {
        position:absolute;
        width:200%;
        height:200%;
        z-index: -1; /* should be calculated from image */
        opacity: 0.75;
        left: -50%;
        right: -50%;
        top: -50%;
        bottom: -50%;
        filter: blur(50px) brightness(0.5) contrast(2);
    }
    
    .tile .art {
        z-index: -2;
        position: absolute;
        left: 0;
        right: 0;
        width: 100%;
        height: 100%;
        top: 0;
        bottom: 0;
        object-fit: cover;
    }
    
    .tile .button {
        background: var(--tile-button-background);
        width: var(--tile-button-size);
        height: var(--tile-button-size);
        margin: 8px;
        border-radius: 50%;
        text-align: center;
        display: inline-block;
        vertical-align: middle;
    }
    
    .tile .button img {
        width: 20px;
        height: 20px;
        object-fit: contain;
        filter: invert(100%) sepia(0%) saturate(0%) hue-rotate(26deg) brightness(99%) contrast(103%);
        display: inline-block;
        vertical-align: middle;
        padding: 2.5px;
    }
    
    .tile .name {
        display: inline-block;
        font-size: var(--tile-name-size);
    }
    
    .tile .info {
        padding: 8px;
        font-size: 12px;
    }

    .tile .info .title {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    
    .tile .info .subtitle {
        font-size: 11px;
        opacity: 0.8;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    
    .tile .controls {
        position: absolute;
        top: calc((var(--tile-height) / 2) - 25px);
        right: 8px;
    }

    :host([height="2"]) .tile .controls {
      position: static;
      text-align: center;
      margin-bottom: 16px;
    }

    :host([width="2"]) .tile .controls {
      top: calc((var(--tile-height) / 2) - 10px);
    }

    :host([width="2"]) .tile .info {
        margin-top: -14px;
    }
    
    .tile .controls .icon:hover {
        color: #FFFFFF;
        text-shadow: 0 0 5px #FFFFFF;
        cursor: pointer;
    }

    .seek-container {
      display: none;
      position: absolute;
      bottom: 8px;
      width: 100%;
    }

    :host([height="2"]) .seek-container, :host([width="2"]) .seek-container {
      display: block;
    }
    
    .seek-bar {
      -webkit-appearance: none;
      width: calc(100% - 16px);
      background: transparent;
      margin: 0 8px;
    }

    .seek-bar::-webkit-slider-thumb {
      -webkit-appearance: none;
    }

    .seek-bar:focus {
      outline: none; /* Removes the blue border. You should probably do some kind of focus styling for accessibility reasons though. */
    }

    .seek-bar::-ms-track {
      width: 100%;
      cursor: pointer;

      /* Hides the slider so custom styles can be added */
      background: transparent; 
      border-color: transparent;
      color: transparent;
    }

    .seek-container:hover .seek-bar::-webkit-slider-thumb {
      -webkit-appearance: none;
      height: 16px;
      width: 16px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.85);
      cursor: pointer;
      margin-top: -6px; /* You need to specify a margin in Chrome, but in Firefox and IE it is automatic */
    }

    /* All the same stuff for Firefox */
    .seek-container:hover .seek-bar:hover::-moz-range-thumb {
      height: 16px;
      width: 16px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.85);
      cursor: pointer;
    }

    .seek-bar::-webkit-slider-runnable-track {
      width: 100%;
      height: 3px;
      cursor: pointer;
      background: rgba(255, 255, 255, 0.5);
    }

    .seek-bar:focus::-webkit-slider-runnable-track {
      background: rgba(255, 255, 255, 0.7);
    }

    .seek-bar::-moz-range-track {
      width: 100%;
      height: 3px;
      cursor: pointer;
      background: rgba(255, 255, 255, 0.5);
    }

    .seek-bar::-ms-track {
      width: 100%;
      height: 3px;
      cursor: pointer;
      background: transparent;
      border-color: transparent;
      border-width: 16px 0;
      color: transparent;
    }
    .seek-bar::-ms-fill-lower {
      background: rgba(255, 255, 255, 0.5);
    }
    .seek-bar:focus::-ms-fill-lower {
      background: rgba(255, 255, 255, 0.7);
    }
    .seek-bar::-ms-fill-upper {
      background: rgba(255, 255, 255, 0.5);
    }
    .seek-bar:focus::-ms-fill-upper {
      background: rgba(255, 255, 255, 0.7);
    }`];je([a({attribute:!1})],ee.prototype,"data",2);ee=je([g("tile-media")],ee);var oi=Object.defineProperty,ni=Object.getOwnPropertyDescriptor,Te=(t,e,i,r)=>{for(var s=r>1?void 0:r?ni(e,i):e,o=t.length-1,n;o>=0;o--)(n=t[o])&&(s=(r?n(e,i,s):n(s))||s);return r&&s&&oi(e,i,s),s};let te=class extends C{constructor(){super(...arguments),this.icon="switch"}clicked(){this.state=this.state=="on"?"off":"on"}renderInner(){return l`
      <div class="button">
        <span class="icon ${this.icon}">${this.getIcon()}</span>
      </div>
      <div class="name">${this.getDisplayName()}</div>
      <div class="state">${this.state}</div>`}getIcon(){switch(this.icon){case"light":return"lightbulb";case"fan":return"mode_fan";case"pump":return"water_pump"}return this.state=="on"?"toggle_on":"toggle_off"}};te.styles=[C.styles,u`.tile {
        position: relative;
        transition: all 0.3s cubic-bezier(.25,.8,.25,1);
    }
    
    .tile:hover {
        box-shadow: 0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23);
        background: rgba(255, 255, 255, 0.1);
        color: var(--tile-text-inverse);
        cursor: pointer;
    }
    
    .tile.on {
        background: rgba(var(--tile-default-active-color), 0.75);
    }
    
    .tile.on:hover {
        background: rgba(var(--tile-default-active-color), 1);
    }
    
    .tile .button {
        background: var(--tile-button-background);
        width: var(--tile-button-size);
        height: var(--tile-button-size);
        margin: 8px;
        border-radius: 50%;
        text-align: center;
        display: inline-block;
        vertical-align: middle;
    }
    
    .tile .button .icon {
        font-size: var(--tile-icon-size);
        line-height: var(--tile-button-size)
    }
    
    .tile.on .icon.fan {
        animation: spin-animation 3s infinite;
        animation-timing-function: linear;
    }
    
    .tile.on .icon.pump {
        animation: pump-animation 0.5s infinite;
    }

    .tile.off .icon.light {
      font-variation-settings:
            'FILL' 0,
            'wght' 400,
            'GRAD' 0,
            'opsz' 24;
    }

    .tile .state {
        position: absolute;
        bottom: 8px;
        right: 8px;
        font-size: 11px;
        opacity: 0.75;
    }
    
    @keyframes pump-animation {
        0% {
          transform: scale(0.9);
        }
        100% {
          transform: rotate(1);
        }
    }
    
    @keyframes spin-animation {
        0% {
            transform: rotate(0deg);
        }
    
        100% {
            transform: rotate(360deg);
        }
    }`];Te([a()],te.prototype,"icon",2);te=Te([g("tile-switch")],te);var ai=Object.defineProperty,li=Object.getOwnPropertyDescriptor,ci=Object.getPrototypeOf,di=Reflect.get,ge=(t,e,i,r)=>{for(var s=r>1?void 0:r?li(e,i):e,o=t.length-1,n;o>=0;o--)(n=t[o])&&(s=(r?n(e,i,s):n(s))||s);return r&&s&&ai(e,i,s),s},hi=(t,e,i)=>di(ci(t),i,e);let _=class extends se{renderProgress(){return l`<div class="progress" style="right: ${100-this._localLevel}%;"></div>`}renderInner(){return l`
      <div class="button">
        <span class="icon ${this.state!="on"?"clear":""}">window_closed</span>
      </div>
      ${this.renderProgress()}
      <div class="name">${this.getDisplayName()}</div>
      <div class="level">${this._localLevel}%</div>`}dragStart(){this.dragStartLevel=this._localLevel}dragging(t){this._localLevel=this.clamp(Math.round(this.dragStartLevel+t*100),0,100)}dragEnd(t){const e=this.clamp(Math.round(this.dragStartLevel+t*100),0,100);this.position=e}updated(t){super.updated(t),t.has("position")&&(this._localLevel=this.position)}static clamp(t,e,i){return t<e?e:t>i?i:t}};_.ignoredProperties=[...hi(_,_,"ignoredProperties")];_.styles=[se.styles,u`.tile {
        position: relative;
        transition: all 0.3s cubic-bezier(.25,.8,.25,1);
    }

    .tile:hover {
        box-shadow: 0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23);
        background: rgba(255, 255, 255, 0.1);
        color: var(--tile-text-inverse);
        cursor: pointer;
    }

    .tile .progress {
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        background: #ffb500;
        z-index: -1;
        opacity: 0.75
    }

    .tile .button {
        background: var(--tile-button-background);
        width: var(--tile-button-size);
        height: var(--tile-button-size);
        margin: 8px;
        border-radius: 50%;
        text-align: center;
        display: inline-block;
        vertical-align: middle;
    }

    .tile .button .icon {
        font-size: var(--tile-icon-size);
        line-height: var(--tile-button-size)
    }

    .tile .level {
        position: absolute;
        bottom: 8px;
        right: 8px;
        font-size: 11px;
        opacity: 0.75;
    }`];ge([a({type:Number})],_.prototype,"position",2);ge([a({type:Number})],_.prototype,"_localLevel",2);_=ge([g("tile-window")],_);var pi=Object.defineProperty,ui=Object.getOwnPropertyDescriptor,me=(t,e,i,r)=>{for(var s=r>1?void 0:r?ui(e,i):e,o=t.length-1,n;o>=0;o--)(n=t[o])&&(s=(r?n(e,i,s):n(s))||s);return r&&s&&pi(e,i,s),s};let Y=class extends O{constructor(){super(...arguments),this.proxyRef=B()}render(){return l`<div ${G(this.proxyRef)} class="proxy" style="width: ${this.width}px; height: ${this.height}px;" draggable="true"></div>`}setProxyPosition(t){this.proxyRef.value&&(this.proxyRef.value.style.top=t.pageY-this.offsetY+"px",this.proxyRef.value.style.left=t.pageX-this.offsetX+"px")}setMouseOffset(t){this.offsetX=t.offsetX,this.offsetY=t.offsetY,this.setProxyPosition(t)}intersection(t){var o;var e=t.getBoundingClientRect(),i=(o=this.proxyRef.value)==null?void 0:o.getBoundingClientRect();const r=Math.max(0,Math.min(e.right,i.right)-Math.max(e.left,i.left))/(e.right-e.left),s=Math.max(0,Math.min(e.bottom,i.bottom)-Math.max(e.top,i.top))/(e.bottom-e.top);return r*s}};Y.styles=u`
        .proxy {
            position: absolute;
            background: rgba(128, 128, 128, 0.5);
            border-radius: var(--tile-roundness);
            border: 1px dashed rgba(0,0,0,0.3);
            box-sizing: border-box;
        }`;me([a({type:Number})],Y.prototype,"width",2);me([a({type:Number})],Y.prototype,"height",2);Y=me([g("tile-proxy")],Y);class Me extends Ye{constructor(){super(...arguments),this.prevData={}}render(e){return Xe}update(e,[i]){var r;this.element!==e.element&&(this.element=e.element),this.host=((r=e.options)==null?void 0:r.host)||this.element,this.apply(i),this.groom(i),this.prevData={...i}}apply(e){if(!e)return;const{prevData:i,element:r}=this;for(const s in e){const o=e[s];o!==i[s]&&(r[s]=o)}}groom(e){const{prevData:i,element:r}=this;if(i)for(const s in i)(!e||!(s in e)&&r[s]===i[s])&&(r[s]=void 0)}}const m=_e(Me);class gi extends Me{constructor(){super(...arguments),this.eventData={}}apply(e){if(e)for(const i in e){const r=e[i];r!==this.eventData[i]&&this.applyEvent(i,r)}}applyEvent(e,i){const{prevData:r,element:s}=this;this.eventData[e]=i,r[e]&&s.removeEventListener(e,this,i),s.addEventListener(e,this,i)}groom(e){const{prevData:i,element:r}=this;if(i)for(const s in i)(!e||!(s in e)&&r[s]===i[s])&&this.groomEvent(s,i[s])}groomEvent(e,i){const{element:r}=this;delete this.eventData[e],r.removeEventListener(e,this,i)}handleEvent(e){const i=this.eventData[e.type];typeof i=="function"?i.call(this.host,e):i.handleEvent(e)}disconnected(){const{eventData:e,element:i}=this;for(const r in e){const s=r.slice(1),o=e[r];i.removeEventListener(s,this,o)}}reconnected(){const{eventData:e,element:i}=this;for(const r in e){const s=r.slice(1),o=e[r];i.addEventListener(s,this,o)}}}class mi extends gi{apply(e){if(!e)return;const{prevData:i,element:r}=this;for(const s in e){const o=e[s];if(o===i[s])continue;const n=s.slice(1);switch(s[0]){case"@":this.eventData[n]=o,this.applyEvent(n,o);break;case".":r[n]=o;break;case"?":o?r.setAttribute(n,""):r.removeAttribute(n);break;default:o!=null?r.setAttribute(s,String(o)):r.removeAttribute(s);break}}}groom(e){const{prevData:i,element:r}=this;if(i)for(const s in i){const o=s.slice(1);if(!e||!(s in e)&&r[o]===i[s])switch(s[0]){case"@":this.groomEvent(o,i[s]);break;case".":r[o]=void 0;break;case"?":r.removeAttribute(o);break;default:r.removeAttribute(s);break}}}}const xe=_e(mi);var fi=Object.defineProperty,vi=Object.getOwnPropertyDescriptor,H=(t,e,i,r)=>{for(var s=r>1?void 0:r?vi(e,i):e,o=t.length-1,n;o>=0;o--)(n=t[o])&&(s=(r?n(e,i,s):n(s))||s);return r&&s&&fi(e,i,s),s};let D=class extends J(c)(O){renderTile(t){var e,i,r,s,o,n,h,d,f;switch(t.type){case"media":return l`<tile-media ?editing=${this.editing} id="${t.id}" name="${t.label}" room="${this.room}" .onLongClick=${(e=this.onLongClickItem)==null?void 0:e.bind(this,t)} ${m(t.getState())} ${m(t.getPrefs())}/>`;case"light":return l`<tile-light ?editing=${this.editing} id="${t.id}" name="${t.label}" room="${this.room}" .onLongClick=${(i=this.onLongClickItem)==null?void 0:i.bind(this,t)} ${m(t.getState())} ${m(t.getPrefs())}/>`;case"camera":return l`<tile-camera ?editing=${this.editing} id="${t.id}" name="${t.label}" room="${this.room}" .onLongClick=${(r=this.onLongClickItem)==null?void 0:r.bind(this,t)} ${m(t.getState())} ${m(t.getPrefs())}/>`;case"hvac":return l`<tile-hvac ?editing=${this.editing} id="${t.id}" name="${t.label}" room="${this.room}" .onLongClick=${(s=this.onLongClickItem)==null?void 0:s.bind(this,t)} ${m(t.getState())} ${m(t.getPrefs())}/>`;case"temp":return l`<tile-temp ?editing=${this.editing} id="${t.id}" name="${t.label}" room="${this.room}" .onLongClick=${(o=this.onLongClickItem)==null?void 0:o.bind(this,t)} ${m(t.getState())} ${m(t.getPrefs())}/>`;case"lock":return l`<tile-lock ?editing=${this.editing} id="${t.id}" name="${t.label}" room="${this.room}" .onLongClick=${(n=this.onLongClickItem)==null?void 0:n.bind(this,t)} ${m(t.getState())} ${m(t.getPrefs())}/>`;case"window":return l`<tile-window ?editing=${this.editing} id="${t.id}" name="${t.label}" room="${this.room}" .onLongClick=${(h=this.onLongClickItem)==null?void 0:h.bind(this,t)} ${m(t.getState())} ${m(t.getPrefs())}/>`;case"switch":return l`<tile-switch ?editing=${this.editing} id="${t.id}" name="${t.label}" room="${this.room}" .onLongClick=${(d=this.onLongClickItem)==null?void 0:d.bind(this,t)} ${m(t.getState())} ${m(t.getPrefs())}/>`;default:return l`<tile-editable ?editing=${this.editing} id="${t.id}" name="${t.label}" room="${this.room}" .onLongClick=${(f=this.onLongClickItem)==null?void 0:f.bind(this,t)} ${m(t.getState())} ${m(t.getPrefs())}/>`}}get devices(){var t,e;return this.room?((t=pe(this.gridId))==null?void 0:t.devices)||[]:((e=Ct(this.gridId))==null?void 0:e.devices)||[]}render(){return l`<div class="canvas">
             ${We(this.devices,t=>t.id,t=>this.renderTile(t))}
        </div>`}checkProxyIntersection(t,e){const i=this.devices.find(r=>{const s=this.shadowRoot.getElementById(r.id.toString());return r!=e.item&&t.intersection(s)>.4});i&&(console.log("intersected",i),Dt(this.gridId,[parseInt(e.id),i.id]),this.requestUpdate(),this.debounceOrderChange())}debounceOrderChange(){clearTimeout(this.debounceTimeout),this.onOrderChange&&this.gridId&&(this.debounceTimeout=setTimeout(()=>{this.onOrderChange(this.gridId,this.devices.map(({id:t})=>t))},500))}swapElements(t,e,i){t[e]=t.splice(i,1,t[e])[0]}};D.styles=u`.title {
        color: rgba(255, 255, 255, 0.4);
        font-weight: 100;
        font-size: 30px;
        margin: var(--tile-gap);
    }
    
    .canvas {
        width: 100%;
        gap: var(--tile-gap);
        display: grid;
        margin: 0 auto;
        grid-template-columns: repeat(auto-fill, var(--tile-width));
        grid-auto-rows: var(--tile-height);
        justify-content: center;
        box-sizing: border-box;
    }`;H([a({type:Number,attribute:"grid-id"})],D.prototype,"gridId",2);H([a()],D.prototype,"room",2);H([a({attribute:!1})],D.prototype,"onLongClickItem",2);H([a({attribute:!1})],D.prototype,"onOrderChange",2);H([a({type:Boolean})],D.prototype,"editing",2);D=H([g("device-grid")],D);var bi=Object.defineProperty,yi=Object.getOwnPropertyDescriptor,K=(t,e,i,r)=>{for(var s=r>1?void 0:r?yi(e,i):e,o=t.length-1,n;o>=0;o--)(n=t[o])&&(s=(r?n(e,i,s):n(s))||s);return r&&s&&bi(e,i,s),s};let L=class extends J(c)(O){render(){return l`<div class="bar">
            <h1 class="home">${this.home}</h1>
            <!-- <h3 class="room">${this.room}</h3>        -->
            
            ${this.renderClock()}
            ${this.renderDate()}
        </div>`}renderClock(){return l`<div class="clock">
            ${this.time}
        </div>`}renderDate(){return l`<div class="date">${this.date}
        </div>`}stateChanged(t){var e;this.home=t.home.name,this.room=(e=t.rooms.find(({id:i})=>i==t.app.room))==null?void 0:e.name}connectedCallback(){super.connectedCallback(),this.tick()}disconnectedCallback(){super.disconnectedCallback(),clearTimeout(this.tickTimeout)}tick(){const t=new Date,e=t.getHours(),i=t.getMinutes();t.getSeconds();const r=e<10?"0"+e:e,s=i<10?"0"+i:i,o=t.getMonth(),n=t.getFullYear(),h=t.getDate(),d=["January","February","March","April","May","June","July","August","September","October","November","December"],f=["th","st","nd","rd","th","th","th","th","th","th"],T=h+""+f[h>10?h.toString()[1]:h]+" of "+d[o]+" "+n,Ne=r+":"+s;this.date=T,this.time=Ne,this.tickTimeout=setTimeout(this.tick.bind(this),1e3)}};L.styles=u`
    .bar {
        padding: var(--tile-gap);
        overflow: hidden;
        text-overflow: ellipsis;
        color: rgba(255, 255, 255, 0.75);
        text-align: right;
    }

    .home {
        font-weight: 100;
        font-weight: 100;
        font-size: 4vw;
        text-transform: uppercase;
    }

    .room {
        font-weight: 400;
        margin-top: -25px;
    }

    .clock {
        font-weight: 600;
        font-size: 8vw;
    }

    .date {
        margin-top: -1.4vw;
        font-weight: 100;
        text-transform: uppercase;
        font-size: 1.8vw;
    }`;K([a()],L.prototype,"home",2);K([a()],L.prototype,"room",2);K([a()],L.prototype,"time",2);K([a()],L.prototype,"date",2);L=K([g("info-bar")],L);var wi=Object.defineProperty,xi=Object.getOwnPropertyDescriptor,R=(t,e,i,r)=>{for(var s=r>1?void 0:r?xi(e,i):e,o=t.length-1,n;o>=0;o--)(n=t[o])&&(s=(r?n(e,i,s):n(s))||s);return r&&s&&wi(e,i,s),s};let v=class extends O{render(){return l`<div class="popover">
                <h2 class="title">${this.title}</h2>
                <div class="button" @click=${this.onClose}>
                    <span class="icon">close</span>
                </div>
                ${this.renderControls()}
                ${this.renderContent()}
            </div>
        </div>`}renderContent(){return l`this element must be extended`}renderControls(){return l`<div class="group-controls">
            ${this.renderGroupControlsForType()}
        </div>`}renderGroupControlsForType(){switch(this.type){case"light":return l`<controls-light id=${this.id} .meta=${this.item.getMeta()} ${xe(this.item.getState())}/>`;case"switch":return l`<controls-switch id=${this.id} ${xe(this.item.getPrefs())}/>`}}};v.styles=u`
        @import url("https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200");
        .icon {
            font-family: 'Material Symbols Outlined';
            font-weight: normal;
            font-style: normal;
            font-size: 24px;
            line-height: 1;
            letter-spacing: normal;
            text-transform: none;
            display: inline-block;
            white-space: nowrap;
            word-wrap: normal;
            direction: ltr;
            -webkit-font-feature-settings: 'liga';
            -webkit-font-smoothing: antialiased;
            font-variation-settings:
                'FILL' 1,
                'wght' 400,
                'GRAD' 0,
                'opsz' 24
        }

        .popover {
            position: fixed;
            top: 50%;
            left: 50%;
            width: 460px;
            height: 500px;
            border-radius: 3px;
            background: rgba(255, 255, 255, 0.85);
            transform: translateX(-50%) translateY(-50%);
            z-index: 10;
            box-shadow: 0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23);
            backdrop-filter: blur(8px);
            padding: 12px;
            box-sizing: border-box;
            max-width: calc(100% - 12px);
        }

        @media only screen and (max-width: 500px) {
            .popover  {
                height: calc(100% - 100px);
            }
        }

        .popover .button {
            position: absolute;
            top: 8px;
            right: 8px;
            border-radius: 50%;
            background: rgba(0,0,0,0.1);
            padding: 4px;
            cursor: pointer;
        }

        .popover .title {
            font-weight: 100;
            margin: 0;
        }`;R([a()],v.prototype,"title",2);R([a({attribute:!1})],v.prototype,"meta",2);R([a()],v.prototype,"type",2);R([a({attribute:!1})],v.prototype,"item",2);R([a({attribute:!1})],v.prototype,"onClose",2);R([a({attribute:!1})],v.prototype,"onItemChange",2);v=R([g("popover-base")],v);var $i=Object.defineProperty,_i=Object.getOwnPropertyDescriptor,fe=(t,e,i,r)=>{for(var s=r>1?void 0:r?_i(e,i):e,o=t.length-1,n;o>=0;o--)(n=t[o])&&(s=(r?n(e,i,s):n(s))||s);return r&&s&&$i(e,i,s),s};let X=class extends v{renderContent(){return l`<div class="grid-container">
            <div class="inner-container">
                <device-grid .home=${this.home} grid-id=${this.id}></device-grid>
            </div>
        </div>`}};X.styles=[v.styles,u`
        :host {
            --tile-text-color: #333333;
            --tile-text-inverse: #999999;
        }

        .group-controls {
            height: 200px;
        }
        
        .grid-container {
            height: calc(100% - 230px);
            width: 100%;
            overflow: auto;
            --mask: linear-gradient(to bottom, 
                rgba(0,0,0, 1) 0,   rgba(0,0,0, 1) 75%, 
                rgba(0,0,0, 0) 99%, rgba(0,0,0, 0) 0
            ) 100% 50% / 100% 100% repeat-x;

            -webkit-mask: var(--mask); 
            mask: var(--mask);
        }

        .inner-container {
            padding-bottom: 50px;
        }`];fe([a({attribute:!1})],X.prototype,"home",2);fe([a({attribute:!1})],X.prototype,"devices",2);X=fe([g("popover-group")],X);var ki=Object.defineProperty,Pi=Object.getOwnPropertyDescriptor,oe=(t,e,i,r)=>{for(var s=r>1?void 0:r?Pi(e,i):e,o=t.length-1,n;o>=0;o--)(n=t[o])&&(s=(r?n(e,i,s):n(s))||s);return r&&s&&ki(e,i,s),s};let F=class extends v{renderContent(){return l`<p>We should probably add some device control stuff here?</p>`}};F.styles=[v.styles,u`

        .controls {
            height: 100%;
        }`];oe([a({attribute:!1})],F.prototype,"home",2);oe([a()],F.prototype,"type",2);oe([a({attribute:!1})],F.prototype,"meta",2);F=oe([g("popover-device")],F);var Ci=Object.defineProperty,Di=Object.getOwnPropertyDescriptor,Z=(t,e,i,r)=>{for(var s=r>1?void 0:r?Di(e,i):e,o=t.length-1,n;o>=0;o--)(n=t[o])&&(s=(r?n(e,i,s):n(s))||s);return r&&s&&Ci(e,i,s),s};let z=class extends v{renderContent(){var t,e,i,r,s;return l`<h3>Background Color</h3>
        Gradient Color 1: <input type="color" id="bgColor1" .value=${((e=(t=this.room.prefs)==null?void 0:t.bgColor)==null?void 0:e[0])??"#1a50e2"} @change=${this.color1Change}/><br>
        Gradient Color 2: <input type="color" id="bgColor2" .value=${((r=(i=this.room.prefs)==null?void 0:i.bgColor)==null?void 0:r[1])??"#1096b1"} @change=${this.color2Change}/><br>
        Gradient Angle: <input type="range" min="0" max="359" .value=${((s=this.room.prefs)==null?void 0:s.bgAngle)??328} @change=${this.angleChange}>`}color1Change(t){this.room.prefs.bgColor||(this.room.prefs.bgColor=[]),this.room.prefs.bgColor[0]=t.target.value,this.setBackground(this.room.prefs),this.onPrefChange(this.room.id,"bgColor",this.room.prefs.bgColor)}color2Change(t){this.room.prefs.bgColor||(this.room.prefs.bgColor=[]),this.room.prefs.bgColor[1]=t.target.value,this.setBackground(this.room.prefs),this.onPrefChange(this.room.id,"bgColor",this.room.prefs.bgColor)}angleChange(t){this.room.prefs.bgAngle=t.target.value,this.setBackground(this.room.prefs),this.onPrefChange(this.room.id,"bgAngle",this.room.prefs.bgAngle)}changeBg(){var t,e,i,r;document.body.style=`--bg-grad-1: ${((e=(t=this.room.prefs)==null?void 0:t.bgColor)==null?void 0:e[0])??"#1a50e2"}; --bg-grad-2: ${((r=(i=this.room.prefs)==null?void 0:i.bgColor)==null?void 0:r[1])??"#1096b1"}; --bg-grad-angle: ${this.room.prefs.bgAngle??328}deg; --tile-default-active-color: ${this.rgb()}`}rgb(){var i,r;var t=((r=(i=this.room.prefs)==null?void 0:i.bgColor)==null?void 0:r[0])??"#1a50e2",e=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(t);return e?`${parseInt(e[1],16)+25}, ${parseInt(e[2],16)+25}, ${parseInt(e[3],16)+25}`:""}};z.styles=[v.styles,u``];Z([a({attribute:!1})],z.prototype,"home",2);Z([a({attribute:!1})],z.prototype,"room",2);Z([a({attribute:!1})],z.prototype,"onPrefChange",2);Z([a({attribute:!1})],z.prototype,"setBackground",2);z=Z([g("popover-room-settings")],z);var Oi=Object.defineProperty,Si=Object.getOwnPropertyDescriptor,j=(t,e,i,r)=>{for(var s=r>1?void 0:r?Si(e,i):e,o=t.length-1,n;o>=0;o--)(n=t[o])&&(s=(r?n(e,i,s):n(s))||s);return r&&s&&Oi(e,i,s),s};let x=class extends J(c)(O){constructor(){super(...arguments),this.colorPickerRef=B(),this.meta={color:!1,ct:!1,level:!1},this.initialised=!1}render(){return l`
        <div class="color-container">
            ${this.renderTabs()}
            ${this.renderTab()}
        </div>
        <div class="level"></div>`}renderTabs(){return this.meta.color&&this.meta.ct?l`<div class="tab-container">
                <a href="#RGB" class="tab ${this.mode=="RGB"?"active":""}" @click="${this.switchMode}">Color</a>
                <a href="#CT" class="tab ${this.mode=="CT"?"active":""}" @click="${this.switchMode}">Temperature</a>
            </div>`:null}renderTab(){return this.meta.color&&!this.meta.ct?this.renderColorTab():this.meta.ct&&!this.meta.color?this.renderCTTab():!this.meta.ct&&!this.meta.color?null:this.mode=="RGB"?this.renderColorTab():this.renderCTTab()}renderColorTab(){return l`<div>
            <div id="picker" ${G(this.colorPickerRef)}></div>
        </div>`}renderCTTab(){return l`<div>Temp Picker</div>`}switchMode(t){t.preventDefault();const e=t.target.href.split("#")[1];this.mode=e}updated(t){if(super.updated(t),this.colorPickerRef.value&&!this.colorPicker?(this.colorPicker=new be.ColorPicker(this.colorPickerRef.value,{width:150,layoutDirection:"horizontal",color:this.hsvToRgbHex(this.hue/360,this.saturation/100),layout:[{component:be.ui.Wheel}]}),this.colorPicker.on("input:end",i=>{this.hue=i.hsv.h,this.saturation=i.hsv.s})):this.colorPickerRef.value||delete this.colorPicker,!this.initialised){this.initialised=!0;return}const e=[...t].filter(([i,r])=>r!=this[i]).map(([i])=>i);if(e.length>0){const i=new Map(e.map(r=>[r,this[r]]));Ie(parseInt(this.id,10),i)}}hsvToRgbHex(t=0,e=0,i=1){const{r,g:s,b:o}=this.HSVtoRGB(t,e,i);return"#"+this.componentToHex(r)+this.componentToHex(s)+this.componentToHex(o)}componentToHex(t){const e=t.toString(16);return e.length==1?"0"+e:e}HSVtoRGB(t,e,i){var r,s,o,n,h,d,f,T;switch(arguments.length===1&&(e=t.s,i=t.v,t=t.h),n=Math.floor(t*6),h=t*6-n,d=i*(1-e),f=i*(1-h*e),T=i*(1-(1-h)*e),n%6){case 0:r=i,s=T,o=d;break;case 1:r=f,s=i,o=d;break;case 2:r=d,s=i,o=T;break;case 3:r=d,s=f,o=i;break;case 4:r=T,s=d,o=i;break;case 5:r=i,s=d,o=f;break}return{r:Math.round(r*255),g:Math.round(s*255),b:Math.round(o*255)}}};x.styles=u`
    :host {
        display: flex;
    }

    .color-container {
        width: 65%;
        flex-grow: 0;
        flex-shrink: 0;
    }

    .tab-container {
        
    }

    .tab {
        width: 30%;
        color: black;
        text-decoration: none;
        padding: 4px 6px;
        display: inline-block;
        box-sizing: border-box;
    }

    .tab.active {
        font-weight: bold;
        border-bottom: 2px solid black;
    }

    .level {
        display: block;
        width: 100%;
        height: 20px;
        border-radius: 3px;
        background: rgba(0,0,0,0.2);
    }
    `;j([a({attribute:!1})],x.prototype,"meta",2);j([a({type:String})],x.prototype,"mode",2);j([a({type:Number})],x.prototype,"hue",2);j([a({type:Number})],x.prototype,"saturation",2);j([a({type:Number})],x.prototype,"ct",2);j([a({type:Number})],x.prototype,"level",2);x=j([g("controls-light")],x);var Ei=Object.defineProperty,Li=Object.getOwnPropertyDescriptor,Fe=(t,e,i,r)=>{for(var s=r>1?void 0:r?Li(e,i):e,o=t.length-1,n;o>=0;o--)(n=t[o])&&(s=(r?n(e,i,s):n(s))||s);return r&&s&&Ei(e,i,s),s};let ie=class extends J(c)(O){render(){return l`
        <select @change=${t=>{this.icon=t.target.value}}>
            <option ?selected=${!this.icon||this.icon=="switch"} value="switch">Switch</option>
            <option ?selected=${this.icon=="light"} value="light">Light</option>
            <option ?selected=${this.icon=="pump"} value="pump">Pump</option>
            <option ?selected=${this.icon=="fan"} value="fan">Fan</option>
        </select>`}stateChanged(t){const e=t.devices.find(({id:i})=>i==this.id);this.icon=e.prefs.icon}updated(t){t.icon!=this.icon&&Ot(parseInt(this.id,10),{icon:this.icon})}};ie.styles=u`.level {
        display: block;
        width: 100%;
        height: 20px;
        border-radius: 3px;
        background: rgba(0,0,0,0.2);
    }
    `;Fe([a()],ie.prototype,"icon",2);ie=Fe([g("controls-switch")],ie);if(!window.__homedash_config||!window.__homedash_config.provider)throw new Error("Config not set!");let y;switch(window.__homedash_config.provider.type){case"hubitat":y=new Je(window.__homedash_config.provider.server,window.__homedash_config.provider.token);break;default:throw new Error(`Unknown Provider: '${window.__homedash_config.provider.type}'`)}y.init().then(()=>{xt(y),Et("app.room",Be),Ii(),Ri(),Bi(),Ni()});function zi(){const t=document.querySelector(".edit-mode"),e=document.querySelector(".main-canvas");t.addEventListener("change",()=>{e.editing=t.checked}),document.querySelector(".room-settings-button").addEventListener("click",()=>{Fi(Ge())})}function Ii(){const t=document.querySelector(".sidebar .name");t.innerText=c.getState().home.name}function Ri(){const t=document.querySelector(".sidebar .menu");c.getState().rooms.map(i=>{const r=document.createElement("li");return r.innerText=i.name,r.id=`room-${i.id}`,r.addEventListener("click",Pt.bind(this,i.id)),r}).forEach(i=>t.appendChild(i))}function Be(t,e=!0){var n;const i=pe(t),r=document.querySelector(".main-canvas"),s=document.querySelector(".room");r.room=i.name,r.gridId=i.id,r.onLongClickItem=Mi,r.onOrderChange=ji,s.innerText=i.name,Ae(i.prefs);const o=document.querySelector(".sidebar .menu");(n=o.querySelector(".selected"))==null||n.classList.remove("selected"),o.querySelector(`#room-${i.id}`).classList.add("selected"),e&&y.refreshRoom(t)}function ji(t,e){return y.setRoomPref(t,"order",e)}function Ti(t,e,i){return y.setRoomPref(t,e,i)}function re(){const t=document.querySelector(".popover-container"),e=Array.from(t==null?void 0:t.children);e==null||e.forEach(i=>{t==null||t.removeChild(i)})}function Mi(t){re();const e=document.querySelector(".popover-container");let i;"devices"in t?(i=document.createElement("popover-group"),i.devices=t.devices):i=document.createElement("popover-device"),i.id=t.id,i.title=t.label,i.type=t.type,i.item=t,i.meta=t.getMeta(),i.onClose=re,e.appendChild(i)}function Fi(t){const e=pe(t);re();const i=document.querySelector(".popover-container"),r=document.createElement("popover-room-settings");r.title=e.name,r.room=e,r.onPrefChange=Ti,r.setBackground=Ae,r.onClose=re,i.appendChild(r)}function Bi(){Be(Ge(),!1),Ui(),Hi(),zi(),we(le.stateSet,(t,e)=>{Object.entries(e).forEach(([i,r])=>{y.setDeviceValue(t,i,r)})}),we(le.prefSet,(t,e)=>{Object.entries(e).forEach(([i,r])=>{y.setDeviceValue(t,i,r)})}),y.addEventListener(ne.roomRefresh,Ai),y.addEventListener(ne.deviceUpdates,Gi)}function Gi(t){const e=y.getDevices().filter(i=>t.includes(i.id)).map(I.fromObject);$t(e)}function Ai(t,e){_t(t),kt(e)}function Ni(){const t=document.querySelector(".loading");document.body.removeChild(t)}function Ge(){return c.getState().app.room||y.getRooms()[0].id}function Ae(t){var r,s,o;const e=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(((r=t==null?void 0:t.bgColor)==null?void 0:r[0])??"#1a50e2"),i=e?`${parseInt(e[1],16)+25}, ${parseInt(e[2],16)+25}, ${parseInt(e[3],16)+25}`:"";document.body.style=`--bg-grad-1: ${((s=t==null?void 0:t.bgColor)==null?void 0:s[0])??"#1a50e2"}; --bg-grad-2: ${((o=t==null?void 0:t.bgColor)==null?void 0:o[1])??"#1096b1"}; --bg-grad-angle: ${t.bgAngle??328}deg; --tile-default-active-color: ${i}`}function Ui(){const t=c.getState().app;t.fullscreen?document.body.classList.add("fullscreen"):document.body.classList.remove("fullscreen"),t.infobar!=null?document.body.classList.add("infobar"):document.body.classList.remove("infobar")}function Hi(){const t=document.querySelector(".mobile-sidebar-toggle"),e=document.querySelector(".sidebar");t.addEventListener("click",()=>{e.classList.toggle("show")})}
//# sourceMappingURL=index.js.map
