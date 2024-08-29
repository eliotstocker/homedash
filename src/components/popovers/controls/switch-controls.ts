import {html, css, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import { connect } from 'pwa-helpers';
import store, { setDevicePrefs } from '../../../state';

@customElement('controls-switch')
export default class SwitchControls extends connect(store)(LitElement) {
    static styles? = css`.level {
        display: block;
        width: 100%;
        height: 20px;
        border-radius: 3px;
        background: rgba(0,0,0,0.2);
    }
    `;

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

    stateChanged(state) {
        const device = state.devices.find(({id}) => id == this.id);

        this.icon = device.prefs.icon;
    }

    updated(oldProps) {
        if(oldProps.icon != this.icon) {
            setDevicePrefs(parseInt(this.id, 10), {icon: this.icon});
        }
    }
}