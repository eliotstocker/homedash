import {html, css, LitElement, TemplateResult} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {repeat} from 'lit/directives/repeat.js';
import { spreadProps } from '../component-utils';
import TileProxy from './tiles/tile-proxy';
import Tile from './tiles/tile-base';
import iItemModel, {iItem} from '../models/iItem';

import { connect } from 'pwa-helpers';
import store, {getGroup, getRoom, swapDevicesInRoom} from '../state';

@customElement('device-grid')
export default class DeviceGrid extends connect(store)(LitElement) {
    static styles = css`.title {
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
    }`

    private debounceTimeout: Node.Timeout;

    @property({type: Number, attribute: 'grid-id'})
    gridId?: number;

    @property()
    room?: string;

    @property({attribute: false})
    onLongClickItem?: (device: iItem) => void;

    @property({attribute: false})
    onOrderChange: (roomId: number, order: number[]) => void

    @property({type:Boolean})
    editing:boolean;

    renderTile(item:iItemModel) : TemplateResult {
        switch(item.type) {
            case "media":
                return html`<tile-media ?editing=${this.editing} id="${item.id}" name="${item.label}" room="${this.room}" .onLongClick=${this.onLongClickItem?.bind(this, item)} ${spreadProps(item.getState())} ${spreadProps(item.getPrefs())}/>`;
            case "light":
                return html`<tile-light ?editing=${this.editing} id="${item.id}" name="${item.label}" room="${this.room}" .onLongClick=${this.onLongClickItem?.bind(this, item)} ${spreadProps(item.getState())} ${spreadProps(item.getPrefs())}/>`;
            case "camera":
                return html`<tile-camera ?editing=${this.editing} id="${item.id}" name="${item.label}" room="${this.room}" .onLongClick=${this.onLongClickItem?.bind(this, item)} ${spreadProps(item.getState())} ${spreadProps(item.getPrefs())}/>`;
            case "hvac":
                return html`<tile-hvac ?editing=${this.editing} id="${item.id}" name="${item.label}" room="${this.room}" .onLongClick=${this.onLongClickItem?.bind(this, item)} ${spreadProps(item.getState())} ${spreadProps(item.getPrefs())}/>`;
            case "temp":
                return html`<tile-temp ?editing=${this.editing} id="${item.id}" name="${item.label}" room="${this.room}" .onLongClick=${this.onLongClickItem?.bind(this, item)} ${spreadProps(item.getState())} ${spreadProps(item.getPrefs())}/>`;
            case "lock":
                return html`<tile-lock ?editing=${this.editing} id="${item.id}" name="${item.label}" room="${this.room}" .onLongClick=${this.onLongClickItem?.bind(this, item)} ${spreadProps(item.getState())} ${spreadProps(item.getPrefs())}/>`;
            case "window":
                return html`<tile-window ?editing=${this.editing} id="${item.id}" name="${item.label}" room="${this.room}" .onLongClick=${this.onLongClickItem?.bind(this, item)} ${spreadProps(item.getState())} ${spreadProps(item.getPrefs())}/>`;
            case "switch":
                return html`<tile-switch ?editing=${this.editing} id="${item.id}" name="${item.label}" room="${this.room}" .onLongClick=${this.onLongClickItem?.bind(this, item)} ${spreadProps(item.getState())} ${spreadProps(item.getPrefs())}/>`;
            default:
                return html`<tile-editable ?editing=${this.editing} id="${item.id}" name="${item.label}" room="${this.room}" .onLongClick=${this.onLongClickItem?.bind(this, item)} ${spreadProps(item.getState())} ${spreadProps(item.getPrefs())}/>`;
        }
    }

    get devices(): iItemModel[] {
        if(this.room) {
            return getRoom(this.gridId)?.devices || [];
        }
        return getGroup(this.gridId)?.devices || [];
    }

    render() {
        return html`<div class="canvas">
             ${repeat(this.devices, (device) => device.id, (device) => this.renderTile(device))}
        </div>`
    }

    checkProxyIntersection(proxy: TileProxy, tile: Tile) {
        
        const intersected = this.devices.find(device => {
            const deviceEl = this.shadowRoot.getElementById(device.id.toString());
            return device != tile.item && proxy.intersection(deviceEl) > 0.4
        });

        if(intersected) {
            console.log('intersected', intersected);

            swapDevicesInRoom(this.gridId, [parseInt(tile.id), intersected.id]);
            this.requestUpdate();
            this.debounceOrderChange();
        }
    }

    private debounceOrderChange() {
        clearTimeout(this.debounceTimeout);
        if(this.onOrderChange && this.gridId) {
            this.debounceTimeout = setTimeout(() => {
                this.onOrderChange(this.gridId, this.devices.map(({id}) => id))
            }, 500);
        }
    }

    swapElements(array:any[], index1:number, index2:number) {
        array[index1] = array.splice(index2, 1, array[index1])[0];
    };
}