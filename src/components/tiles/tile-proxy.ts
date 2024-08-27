import { LitElement, css, html } from "lit";
import {customElement, property} from 'lit/decorators.js';
import { Ref, createRef, ref } from 'lit/directives/ref.js';


@customElement('tile-proxy')
export default class TileProxy extends LitElement {
    static styles = css`
        .proxy {
            position: absolute;
            background: rgba(128, 128, 128, 0.5);
            border-radius: var(--tile-roundness);
            border: 1px dashed rgba(0,0,0,0.3);
            box-sizing: border-box;
        }`

    @property({type:Number})
    width:number;

    @property({type:Number})
    height:number;

    private offsetX:number;
    private offsetY:number;

    proxyRef:Ref = createRef();


    render() {
        return html`<div ${ref(this.proxyRef)} class="proxy" style="width: ${this.width}px; height: ${this.height}px;" draggable="true"></div>`
    }

    setProxyPosition(event:MouseEvent) {
        if(this.proxyRef.value) {
            (this.proxyRef.value as HTMLDivElement).style.top = (event.pageY - this.offsetY) + 'px';
            (this.proxyRef.value as HTMLDivElement).style.left = (event.pageX - this.offsetX) + 'px';
        }
    }

    setMouseOffset(event:MouseEvent) {
        this.offsetX = event.offsetX;
        this.offsetY = event.offsetY;
        
        this.setProxyPosition(event);
    }

    intersection(el:Element) {        
        var rectA = el.getBoundingClientRect();
        var rectB = this.proxyRef.value?.getBoundingClientRect();

        const x_overlap = Math.max(0, Math.min(rectA.right, rectB.right) - Math.max(rectA.left, rectB.left)) / (rectA.right - rectA.left);
        const y_overlap = Math.max(0, Math.min(rectA.bottom, rectB.bottom) - Math.max(rectA.top, rectB.top)) / (rectA.bottom - rectA.top);

        return x_overlap * y_overlap;
    }
}