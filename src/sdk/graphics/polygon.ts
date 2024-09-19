/**
 * @file 自定义多边形
 * @author jiangchunhui
 */
import Line from './line';
import forEach from 'lodash/forEach';
import get from 'lodash/get';
import {ShapeEnum} from '../constants';
import {ShapeConfig, Point} from '../type/index.type';
import {checkClose, isPointNearLine} from '../utils';

interface PolygonConfig extends ShapeConfig {
    isFill: boolean;
    isComplete: boolean;
}

export default class Polygon extends Line {
    _isFill: boolean = false;
    _isComplete: boolean = false; // 标记是否绘制完成
    constructor(config: PolygonConfig) {
        super(config);
        this._isFill = config.isFill === undefined ? false : config.isFill;
        this._isComplete = get(config, 'data.length', 0) ? true : false;
        this._type = ShapeEnum.polygon;
    }

    drawShape() {
        if (this.data.length < 2) {
            return;
        }
        this.ctx.beginPath();
        // 每次移动
        forEach(this.data, (point, index) => {
            if (index === 0) {
                this.ctx.moveTo(point.x, point.y);
            } else {
                this.ctx.lineTo(point.x, point.y);
            }
        });
        if (this._isComplete) {
            this.ctx.lineTo(this.data[0].x, this.data[0].y);
        }
        this._isFill ? this.ctx.fill() : this.ctx.stroke();
    }

    onCanvasMouseDown = (point: Point) => {
        const {x, y} = point;
        if (this.checkLineClose({x, y})) {
            // 闭合区域
            this._isComplete = true;
            this._onfire.fire('addShape');
        } else {
            this.data.push({x, y});
            this._onfire.fire('refresh');
        }
    };

    // 闭合检验
    checkLineClose({x, y}) {
        return this.data[0] && checkClose(this.data[0], {x, y});
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
    }

    isShapeSelect(point: Point) {
        for (let i = 0; i < this.data.length; i++) {
            const j = (i + 1) % this.data.length;
            if (isPointNearLine(point, [this.data[i], this.data[j]])) {
                return true;
            }
        }
        return false;
    }

    getOwnConfig() {
        return {
            isFill: this._isFill
        };
    }
}
