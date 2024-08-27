var Ae=Object.getPrototypeOf;var Ge=Reflect.get;var be=(t,e,i)=>Ge(Ae(t),i,e);import{a as $,c as we,b as J,d as Ne,w as Ue,i as u,n as a,e as ce,s as O,f as B,x as l,g as A,t as g,h as xe,j as He,T as qe,k as Ve,l as ve}from"./vendor.js";(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))r(o);new MutationObserver(o=>{for(const s of o)if(s.type==="childList")for(const n of s.addedNodes)n.tagName==="LINK"&&n.rel==="modulepreload"&&r(n)}).observe(document,{childList:!0,subtree:!0});function i(o){const s={};return o.integrity&&(s.integrity=o.integrity),o.referrerPolicy&&(s.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?s.credentials="include":o.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function r(o){if(o.ep)return;o.ep=!0;const s=i(o);fetch(o.href,s)}})();class I{getState(){return this.state}getMeta(){return this.meta}getPrefs(){return this.prefs}setState(e){Object.entries(e).forEach(([i,r])=>{this.state[i]=r})}setPrefs(e){Object.entries(e).forEach(([i,r])=>{this.prefs[i]=r})}static fromObject(e){const i=Object.create(I.prototype);return Object.assign(i,e)}toObject(){return{type:this.type,name:this.name,label:this.label,id:this.id,meta:this.meta,state:this.state,prefs:this.prefs,ingroup:this.ingroup}}}class Ye{constructor(e,i){this.eventListeners={deviceUpdates:[],roomRefresh:[]},this.server=e,this.token=i,this.pollInterval=1e4,this.server.endsWith("/")||(this.server+="/")}addEventListener(e,i){this.eventListeners[e].push(i)}setDeviceValue(e,i,r){return $.post(this.server+"device/"+e+"?access_token="+this.token,{attribute:i,value:r}).then(this.quickPoll.bind(this))}setGroupValue(e,i,r){return $.post(this.server+"group/"+e.id+"?access_token="+this.token,{devices:e.devices,attribute:i,value:r}).then(this.quickPoll.bind(this))}setRoomPref(e,i,r){return $.post(this.server+"room/"+e+"?access_token="+this.token,{attribute:i,value:r}).then(this.quickPoll.bind(this))}init(){return $.get(this.server+"home?access_token="+this.token).then(e=>e.data).then(e=>this.rawData=e).then(()=>(this.homeData=this.formatDevices(this.filterUnknownDevices(this.rawData)),this.createSession()))}createSession(){return $.post(this.server+"session?access_token="+this.token).then(e=>e.data).then(({id:e})=>this.session=e).then(()=>{this.pollTimeout=setTimeout(this.pollSession.bind(this),this.pollInterval)})}quickPoll(){}pollSession(){return clearTimeout(this.pollTimeout),$.get(this.server+"session/"+this.session+"?access_token="+this.token).then(e=>e.data).then(({changes:e})=>{Object.keys(e).length>0&&(Object.entries(e).map(([i,r])=>this.setStateByDeviceId(parseInt(i),r)),this.eventListeners.deviceUpdates.forEach(i=>i(Object.keys(e).map(r=>parseInt(r)))))}).then(()=>{this.pollTimeout=setTimeout(this.pollSession.bind(this),this.pollInterval)}).catch(()=>{this.pollTimeout=setTimeout(this.pollSession.bind(this),this.pollInterval)})}setStateByDeviceId(e,i){const r=this.getDeviceById(e);r&&Object.assign(r.state,i)}getDeviceById(e){const i=this.homeData.devices.find(r=>r.id==e);return i||(console.log("cant find device",e),null)}filterUnknownDevices(e){return{...e,rooms:e.rooms.map(i=>({...i,devices:i.devices.filter(({type:r})=>r!=="unknown")}))}}getGroupId(e,i){var s;const r=parseInt((s=Object.entries(e.groupIds).find(([n,d])=>d===i))==null?void 0:s[0]);if(r)return{id:r,new:!1};let o=5e3;for(;Object.keys(e.groupIds).includes(o.toString());)o++;return e.groupIds[o]=i,{id:o,new:!0}}formatDevices(e){const i=e.rooms.flatMap(s=>this.generateGroupsForRoom(s.devices,e)),r=this.assignDevicesToGroups(e.rooms.flatMap(({devices:s})=>s),i),o=e.rooms.map(s=>this.generateRoomFromData(s,i));return{...e,devices:r,groups:i,rooms:o}}generateGroupsForRoom(e,i){const r=e.reduce((o,s)=>{const n=s.label.replace(/\s([\d-_]+)$/,""),d=o.find(c=>s.type===c.type&&c.label===n);if(d&&(s.ingroup=d.id,d.devices.push(s.id)),n!=s.label&&e.some(c=>c.label.match(RegExp(`${n}\\s([\\d\\-_]+)$`)))){const c=this.getGroupId(i,n),f={label:n,type:s.type,id:c.id,devices:[s.id],persisted:!c.new};s.ingroup=f.id,o.push(f)}return o},[]).filter(o=>o.devices.length>1);return r.filter(({persisted:o})=>!o).map(this.persistGroup.bind(this)),r}generateRoomFromData(e,i){const r=[...new Set(e.devices.map(n=>i.find(d=>d.devices.includes(n.id))).filter(n=>n))],s=[...e.devices.filter(n=>!i.find(d=>d.devices.includes(n.id))),...r].map(({id:n})=>n).sort((n,d)=>{if(e.prefs.order){const c=e.prefs.order.indexOf(n),f=e.prefs.order.indexOf(d);return c<0?1:f<0?-1:c-f}return 0});return{...e,devices:s}}assignDevicesToGroups(e,i){return e.map(r=>{const o=i.find(({devices:s})=>s.includes(r.id));return o&&(r.ingroup=o.id),r})}persistGroup(e){return $.post(this.server+"group?access_token="+this.token,{id:e.id,name:e.label})}updateDevicesByRoom(e){return $.get(this.server+`room/${e}?access_token=`+this.token).then(i=>i.data).then(i=>{const r=i.devices,o=this.generateRoomFromData(i,this.homeData.groups);console.log("room updated"),this.eventListeners.roomRefresh.forEach(s=>s(r,o))})}getHome(){if(!this.homeData)throw new Error("Provided not initialised");return this.homeData.home}getRooms(){if(!this.homeData)throw new Error("Provided not initialised");return this.homeData.rooms}getDevices(){return this.homeData.devices}getGroups(){return this.homeData.groups}refreshRoom(e){return this.updateDevicesByRoom(e)}}var se=(t=>(t.deviceUpdates="deviceUpdates",t.roomRefresh="roomRefresh",t))(se||{});const $e=we();$e.startListening({actionCreator:"app",effect:async t=>{const e=_e();switch(t.type){case"app/setRoom":e.room=t.payload;break;case"app/setFullscreen":e.fullscreen=t.payload;break}We(e)}});function _e(){const t=window.location.search.substring(1);if(t.length<1)return{};var e=t.split("&");return e.length<1?{}:e.reduce((i,r)=>{const[o,s]=r.split("=");return{...i,[decodeURIComponent(o)]:Xe(decodeURIComponent(s||""))}},{})}function Xe(t){if(isFinite(t))return parseInt(t);const e=t.toLowerCase();return e=="true"||e=="false"?e=="true":ne[t]!=null?ne[t]:t}function We(t){const e=window.location.pathname;window.history.pushState(null,"Room",e+"?"+Je(t))}function Je(t){return Object.entries(t).map(([e,i])=>`${encodeURIComponent(e)}=${encodeURIComponent(i)}`).join("&")}var ne=(t=>(t[t.dateTime=0]="dateTime",t[t.minimal=1]="minimal",t[t.full=2]="full",t[t.calendar=3]="calendar",t))(ne||{});const Qe={fullscreen:!1,room:0,..._e()},ke=J({name:"app",initialState:Qe,reducers:{setRoom(t,e){t.room=e.payload}}}),{setRoom:Ke}=ke.actions,Ze=ke.reducer,et={name:"Loading...",baseUrl:"",tempScale:"c",lastUpdate:Date.now(),location:{longitude:0,latitude:0},sunrise:Date.now(),sunset:Date.now()},Pe=J({name:"home",initialState:et,reducers:{initHome(t,e){Object.assign(t,e.payload)},homeUpdated(t){t.lastUpdate=Date.now()}}}),{initHome:tt,homeUpdated:it}=Pe.actions,rt=Pe.reducer,ot=[],Ce=J({name:"rooms",initialState:ot,reducers:{roomAdd(t,e){t.push(structuredClone(e.payload))},roomRefresh(t,e){const i=t.find(({id:r})=>r==e.payload.id);if(!i){this.roomAdd(t,e);return}Object.entries(e.payload).forEach(([r,o])=>{i[r]=o})},swapDeviceOrder(t,e){console.log(t);const i=t.find(({id:s})=>s==e.payload.roomId);console.log(i,e.payload.roomId);const r=e.payload.swapDevices,o=i.devices;console.log(o.indexOf(r[0]),o.indexOf(r[1])),o[o.indexOf(r[0])]=o.splice(o.indexOf(r[1]),1,o[o.indexOf(r[0])])[0],console.log(o),i.devices=o}}}),{roomAdd:st,roomRefresh:nt,swapDeviceOrder:at}=Ce.actions,lt=Ce.reducer,ct=[],De=J({name:"devices",initialState:ct,reducers:{deviceAdd(t,e){t.push(structuredClone(e.payload))},deviceRefresh(t,e){const i=t.find(({id:r})=>r==e.payload.id);if(!i){this.deviceAdd(t,e);return}Object.entries(e.payload).forEach(([r,o])=>{i[r]=o})},setDeviceState(t,e){let i=t.find(({id:r})=>r==e.payload.device);Object.assign(i.state,e.payload.state)},updateDeviceState(t,e){let i=t.find(({id:r})=>r==e.payload.device);i&&Object.assign(i.state,e.payload.state)}}}),{deviceAdd:dt,deviceRefresh:ht,setDeviceState:ae,updateDeviceState:pt}=De.actions,ut=De.reducer,gt=[],Oe=J({name:"groups",initialState:gt,reducers:{groupAdd(t,e){t.push(structuredClone(e.payload))},setGroupState(t,e){t.find(({id:i})=>i==e.payload.group)}}}),{groupAdd:mt,setGroupState:Ui}=Oe.actions,ft=Oe.reducer;class ie{constructor(e,i,r){this.devices=[],this.persisted=!1,this.label=e,this.type=i,this.id=r||Math.floor(Math.random()*999),r&&(this.persisted=!0)}getMeta(){return this.devices.reduce((e,{meta:i})=>Object.entries(i).reduce((r,[o,s])=>o in r?s?{...r,[o]:s}:r:{...r,[o]:s},e),{})}getState(){const e=this.devices.reduce((i,r)=>Object.entries(r.state).reduce((o,[s,n])=>(o[s]||(o[s]=[]),o[s].push(n),o),i),{});return Object.fromEntries(Object.entries(e).map(([i,r])=>[i,this.getStateValue(r)]))}getPrefs(){return{}}getStateValue(e){if(typeof e[0]=="number")return Math.round(e.reduce((i,r)=>i+r,0)/e.length);if(typeof e[0]=="boolean")return e.reduce((i,r)=>i||r,!1);if(typeof e[0]=="string")return e.reduce((i,r)=>i=="on"||r=="on"?"on":r=="off"?i:r,"off")}static fromObject(e,i){if(!e)return null;const r=Object.create(ie.prototype);return Object.assign(r,{...e,devices:e.devices.map(o=>I.fromObject(i.find(({id:s})=>s==o)))})}toObject(){return{type:this.type,label:this.label,id:this.id,devices:this.devices.map(({id:e})=>e),persisted:this.persisted}}}class de{static fromObject(e,i,r){if(!e)return null;let o=Object.create(de.prototype);return Object.assign(o,{...e,devices:e.devices.map(s=>{const n=r.find(({id:c})=>c==s);if(n)return ie.fromObject(n,i);const d=i.find(({id:c})=>c==s);if(d)return I.fromObject(d);throw new Error(`device: '${s}' not found`)})})}toObject(){return{name:this.name,id:this.id,devices:this.devices.map(e=>e.id),prefs:this.prefs}}}const Se=[],Ee=we();function bt(t){Se.push(t)}Ee.startListening({actionCreator:ae,effect:async t=>{Se.forEach(e=>{e(t.payload.device,t.payload.state)})}});const h=Ne({reducer:{app:Ze,home:rt,rooms:lt,devices:ut,groups:ft},middleware:t=>t().prepend(Ee.middleware,$e.middleware)});function vt(t){return h.dispatch(tt(t.getHome())),t.getRooms().forEach(e=>{h.dispatch(st(e))}),t.getDevices().forEach(e=>{h.dispatch(dt(e))}),t.getGroups().forEach(e=>{h.dispatch(mt(e))}),h}function yt(t){h.dispatch(it()),t.forEach(e=>{Pt(Le(e.id),e.getState())&&h.dispatch(pt({device:e.id,state:e.getState()}))})}function wt(t){t.forEach(e=>{h.dispatch(ht(e))})}function xt(t){h.dispatch(nt(t))}function $t(t){h.dispatch(Ke(t))}function he(t){const{rooms:e,devices:i,groups:r}=h.getState();return de.fromObject(e.find(o=>o.id==t),i,r)}function _t(t,e){h.dispatch(at({roomId:t,swapDevices:e}))}function Le(t){return I.fromObject(h.getState().devices.find(e=>e.id==t))}function kt(t,e){const i=h.getState().devices;if(!i.find(({id:o})=>o==t)){i.filter(({ingroup:s})=>s==t).forEach(s=>{h.dispatch(ae({device:s.id,state:Object.fromEntries(e)}))});return}h.dispatch(ae({device:t,state:Object.fromEntries(e)}))}function Pt(t,e){const i=Object.assign({},t.state,e);return JSON.stringify(i)!==JSON.stringify(t.state)}function Ct(t,e){const i=Ue(h.getState,t);h.subscribe(i(e))}var Dt=Object.defineProperty,Ot=Object.getOwnPropertyDescriptor,G=(t,e,i,r)=>{for(var o=r>1?void 0:r?Ot(e,i):e,s=t.length-1,n;s>=0;s--)(n=t[s])&&(o=(r?n(e,i,o):n(o))||o);return r&&o&&Dt(e,i,o),o};let w=class extends ce(h)(O){constructor(){super(...arguments),this.tileRef=B(),this.initilised=!1,this.receiving=!1}get item(){return Le(parseInt(this.id))}get home(){return h.getState().home}get meta(){return this.item.getMeta()}render(){return l`<div ${A(this.tileRef)} class="tile ${this.constructor.name} ${this.state}">
          ${this.renderInner()}
        </div>`}renderInner(){return l`<div class="name">${this.name}</div>`}getTileElement(){return this.shadowRoot.querySelector("div")}getTileSize(){const t=this.getTileElement();return[parseInt(getComputedStyle(t).getPropertyValue("width")),parseInt(getComputedStyle(t).getPropertyValue("height"))]}updated(t){const e=Array.from(t.keys()).filter(i=>!this.constructor.ignoredProperties.includes(i)&&!i.startsWith("_"));if(e.length>0&&this.initilised&&!this.receiving){const i=new Map(e.map(r=>[r,this[r]]));kt(parseInt(this.id,10),i)}this.initilised=!0}getDisplayName(){return this.room&&this.name.startsWith(this.room+" ")?this.name.substring(this.room.length+1).toLowerCase().startsWith("and")?this.name:this.name.substring(this.room.length+1):this.name}stateChanged(t){this.receiving=!0;const e=t.devices.find(({id:r})=>r==this.id);let i;if(e)i=I.fromObject(e).getState();else{const r=t.groups.find(({id:o})=>o==this.id);i=ie.fromObject(r,t.devices).getState()}Object.entries(i).forEach(([r,o])=>{this[r]=o}),setTimeout(()=>{this.receiving=!1},20)}};w.ignoredProperties=["style","name","room","meta","home","updating","item","meta"];w.styles=u`
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
    }`;G([a()],w.prototype,"name",2);G([a()],w.prototype,"room",2);G([a()],w.prototype,"state",2);G([a({type:Boolean})],w.prototype,"updating",2);G([a()],w.prototype,"style",2);w=G([g("tile-base")],w);var St=Object.defineProperty,Et=Object.getOwnPropertyDescriptor,Lt=Object.getPrototypeOf,zt=Reflect.get,S=(t,e,i,r)=>{for(var o=r>1?void 0:r?Et(e,i):e,s=t.length-1,n;s>=0;s--)(n=t[s])&&(o=(r?n(e,i,o):n(o))||o);return r&&o&&St(e,i,o),o},Rt=(t,e,i)=>zt(Lt(t),i,e);let p=class extends w{constructor(){super(),this.editing=!1,this.moving=!1,this.resizing=!1,this.resizeHandleRef=B(),this.width=1,this.height=1,this.editableMouseDown=this.editableMouseDown.bind(this),this.editableMove=this.editableMove.bind(this),this.editableMoveEnd=this.editableMoveEnd.bind(this),this.resizableMouseDown=this.resizableMouseDown.bind(this),this.resiziableDrag=this.resiziableDrag.bind(this),this.resiziableDragEnd=this.resiziableDragEnd.bind(this)}connectedCallback(){super.connectedCallback(),this.addEventListener("mousedown",this.editableMouseDown)}attachProxyToWindow(t){const[e,i]=this.getTileSize();this.proxy=document.createElement("tile-proxy"),this.proxy.width=e,this.proxy.height=i,document.body.appendChild(this.proxy),this.proxy.setMouseOffset(t)}editableMouseDown(t){!this.editing||this.resizing||(this.tileRef.value.classList.add("editing"),this.attachProxyToWindow(t),this.moving=!0,t.preventDefault(),t.stopPropagation(),window.addEventListener("mousemove",this.editableMove),window.addEventListener("mouseup",this.editableMoveEnd))}editableMove(t){this.proxy.setProxyPosition(t),this.parentElement.getRootNode().host.checkProxyIntersection(this.proxy,this)}editableMoveEnd(t){window.removeEventListener("mousemove",this.editableMove),window.removeEventListener("mouseup",this.editableMoveEnd),this.moving=!1,t.preventDefault(),t.stopPropagation(),this.tileRef.value.classList.remove("editing"),document.body.removeChild(this.proxy)}resizableMouseDown(t){!this.editing||this.moving||(this.resizing=!0,t.preventDefault(),t.stopPropagation(),window.addEventListener("mousemove",this.resiziableDrag),window.addEventListener("mouseup",this.resiziableDragEnd))}resiziableDrag(t){const e=this.resizeHandleRef.value.getBoundingClientRect(),i=t.clientX-e.right,r=t.clientY-e.bottom;i>100&&this.width<2?this.width=2:i<-100&&this.width>1&&(this.width=1),r>50&&this.height<2?this.height=2:r<-50&&this.height>1&&(this.height=1)}resiziableDragEnd(t){window.removeEventListener("mousemove",this.resiziableDrag),window.removeEventListener("mouseup",this.resiziableDragEnd),this.resizing=!1,t.preventDefault(),t.stopPropagation()}disconnectedCallback(){this.removeEventListener("mousedown",this.editableMouseDown),super.disconnectedCallback()}render(){return this.editing?l`<div class="edit-overlay">
                <div class="resize-handle ${this.moving?"moving":""}" @mousedown=${this.resizableMouseDown} ${A(this.resizeHandleRef)}></div>
            </div>${super.render()}`:super.render()}};p.ignoredProperties=[...Rt(p,p,"ignoredProperties"),"editing","moving","resizing"];p.styles=[w.styles,u`
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
    `];S([a({type:Boolean})],p.prototype,"editing",2);S([a({type:Boolean})],p.prototype,"moving",2);S([a({type:Boolean})],p.prototype,"resizing",2);S([a({attribute:!1})],p.prototype,"onItemReorder",2);S([a({attribute:!1})],p.prototype,"onItemResize",2);S([a({type:Number,reflect:!0})],p.prototype,"width",2);S([a({type:Number,reflect:!0})],p.prototype,"height",2);p=S([g("tile-editable")],p);var It=Object.defineProperty,jt=Object.getOwnPropertyDescriptor,N=(t,e,i,r)=>{for(var o=r>1?void 0:r?jt(e,i):e,s=t.length-1,n;s>=0;s--)(n=t[s])&&(o=(r?n(e,i,o):n(o))||o);return r&&o&&It(e,i,o),o};let k=class extends p{constructor(){super(...arguments),this.fill=!0,this.useImage=!1,this.imageRef=B(),this.imagePollInterval=0}renderInner(){return l`<div class="button">
        <span class="icon">videocam</span>
      </div>
      <div class="name">${this.getDisplayName()}</div>
      ${this.renderCamera()}`}renderCamera(){return this.useVideo()?l`<video autoplay muted src="${this.stream}" class="${this.fill?"fill":""}">`:l`<img ${A(this.imageRef)} src="${this.parseUrl()}" class="${this.fill?"fill":""}"/>`}useVideo(){return this.stream&&this.stream.startsWith("http")&&!this.useImage}parseUrl(){return this.b64image?`data:image/jpeg;base64,${this.b64image}`:this.image.startsWith("<")?/src=(.+?)\s/g.exec(this.image)[1]:this.image}connectedCallback(){super.connectedCallback(),clearInterval(this.imagePollInterval),!this.useVideo()&&!this.b64image&&(this.imagePollInterval=setInterval(this.imageIntervalRefresh.bind(this),1e4))}disconnectedCallback(){super.disconnectedCallback(),clearInterval(this.imagePollInterval)}imageIntervalRefresh(){const t=new URL(this.imageRef.value.src);t.searchParams.set("q",new Date().getTime().toString()),this.imageRef.value.src=t.toString()}};k.styles=[p.styles,u`.tile {
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
    }`];N([a()],k.prototype,"fill",2);N([a()],k.prototype,"useImage",2);N([a()],k.prototype,"image",2);N([a()],k.prototype,"stream",2);N([a()],k.prototype,"b64image",2);k=N([g("tile-camera")],k);var Tt=Object.defineProperty,Mt=Object.getOwnPropertyDescriptor,U=(t,e,i,r)=>{for(var o=r>1?void 0:r?Mt(e,i):e,s=t.length-1,n;s>=0;s--)(n=t[s])&&(o=(r?n(e,i,o):n(o))||o);return r&&o&&Tt(e,i,o),o};let P=class extends O{constructor(){super(...arguments),this.size=120,this.progress=0,this.min=0,this.max=360,this.width=4,this.circle=B()}updated(){if(this.circle.value){const e=this.circle.value.r.baseVal.value*2*Math.PI;this.circle.value.style.strokeDasharray=`${e} ${e}`,this.circle.value.style.strokeDashoffset=`${e}`;const i=this.max-this.min,r=e-this.progress/100*(i/360)*e;this.circle.value.style.strokeDashoffset=r,this.min!=0&&(this.circle.value.style.transform=`rotate(${this.min-90}deg)`)}}render(){return l`<svg
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
                ${A(this.circle)}/>
        </svg>`}};P.styles=u`
    .progress-ring {
  
    }
    
    .progress-ring__circle {
      transition: 0.35s stroke-dashoffset;
      transform: rotate(-90deg);
      transform-origin: 50% 50%;
    }`;U([a({type:Number})],P.prototype,"size",2);U([a({type:Number})],P.prototype,"progress",2);U([a({type:Number})],P.prototype,"min",2);U([a({type:Number})],P.prototype,"max",2);U([a({type:Number})],P.prototype,"width",2);P=U([g("circular-progress")],P);var Ft=Object.defineProperty,Bt=Object.getOwnPropertyDescriptor,ze=(t,e,i,r)=>{for(var o=r>1?void 0:r?Bt(e,i):e,s=t.length-1,n;s>=0;s--)(n=t[s])&&(o=(r?n(e,i,o):n(o))||o);return r&&o&&Ft(e,i,o),o};let M=class extends p{renderInner(){return l`
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
    }`];ze([a({type:Number})],M.prototype,"temp",2);M=ze([g("tile-temp")],M);var At=Object.defineProperty,Gt=Object.getOwnPropertyDescriptor,pe=(t,e,i,r)=>{for(var o=r>1?void 0:r?Gt(e,i):e,s=t.length-1,n;s>=0;s--)(n=t[s])&&(o=(r?n(e,i,o):n(o))||o);return r&&o&&At(e,i,o),o};let V=class extends M{constructor(){super(...arguments),this.meta={heat:!1,cool:!1,modes:[]}}renderInner(){return l`
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
    }`];pe([a({attribute:!1})],V.prototype,"meta",2);pe([a()],V.prototype,"mode",2);V=pe([g("tile-hvac")],V);var Nt=Object.defineProperty,Ut=Object.getOwnPropertyDescriptor,Ht=(t,e,i,r)=>{for(var o=r>1?void 0:r?Ut(e,i):e,s=t.length-1,n;s>=0;s--)(n=t[s])&&(o=(r?n(e,i,o):n(o))||o);return r&&o&&Nt(e,i,o),o};const q=class q extends p{constructor(){super(),this.boundMouseDown=this._mouseDown.bind(this),this.boundMouseUp=this._mouseUp.bind(this),this.addEventListener("mousedown",this.boundMouseDown),this.addEventListener("mouseup",this.boundMouseUp),this.addEventListener("touchstart",this.boundMouseDown),this.addEventListener("touchend",this.boundMouseUp)}clicked(){}longClicked(){}clamp(e,i,r){return e>r?r:e<i?i:e}_mouseDown(e){this.preventMouseEmulation(e),this.longClickTimeout=setTimeout(this._onLongClick.bind(this),250)}_mouseUp(e){this.preventMouseEmulation(e),this.longClickComplete||(clearTimeout(this.longClickTimeout),this.clicked()),this.longClickComplete=!1}_onLongClick(){this.longClickComplete=!0,this.onLongClick&&this.onLongClick(this.id),this.longClicked()}preventMouseEmulation(e){e.type.startsWith("touch")&&e.preventDefault()}};q.ignoredProperties=[...be(q,q,"ignoredProperties"),"onLongClick"];let C=q;Ht([a({attribute:!1})],C.prototype,"onLongClick",2);class re extends C{constructor(){super(...arguments),this.dragLevelChanging=!1}dragStart(){throw new Error("dragStart must be overridden for a Draggable Component Control")}dragging(e){}dragEnd(e){throw new Error("dragEnd must be overridden for a Draggable Component Control")}clamp(e,i,r){return e>r?r:e<i?i:e}_mouseDown(e){this.preventMouseEmulation(e),e.preventDefault(),e instanceof TouchEvent&&e.changedTouches?this.dragStartAbsolutePosition=[e.changedTouches[0].clientX,e.changedTouches[0].clientY]:e instanceof MouseEvent&&(this.dragStartAbsolutePosition=[e.clientX,e.clientY]),this.dragEventHandlers={mousemove:this._onDrag.bind(this),mouseup:this._onDragEnd.bind(this)},window.addEventListener("mousemove",this.dragEventHandlers.mousemove),window.addEventListener("mouseup",this.dragEventHandlers.mouseup),window.addEventListener("touchmove",this.dragEventHandlers.mousemove),window.addEventListener("touchend",this.dragEventHandlers.mouseup),this.dragStart(),super._mouseDown(e)}_getPercentageFromEvent(e){const i=this.getTileSize()[0];let r;return e instanceof TouchEvent&&e.changedTouches?r=e.changedTouches[0].clientX-this.dragStartAbsolutePosition[0]:e instanceof MouseEvent&&(r=e.clientX-this.dragStartAbsolutePosition[0]),this.dragLevelChanging=!0,r/i}_onDrag(e){if(this.preventMouseEmulation(e),e instanceof TouchEvent&&e.changedTouches){let i=e.changedTouches[0].clientX-this.dragStartAbsolutePosition[0];if(i<10||i>-10)return}this.dragging(this._getPercentageFromEvent(e)),this.longClickComplete=!1,clearTimeout(this.longClickTimeout)}_onDragEnd(e){this.preventMouseEmulation(e),window.removeEventListener("mousemove",this.dragEventHandlers.mousemove),window.removeEventListener("mouseup",this.dragEventHandlers.mouseup),window.removeEventListener("touchmove",this.dragEventHandlers.mousemove),window.removeEventListener("touchend",this.dragEventHandlers.mouseup),this.dragLevelChanging&&this._dragEnded(this._getPercentageFromEvent(e)),this.longClickComplete=!1}_mouseUp(e){this.preventMouseEmulation(e),this.dragLevelChanging?(e.preventDefault(),this.longClickComplete=!1):super._mouseUp(e)}_dragEnded(e){this.dragLevelChanging=!1,this.dragEnd(e)}}var qt=Object.defineProperty,Vt=Object.getOwnPropertyDescriptor,Yt=Object.getPrototypeOf,Xt=Reflect.get,E=(t,e,i,r)=>{for(var o=r>1?void 0:r?Vt(e,i):e,s=t.length-1,n;s>=0;s--)(n=t[s])&&(o=(r?n(e,i,o):n(o))||o);return r&&o&&qt(e,i,o),o},Wt=(t,e,i)=>Xt(Yt(t),i,e);let v=class extends re{constructor(){super(...arguments),this.meta={color:!1,ct:!1,level:!1}}renderProgress(){return this.state=="on"?l`<div class="progress" style="right: ${100-this._localLevel}%; background: ${this.getBackgroundColor()}"></div>`:null}renderInner(){return l`
      <div class="button">
        <span class="icon ${this.state!="on"?"clear":""}">lightbulb</span>
      </div>
      ${this.renderProgress()}
      <div class="name">${this.getDisplayName()}</div>
      <div class="level">${this.state=="on"?this._localLevel+"%":"off"}</div>`}dragStart(){this.state==="on"&&(this.dragStartLevel=this.level)}dragging(t){this.state==="on"&&(this._localLevel=this.clamp(Math.round(this.dragStartLevel+t*100),0,100))}dragEnd(t){if(this.state!=="on")return;const e=this.clamp(Math.round(this.dragStartLevel+t*100),0,100);this.level=e}updated(t){super.updated(t),t.has("level")&&(this._localLevel=this.level)}clicked(){this.state=this.state=="on"?"off":"on"}getBackgroundColor(){if(this.meta.color&&this.mode=="RGB")return`hsl(${this.hue}, ${this.saturation}%, ${this.level/2}%)`;if(this.meta.ct){const{r:t,g:e,b:i}=v.colorTemperatureToRGB(this.ct);return`rgb(${t}, ${e}, ${i})`}else return"#ffb500"}static colorTemperatureToRGB(t){let e=t/100,i,r,o;return e<=66?(i=255,r=e,r=99.4708025861*Math.log(r)-161.1195681661,e<=19?o=0:(o=e-10,o=138.5177312231*Math.log(o)-305.0447927307)):(i=e-60,i=329.698727446*Math.pow(i,-.1332047592),r=e-60,r=288.1221695283*Math.pow(r,-.0755148492),o=255),{r:this.clamp(i,0,255),g:this.clamp(r,0,255),b:this.clamp(o,0,255)}}static clamp(t,e,i){return t<e?e:t>i?i:t}};v.ignoredProperties=[...Wt(v,v,"ignoredProperties")];v.styles=[re.styles,u`.tile {
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
    }`];E([a({attribute:!1})],v.prototype,"meta",2);E([a({type:Number})],v.prototype,"level",2);E([a({type:Number})],v.prototype,"_localLevel",2);E([a()],v.prototype,"mode",2);E([a({type:Number})],v.prototype,"hue",2);E([a({type:Number})],v.prototype,"saturation",2);E([a({type:Number})],v.prototype,"ct",2);v=E([g("tile-light")],v);var Jt=Object.defineProperty,Qt=Object.getOwnPropertyDescriptor,Kt=(t,e,i,r)=>{for(var o=r>1?void 0:r?Qt(e,i):e,s=t.length-1,n;s>=0;s--)(n=t[s])&&(o=(r?n(e,i,o):n(o))||o);return r&&o&&Jt(e,i,o),o};let le=class extends C{clicked(){this.state=this.state=="locked"?"unlocked":"locked"}renderInner(){return l`
      <div class="button">
        <span class="icon">${this.getIcon()}</span>
      </div>
      <div class="name">${this.getDisplayName()}</div>
      <div class="state">${this.state}</div>`}getIcon(){return this.state=="locked"?"door_front":"door_open"}};le.styles=[C.styles,u`.tile {
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
    }`];le=Kt([g("tile-lock")],le);var Zt=Object.defineProperty,ei=Object.getOwnPropertyDescriptor,Re=(t,e,i,r)=>{for(var o=r>1?void 0:r?ei(e,i):e,s=t.length-1,n;s>=0;s--)(n=t[s])&&(o=(r?n(e,i,o):n(o))||o);return r&&o&&Zt(e,i,o),o};let Z=class extends p{renderBackground(){var t;return(t=this.data)!=null&&t.image?l`<img class="background" src="${this.data.image}" referrerpolicy="no-referrer"></img>
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
      </div>`}toggleState(){this.state=="playing"?this.state="paused":this.state=="paused"&&(this.state="playing")}getIcon(t){switch(t){case"YouTube":return"https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg";case"Disney+":return"https://upload.wikimedia.org/wikipedia/commons/3/3e/Disney%2B_logo.svg";case"Netflix":return"https://upload.wikimedia.org/wikipedia/commons/0/0c/Netflix_2015_N_logo.svg";case"Prime Video":return"https://upload.wikimedia.org/wikipedia/commons/d/de/Amazon_icon.png";case"BBC iPlayer":return"https://upload.wikimedia.org/wikipedia/commons/3/39/BBC_iPlayer_2021_%28symbol%29.svg";case"All 4":return"https://upload.wikimedia.org/wikipedia/commons/0/0e/Channel_4_logo_2015.svg";case"ITV Player":return"https://en.wikipedia.org/wiki/ITV_plc#/media/File:ITV_logo_2013.svg"}return"https://upload.wikimedia.org/wikipedia/commons/7/7b/Octicons-playback-play.svg"}};Z.styles=[p.styles,u`.tile {
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
    }`];Re([a({attribute:!1})],Z.prototype,"data",2);Z=Re([g("tile-media")],Z);var ti=Object.defineProperty,ii=Object.getOwnPropertyDescriptor,Ie=(t,e,i,r)=>{for(var o=r>1?void 0:r?ii(e,i):e,s=t.length-1,n;s>=0;s--)(n=t[s])&&(o=(r?n(e,i,o):n(o))||o);return r&&o&&ti(e,i,o),o};let ee=class extends C{constructor(){super(...arguments),this.icon="switch"}clicked(){this.state=this.state=="on"?"off":"on"}renderInner(){return l`
      <div class="button">
        <span class="icon ${this.icon}">${this.getIcon()}</span>
      </div>
      <div class="name">${this.getDisplayName()}</div>
      <div class="state">${this.state}</div>`}getIcon(){switch(this.icon){case"light":return"lightbulb";case"fan":return"mode_fan";case"pump":return"water_pump"}return this.state=="on"?"toggle_on":"toggle_off"}};ee.styles=[C.styles,u`.tile {
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
    }`];Ie([a()],ee.prototype,"icon",2);ee=Ie([g("tile-switch")],ee);var ri=Object.defineProperty,oi=Object.getOwnPropertyDescriptor,si=Object.getPrototypeOf,ni=Reflect.get,ue=(t,e,i,r)=>{for(var o=r>1?void 0:r?oi(e,i):e,s=t.length-1,n;s>=0;s--)(n=t[s])&&(o=(r?n(e,i,o):n(o))||o);return r&&o&&ri(e,i,o),o},ai=(t,e,i)=>ni(si(t),i,e);let _=class extends re{renderProgress(){return l`<div class="progress" style="right: ${100-this._localLevel}%;"></div>`}renderInner(){return l`
      <div class="button">
        <span class="icon ${this.state!="on"?"clear":""}">window_closed</span>
      </div>
      ${this.renderProgress()}
      <div class="name">${this.getDisplayName()}</div>
      <div class="level">${this._localLevel}%</div>`}dragStart(){this.dragStartLevel=this._localLevel}dragging(t){this._localLevel=this.clamp(Math.round(this.dragStartLevel+t*100),0,100)}dragEnd(t){const e=this.clamp(Math.round(this.dragStartLevel+t*100),0,100);this.position=e}updated(t){super.updated(t),t.has("position")&&(this._localLevel=this.position)}static clamp(t,e,i){return t<e?e:t>i?i:t}};_.ignoredProperties=[...ai(_,_,"ignoredProperties")];_.styles=[re.styles,u`.tile {
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
    }`];ue([a({type:Number})],_.prototype,"position",2);ue([a({type:Number})],_.prototype,"_localLevel",2);_=ue([g("tile-window")],_);var li=Object.defineProperty,ci=Object.getOwnPropertyDescriptor,ge=(t,e,i,r)=>{for(var o=r>1?void 0:r?ci(e,i):e,s=t.length-1,n;s>=0;s--)(n=t[s])&&(o=(r?n(e,i,o):n(o))||o);return r&&o&&li(e,i,o),o};let Y=class extends O{constructor(){super(...arguments),this.proxyRef=B()}render(){return l`<div ${A(this.proxyRef)} class="proxy" style="width: ${this.width}px; height: ${this.height}px;" draggable="true"></div>`}setProxyPosition(t){this.proxyRef.value&&(this.proxyRef.value.style.top=t.pageY-this.offsetY+"px",this.proxyRef.value.style.left=t.pageX-this.offsetX+"px")}setMouseOffset(t){this.offsetX=t.offsetX,this.offsetY=t.offsetY,this.setProxyPosition(t)}intersection(t){var s;var e=t.getBoundingClientRect(),i=(s=this.proxyRef.value)==null?void 0:s.getBoundingClientRect();const r=Math.max(0,Math.min(e.right,i.right)-Math.max(e.left,i.left))/(e.right-e.left),o=Math.max(0,Math.min(e.bottom,i.bottom)-Math.max(e.top,i.top))/(e.bottom-e.top);return r*o}};Y.styles=u`
        .proxy {
            position: absolute;
            background: rgba(128, 128, 128, 0.5);
            border-radius: var(--tile-roundness);
            border: 1px dashed rgba(0,0,0,0.3);
            box-sizing: border-box;
        }`;ge([a({type:Number})],Y.prototype,"width",2);ge([a({type:Number})],Y.prototype,"height",2);Y=ge([g("tile-proxy")],Y);class je extends He{constructor(){super(...arguments),this.prevData={}}render(e){return qe}update(e,[i]){var r;this.element!==e.element&&(this.element=e.element),this.host=((r=e.options)==null?void 0:r.host)||this.element,this.apply(i),this.groom(i),this.prevData={...i}}apply(e){if(!e)return;const{prevData:i,element:r}=this;for(const o in e){const s=e[o];s!==i[o]&&(r[o]=s)}}groom(e){const{prevData:i,element:r}=this;if(i)for(const o in i)(!e||!(o in e)&&r[o]===i[o])&&(r[o]=void 0)}}const m=xe(je);class di extends je{constructor(){super(...arguments),this.eventData={}}apply(e){if(e)for(const i in e){const r=e[i];r!==this.eventData[i]&&this.applyEvent(i,r)}}applyEvent(e,i){const{prevData:r,element:o}=this;this.eventData[e]=i,r[e]&&o.removeEventListener(e,this,i),o.addEventListener(e,this,i)}groom(e){const{prevData:i,element:r}=this;if(i)for(const o in i)(!e||!(o in e)&&r[o]===i[o])&&this.groomEvent(o,i[o])}groomEvent(e,i){const{element:r}=this;delete this.eventData[e],r.removeEventListener(e,this,i)}handleEvent(e){const i=this.eventData[e.type];typeof i=="function"?i.call(this.host,e):i.handleEvent(e)}disconnected(){const{eventData:e,element:i}=this;for(const r in e){const o=r.slice(1),s=e[r];i.removeEventListener(o,this,s)}}reconnected(){const{eventData:e,element:i}=this;for(const r in e){const o=r.slice(1),s=e[r];i.addEventListener(o,this,s)}}}class hi extends di{apply(e){if(!e)return;const{prevData:i,element:r}=this;for(const o in e){const s=e[o];if(s===i[o])continue;const n=o.slice(1);switch(o[0]){case"@":this.eventData[n]=s,this.applyEvent(n,s);break;case".":r[n]=s;break;case"?":s?r.setAttribute(n,""):r.removeAttribute(n);break;default:s!=null?r.setAttribute(o,String(s)):r.removeAttribute(o);break}}}groom(e){const{prevData:i,element:r}=this;if(i)for(const o in i){const s=o.slice(1);if(!e||!(o in e)&&r[s]===i[o])switch(o[0]){case"@":this.groomEvent(s,i[o]);break;case".":r[s]=void 0;break;case"?":r.removeAttribute(s);break;default:r.removeAttribute(o);break}}}}const ye=xe(hi);var pi=Object.defineProperty,ui=Object.getOwnPropertyDescriptor,H=(t,e,i,r)=>{for(var o=r>1?void 0:r?ui(e,i):e,s=t.length-1,n;s>=0;s--)(n=t[s])&&(o=(r?n(e,i,o):n(o))||o);return r&&o&&pi(e,i,o),o};let D=class extends ce(h)(O){renderTile(t){var e,i,r,o,s,n,d,c,f;switch(t.type){case"media":return l`<tile-media ?editing=${this.editing} id="${t.id}" name="${t.label}" room="${this.room}" .onLongClick=${(e=this.onLongClickItem)==null?void 0:e.bind(this,t)} ${m(t.getState())} ${m(t.getPrefs())}/>`;case"light":return l`<tile-light ?editing=${this.editing} id="${t.id}" name="${t.label}" room="${this.room}" .onLongClick=${(i=this.onLongClickItem)==null?void 0:i.bind(this,t)} ${m(t.getState())} ${m(t.getPrefs())}/>`;case"camera":return l`<tile-camera ?editing=${this.editing} id="${t.id}" name="${t.label}" room="${this.room}" .onLongClick=${(r=this.onLongClickItem)==null?void 0:r.bind(this,t)} ${m(t.getState())} ${m(t.getPrefs())}/>`;case"hvac":return l`<tile-hvac ?editing=${this.editing} id="${t.id}" name="${t.label}" room="${this.room}" .onLongClick=${(o=this.onLongClickItem)==null?void 0:o.bind(this,t)} ${m(t.getState())} ${m(t.getPrefs())}/>`;case"temp":return l`<tile-temp ?editing=${this.editing} id="${t.id}" name="${t.label}" room="${this.room}" .onLongClick=${(s=this.onLongClickItem)==null?void 0:s.bind(this,t)} ${m(t.getState())} ${m(t.getPrefs())}/>`;case"lock":return l`<tile-lock ?editing=${this.editing} id="${t.id}" name="${t.label}" room="${this.room}" .onLongClick=${(n=this.onLongClickItem)==null?void 0:n.bind(this,t)} ${m(t.getState())} ${m(t.getPrefs())}/>`;case"window":return l`<tile-window ?editing=${this.editing} id="${t.id}" name="${t.label}" room="${this.room}" .onLongClick=${(d=this.onLongClickItem)==null?void 0:d.bind(this,t)} ${m(t.getState())} ${m(t.getPrefs())}/>`;case"switch":return l`<tile-switch ?editing=${this.editing} id="${t.id}" name="${t.label}" room="${this.room}" .onLongClick=${(c=this.onLongClickItem)==null?void 0:c.bind(this,t)} ${m(t.getState())} ${m(t.getPrefs())}/>`;default:return l`<tile-editable ?editing=${this.editing} id="${t.id}" name="${t.label}" room="${this.room}" .onLongClick=${(f=this.onLongClickItem)==null?void 0:f.bind(this,t)} ${m(t.getState())} ${m(t.getPrefs())}/>`}}get devices(){var t;return(t=he(this.gridId))==null?void 0:t.devices}render(){return l`<div class="canvas">
             ${Ve(this.devices,t=>t.id,t=>this.renderTile(t))}
        </div>`}checkProxyIntersection(t,e){const i=this.devices.find(r=>{const o=this.shadowRoot.getElementById(r.id.toString());return r!=e.item&&t.intersection(o)>.4});i&&(console.log("intersected",i),_t(this.gridId,[parseInt(e.id),i.id]),this.requestUpdate(),this.debounceOrderChange())}debounceOrderChange(){clearTimeout(this.debounceTimeout),this.onOrderChange&&this.gridId&&(this.debounceTimeout=setTimeout(()=>{this.onOrderChange(this.gridId,this.devices.map(({id:t})=>t))},500))}swapElements(t,e,i){t[e]=t.splice(i,1,t[e])[0]}};D.styles=u`.title {
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
    }`;H([a({type:Number,attribute:"grid-id"})],D.prototype,"gridId",2);H([a()],D.prototype,"room",2);H([a({attribute:!1})],D.prototype,"onLongClickItem",2);H([a({attribute:!1})],D.prototype,"onOrderChange",2);H([a({type:Boolean})],D.prototype,"editing",2);D=H([g("device-grid")],D);var gi=Object.defineProperty,mi=Object.getOwnPropertyDescriptor,Q=(t,e,i,r)=>{for(var o=r>1?void 0:r?mi(e,i):e,s=t.length-1,n;s>=0;s--)(n=t[s])&&(o=(r?n(e,i,o):n(o))||o);return r&&o&&gi(e,i,o),o};let z=class extends ce(h)(O){render(){return l`<div class="bar">
            <h1 class="home">${this.home}</h1>
            <!-- <h3 class="room">${this.room}</h3>        -->
            
            ${this.renderClock()}
            ${this.renderDate()}
        </div>`}renderClock(){return l`<div class="clock">
            ${this.time}
        </div>`}renderDate(){return l`<div class="date">${this.date}
        </div>`}stateChanged(t){var e;this.home=t.home.name,this.room=(e=t.rooms.find(({id:i})=>i==t.app.room))==null?void 0:e.name}connectedCallback(){super.connectedCallback(),this.tick()}disconnectedCallback(){super.disconnectedCallback(),clearTimeout(this.tickTimeout)}tick(){const t=new Date,e=t.getHours(),i=t.getMinutes();t.getSeconds();const r=e<10?"0"+e:e,o=i<10?"0"+i:i,s=t.getMonth(),n=t.getFullYear(),d=t.getDate(),c=["January","February","March","April","May","June","July","August","September","October","November","December"],f=["th","st","nd","rd","th","th","th","th","th","th"],T=d+""+f[d>10?d.toString()[1]:d]+" of "+c[s]+" "+n,Be=r+":"+o;this.date=T,this.time=Be,this.tickTimeout=setTimeout(this.tick.bind(this),1e3)}};z.styles=u`
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
    }`;Q([a()],z.prototype,"home",2);Q([a()],z.prototype,"room",2);Q([a()],z.prototype,"time",2);Q([a()],z.prototype,"date",2);z=Q([g("info-bar")],z);var fi=Object.defineProperty,bi=Object.getOwnPropertyDescriptor,j=(t,e,i,r)=>{for(var o=r>1?void 0:r?bi(e,i):e,s=t.length-1,n;s>=0;s--)(n=t[s])&&(o=(r?n(e,i,o):n(o))||o);return r&&o&&fi(e,i,o),o};let b=class extends O{render(){return l`<div class="popover">
                <h2 class="title">${this.title}</h2>
                <div class="button" @click=${this.onClose}>
                    <span class="icon">close</span>
                </div>
                ${this.renderControls()}
                ${this.renderContent()}
            </div>
        </div>`}renderContent(){return l`this element must be extended`}renderControls(){return l`<div class="group-controls">
            ${this.renderGroupControlsForType()}
        </div>`}renderGroupControlsForType(){switch(this.type){case"light":return l`<controls-light .meta=${this.item.getMeta()} ${ye(this.item.getState())} .item=${this.item}/>`;case"switch":return l`<controls-switch ${ye(this.item.getPrefs())} .item=${this.item}/>`}}};b.styles=u`
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
        }`;j([a()],b.prototype,"title",2);j([a({attribute:!1})],b.prototype,"meta",2);j([a()],b.prototype,"type",2);j([a({attribute:!1})],b.prototype,"item",2);j([a({attribute:!1})],b.prototype,"onClose",2);j([a({attribute:!1})],b.prototype,"onItemChange",2);b=j([g("popover-base")],b);var vi=Object.defineProperty,yi=Object.getOwnPropertyDescriptor,me=(t,e,i,r)=>{for(var o=r>1?void 0:r?yi(e,i):e,s=t.length-1,n;s>=0;s--)(n=t[s])&&(o=(r?n(e,i,o):n(o))||o);return r&&o&&vi(e,i,o),o};let X=class extends b{renderContent(){return l`<div class="grid-container">
            <div class="inner-container">
                <device-grid .devices=${this.devices} .home=${this.home} .onItemChange=${this.onItemChange} />
            </div>
        </div>`}};X.styles=[b.styles,u`
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
        }`];me([a({attribute:!1})],X.prototype,"home",2);me([a({attribute:!1})],X.prototype,"devices",2);X=me([g("popover-group")],X);var wi=Object.defineProperty,xi=Object.getOwnPropertyDescriptor,oe=(t,e,i,r)=>{for(var o=r>1?void 0:r?xi(e,i):e,s=t.length-1,n;s>=0;s--)(n=t[s])&&(o=(r?n(e,i,o):n(o))||o);return r&&o&&wi(e,i,o),o};let F=class extends b{renderContent(){return l`<p>We should probably add some device control stuff here?</p>`}};F.styles=[b.styles,u`

        .controls {
            height: 100%;
        }`];oe([a({attribute:!1})],F.prototype,"home",2);oe([a()],F.prototype,"type",2);oe([a({attribute:!1})],F.prototype,"meta",2);F=oe([g("popover-device")],F);var $i=Object.defineProperty,_i=Object.getOwnPropertyDescriptor,K=(t,e,i,r)=>{for(var o=r>1?void 0:r?_i(e,i):e,s=t.length-1,n;s>=0;s--)(n=t[s])&&(o=(r?n(e,i,o):n(o))||o);return r&&o&&$i(e,i,o),o};let R=class extends b{renderContent(){var t,e,i,r,o;return l`<h3>Background Color</h3>
        Gradient Color 1: <input type="color" id="bgColor1" .value=${((e=(t=this.room.prefs)==null?void 0:t.bgColor)==null?void 0:e[0])??"#1a50e2"} @change=${this.color1Change}/><br>
        Gradient Color 2: <input type="color" id="bgColor2" .value=${((r=(i=this.room.prefs)==null?void 0:i.bgColor)==null?void 0:r[1])??"#1096b1"} @change=${this.color2Change}/><br>
        Gradient Angle: <input type="range" min="0" max="359" .value=${((o=this.room.prefs)==null?void 0:o.bgAngle)??328} @change=${this.angleChange}>`}color1Change(t){this.room.prefs.bgColor||(this.room.prefs.bgColor=[]),this.room.prefs.bgColor[0]=t.target.value,this.setBackground(this.room.prefs),this.onPrefChange(this.room.id,"bgColor",this.room.prefs.bgColor)}color2Change(t){this.room.prefs.bgColor||(this.room.prefs.bgColor=[]),this.room.prefs.bgColor[1]=t.target.value,this.setBackground(this.room.prefs),this.onPrefChange(this.room.id,"bgColor",this.room.prefs.bgColor)}angleChange(t){this.room.prefs.bgAngle=t.target.value,this.setBackground(this.room.prefs),this.onPrefChange(this.room.id,"bgAngle",this.room.prefs.bgAngle)}changeBg(){var t,e,i,r;document.body.style=`--bg-grad-1: ${((e=(t=this.room.prefs)==null?void 0:t.bgColor)==null?void 0:e[0])??"#1a50e2"}; --bg-grad-2: ${((r=(i=this.room.prefs)==null?void 0:i.bgColor)==null?void 0:r[1])??"#1096b1"}; --bg-grad-angle: ${this.room.prefs.bgAngle??328}deg; --tile-default-active-color: ${this.rgb()}`}rgb(){var i,r;var t=((r=(i=this.room.prefs)==null?void 0:i.bgColor)==null?void 0:r[0])??"#1a50e2",e=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(t);return e?`${parseInt(e[1],16)+25}, ${parseInt(e[2],16)+25}, ${parseInt(e[3],16)+25}`:""}};R.styles=[b.styles,u``];K([a({attribute:!1})],R.prototype,"home",2);K([a({attribute:!1})],R.prototype,"room",2);K([a({attribute:!1})],R.prototype,"onPrefChange",2);K([a({attribute:!1})],R.prototype,"setBackground",2);R=K([g("popover-room-settings")],R);var ki=Object.defineProperty,Pi=Object.getOwnPropertyDescriptor,L=(t,e,i,r)=>{for(var o=r>1?void 0:r?Pi(e,i):e,s=t.length-1,n;s>=0;s--)(n=t[s])&&(o=(r?n(e,i,o):n(o))||o);return r&&o&&ki(e,i,o),o};let x=class extends O{constructor(){super(...arguments),this.colorPickerRef=B(),this.meta={color:!1,ct:!1,level:!1}}render(){return l`
        <div class="color-container">
            ${this.renderTabs()}
            ${this.renderTab()}
        </div>
        <div class="level"></div>`}renderTabs(){return this.meta.color&&this.meta.ct?l`<div class="tab-container">
                <a href="#RGB" class="tab ${this.mode=="RGB"?"active":""}" @click="${this.switchMode}">Color</a>
                <a href="#CT" class="tab ${this.mode=="CT"?"active":""}" @click="${this.switchMode}">Temperature</a>
            </div>`:null}renderTab(){return this.meta.color&&!this.meta.ct?this.renderColorTab():this.meta.ct&&!this.meta.color?this.renderCTTab():!this.meta.ct&&!this.meta.color?null:this.mode=="RGB"?this.renderColorTab():this.renderCTTab()}renderColorTab(){return l`<div>
            <div id="picker" ${A(this.colorPickerRef)}></div>
        </div>`}renderCTTab(){return l`<div>Temp Picker</div>`}switchMode(t){t.preventDefault();const e=t.target.href.split("#")[1];this.mode=e}updated(t){if(super.updated(t),this.colorPickerRef.value&&!this.colorPicker?(this.colorPicker=new ve.ColorPicker(this.colorPickerRef.value,{width:150,layoutDirection:"horizontal",color:this.hsvToRgbHex(this.hue/360,this.saturation/100),layout:[{component:ve.ui.Wheel}]}),this.colorPicker.on("color:change",e=>{this.hue=e.hsv.h,this.saturation=e.hsv.s})):this.colorPickerRef.value||delete this.colorPicker,this.item.el){const e=this.item.el.constructor.ignoredProperties,i=[...t.keys()].filter(r=>!e.includes(r));i.length>0&&i.forEach(r=>{this.item.el[r]=this[r],this.item.el.requestUpdate()})}}hsvToRgbHex(t=0,e=0,i=1){const{r,g:o,b:s}=this.HSVtoRGB(t,e,i);return"#"+this.componentToHex(r)+this.componentToHex(o)+this.componentToHex(s)}componentToHex(t){const e=t.toString(16);return e.length==1?"0"+e:e}HSVtoRGB(t,e,i){var r,o,s,n,d,c,f,T;switch(arguments.length===1&&(e=t.s,i=t.v,t=t.h),n=Math.floor(t*6),d=t*6-n,c=i*(1-e),f=i*(1-d*e),T=i*(1-(1-d)*e),n%6){case 0:r=i,o=T,s=c;break;case 1:r=f,o=i,s=c;break;case 2:r=c,o=i,s=T;break;case 3:r=c,o=f,s=i;break;case 4:r=T,o=c,s=i;break;case 5:r=i,o=c,s=f;break}return{r:Math.round(r*255),g:Math.round(o*255),b:Math.round(s*255)}}};x.styles=u`
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
    `;L([a({attribute:!1})],x.prototype,"item",2);L([a({attribute:!1})],x.prototype,"meta",2);L([a({type:String})],x.prototype,"mode",2);L([a({type:Number})],x.prototype,"hue",2);L([a({type:Number})],x.prototype,"saturation",2);L([a({type:Number})],x.prototype,"ct",2);L([a({type:Number})],x.prototype,"level",2);x=L([g("controls-light")],x);var Ci=Object.defineProperty,Di=Object.getOwnPropertyDescriptor,fe=(t,e,i,r)=>{for(var o=r>1?void 0:r?Di(e,i):e,s=t.length-1,n;s>=0;s--)(n=t[s])&&(o=(r?n(e,i,o):n(o))||o);return r&&o&&Ci(e,i,o),o};let W=class extends O{render(){return l`
        <select @change=${t=>{this.icon=t.target.value}}>
            <option ?selected=${!this.icon||this.icon=="switch"} value="switch">Switch</option>
            <option ?selected=${this.icon=="light"} value="light">Light</option>
            <option ?selected=${this.icon=="pump"} value="pump">Pump</option>
            <option ?selected=${this.icon=="fan"} value="fan">Fan</option>
        </select>`}updated(t,e){this.item.setPrefs&&(this.item.setPrefs({icon:this.icon}),this.item.el&&(this.item.el.icon=this.icon,this.item.el.requestUpdate()))}};W.styles=u`.level {
        display: block;
        width: 100%;
        height: 20px;
        border-radius: 3px;
        background: rgba(0,0,0,0.2);
    }
    `;fe([a({attribute:!1})],W.prototype,"item",2);fe([a()],W.prototype,"icon",2);W=fe([g("controls-switch")],W);if(!window.__homedash_config||!window.__homedash_config.provider)throw new Error("Config not set!");let y;switch(window.__homedash_config.provider.type){case"hubitat":y=new Ye(window.__homedash_config.provider.server,window.__homedash_config.provider.token);break;default:throw new Error(`Unknown Provider: '${window.__homedash_config.provider.type}'`)}y.init().then(()=>{vt(y),Ct("app.room",Te),Si(),Ei(),ji(),Fi()});function Oi(){const t=document.querySelector(".edit-mode"),e=document.querySelector(".main-canvas");t.addEventListener("change",()=>{e.editing=t.checked}),document.querySelector(".room-settings-button").addEventListener("click",()=>{Ii(Me())})}function Si(){const t=document.querySelector(".sidebar .name");t.innerText=h.getState().home.name}function Ei(){const t=document.querySelector(".sidebar .menu");h.getState().rooms.map(i=>{const r=document.createElement("li");return r.innerText=i.name,r.id=`room-${i.id}`,r.addEventListener("click",$t.bind(this,i.id)),r}).forEach(i=>t.appendChild(i))}function Te(t,e=!0){var n;const i=he(t),r=document.querySelector(".main-canvas"),o=document.querySelector(".room");r.room=i.name,r.gridId=i.id,r.onLongClickItem=Ri,r.onOrderChange=Li,o.innerText=i.name,Fe(i.prefs);const s=document.querySelector(".sidebar .menu");(n=s.querySelector(".selected"))==null||n.classList.remove("selected"),s.querySelector(`#room-${i.id}`).classList.add("selected"),e&&y.refreshRoom(t)}function Li(t,e){return y.setRoomPref(t,"order",e)}function zi(t,e,i){return y.setRoomPref(t,e,i)}function te(){const t=document.querySelector(".popover-container"),e=Array.from(t==null?void 0:t.children);e==null||e.forEach(i=>{t==null||t.removeChild(i)})}function Ri(t){te();const e=document.querySelector(".popover-container");let i;"devices"in t?(i=document.createElement("popover-group"),i.devices=t.devices):i=document.createElement("popover-device"),i.title=t.label,i.type=t.type,i.item=t,i.meta=t.getMeta(),i.onClose=te,e.appendChild(i)}function Ii(t){const e=he(t);te();const i=document.querySelector(".popover-container"),r=document.createElement("popover-room-settings");r.title=e.name,r.room=e,r.onPrefChange=zi,r.setBackground=Fe,r.onClose=te,i.appendChild(r)}function ji(){Te(Me(),!1),Bi(),Ai(),Oi(),bt((t,e)=>{Object.entries(e).forEach(([i,r])=>{y.setDeviceValue(t,i,r)})}),y.addEventListener(se.roomRefresh,Mi),y.addEventListener(se.deviceUpdates,Ti)}function Ti(t){const e=y.getDevices().filter(i=>t.includes(i.id)).map(I.fromObject);yt(e)}function Mi(t,e){wt(t),xt(e)}function Fi(){const t=document.querySelector(".loading");document.body.removeChild(t)}function Me(){return h.getState().app.room||y.getRooms()[0].id}function Fe(t){var r,o,s;const e=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(((r=t==null?void 0:t.bgColor)==null?void 0:r[0])??"#1a50e2"),i=e?`${parseInt(e[1],16)+25}, ${parseInt(e[2],16)+25}, ${parseInt(e[3],16)+25}`:"";document.body.style=`--bg-grad-1: ${((o=t==null?void 0:t.bgColor)==null?void 0:o[0])??"#1a50e2"}; --bg-grad-2: ${((s=t==null?void 0:t.bgColor)==null?void 0:s[1])??"#1096b1"}; --bg-grad-angle: ${t.bgAngle??328}deg; --tile-default-active-color: ${i}`}function Bi(){const t=h.getState().app;t.fullscreen?document.body.classList.add("fullscreen"):document.body.classList.remove("fullscreen"),t.infobar!=null?document.body.classList.add("infobar"):document.body.classList.remove("infobar")}function Ai(){const t=document.querySelector(".mobile-sidebar-toggle"),e=document.querySelector(".sidebar");t.addEventListener("click",()=>{e.classList.toggle("show")})}
//# sourceMappingURL=index.js.map
