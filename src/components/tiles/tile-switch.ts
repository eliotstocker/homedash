import {html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import TileClickable from './tile-clickable';

@customElement('tile-switch')
export default class TileSwitch extends TileClickable {
  static styles = [
    TileClickable.styles,
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
    
    .tile.on {
        background: rgba(var(--tile-default-active-color), 0.75);
    }
    
    .tile.on:hover {
        background: rgba(var(--tile-default-active-color), 1);
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
    
    .tile.on .icon.fan {
        animation: spin-animation 3s infinite;
        animation-timing-function: linear;
    }
    
    .tile.on .icon.pump {
        animation: pump-animation 0.5s infinite;
    }

    .tile.off .icon.light {
      font-variation-settings:
            'FILL' 0,
            'wght' 400,
            'GRAD' 0,
            'opsz' 24;
    }

    .tile .state {
        position: absolute;
        bottom: 8px;
        right: 8px;
        font-size: 11px;
        opacity: 0.75;
    }
    
    @keyframes pump-animation {
        0% {
          transform: scale(0.9);
        }
        100% {
          transform: rotate(1);
        }
    }
    
    @keyframes spin-animation {
        0% {
            transform: rotate(0deg);
        }
    
        100% {
            transform: rotate(360deg);
        }
    }`];

  @property()
  icon: string = 'switch';

  clicked() {
    this.state = this.state == 'on' ? 'off' : 'on';
  }

  renderInner() {
    return html`
      <div class="button">
        <span class="icon ${this.icon}">${this.getIcon()}</span>
      </div>
      <div class="name">${this.getDisplayName()}</div>
      <div class="state">${this.state}</div>`;
  }

  getIcon() {
    switch(this.icon) {
      case "light":
        return 'lightbulb';
      case "fan":
        return 'mode_fan';
      case "pump":
        return 'water_pump';
    }

    return this.state == 'on' ? 'toggle_on' : 'toggle_off'
  }
}