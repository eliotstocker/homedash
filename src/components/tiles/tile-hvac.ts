import {html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import { hvacMeta } from '../models/meta';
import TileTemperature from './tile-temp';

@customElement('tile-hvac')
export default class TileHVAC extends TileTemperature {
  static styles = [
    TileTemperature.styles,
    css`
    .tile .temp .icon {
        vertical-align: middle;
        font-size: 35px;
        margin: 0 -8px;
    }
    
    .tile .temp .icon:hover {
        color: #FFFFFF;
        text-shadow: 0 0 5px #FFFFFF;
        cursor: pointer;
    }
    
    .tile .mode {
      background: rgba(0, 0, 0, 0.1);
      padding: 2px 8px;
      display: inline-block;
      border-radius: 3px;
      border: 1px solid rgba(0, 0, 0, 0.2);
      position: absolute;
      top: 8px;
      right: 8px;
      font-size: 10px;
      text-transform: uppercase;
    }
    
    .tile .mode:hover {
        background: rgba(255, 255, 255, 0.1);
        cursor: pointer;
    }
    
    .tile .state {
      position: absolute;
      bottom: 8px;
      right: 8px;
      text-align: center;
      font-size: 11px;
      opacity: 0.75;
    }

    :host([height="2"]) .tile .temp {
        display: block;
        margin-top: 35px;
    }

    :host([height="2"]) .tile .mode {
        position: relative;
        margin-top: 10px;
        left: 50%;
        right: auto;
        top: auto;
        transform: translateX(-50%);
    }`];
    
  @property({attribute: false})
  meta: hvacMeta = {heat: false, cool: false, modes: []};

  @property()
  mode: string;

  renderInner() {
    return html`
      <div class="button">
        <span class="icon">thermostat</span>
      </div>
      <div class="name">${this.getDisplayName()}</div>
      <div class="temp">
        <span class="icon left">arrow_left</span>
        <span class="value">${this.temp}º${this.home.tempScale}</span>
        <span class="icon right">arrow_right</span>
      </div>
      <div class="state">${this.state}</div>
      <div class="mode">${this.mode}</div>
      <circular-progress progress="${this.progressForTemp(this.temp)}" min="-110" max="110" size="150" width="6"/>`;
  }
}