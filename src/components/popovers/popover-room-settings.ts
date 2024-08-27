import {html, css, TemplateResult, PropertyValueMap} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import Popover from './popover-base';
import Home from '../../models/home';
import RoomModel from '../../models/room';
import { RoomPrefs } from '../../models/prefs';

@customElement('popover-room-settings')
export default class PopoverRoomSettings extends Popover {
    static styles = [
        Popover.styles,
        css``
    ];

    @property({attribute: false})
    home: Home;

    @property({attribute: false})
    room: RoomModel;

    @property({attribute: false})
    onPrefChange: (roomId: number, pref: string, value: any) => void

    @property({attribute: false})
    setBackground: (prefs: RoomPrefs) => void;

    renderContent(): TemplateResult {
        return html`<h3>Background Color</h3>
        Gradient Color 1: <input type="color" id="bgColor1" .value=${this.room.prefs?.bgColor?.[0] ?? '#1a50e2'} @change=${this.color1Change}/><br>
        Gradient Color 2: <input type="color" id="bgColor2" .value=${this.room.prefs?.bgColor?.[1] ?? '#1096b1'} @change=${this.color2Change}/><br>
        Gradient Angle: <input type="range" min="0" max="359" .value=${this.room.prefs?.bgAngle ?? 328} @change=${this.angleChange}>`;
    }

    color1Change(e: InputEvent) {
        if(!this.room.prefs.bgColor) {
            this.room.prefs.bgColor = [];
        }
        this.room.prefs.bgColor[0] = e.target.value;
        this.setBackground(this.room.prefs);
        this.onPrefChange(this.room.id, 'bgColor', this.room.prefs.bgColor);
    }

    color2Change(e: InputEvent) {
        if(!this.room.prefs.bgColor) {
            this.room.prefs.bgColor = [];
        }
        this.room.prefs.bgColor[1] = e.target.value;
        this.setBackground(this.room.prefs);
        this.onPrefChange(this.room.id, 'bgColor', this.room.prefs.bgColor);
    }

    angleChange(e: InputEvent) {
        this.room.prefs.bgAngle = e.target.value;
        this.setBackground(this.room.prefs);
        this.onPrefChange(this.room.id, 'bgAngle', this.room.prefs.bgAngle);
    }

    changeBg() {
        document.body.style = `--bg-grad-1: ${this.room.prefs?.bgColor?.[0] ?? '#1a50e2'}; --bg-grad-2: ${this.room.prefs?.bgColor?.[1] ?? '#1096b1'}; --bg-grad-angle: ${this.room.prefs.bgAngle ?? 328}deg; --tile-default-active-color: ${this.rgb()}`;
    }

    rgb() {
        var color = this.room.prefs?.bgColor?.[0] ?? '#1a50e2';

        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
        return result ? `${parseInt(result[1], 16) + 25}, ${parseInt(result[2], 16) + 25}, ${parseInt(result[3], 16) + 25}` : '';
    }
}