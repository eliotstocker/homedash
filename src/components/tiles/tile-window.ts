import {html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import TileDraggable from './tile-draggable';
import {  } from '../../models/meta';

@customElement('tile-window')
export default class TileWindow extends TileDraggable {
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

  @property({type: Number})
  position: number;

  @property({type: Number})
  _localLevel: number;

  dragStartLevel: number;

  renderProgress() {
    return html`<div class="progress" style="right: ${100 - this._localLevel}%;"></div>`
  }

  renderInner() {
    return html`
      <div class="button">
        <span class="icon ${this.state != 'on' ? 'clear' : ''}">window_closed</span>
      </div>
      ${this.renderProgress()}
      <div class="name">${this.getDisplayName()}</div>
      <div class="level">${this._localLevel}%</div>`;
  }

  dragStart() {
    this.dragStartLevel = this._localLevel;
  }

  dragging(change: number) {
    this._localLevel = this.clamp(Math.round(this.dragStartLevel + (change * 100)), 0, 100);
  }

  dragEnd(change: number) {
    const newLevel = this.clamp(Math.round(this.dragStartLevel + (change * 100)), 0, 100);
    this.position = newLevel;
  }

  updated(changedProperties: Map<string, any>) {
    super.updated(changedProperties);
    if(changedProperties.has('position')) {
      this._localLevel = this.position;
    }
  }

  static clamp(x:number, min:number, max:number) {
    if(x<min){ return min; }
    if(x>max){ return max; }

    return x;
  }
}