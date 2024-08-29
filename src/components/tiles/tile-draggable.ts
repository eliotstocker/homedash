import TileClickable from "./tile-clickable";

export default class TileDraggable extends TileClickable {
    dragStartAbsolutePosition: number[];
    dragEventHandlers: {mousemove:any, mouseup:any};
    dragStartLevel?: number;
    dragLevelChanging: boolean = false;
    
    dragStart() {
        throw new Error('dragStart must be overridden for a Draggable Component Control');
    }

    dragging(change: number) {

    }

    dragEnd(change: number) {
        throw new Error('dragEnd must be overridden for a Draggable Component Control');
    }

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
        event.preventDefault();

        if(event instanceof TouchEvent && event.changedTouches) {
          this.dragStartAbsolutePosition = [event.changedTouches[0].clientX, event.changedTouches[0].clientY]
        } else if(event instanceof MouseEvent) {
          this.dragStartAbsolutePosition = [event.clientX, event.clientY];
        }
        
        this.dragEventHandlers = {
          mousemove: this._onDrag.bind(this),
          mouseup: this._onDragEnd.bind(this)
        };
    
        window.addEventListener('mousemove', this.dragEventHandlers.mousemove);
        window.addEventListener('mouseup', this.dragEventHandlers.mouseup);

        //for touch
        window.addEventListener('touchmove', this.dragEventHandlers.mousemove);
        window.addEventListener('touchend', this.dragEventHandlers.mouseup);

        this.dragStart();

        super._mouseDown(event);
      }

      _getPercentageFromEvent(event: MouseEvent|TouchEvent): number {
        const width = this.getTileSize()[0];

        let delta;
        if(event instanceof TouchEvent && event.changedTouches) {
          delta = event.changedTouches[0].clientX - this.dragStartAbsolutePosition[0];
        } else if(event instanceof MouseEvent) {
          delta = event.clientX - this.dragStartAbsolutePosition[0];
        }
        this.dragLevelChanging = true;
    
        return delta / width;
      }
    
      _onDrag(event: MouseEvent|TouchEvent) {

        this.preventMouseEmulation(event);

        if(event instanceof TouchEvent && event.changedTouches) { //fix dragging bug on mobile
          let delta = event.changedTouches[0].clientX - this.dragStartAbsolutePosition[0];

          if((delta < 10 && delta > 0) || (delta < 0 && delta > -10)) {
            return;
          }
        }

        this.dragging(this._getPercentageFromEvent(event));
        
        this.longClickComplete = false;
        clearTimeout(this.longClickTimeout);
      }
    
      _onDragEnd(event: MouseEvent|TouchEvent) {
        this.preventMouseEmulation(event);
        window.removeEventListener('mousemove', this.dragEventHandlers.mousemove);
        window.removeEventListener('mouseup', this.dragEventHandlers.mouseup);

        //for touch
        window.removeEventListener('touchmove', this.dragEventHandlers.mousemove);
        window.removeEventListener('touchend', this.dragEventHandlers.mouseup);
        if(this.dragLevelChanging) {
          this._dragEnded(this._getPercentageFromEvent(event));
        }
        this.longClickComplete = false;
      }
    
      _mouseUp(event: MouseEvent|TouchEvent) {
        this.preventMouseEmulation(event);
        if(this.dragLevelChanging) {
          event.preventDefault();
          this.longClickComplete = false;
        } else  {
            super._mouseUp(event);
        }
      }
    
      _dragEnded(change: number) {
        this.dragLevelChanging = false;
        this.dragEnd(change);
      }
}