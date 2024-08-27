import {html, css, LitElement, TemplateResult} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import { Ref, createRef, ref } from 'lit/directives/ref.js';
import Home from '../../models/home';
import { baseMeta } from '../../models/meta';
import { connect } from 'pwa-helpers';
import store, {setDeviceState, getDevice} from '../../state';
import iItemModel from '../../models/iItem';
import DeviceModel from '../../models/device';
import GroupModel from '../../models/group';

@customElement('tile-base')
export default class Tile extends connect(store)(LitElement) {
    protected static ignoredProperties: string[] = ['style', 'name', 'room', 'meta', 'home', 'updating', 'item', 'meta'];
    static styles = css`
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
    }`;

    tileRef:Ref = createRef();

    initilised: boolean = false;
    receiving: boolean = false;

    @property()
    name: string;

    @property()
    room: string;

    //all tiles can have a state property
    @property()
    state: string;

    //dispatched from parent to not of external updates ocurring
    @property({type: Boolean})
    updating: boolean;

    //allows rendering to react to size changes
    @property()
    style: CSSStyleDeclaration;

    get item() : iItemModel {
        return getDevice(parseInt(this.id));
    }

    get home() : Home {
        return store.getState().home;
    }

    get meta() : baseMeta {
        return this.item.getMeta();
    }

    render(): TemplateResult {
        return html`<div ${ref(this.tileRef)} class="tile ${this.constructor.name} ${this.state}">
          ${this.renderInner()}
        </div>`;
    }

    renderInner(): TemplateResult {
        return html`<div class="name">${this.name}</div>`;
    }

    getTileElement(): HTMLDivElement {
        return this.shadowRoot.querySelector('div');
    }

    getTileSize(): number[] {
        const element = this.getTileElement();
        return [
            parseInt(getComputedStyle(element).getPropertyValue('width')),
            parseInt(getComputedStyle(element).getPropertyValue('height'))
        ];
    }

    updated(changedProperties: Map<string, any>) {
        const changedKeys = Array.from(changedProperties.keys()).filter(key => !(<typeof Tile> this.constructor).ignoredProperties.includes(key) && !key.startsWith('_'));

        if(changedKeys.length > 0 && this.initilised && !this.receiving) {
            const observedChanges = new Map(changedKeys.map(key => ([key, this[key]])));
            setDeviceState(parseInt(this.id, 10), observedChanges);
        }

        this.initilised = true;
     }

    getDisplayName() {
        if(this.room && this.name.startsWith(this.room + ' ')) {
            if(this.name.substring(this.room.length + 1).toLowerCase().startsWith('and')) {
                return this.name;
            }

            return this.name.substring(this.room.length + 1);
        }
        return this.name;
    }

    stateChanged(state) {
        this.receiving = true;
        const device = state.devices.find(({id}) => id == this.id);
        let tileState;

        if(!device) {
            const group = state.groups.find(({id}) => id == this.id);
            tileState = GroupModel.fromObject(group, state.devices).getState();
        } else {
            tileState = DeviceModel.fromObject(device).getState();
        }
        

        Object.entries(tileState).forEach(([k, v]) => {
            //console.log(this.id, 'set: ', k, v);
            this[k] = v;
        });

        setTimeout(() => {
            this.receiving = false;
        }, 20);
    }
}