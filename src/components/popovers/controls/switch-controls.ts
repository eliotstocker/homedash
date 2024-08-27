import {html, css, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';

@customElement('controls-switch')
export default class SwitchControls extends LitElement {
    static styles? = css`.level {
        display: block;
        width: 100%;
        height: 20px;
        border-radius: 3px;
        background: rgba(0,0,0,0.2);
    }
    `;

    @property({attribute: false})
    item: iItem;

    @property()
    icon?: string;

    render() {
        return html`
        <select @change=${e => {this.icon = e.target.value;}}>
            <option ?selected=${!this.icon || this.icon == 'switch'} value="switch">Switch</option>
            <option ?selected=${this.icon == 'light'} value="light">Light</option>
            <option ?selected=${this.icon == 'pump'} value="pump">Pump</option>
            <option ?selected=${this.icon == 'fan'} value="fan">Fan</option>
        </select>`
    }

    updated(oldProps, newProps) {
        if(this.item.setPrefs) {
            this.item.setPrefs({icon: this.icon});
            if(this.item.el) {
                this.item.el.icon = this.icon;
                this.item.el.requestUpdate();
            }
        }
    }
}