import {html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import TileEditable from './tile-editable';
import { mediaData } from '../../models/state';

@customElement('tile-media')
export default class TileMedia extends TileEditable {
  static styles = [
    TileEditable.styles,
    css`.tile {
        position: relative;
        background: transparent;
        color: var(--tile-text-color);
    }

    .tile .defaultBackground {
      position:absolute;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      background: linear-gradient(270deg, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.05) 100%);
    }
    
    .tile .background {
        position:absolute;
        width:200%;
        height:200%;
        z-index: -1; /* should be calculated from image */
        opacity: 0.75;
        left: -50%;
        right: -50%;
        top: -50%;
        bottom: -50%;
        filter: blur(50px) brightness(0.5) contrast(2);
    }
    
    .tile .art {
        z-index: -2;
        position: absolute;
        left: 0;
        right: 0;
        width: 100%;
        height: 100%;
        top: 0;
        bottom: 0;
        object-fit: cover;
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
    
    .tile .button img {
        width: 20px;
        height: 20px;
        object-fit: contain;
        filter: invert(100%) sepia(0%) saturate(0%) hue-rotate(26deg) brightness(99%) contrast(103%);
        display: inline-block;
        vertical-align: middle;
        padding: 2.5px;
    }
    
    .tile .name {
        display: inline-block;
        font-size: var(--tile-name-size);
    }
    
    .tile .info {
        padding: 8px;
        font-size: 12px;
    }

    .tile .info .title {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    
    .tile .info .subtitle {
        font-size: 11px;
        opacity: 0.8;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    
    .tile .controls {
        position: absolute;
        top: calc((var(--tile-height) / 2) - 25px);
        right: 8px;
    }

    :host([height="2"]) .tile .controls {
      position: static;
      text-align: center;
      margin-bottom: 16px;
    }

    :host([width="2"]) .tile .controls {
      top: calc((var(--tile-height) / 2) - 10px);
    }

    :host([width="2"]) .tile .info {
        margin-top: -14px;
    }
    
    .tile .controls .icon:hover {
        color: #FFFFFF;
        text-shadow: 0 0 5px #FFFFFF;
        cursor: pointer;
    }

    .seek-container {
      display: none;
      position: absolute;
      bottom: 8px;
      width: 100%;
    }

    :host([height="2"]) .seek-container, :host([width="2"]) .seek-container {
      display: block;
    }
    
    .seek-bar {
      -webkit-appearance: none;
      width: calc(100% - 16px);
      background: transparent;
      margin: 0 8px;
    }

    .seek-bar::-webkit-slider-thumb {
      -webkit-appearance: none;
    }

    .seek-bar:focus {
      outline: none; /* Removes the blue border. You should probably do some kind of focus styling for accessibility reasons though. */
    }

    .seek-bar::-ms-track {
      width: 100%;
      cursor: pointer;

      /* Hides the slider so custom styles can be added */
      background: transparent; 
      border-color: transparent;
      color: transparent;
    }

    .seek-container:hover .seek-bar::-webkit-slider-thumb {
      -webkit-appearance: none;
      height: 16px;
      width: 16px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.85);
      cursor: pointer;
      margin-top: -6px; /* You need to specify a margin in Chrome, but in Firefox and IE it is automatic */
    }

    /* All the same stuff for Firefox */
    .seek-container:hover .seek-bar:hover::-moz-range-thumb {
      height: 16px;
      width: 16px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.85);
      cursor: pointer;
    }

    .seek-bar::-webkit-slider-runnable-track {
      width: 100%;
      height: 3px;
      cursor: pointer;
      background: rgba(255, 255, 255, 0.5);
    }

    .seek-bar:focus::-webkit-slider-runnable-track {
      background: rgba(255, 255, 255, 0.7);
    }

    .seek-bar::-moz-range-track {
      width: 100%;
      height: 3px;
      cursor: pointer;
      background: rgba(255, 255, 255, 0.5);
    }

    .seek-bar::-ms-track {
      width: 100%;
      height: 3px;
      cursor: pointer;
      background: transparent;
      border-color: transparent;
      border-width: 16px 0;
      color: transparent;
    }
    .seek-bar::-ms-fill-lower {
      background: rgba(255, 255, 255, 0.5);
    }
    .seek-bar:focus::-ms-fill-lower {
      background: rgba(255, 255, 255, 0.7);
    }
    .seek-bar::-ms-fill-upper {
      background: rgba(255, 255, 255, 0.5);
    }
    .seek-bar:focus::-ms-fill-upper {
      background: rgba(255, 255, 255, 0.7);
    }`];

  @property({attribute: false})
  data: mediaData;

  renderBackground() {
    if(!this.data?.image) {
      return html`<div class="defaultBackground"></div`;
    }
    return html`<img class="background" src="${this.data.image}" referrerpolicy="no-referrer"></img>
      <img
        class="art"
        src="${this.data.image}"
        referrerpolicy="no-referrer"
      />`;
  }

  renderInner() {
    return html`
      ${this.renderBackground()}
      <div class="button">
        <img
          src="${this.getIcon(this.data?.app)}"
        />
      </div>
      <div class="name">${this.getDisplayName()}</div>
      <div class="controls playing">
        <span class="icon back-btn"> fast_rewind </span>
        <span class="icon play-pause-btn ${this.state == 'playing' ? "" : "material-symbols-outlined"}" @click=${this.toggleState}>
          ${this.state == 'playing' ? 'pause' : 'play_arrow'}
        </span>
        <span class="icon next-btn"> fast_forward </span>
      </div>
      <div class="info">
        <div class="title">${this.data?.title}</div>
        <div class="subtitle">${this.data?.artist}</div>
      </div>
      <div class="seek-container">
        <input type="range" class="seek-bar"/>
      </div>`;
  }

  toggleState() {
    if(this.state == 'playing') {
      this.state = 'paused'
    } else if(this.state == 'paused') {
      this.state = 'playing'
    }
  }

  getIcon(app: string) {
    switch(app) {
      case "YouTube":
        return "https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg"
      case "Disney+":
        return "https://upload.wikimedia.org/wikipedia/commons/3/3e/Disney%2B_logo.svg"
      case "Netflix":
        return "https://upload.wikimedia.org/wikipedia/commons/0/0c/Netflix_2015_N_logo.svg"
      case "Prime Video":
        return "https://upload.wikimedia.org/wikipedia/commons/d/de/Amazon_icon.png"
      case "BBC iPlayer":
        return "https://upload.wikimedia.org/wikipedia/commons/3/39/BBC_iPlayer_2021_%28symbol%29.svg";
      case "All 4":
        return "https://upload.wikimedia.org/wikipedia/commons/0/0e/Channel_4_logo_2015.svg";
      case "ITV Player":
        return "https://en.wikipedia.org/wiki/ITV_plc#/media/File:ITV_logo_2013.svg";
    }
    return "https://upload.wikimedia.org/wikipedia/commons/7/7b/Octicons-playback-play.svg";
  }
}