/**
 * @file 拖拽类
 * @author jiangchunhui
 */
import {Point} from '../type/index.type';

interface DragConfig {
    canvas: HTMLCanvasElement;
    data: Point;
    index: number;
}

const baseStyle = {
    fillStyle: '#f33e3e',
    strokeStyle: '#f33e3e',
    lineWidth: 1
};

export default class Drag {
    _canvas: HTMLCanvasElement;
    _ctx: CanvasRenderingContext2D;
    _data: Point;
    _index: number;
    _type: string;
    constructor(config: DragConfig) {
        this._canvas = config.canvas;
        this._ctx = config.canvas.getContext('2d');
        this._data = config.data;
        this._index = config.index;
        this._type = 'drag';
    }

    draw() {
        this._ctx.lineWidth = baseStyle.lineWidth;
        this._ctx.strokeStyle = baseStyle.strokeStyle;
        this._ctx.fillStyle = baseStyle.fillStyle;
        const drag = new Path2D();
        drag.arc(this._data.x, this._data.y, 4, 0, 2 * Math.PI);
        this._ctx.strokeStyle = 'red';
        this._ctx.stroke(drag);
        this._ctx.fillStyle = 'white';
        this._ctx.fill(drag);
    }

    isSelect(point: Point): boolean {
        const {x, y} = point;
        if (Math.abs(x - this._data.x) <= 3 && Math.abs(y - this._data.y) <= 3) {
            return true;
        }
        return false;
    }

    // 获取点位的实际位置
    getPointInCanvas(e: MouseEvent) {
        const canvasRect = this._canvas.getBoundingClientRect();
        const x = (e.offsetX / canvasRect.width) * this._ctx.canvas.width;
        const y = (e.offsetY / canvasRect.height) * this._ctx.canvas.height;
        return {x, y};
    }

    public set data(point: Point) {
        this._data = point;
    }

    public get index(): number {
        return this._index;
    }

    public get type(): string {
        return this._type;
    }
}
