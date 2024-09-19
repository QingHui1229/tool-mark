/**
 * @file 外层容器
 * @author jiangchunhui
 */
import {ToolMarkConfig, GeneralStyle, ShapeStyle, Point} from '../type/index.type';
import merge from 'lodash/merge';
import cloneDeep from 'lodash/cloneDeep';
import OnFire from 'onfire.js';
import {normalizeId} from '../utils';
import Shape from '../graphics/shape';
import Drag from '../drag';
import TextArea from '../textArea';
import {getBaseStyle, getBaseSelectStyle, ListenerType, ListenerEnum, ShapeEnum} from '../constants';

import Arrow from '../graphics/arrow';
import Circle from '../graphics/circle';
import Line from '../graphics/line';
import Polygon from '../graphics/polygon';
import Rectangle from '../graphics/rectangle';
import Text from '../graphics/text';

interface ToolMarkSize {
    width: string | number;
    height: string | number;
}

type TargetType = HTMLElement | number | string;

export default class ToolMark {
    _canvas: HTMLCanvasElement = null;
    // _ctx: CanvasRenderingContext2D = null;
    _target: TargetType = null;
    _parentDom: HTMLElement = null;
    _shapeModule: any[] = [];
    _width: number = 0;
    _height: number = 0;
    _top: number = 0;
    _left: number = 0;
    _style: GeneralStyle | {} = getBaseStyle();
    _shapeStyle: ShapeStyle = {};
    _shapeList: Shape[] = [];
    _dragList: Drag[] = [];
    _dragShape: Drag = null;
    _drawShape: Shape = null;
    _selectShape: Shape = null;
    _onfire;
    _editAble: boolean = false;
    _refreshTimer: any = 0;
    _textArea: TextArea = null;
    _textAreaFocus: boolean = false;
    _eventListener: {[key in ListenerType]?: Function} = {};
    _timer: any = 0;
    _shapeModuleMap: Map<string, module>;
    constructor(target: TargetType, config: ToolMarkConfig) {
        config = config || {};
        this._target = target;
        // 绑定父节点
        this.bindParentDom(config);
        // 初始化画布大小
        this.initCanvasSize(config);
        // 初始化画布样式
        this.initCanvasStyle(config);
        // 绑定其他参数
        this._editAble = !!config.editAble;
        // 挂载画布和文本
        this.mountCanvas();
        // 绑定监听事件
        this._canvas.addEventListener('mousedown', this.onCanvasMouseDown);
        this._canvas.addEventListener('mousemove', this.onCanvasMouseMove);
        this._canvas.addEventListener('mouseup', this.onCanvasMouseUp);
        // 设置文本基础点
        // this._ctx = this._canvas.getContext('2d');

        // 初始化监听
        this._onfire = new OnFire();
        this._onfire.on('refresh', () => {
            this.refresh();
        });
        this._onfire.on('addShape', () => {
            this._shapeList.push(this._drawShape);
            if (this._eventListener['drawEnd']) {
                this._eventListener['drawEnd'](this._drawShape);
            }
            this.clearDrawShape();
            this.refresh();
        });
        this._onfire.on('setStyle', (shape: Shape) => {
            const baseStyle = getBaseStyle();
            const classStyle = this._shapeStyle[shape.type || ''] || {};
            merge(baseStyle, this._style, classStyle, shape.getStyle());
            shape.setDrawingStyle(baseStyle);
        });
        // 监听textarea处理
        this._onfire.on('textAreaChange', data => {
            this._selectShape.dealText(data);
        });
        this._textArea = new TextArea({onfire: this._onfire});
        this._parentDom.appendChild(this._textArea.getCurrent());
        // 动态的导入所有图形类
        // this.importGraphics(config);
        // 暂时处理下 导出
        this._shapeModuleMap = new Map([
            ['arrow', Arrow],
            ['circle', Circle],
            ['line', Line],
            ['polygon', Polygon],
            ['rectangle', Rectangle],
            ['text', Text]
        ]);

        this.initDrawShapes(config);
    }

    /** 初始化部分 **/
    // 初始化画布大小
    initCanvasSize(config: ToolMarkConfig) {
        if (!this._parentDom) {
            return;
        }
        // 允许的匹配规则
        // const reg = new RegExp(/^[0-9]+(px)$/);
        // const regex = /(.+?)\px/g;

        // 获取父节点宽高
        const parentWidth = this._parentDom.clientWidth;
        const parentHeight = this._parentDom.clientHeight;

        // 合并宽高数据
        const {width, height} = config;
        this._width = this.dealSizeParam(width, parentWidth);
        this._height = this.dealSizeParam(height, parentHeight);
        this._top = config.top || 0;
        this._left = config.left || 0;
    }

    // 根据配置创建画布，并挂载画布和其他组件
    mountCanvas() {
        if (this._canvas) {
            return;
        }
        this._canvas = document.createElement('canvas');
        // 设定一些样式
        this._parentDom.style.position = 'relative';
        this._canvas.style.position = 'absolute';
        this._canvas.width = this._width;
        this._canvas.height = this._height;
        this._canvas.style.top = this._top;
        this._canvas.style.left = this._left;
        this._parentDom.appendChild(this._canvas);
    }

    // 动态导入图形文件夹下的所有文件
    // importGraphics(config) {
    //     const modules = import.meta.glob('../graphics/*');
    //     const reg = /graphics\/(.+?)\./;
    //     this._shapeModuleMap = new Map([]);
    //     const moduleList = [];
    //     const nameList = [];
    //     for (const path in modules) {
    //         const name = reg.exec(path)[1];
    //         nameList.push(name);
    //         moduleList.push(modules[path]());
    //     }
    //     Promise.all(moduleList).then(res => {
    //         res.forEach((item, index) => {
    //             this._shapeModuleMap.set(nameList[index], item.default);
    //         });
    //         // 根据初始化绘制图形
    //         this.initDrawShapes(config);
    //     });
    // }

    initDrawShapes(config: ToolMarkConfig) {
        const {shapeList = []} = config;
        this._shapeList = [];
        shapeList.map(shape => {
            const theModules = this._shapeModuleMap.get(shape.type);
            if (theModules) {
                const theShape = new theModules(shape);
                theShape.initCanvas(this._canvas, this._onfire);
                this._shapeList.push(theShape);
            }
        });

        this.refresh();
    }

    // 绑定父节点
    bindParentDom(config: ToolMarkConfig) {
        // 获取当前节点
        const target = this._target || null;
        if (!target) {
            this.throwException('请输入初始化节点绑定');
            return;
        }

        if (typeof target === 'string') {
            const parentDom = document.getElementById(normalizeId(target));
            if (parentDom) {
                this._parentDom = parentDom;
            }
        } else if (target instanceof HTMLElement) {
            this._parentDom = target;
        }
    }

    /** 画布方法 **/
    // 重设画布大小和位置
    resetCanvasSize(config: ToolMarkSize) {
        const {width, height} = config;
        this._width = this.dealSizeParam(width, this._width);
        this._height = this.dealSizeParam(height, this._height);
        this.refresh();
    }

    // 设置画布偏移量
    resetCanvasPos(config: {top: number; left: number} = {}) {
        if (config.top !== undefined) {
            this._top = config.top;
            this._canvas.style.top = parseFloat(config.top) + 'px';
        }
        if (config.left !== undefined) {
            this._left = config.left;
            this._canvas.style.left = parseFloat(config.left) + 'px';
        }
    }

    // 清空画布
    clear() {
        this._shapeList = [];
        this._drawShape = null;
        this.refresh();
    }

    // 为了避免不确定因素引起的刷新，方法内应尽量减少逻辑封装
    refresh() {
        this._canvas.width = this._width;
        this._canvas.height = this._height;
        this._shapeList.forEach(shape => shape._drawShape());
        // 如果有绘制图形
        this._drawShape && this._drawShape._drawMoveShape();

        // if (this._eventListener['refresh']) {
        //     this._eventListener['refresh']({
        //         shapeList: this._shapeList,
        //         drawShape: this._drawShape,
        //         selectShape: this._selectShape
        //     });
        // }
    }

    // 清除选中
    clearSelect() {
        this._selectShape.isSelect = false;
        this._selectShape = null;
        this._dragList = null;
    }

    /**
     * 添加监听
     * @param type 监听的事件类型
     * @param callback 事件的回调
     * @returns
     */
    addListener(type: ListenerType, callback: Function) {
        if (!(type in ListenerEnum)) {
            this.throwException('未支持的事件回调类型');
            return;
        }
        if (typeof callback !== 'function') {
            this.throwException('请绑定正确的回调函数');
            return;
        }
        if (typeof this._eventListener[type] === 'function') {
            return;
        }
        this._eventListener[type] = callback;
    }

    // 取消监听
    removeListener(type: ListenerEnum) {
        if (this._eventListener[type]) {
            this._eventListener[type] = null;
        }
    }

    // 销毁方法
    destory() {}

    // 设置当前的编辑态
    setEditAble(status: boolean) {
        this._editAble = status;
        if (!this._editAble) {
            this.clearDrawShape();
            this.refresh();
        }
    }

    // 获取当前配置数据
    getConfig() {
        return {
            width: this._width,
            height: this._height,
            style: this.getStyle(),
            shapeStyle: this.getShapesStyle(),
            data: this._shapeList.map(shape => shape.getConfig())
        };
    }

    /*样式部分*/
    // 初始化画布样式
    initCanvasStyle(config: ToolMarkConfig) {
        const {style, shapeStyle} = config;
        // 处理画布全局样式
        merge(this._style, style);
        // 处理图形类样式
        merge(this._shapeStyle, shapeStyle);
    }

    /** 画布事件 **/
    // 点击事件
    onCanvasMouseDown = (e: MouseEvent) => {
        const point = this.getPointInCanvas(e);

        // 是否有绘制图形
        if (this._drawShape) {
            this._drawShape.onCanvasMouseDown(point);
            return;
        }

        // 在可以编辑的情况下，是否选中图形
        if (this._editAble) {
            // 是否选中拖拽点
            if (this._selectShape) {
                const res = this._selectShape.checkDrag(point);
                // 如果选中
                if (res) {
                    this._dragShape = res;
                    this.handleCanvasClick(this._dragShape);
                    return;
                } else if (this._selectShape.isShapeSelect(point)) {
                    this._selectShape.onSelectClick(point);
                    this.handleCanvasClick(this._selectShape);
                    return;
                }
            }

            // 模拟层级
            for (let i = 0; i < this._shapeList.length; i++) {
                const shape = this._shapeList[i];
                if (shape.isShapeSelect(point)) {
                    // 清除上一个图形选中
                    if (this._selectShape) {
                        this._selectShape.isSelect = false;
                    }
                    // 选中当前图形
                    this._selectShape = shape;
                    this._selectShape.isSelect = true;
                    this.handleCanvasClick(shape);
                    this.refresh();
                    return;
                }
            }
        }
        // 释放状态
        if (this._selectShape) {
            this._selectShape.isSelect = false;
            this._selectShape = null;
            this.handleCanvasClick(null);
            this.refresh();
            return;
        }
        this.handleCanvasClick(null);
    };

    // 执行绑定点击方法
    handleCanvasClick(graphics: Shape | Drag | null) {
        if (!this._eventListener['click']) {
            return;
        }
        if (typeof this._eventListener['click'] !== 'function') {
            return;
        }
        this._eventListener['click'](graphics);
    }

    // 鼠标移动
    onCanvasMouseMove = (e: MouseEvent) => {
        const point = this.getPointInCanvas(e);

        if (this._dragShape) {
            this._selectShape._dragShape(point);
            this.refresh();
        }
        if (this._drawShape) {
            this._drawShape.onCanvasMouseMove(e);
        }
    };

    // 鼠标抬起
    onCanvasMouseUp = (e: MouseEvent) => {
        // 清除拖拽控制
        if (this._dragShape) {
            this._dragShape = null;
        }
        // 文本编辑时，输入框选中
        if (this._selectShape && this._selectShape.type === ShapeEnum.text) {
            this._textArea.focus();
        }
    };

    /** 图形处理 **/
    // 添加图形
    addShape(shape: Shape) {
        if (this._drawShape) {
            this.throwException('当前有绘制图形，无法添加图形');
            return;
        }
        shape.initCanvas(this._canvas, this._onfire);
        this._shapeList.push(shape);
        shape._drawShape();
        if (this._eventListener['shapeAdded']) {
            this._eventListener['shapeAdded'](shape);
        }
    }

    // 加载多个图形到画布
    addShapes(shapes: Shape[]) {
        shapes.forEach(shape => {
            shape.initCanvas(this._canvas, this._onfire);
        });
        this._shapeList.push(...shapes);
        this.refresh();
        if (this._eventListener['shapeAdded']) {
            this._eventListener['shapeAdded'](shapes);
        }
    }

    // 删除图形
    deleteShape(target: string | Shape) {
        let deleteId = '';
        if (typeof target === 'string') {
            deleteId = target;
        } else if (target instanceof Shape) {
            deleteId = target.id;
        }
        if (this._eventListener['beforeShapeDelete']) {
            const result = this._eventListener['beforeShapeDelete']();
            if (!result) {
                return;
            }
        }
        const index = this._shapeList.findIndex(shape => shape.id === deleteId);
        const deleteShape = this._shapeList[index];
        if (index !== -1) {
            this._shapeList.splice(index, 1);
            // 如果是选中图形，进行处理
            if (this._selectShape && this._selectShape.id === deleteId) {
                this.clearSelect();
            }
        }
        this.refresh();
        if (this._eventListener['shapeDeleted']) {
            this._eventListener['shapeDeleted'](deleteShape);
        }
    }

    // 根据id获取图形
    getShapeById(id: string) {
        return this._shapeList.find(shape => shape.id === id);
    }

    // 获取所有图形
    getShapes() {
        return this._shapeList;
    }

    // 设置绘制图形
    setDrawShape(shape: Shape) {
        if (this._drawShape) {
            this.throwException('当前已有绘制中的图形..');
            return;
        }
        shape.clearPoint();
        shape.initCanvas(this._canvas, this._onfire);
        // 文本类的创建后默认选中
        if (shape.type === ShapeEnum.text) {
            if (this._selectShape) {
                this._selectShape.isSelect = false;
            }
            this._selectShape = shape;
            this._selectShape.isSelect = true;
        }
        this._drawShape = shape;
    }

    // 清除绘制图形
    clearDrawShape() {
        this._drawShape = null;
    }

    // 图形选中
    selectShape() {}

    // 重置画布图形
    resetCanvasConfig(config: ToolMarkConfig) {
        this.initDrawShapes(config);
    }

    /** 属性的设置 **/
    // 修改画布全局样式
    setStyle(style: GeneralStyle) {
        merge(this._style, style);
        this.refresh();
    }

    // 修改图形类样式
    setShapesStyle(style: ShapeStyle) {
        merge(this._shapeStyle, style);
        this.refresh();
    }

    /** 属性的获取 **/
    // 获取画布全局样式
    getStyle() {
        return cloneDeep(this._style);
    }

    // 获取图形了类样式
    getShapesStyle(type: string) {
        if (!type) {
            return merge(
                {
                    line: getBaseStyle(),
                    arrow: getBaseStyle(),
                    rectangle: getBaseStyle(),
                    text: getBaseStyle(),
                    circle: getBaseStyle(),
                    polygon: getBaseStyle()
                },
                this._shapeStyle
            );
        }
        const style = this._shapeStyle[type] || getBaseStyle();
        return cloneDeep(style);
    }

    /** 通用工具函数 **/
    // 处理宽高数据
    dealSizeParam(dealParam: string | number, defaultParam: number) {
        let currentVal = 0;
        // 允许的匹配规则
        const reg = new RegExp(/^[0-9]+(px)$/);
        const regex = /(.+?)\px/g;

        if (dealParam) {
            const type = typeof dealParam;
            switch (type) {
                case 'string':
                    if (reg.test(dealParam as string)) {
                        currentVal = parseFloat(regex.exec(dealParam as string)[1]);
                    } else {
                        currentVal = defaultParam;
                    }
                    break;
                case 'number':
                    currentVal = ~~dealParam;
                    break;
                default:
                    currentVal = defaultParam;
                    break;
            }
        } else {
            currentVal = defaultParam;
        }
        return currentVal;
    }

    // 异常抛出
    throwException(msg: string) {
        console.error(msg);
    }

    // 获取点位的实际位置
    getPointInCanvas(e) {
        const canvasRect = this._canvas.getBoundingClientRect();
        const ctx = this._canvas.getContext('2d');
        const x = (e.offsetX / canvasRect.width) * ctx.canvas.width;
        const y = (e.offsetY / canvasRect.height) * ctx.canvas.height;
        return {x, y};
    }
}
