/**
 * @file 点图形
 * @author jiangchunhui
 */
import Shape from './shape';
import {ShapeEnum} from '../constants';
import {ShapeConfig, Point} from '../type/index.type';
import {getPointsDis} from '../utils';
import get from 'lodash/get';

interface CircleData {
    center: Point;
    radius: number;
}

interface CircleConfig extends Omit<ShapeConfig, 'data'> {
    data: CircleData;
    isFill: boolean;
}

export default class Circle extends Shape {
    _startAngle: number = 0;
    _endAngle: number = 2 * Math.PI;
    _radius: number = 10;
    _isFill: boolean = true;
    constructor(config: CircleConfig) {
        const center = get(config, 'data.center');
        const radius = get(config, 'data.radius', 10);
        const propsConfig = {
            ...config,
            data: center ? [center] : []
        };
        super(propsConfig);
        this._radius = radius || 10;
        this._isFill = config.isFill === undefined ? true : config.isFill;
        this._type = ShapeEnum.circle;
    }

    drawShape() {
        if (!this.data.length) {
            return;
        }
        const shape = new Path2D();
        shape.arc(this.data[0].x, this.data[0].y, this._radius, this._startAngle, this._endAngle);
        this._isFill ? this.ctx.fill(shape) : this.ctx.stroke(shape);
    }

    drawMoveShape() {
        if (!this.data.length) {
            return;
        }
        const dis = getPointsDis(this.data[0], {x: this.moveX, y: this.moveY});
        const shape = new Path2D();
        shape.arc(this.data[0].x, this.data[0].y, dis, this._startAngle, this._endAngle);
        this._isFill ? this.ctx.fill(shape) : this.ctx.stroke(shape);
    }

    onCanvasMouseDown = (point: Point) => {
        const {x, y} = point;
        if (this.data.length === 1) {
            const dis = getPointsDis(this.data[0], {x: this.moveX, y: this.moveY});
            this._radius = dis;
            this._onfire.fire('addShape');
        }
        if (!this.data.length) {
            this.data.push({x, y});
        }
    };

    isShapeSelect(point: Point) {
        const {x, y} = point;
        if (Math.abs(x - this.data[0].x) < this._radius && Math.abs(y - this.data[0].y) < this._radius) {
            return true;
        }
        return false;
    }

    getShapeLocation() {
        return {
            center: {
                x: Math.round(this.data[0].x),
                y: Math.round(this.data[0].y)
            },
            radius: this._radius.toFixed(2)
        };
    }

    _setShapeLocation(data: CircleData) {
        const center = get(data, 'center');
        const radius = get(data, 'radius', this._radius);
        this._radius = parseFloat(radius);
        this.data = center ? [center] : [];
    }

    getOwnConfig() {
        return {};
    }

    _setOwnConfig(config: any) {
        const isFill = get(config, 'isFill');
        if (isFill !== undefined) {
            this._isFill = isFill;
        }
    }
}
