import {html, css, TemplateResult} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import Popover from './popover-base';
import Home from '../../models/home';
import { RoomPrefs } from '../../models/prefs';
import store, { getRoom, setRoomPrefs } from '../../state';
import { connect } from 'pwa-helpers';

@customElement('popover-room-settings')
export default class PopoverRoomSettings extends connect(store)(Popover) {
    static styles = [
        Popover.styles,
        css``
    ];

    @property({attribute: false})
    home: Home;

    @property({attribute: false})
    onPrefChange: (roomId: number, pref: string, value: any) => void

    @property({attribute: false})
    setBackground: (prefs: RoomPrefs) => void;

    @property()
    color1: string = '#1a50e2';

    @property()
    color2: string = '#1096b1';

    @property()
    bgAngle: number = 328;

    renderContent(): TemplateResult {
        return html`<h3>Background Color</h3>
        Gradient Color 1: <input type="color" id="bgColor1" .value=${this.color1} @change=${this.color1Change}/><br>
        Gradient Color 2: <input type="color" id="bgColor2" .value=${this.color2} @change=${this.color2Change}/><br>
        Gradient Angle: <input type="range" min="0" max="359" .value=${this.bgAngle} @change=${this.angleChange}>`;
    }

    color1Change(e: InputEvent) {
        this.color1 = e.target.value;
        // this.setBackground(this.room.prefs);
        // this.onPrefChange(this.room.id, 'bgColor', this.room.prefs.bgColor);
    }

    color2Change(e: InputEvent) {
        this.color2 = e.target.value;
        // this.setBackground(this.room.prefs);
        // this.onPrefChange(this.room.id, 'bgColor', this.room.prefs.bgColor);
    }

    angleChange(e: InputEvent) {
        this.bgAngle = parseInt(e.target.value);
        // this.setBackground(this.room.prefs);
        // this.onPrefChange(this.room.id, 'bgAngle', this.room.prefs.bgAngle);
    }

    changeBg() {
        document.body.style = `--bg-grad-1: ${this.room.prefs?.bgColor?.[0] ?? '#1a50e2'}; --bg-grad-2: ${this.room.prefs?.bgColor?.[1] ?? '#1096b1'}; --bg-grad-angle: ${this.room.prefs.bgAngle ?? 328}deg; --tile-default-active-color: ${this.rgb()}`;
    }

    updated(props) {
        super.updated(props);

        const room = getRoom(parseInt(this.id));
        if(room.prefs.bgColor?.[0] != this.color1 || room.prefs.bgColor?.[1] != this.color2 || room.prefs.bgAngle != this.bgAngle) {
            setRoomPrefs(parseInt(this.id), {bgColor: [this.color1, this.color2], bgAngle: this.bgAngle});
        }
    }

    rgb() {
        var color = this.room.prefs?.bgColor?.[0] ?? '#1a50e2';

        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
        return result ? `${parseInt(result[1], 16) + 25}, ${parseInt(result[2], 16) + 25}, ${parseInt(result[3], 16) + 25}` : '';
    }
}