/**
 * @file 箭头图形
 * @author jiangchunhui
 */
import Line from './line';
import get from 'lodash/get';
import {Point, ShapeConfig} from '../type/index.type';
import {ShapeEnum} from '../constants';
import {getArrowData} from '../utils';

interface ArrowConfig extends Omit<ShapeConfig, 'data'> {
    data: {
        headlen: number;
        theta: number;
        start: Point;
        end: Point;
    };
}

export default class Arrow extends Line {
    _headlen: number;
    _theta: number;
    constructor(config: ArrowConfig) {
        const start = get(config, 'data.start') || get(config, 'data[0]');
        const end = get(config, 'data.end') || get(config, 'data[1]');
        const superConifg = {...config, data: start && end ? [start, end] : []};
        super(superConifg);
        this._headlen = get(config, 'data.headlen', 30);
        this._theta = get(config, 'data.theta', 30);
        this._type = ShapeEnum.arrow;
    }

    drawShape() {
        super.drawShape();
        if (this.data.length !== 2) {
            return;
        }
        const start = this.data[0];
        const end = this.data[1];
        this.drawArrowHead(start, end);
    }

    drawMoveShape() {
        this.drawShape();
        const length = this.data.length;
        if (!length) {
            return;
        }
        this.ctx.beginPath();
        const endPoint = this.data[length - 1];
        this.ctx.moveTo(endPoint.x, endPoint.y);
        this.ctx.lineTo(this.moveX, this.moveY);
        this.ctx.stroke();
        this.drawArrowHead(this.data[0], {x: this.moveX, y: this.moveY});
    }

    /**
     * 绘制箭头部分
     */
    drawArrowHead(start: Point, end: Point) {
        const {topX, topY, botX, botY} = getArrowData(start, end, 10, 30);
        const triangle = new Path2D();
        triangle.moveTo(end.x, end.y);
        triangle.lineTo(end.x + topX, end.y + topY);
        triangle.lineTo(end.x + botX, end.y + botY);
        triangle.moveTo(end.x, end.y);
        this.ctx.fill(triangle);
    }

    override getShapeLocation() {
        return {
            start: {
                x: Math.round(this.data[0].x),
                y: Math.round(this.data[0].y)
            },
            end: {
                x: Math.round(this.data[1].x),
                y: Math.round(this.data[1].y)
            },
            headlen: this._headlen,
            theta: this._theta
        };
    }
}
