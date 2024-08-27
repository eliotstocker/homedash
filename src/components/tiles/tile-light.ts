import {html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import TileDraggable from './tile-draggable';
import { lightMeta } from '../../models/meta';

@customElement('tile-light')
export default class TileLight extends TileDraggable {
  static ignoredProperties: string[] = [...super.ignoredProperties];
  static styles = [
    TileDraggable.styles,
    css`.tile {
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
    }`];
    
  @property({attribute: false})
  meta: lightMeta = {color: false, ct: false, level: false};

  @property({type: Number})
  level: number;

  @property({type: Number})
  _localLevel: number;

  @property()
  mode: string;

  @property({type: Number})
  hue: number;

  @property({type: Number})
  saturation: number;

  @property({type: Number})
  ct: number;

  dragStartLevel: number;

  renderProgress() {
    if(this.state == 'on') {
      return html`<div class="progress" style="right: ${100 - this._localLevel}%; background: ${this.getBackgroundColor()}"></div>`
    }

    return null;
  }

  renderInner() {
    return html`
      <div class="button">
        <span class="icon ${this.state != 'on' ? 'clear' : ''}">lightbulb</span>
      </div>
      ${this.renderProgress()}
      <div class="name">${this.getDisplayName()}</div>
      <div class="level">${this.state == 'on' ? this._localLevel + '%' : 'off'}</div>`;
  }

  dragStart() {
    if(this.state !== 'on') {
      return;
    }
    this.dragStartLevel = this.level;
  }

  dragging(change: number) {
    if(this.state !== 'on') {
      return;
    }
    this._localLevel = this.clamp(Math.round(this.dragStartLevel + (change * 100)), 0, 100);
  }

  dragEnd(change: number) {
    if(this.state !== 'on') {
      return;
    }
    const newLevel = this.clamp(Math.round(this.dragStartLevel + (change * 100)), 0, 100);
    this.level = newLevel;
  }

  updated(changedProperties: Map<string, any>) {
    super.updated(changedProperties);
    if(changedProperties.has('level')) {
      this._localLevel = this.level;
    }
  }

  clicked() {
    this.state = this.state == 'on' ? 'off' : 'on';
  }

  getBackgroundColor() {
    if(this.meta.color && this.mode == "RGB") {
      return `hsl(${this.hue}, ${this.saturation}%, ${this.level / 2}%)`;
    } else if(this.meta.ct) {
      const {r,g,b} = TileLight.colorTemperatureToRGB(this.ct)
      return `rgb(${r}, ${g}, ${b})`
    } else {
      return '#ffb500';
    }
  }

  static colorTemperatureToRGB(kelvin:number){
    let temp = kelvin / 100;
    let red, green, blue;

    if( temp <= 66 ){ 
        red = 255; 
        green = temp;
        green = 99.4708025861 * Math.log(green) - 161.1195681661;
        if( temp <= 19) {
            blue = 0;
        } else {
            blue = temp-10;
            blue = 138.5177312231 * Math.log(blue) - 305.0447927307;
        }

    } else {
        red = temp - 60;
        red = 329.698727446 * Math.pow(red, -0.1332047592);
        green = temp - 60;
        green = 288.1221695283 * Math.pow(green, -0.0755148492 );
        blue = 255;
    }

    return {
        r : this.clamp(red,   0, 255),
        g : this.clamp(green, 0, 255),
        b : this.clamp(blue,  0, 255)
    }
  }

  static clamp(x:number, min:number, max:number) {
    if(x<min){ return min; }
    if(x>max){ return max; }

    return x;
  }
}