import {customElement, property} from 'lit/decorators.js';
import Tile from "./tile-base";
import { css, html } from 'lit';
import TileProxy from './tile-proxy';
import DeviceGrid from '../device-grid';
import { Ref, createRef, ref } from 'lit/directives/ref.js';

@customElement('tile-editable')
export default class TileEditable extends Tile {
    static ignoredProperties: string[] = [...super.ignoredProperties, 'editing', 'moving', 'resizing'];
    static styles = [
        Tile.styles,
        css`
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
    `];

    proxy:TileProxy;

    @property({type:Boolean})
    editing:boolean = false;

    @property({type:Boolean})
    moving:boolean = false;

    @property({type:Boolean})
    resizing:boolean = false;

    @property({attribute: false})
    onItemReorder: (index:number) => void

    @property({attribute: false})
    onItemResize: (w:number, h:number) => void

    resizeHandleRef:Ref = createRef();

    @property({type: Number, reflect: true})
    width:number = 1;

    @property({type: Number, reflect: true})
    height:number = 1;

    constructor() {
        super();

        this.editableMouseDown = this.editableMouseDown.bind(this);
        this.editableMove = this.editableMove.bind(this);
        this.editableMoveEnd = this.editableMoveEnd.bind(this);
        
        this.resizableMouseDown = this.resizableMouseDown.bind(this);
        this.resiziableDrag = this.resiziableDrag.bind(this);
        this.resiziableDragEnd = this.resiziableDragEnd.bind(this);

    }

    connectedCallback() {
        super.connectedCallback();
        this.addEventListener('mousedown', this.editableMouseDown);
    }

    attachProxyToWindow(event: MouseEvent): void {
        const [width, height] = this.getTileSize();
        this.proxy = document.createElement('tile-proxy') as TileProxy;
        this.proxy.width = width;
        this.proxy.height = height;

        document.body.appendChild(this.proxy);

        this.proxy.setMouseOffset(event);
    }

    editableMouseDown(event: MouseEvent): void {
        if(!this.editing || this.resizing) {
            return;
        }

        this.tileRef.value.classList.add('editing');
        this.attachProxyToWindow(event);

        this.moving = true;

        event.preventDefault();
        event.stopPropagation();

        window.addEventListener('mousemove', this.editableMove);
        window.addEventListener('mouseup', this.editableMoveEnd);
    }

    editableMove(event:MouseEvent): void  {
        this.proxy.setProxyPosition(event);
        (this.parentElement.getRootNode().host as DeviceGrid).checkProxyIntersection(this.proxy, this);
    }

    editableMoveEnd(event:MouseEvent): void {
        window.removeEventListener('mousemove', this.editableMove);
        window.removeEventListener('mouseup', this.editableMoveEnd);
        
        this.moving = false;

        event.preventDefault();
        event.stopPropagation();

        this.tileRef.value.classList.remove('editing');
        document.body.removeChild(this.proxy);
    }

    resizableMouseDown(event: MouseEvent): void {
        if(!this.editing || this.moving) {
            return;
        }

        this.resizing = true;

        event.preventDefault();
        event.stopPropagation();

        window.addEventListener('mousemove', this.resiziableDrag);
        window.addEventListener('mouseup', this.resiziableDragEnd);
    }

    resiziableDrag(event:MouseEvent): void {
        const rect = this.resizeHandleRef.value.getBoundingClientRect();

        const dragDistanceX = event.clientX - rect.right;
        const dragDistanceY = event.clientY - rect.bottom;

        if(dragDistanceX > 100 && this.width < 2) {
            this.width = 2;
        } else if(dragDistanceX < -100 && this.width > 1) {
            this.width = 1;
        }

        if(dragDistanceY > 50 && this.height < 2) {
            this.height = 2;
        } else if(dragDistanceY < -50 && this.height > 1) {
            this.height = 1;
        }
    }

    resiziableDragEnd(event:MouseEvent): void {
        window.removeEventListener('mousemove', this.resiziableDrag);
        window.removeEventListener('mouseup', this.resiziableDragEnd);

        this.resizing = false;

        event.preventDefault();
        event.stopPropagation();
    }

    disconnectedCallback(): void {
        this.removeEventListener('mousedown', this.editableMouseDown);
        super.disconnectedCallback();
    }

    render() {
        if(this.editing) {
            return html`<div class="edit-overlay">
                <div class="resize-handle ${this.moving ? 'moving': ''}" @mousedown=${this.resizableMouseDown} ${ref(this.resizeHandleRef)}></div>
            </div>${super.render()}`;
        }

        return super.render();
    }
}