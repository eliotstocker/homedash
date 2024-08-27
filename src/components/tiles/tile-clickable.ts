import { property } from "lit/decorators.js";
import TileEditable from "./tile-editable";

export default class TileClickable extends TileEditable {
    static ignoredProperties: string[] = [...super.ignoredProperties, 'onLongClick'];
    boundMouseDown: any;
    boundMouseUp: any;

    constructor() {
        super();
        this.boundMouseDown = this._mouseDown.bind(this);
        this.boundMouseUp = this._mouseUp.bind(this)
        this.addEventListener('mousedown', this.boundMouseDown);
        this.addEventListener('mouseup', this.boundMouseUp);

        //for touch
        this.addEventListener('touchstart', this.boundMouseDown);
        this.addEventListener('touchend', this.boundMouseUp);
    }

    longClickTimeout: number;
    longClickComplete: boolean;

    @property({attribute: false})
    onLongClick: (number) => {};
    
    clicked() {}

    longClicked() {}

    clamp(value, min, max) {
        if(value > max) {
            return max;
        } else if(value < min) {
            return min;
        }
        return value;
    }

    _mouseDown(event: MouseEvent|TouchEvent) {
        this.preventMouseEmulation(event);
        this.longClickTimeout = setTimeout(this._onLongClick.bind(this), 250);
    }
    
    _mouseUp(event: MouseEvent|TouchEvent) {
        this.preventMouseEmulation(event);

        if(!this.longClickComplete) {
          clearTimeout(this.longClickTimeout);
          this.clicked();
        }
        this.longClickComplete = false;
    }
    
    _onLongClick() {
        this.longClickComplete = true;
        if(this.onLongClick) {
            this.onLongClick(this.id);
        }
        this.longClicked();
    }

    preventMouseEmulation(event:MouseEvent|TouchEvent) {
        if(event.type.startsWith('touch')) {
            event.preventDefault();
        }
    }
}