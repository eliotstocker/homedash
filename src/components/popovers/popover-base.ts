import {html, css, LitElement, TemplateResult} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import { spread } from '../../component-utils';
import Device from '../../models/device';
import Group from '../../models/group';
import { Meta } from '../../models/meta';
import iItemModel from '../../models/iItem';

@customElement('popover-base')
export default class Popover extends LitElement {
    static styles = css`
        @import url("https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200");
        .icon {
            font-family: 'Material Symbols Outlined';
            font-weight: normal;
            font-style: normal;
            font-size: 24px;
            line-height: 1;
            letter-spacing: normal;
            text-transform: none;
            display: inline-block;
            white-space: nowrap;
            word-wrap: normal;
            direction: ltr;
            -webkit-font-feature-settings: 'liga';
            -webkit-font-smoothing: antialiased;
            font-variation-settings:
                'FILL' 1,
                'wght' 400,
                'GRAD' 0,
                'opsz' 24
        }

        .popover {
            position: fixed;
            top: 50%;
            left: 50%;
            width: 460px;
            height: 500px;
            border-radius: 3px;
            background: rgba(255, 255, 255, 0.85);
            transform: translateX(-50%) translateY(-50%);
            z-index: 10;
            box-shadow: 0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23);
            backdrop-filter: blur(8px);
            padding: 12px;
            box-sizing: border-box;
            max-width: calc(100% - 12px);
        }

        @media only screen and (max-width: 500px) {
            .popover  {
                height: calc(100% - 100px);
            }
        }

        .popover .button {
            position: absolute;
            top: 8px;
            right: 8px;
            border-radius: 50%;
            background: rgba(0,0,0,0.1);
            padding: 4px;
            cursor: pointer;
        }

        .popover .title {
            font-weight: 100;
            margin: 0;
        }`;

    @property()
    title: string;

    @property({attribute: false})
    meta: Meta;

    @property()
    type: string;

    @property({attribute: false})
    item: iItemModel;

    @property({attribute: false})
    onClose: () => void;

    @property({attribute: false})
    onItemChange: (item: Device|Group, attribute: string, value: any) => void

    render() {
        return html`<div class="popover">
                <h2 class="title">${this.title}</h2>
                <div class="button" @click=${this.onClose}>
                    <span class="icon">close</span>
                </div>
                ${this.renderControls()}
                ${this.renderContent()}
            </div>
        </div>`
    }

    renderContent(): TemplateResult {
        return html`this element must be extended`
    }

    renderControls(): TemplateResult {
        return html`<div class="group-controls">
            ${this.renderGroupControlsForType()}
        </div>`
    }

    renderGroupControlsForType() {
        switch (this.type) {
            case "light":
                return html`<controls-light id=${this.id} .meta=${this.item.getMeta()} ${spread(this.item.getState())}/>`
            case "switch":
                return html`<controls-switch id=${this.id} ${spread(this.item.getPrefs())}/>`
        }
    }
}