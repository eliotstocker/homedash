import {html, css, TemplateResult} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import Popover from './popover-base';
import Home from '../../models/home';
import { Meta } from '../../models/meta';

@customElement('popover-device')
export default class PopoverDevice extends Popover {
    static styles = [
        Popover.styles,
        css`

        .controls {
            height: 100%;
        }`
    ];

    @property({attribute: false})
    home: Home;

    @property()
    type: string;

    @property({attribute: false})
    meta: Meta;

    renderContent(): TemplateResult {
        return html`<p>We should probably add some device control stuff here?</p>`;
    }
}