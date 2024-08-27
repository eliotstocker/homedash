import {html, css, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import { Ref, createRef, ref } from 'lit/directives/ref.js';
import iro from '@jaames/iro';

@customElement('controls-light')
export default class LightControls extends LitElement {
    static styles? = css`
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
    `;

    colorPickerRef:Ref = createRef();

    colorPicker:ColorPicker;

    @property({attribute: false})
    item: iItem;

    @property({attribute: false})
    meta: lightMeta = {color: false, ct: false, level: false};

    @property({type: String})
    mode: string;

    @property({type: Number})
    hue: number;
  
    @property({type: Number})
    saturation: number;
  
    @property({type: Number})
    ct: number;

    @property({type: Number})
    level: number;

    render() {
        return html`
        <div class="color-container">
            ${this.renderTabs()}
            ${this.renderTab()}
        </div>
        <div class="level"></div>`
    }

    renderTabs() {
        if(this.meta.color && this.meta.ct) {
            return html`<div class="tab-container">
                <a href="#RGB" class="tab ${this.mode == 'RGB' ? 'active' : ''}" @click="${this.switchMode}">Color</a>
                <a href="#CT" class="tab ${this.mode == 'CT' ? 'active' : ''}" @click="${this.switchMode}">Temperature</a>
            </div>`
        }
        return null;
    }

    renderTab() {
        if(this.meta.color && !this.meta.ct) {
            return this.renderColorTab();
        }
        if(this.meta.ct && !this.meta.color) {
            return this.renderCTTab();
        }
        if(!this.meta.ct && !this.meta.color) {
            return null;
        }
        return this.mode == 'RGB' ? this.renderColorTab() : this.renderCTTab()
    }

    renderColorTab() {
        return html`<div>
            <div id="picker" ${ref(this.colorPickerRef)}></div>
        </div>`;
    }

    renderCTTab() {
        return html`<div>Temp Picker</div>`;
    }

    switchMode(evt) {
        evt.preventDefault();
        const mode = evt.target.href.split('#')[1];

        this.mode = mode;
    }

    updated(props) {
        super.updated(props);

        if(this.colorPickerRef.value && !this.colorPicker) {
            this.colorPicker = new iro.ColorPicker(this.colorPickerRef.value, {
                width: 150,
                layoutDirection: 'horizontal',
                color: this.hsvToRgbHex(this.hue / 360, this.saturation / 100),
                layout: [
                    { 
                      component: iro.ui.Wheel,
                    }
                ]
            });

            this.colorPicker.on('color:change', color => {
                this.hue = color.hsv.h;
                this.saturation = color.hsv.s;
            });
        } else if(!this.colorPickerRef.value) {
            delete this.colorPicker;
        }

        if(this.item.el) {
            const ignoredProps = this.item.el.constructor.ignoredProperties;
            const filteredProps = [...props.keys()].filter(key => !ignoredProps.includes(key));

            if(filteredProps.length > 0) {
                filteredProps.forEach(key => {
                    this.item.el[key] = this[key];
                    this.item.el.requestUpdate();
                });
            }
        }
    }

    hsvToRgbHex(h:number = 0, s:number = 0, v:number = 1) {
        const {r, g, b} = this.HSVtoRGB(h, s, v);
        return "#" + this.componentToHex(r) + this.componentToHex(g) + this.componentToHex(b);
    }

    componentToHex(c) {
        const hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }

    HSVtoRGB(h, s, v) {
        var r, g, b, i, f, p, q, t;
        if (arguments.length === 1) {
            s = h.s, v = h.v, h = h.h;
        }
        i = Math.floor(h * 6);
        f = h * 6 - i;
        p = v * (1 - s);
        q = v * (1 - f * s);
        t = v * (1 - (1 - f) * s);
        switch (i % 6) {
            case 0: r = v, g = t, b = p; break;
            case 1: r = q, g = v, b = p; break;
            case 2: r = p, g = v, b = t; break;
            case 3: r = p, g = q, b = v; break;
            case 4: r = t, g = p, b = v; break;
            case 5: r = v, g = p, b = q; break;
        }
        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255)
        };
    }
}