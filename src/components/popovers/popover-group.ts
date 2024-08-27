import {html, css, TemplateResult} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import Popover from './popover-base';
import Device from '../../models/device';
import Home from '../../models/home';

@customElement('popover-group')
export default class PopoverGroup extends Popover {
    static styles = [
        Popover.styles,
        css`
        :host {
            --tile-text-color: #333333;
            --tile-text-inverse: #999999;
        }

        .group-controls {
            height: 200px;
        }
        
        .grid-container {
            height: calc(100% - 230px);
            width: 100%;
            overflow: auto;
            --mask: linear-gradient(to bottom, 
                rgba(0,0,0, 1) 0,   rgba(0,0,0, 1) 75%, 
                rgba(0,0,0, 0) 99%, rgba(0,0,0, 0) 0
            ) 100% 50% / 100% 100% repeat-x;

            -webkit-mask: var(--mask); 
            mask: var(--mask);
        }

        .inner-container {
            padding-bottom: 50px;
        }`
    ];

    @property({attribute: false})
    home: Home;

    @property({attribute: false})
    devices: Device[];

    renderContent(): TemplateResult {
        return html`<div class="grid-container">
            <div class="inner-container">
                <device-grid .devices=${this.devices} .home=${this.home} .onItemChange=${this.onItemChange} />
            </div>
        </div>`;
    }
}