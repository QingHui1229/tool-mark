import {createRequire} from 'module';
/**
 * @file 基础类
 * @author jiangchunhui
 */
import merge from 'lodash/merge';
import {ShapeConfig, GraphicConfig, Point, GeneralStyle} from '../type/index.type';
import {randomString} from '../utils';
import {ShapeEnum, getBaseStyle} from '../constants';
import Drag from '../drag';

abstract class Shape implements GraphicConfig {
    _id: string = '';
    _type: string;
    data: Point[] = [];
    canvas: HTMLCanvasElement = null;
    ctx: CanvasRenderingContext2D = null;
    _onfire;
    moveX: number;
    moveY: number;
    _style: GeneralStyle = {};
    _isSelect: boolean = false;
    _dragList: Drag[] = [];
    _dragIndex: number = 0;
    constructor(config: ShapeConfig) {
        config = config || {};
        this._id = config.id || randomString();
        this._type = ShapeEnum.shape;
        this.data = config.data || [];

        merge(this._style, config.style);
    }

    initCanvas(canvas: HTMLCanvasElement, onfire) {
        this.canvas = canvas;
        this._onfire = onfire;
        this.ctx = canvas.getContext('2d');
    }

    /**
     * 清空点位数据
     */
    clearPoint() {
        this.data = [];
    }

    // 获取点位的实际位置
    getPointInCanvas(e) {
        const canvasRect = this.canvas.getBoundingClientRect();
        const x = (e.offsetX / canvasRect.width) * this.ctx.canvas.width;
        const y = (e.offsetY / canvasRect.height) * this.ctx.canvas.height;
        return {x, y};
    }

    _drawShape() {
        // 设置实际的样式
        this._onfire.fire('setStyle', this);
        // 重绘拖拽点
        this._isSelect && this.addDragList();
        this.drawShape();
        if (this._isSelect) {
            this.drawDrag();
        }
    }

    _drawMoveShape() {
        // 设置实际样式
        this._onfire.fire('setStyle', this);
        this.drawMoveShape();
    }

    abstract drawShape(data?: Point[]): void;

    abstract drawMoveShape(): void;

    // 拖动图形
    _dragShape(point: Point) {
        this.dragShape(point);
        this._onfire.fire('refresh');
    }

    dragShape(point: Point) {
        this.data[this._dragIndex] = point;
    }

    // 是否拖动
    checkDrag(point: Point): Drag | false {
        for (let i = 0; i < this._dragList.length; i++) {
            const drag = this._dragList[i];
            if (drag.isSelect(point)) {
                this._dragIndex = i;
                return drag;
            }
        }
        return false;
    }

    // 绘制拖动点
    addDragList() {
        const list = [];
        this.data.forEach((point, index) => {
            const drag = new Drag({
                data: point,
                canvas: this.canvas,
                index
            });
            list.push(drag);
        });
        this._dragList = list;
    }

    // 绘制选中
    drawDrag() {
        this._dragList.forEach(darg => {
            darg.draw();
        });
    }

    // 删除拖动点
    clearDragList() {
        this._dragList = [];
    }

    // 当图形为选中态的时候 点击了图形本身
    onSelectClick(point: Point) {}

    abstract onCanvasMouseDown(point: Point): void;

    abstract isShapeSelect(point: Point): boolean;

    /**
     * 设置图形位置信息
     */
    abstract _setShapeLocation(data: any): any;

    /**
     * 返回图形位置信息
     */
    abstract getShapeLocation(): any;

    // 获取图形自己的配置
    abstract getOwnConfig(): any;

    setOwnConfig(config: Object): any {
        this._setOwnConfig(config);
        this._onfire.fire('refresh');
    }

    public get id(): string {
        return this._id;
    }

    public get type(): string {
        return this._type;
    }

    public get isSelect(): boolean {
        return this._isSelect;
    }

    public set isSelect(value: boolean) {
        this._isSelect = value;
        if (value) {
            this.addDragList();
        } else {
            this.clearDragList();
        }
        this.isSelectChange(value);
    }

    /**
     * 图形选中态变化都执行的函数 执行完后 画布会自动刷新
     */
    isSelectChange(value: boolean) {}

    /**
     * 设置图形点位数据
     * @param data 图形点位数据
     */
    setShapeLocation(data: any) {
        this._setShapeLocation(data);
        this._onfire.fire('refresh');
    }

    /**
     * 设置样式
     */
    setStyle(style: GeneralStyle) {
        merge(this._style, style);
        this._onfire.fire('refresh');
    }

    getStyle() {
        return {...this._style};
    }

    /**
     * 设置实际绘制样式
     */
    setDrawingStyle(style: GeneralStyle) {
        this.ctx.lineWidth = style.lineWidth;
        this.ctx.strokeStyle = style.strokeStyle;
        this.ctx.fillStyle = style.fillStyle;
        this.ctx.font = style.font;
        // merge(this._style, style);
    }

    /**
     * 画布中鼠标移动
     */
    onCanvasMouseMove = (e: MouseEvent) => {
        const {x, y} = this.getPointInCanvas(e);
        this.moveX = x;
        this.moveY = y;
        this._onfire.fire('refresh');
    };

    // 获取当前配置
    getConfig = () => {
        const config = {
            type: this._type,
            data: this.getShapeLocation(),
            style: this._style
        };
        const ownConfig = this.getOwnConfig();
        return {...config, ...ownConfig};
    };
}

export default Shape;
