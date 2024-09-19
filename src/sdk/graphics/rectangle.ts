/**
 * @file 图形矩形
 * @author jiangchunhui
 */
import Shape from './shape';
import get from 'lodash/get';
import {ShapeConfig, Point} from '../type/index.type';
import {ShapeEnum} from '../constants';

interface RectangleData {
    top: number;
    left: number;
    width: number;
    height: number;
}

interface RectangleConfig extends Omit<ShapeConfig, 'data'> {
    data?: RectangleData;
}

export default class Rectangle extends Shape {
    constructor(config: RectangleConfig) {
        let pointList = [];
        if (config?.data) {
            const {top, left, width, height} = config.data;
            pointList = [
                {x: left, y: top},
                {x: left, y: top + height},
                {x: left + width, y: top + height},
                {x: left + width, y: top}
            ];
        }
        super({...config, data: pointList});
        this._type = ShapeEnum.rectangle;
    }

    drawShape() {
        if (this.data.length !== 4) {
            return;
        }
        this.drawRectangle(this.data[0], this.data[2]);
    }

    drawMoveShape() {
        if (!this.data.length) {
            return;
        }
        this.drawRectangle(this.data[0], {x: this.moveX, y: this.moveY});
    }

    /**
     * 绘制矩形
     */
    drawRectangle(start: Point, end: Point) {
        this.ctx.beginPath();
        this.ctx.moveTo(start.x, start.y);
        this.ctx.lineTo(start.x, end.y);
        this.ctx.lineTo(end.x, end.y);
        this.ctx.lineTo(end.x, start.y);
        this.ctx.lineTo(start.x, start.y);
        this.ctx.stroke();
    }

    onCanvasMouseDown = (point: Point) => {
        const {x, y} = point;
        if (this.data.length < 1) {
            this.data = [{x, y}];
            this._onfire.fire('refresh');
        } else {
            const {x: left, y: top} = this.data[0];
            this.data.push(
                ...[
                    {x, y: top},
                    {x, y},
                    {x: left, y}
                ]
            );
            this._onfire.fire('addShape');
        }
    };

    isShapeSelect(point: Point) {
        const x1 = Math.max(this.data[0].x, this.data[2].x);
        const x2 = Math.min(this.data[0].x, this.data[2].x);
        const y1 = Math.max(this.data[0].y, this.data[2].y);
        const y2 = Math.min(this.data[0].y, this.data[2].y);
        if (point.x > x2 && point.x < x1 && point.y > y2 && point.y < y1) {
            return true;
        }
        return false;
    }

    getShapeLocation() {
        return {
            top: this.data[0].y,
            left: this.data[0].x,
            width: Math.round(Math.abs(this.data[0].x - this.data[2].x)),
            height: Math.round(Math.abs(this.data[0].y - this.data[2].y))
        };
    }

    dragShape(data: Point) {
        let leftTop = null;
        let rightBottom = null;
        switch (this._dragIndex) {
            case 0:
                leftTop = data;
                rightBottom = this.data[2];
                break;
            case 1:
                leftTop = {x: this.data[0].x, y: data.y};
                rightBottom = {x: data.x, y: this.data[2].y};
                break;
            case 2:
                leftTop = this.data[0];
                rightBottom = data;
                break;
            case 3:
                leftTop = {x: data.x, y: this.data[0].y};
                rightBottom = {x: this.data[2].x, y: data.y};
                break;
            default:
                break;
        }
        if (leftTop && rightBottom) {
            this.data = [leftTop, {x: rightBottom.x, y: leftTop.y}, rightBottom, {x: leftTop.x, y: rightBottom.y}];
        }
    }

    _setShapeLocation(data: RectangleData) {
        if (data) {
            const {top, left, width, height} = data;
            const pointList = [
                {x: ~~left, y: ~~top},
                {x: ~~left, y: ~~top + ~~height},
                {x: ~~left + ~~width, y: ~~top + ~~height},
                {x: ~~left + ~~width, y: ~~top}
            ];

            this.data = pointList;
        }
    }

    getOwnConfig() {
        return {};
    }
}
