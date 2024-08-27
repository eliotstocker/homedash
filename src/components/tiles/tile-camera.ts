import {html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import { Ref, createRef, ref } from 'lit/directives/ref.js';
import TileEditable from './tile-editable';

@customElement('tile-camera')
export default class TileCamera extends TileEditable {
  static styles = [
    TileEditable.styles,
    css`.tile {
        position: relative;
    }
    
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

    .tile video {
        background: #333333;
        width: 100%;
        height: 100%;
        position: absolute;
        z-index: -1;
        top: 0;
        left: 0;
        object-fit: contain;
    }

    .tile .fill {
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
    
    .tile .button .icon {
        font-size: var(--tile-icon-size);
        line-height: var(--tile-button-size)
    }
    
    .tile .name {
        display: inline-block;
        font-size: var(--tile-name-size);
        text-shadow: 0 0 3px rgba(0,0,0,0.5);
    }`];

  @property()
  fill: boolean = true;

  @property()
  useImage: boolean = false;

  @property()
  image: string;

  @property()
  stream: string;

  @property()
  b64image: string;

  imageRef:Ref = createRef();

  imagePollInterval:Timeout = 0;

  renderInner() {
    return html`<div class="button">
        <span class="icon">videocam</span>
      </div>
      <div class="name">${this.getDisplayName()}</div>
      ${this.renderCamera()}`;
  }

  renderCamera() {
    if(this.useVideo()) {
      return html`<video autoplay muted src="${this.stream}" class="${this.fill ? 'fill': ''}">`;
    }
    return html`<img ${ref(this.imageRef)} src="${this.parseUrl()}" class="${this.fill ? 'fill': ''}"/>`;
  }

  useVideo() {
    return this.stream && this.stream.startsWith('http') && !this.useImage;
  }

  parseUrl() {
    if(this.b64image) {
      return `data:image/jpeg;base64,${this.b64image}`;
    }

    if(this.image.startsWith('<')) {
      const img = /src=(.+?)\s/g.exec(this.image);
      return img[1];
    }

    return this.image;
  }

  connectedCallback() {
    super.connectedCallback()

    clearInterval(this.imagePollInterval);
    if(!this.useVideo() && !this.b64image) {
      this.imagePollInterval = setInterval(this.imageIntervalRefresh.bind(this), 10000);
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    clearInterval(this.imagePollInterval);
  }

  imageIntervalRefresh() {
    const url = new URL(this.imageRef.value.src);
    url.searchParams.set('q', new Date().getTime().toString());
    this.imageRef.value.src = url.toString();
  }
}