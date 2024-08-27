import {html, css, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import { Ref, createRef, ref } from 'lit/directives/ref.js';

@customElement('circular-progress')
export default class CircularProgress extends LitElement {
    static styles = css`
    .progress-ring {
  
    }
    
    .progress-ring__circle {
      transition: 0.35s stroke-dashoffset;
      transform: rotate(-90deg);
      transform-origin: 50% 50%;
    }`;
    
    @property({type:Number})
    size: number = 120;
    @property({type:Number})
    progress: number = 0;
    @property({type:Number})
    min: number = 0;
    @property({type:Number})
    max: number = 360;
    @property({type:Number})
    width: number = 4;

    circle:Ref = createRef();

    updated() {
        if(this.circle.value) {
            const radius = this.circle.value.r.baseVal.value;
            const circumference = radius * 2 * Math.PI;

            this.circle.value.style.strokeDasharray = `${circumference} ${circumference}`;
            this.circle.value.style.strokeDashoffset = `${circumference}`;

            const full = this.max - this.min;

            const offset = circumference - (this.progress / 100 * (full / 360)) * circumference;
            this.circle.value.style.strokeDashoffset = offset;

            if (this.min != 0) {
                this.circle.value.style.transform = `rotate(${this.min - 90}deg)`;
            }
        }
    }

    render() {
        return  html`<svg
            class="progress-ring"
            width="${this.size}"
            height="${this.size}">
            <circle
                class="progress-ring__circle"
                stroke="white"
                stroke-width="${this.width}"
                fill="transparent"
                r="${this.size / 2 - this.width}"
                cx="${this.size / 2}"
                cy="${this.size / 2}"
                ${ref(this.circle)}/>
        </svg>`;
    }
}