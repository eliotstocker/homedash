import {html, css} from 'lit';
import {customElement} from 'lit/decorators.js';
import TileClickable from './tile-clickable';

@customElement('tile-lock')
export default class TileLock extends TileClickable {
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
    
    .tile.unlocked {
        background: rgba(var(--tile-default-active-color), 0.75);
    }
    
    .tile.unlocked:hover {
        background: rgba(var(--tile-default-active-color), 1);
    }
    
    .tile .name {
        display: inline-block;
        font-size: var(--tile-name-size);
    }
    
    .tile .state {
        font-size: 10px;
        margin: -14px 0 0 45px;
        opacity: 0.75;
    }`];

  clicked() {
    this.state = this.state == 'locked' ? 'unlocked' : 'locked';
  }

  renderInner() {
    return html`
      <div class="button">
        <span class="icon">${this.getIcon()}</span>
      </div>
      <div class="name">${this.getDisplayName()}</div>
      <div class="state">${this.state}</div>`;
  }

  getIcon() {
    return this.state == 'locked' ? 'door_front' : 'door_open'
  }
}