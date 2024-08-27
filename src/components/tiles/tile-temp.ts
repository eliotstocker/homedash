import {html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import { hvacMeta } from '../models/meta';
import TileEditable from './tile-editable';

@customElement('tile-temp')
export default class TileTemperature extends TileEditable {
  static styles = [
    TileEditable.styles,
    css`
    .tile img {
      background: #333333;
      width: 100%;
      height: 100%;
      position: absolute;
      z-index: -1;
      top: 0;
      left: 0;
      object-fit: contain;
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
      line-height: var(--tile-button-size);
    }
    
    .tile .name {
      max-width: 50%;
      vertical-align: middle;
    }
    
    .tile .temp {
      text-align: center;
      display: inline-block;
      width: 100%;
      font-weight: 600;
      margin-top: -8px;
    }
    
    .tile .temp .value {
        vertical-align: middle;
    }
    
    .tile circular-progress {
      display: none;
    }
    
    :host([height="2"]) .tile circular-progress {
      display: block;
    }

    :host([height="2"]) .tile .temp {
        display: block;
        margin-top: 55px;
    }

    .tile circular-progress {
      position: absolute;
      z-index: -1;
      left: 50%;
      top: 60%;
      opacity: 0.75;
      transform: translate(-50%, -50%);
    }`];

  @property({type: Number})
  temp: number;

  renderInner() {
    return html`
      <div class="button">
        <span class="icon">thermometer</span>
      </div>
      <div class="name">${this.getDisplayName()}</div>
      <div class="temp">
        <span class="value">${this.temp}º${this.home.tempScale}</span>
      </div>
      <circular-progress progress="${this.progressForTemp(this.temp)}" min="-110" max="110" size="150" width="6"/>`;
  }

  progressForTemp(temp: number) {
    const min = 5;
    const max = 35;

    if(temp > max) {
      return 100;
    }

    if(temp < min) {
      return 0;
    }

    return (temp - min) / (max - min) * 100
  }
}

import "../circular-progress";