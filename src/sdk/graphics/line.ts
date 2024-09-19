/**
 * @file 线图形
 * @author jiangchunhui
 */
import forEach from 'lodash/forEach';
import {ShapeEnum} from '../constants';
import {isPointNearLine} from '../utils';
import {ShapeConfig, Point} from '../type/index.type';
import Shape from './shape';
import Drag from '../drag';

class Line extends Shape {
    constructor(config: ShapeConfig) {
        super(config);
        this._type = ShapeEnum.line;
    }

    // 绘制图形方法
    drawShape() {
        if (this.data.length !== 2) {
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
        this.ctx.stroke();
    }

    // 鼠标点击绘制
    onCanvasMouseDown = (point: Point) => {
        const {x, y} = point;
        if (this.data.length < 1) {
            this.data = [{x, y}];
            this._onfire.fire('refresh');
        } else {
            this.data.push({x, y});
            this._onfire.fire('addShape');
        }
    };

    // 绘制移动图形
    drawMoveShape() {
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

    // 图形是否选中
    isShapeSelect(point: Point) {
        return isPointNearLine(point, this.data);
    }

    // 获取当前图形数据
    getShapeLocation() {
        return this.data.map(point => ({
            x: Math.round(point.x),
            y: Math.round(point.y)
        }));
    }

    // 选中回调
    // isSelectChange(value: boolean) {
    //     if (value) {

    //     }
    // }

    getOwnConfig() {
        return {};
    }
}

export default Line;
