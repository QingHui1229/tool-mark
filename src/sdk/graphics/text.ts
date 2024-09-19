/**
 * @file 文本图形
 * @author jiangchunhui
 */
import Shape from './shape';
import Rectangle from './rectangle';
import get from 'lodash/get';
import {ShapeEnum} from '../constants';
import TextArea from '../textArea';
import {ShapeConfig, Point} from '../type/index.type';

interface TextConfig extends ShapeConfig {
    text: string;
}

type TextAction = 'add' | 'delete';

export default class Text extends Shape {
    // _text: string = '';
    _isComplete: boolean;
    _defaultHeight: number;
    _rect: Rectangle;
    _textarea: TextArea;
    _textList: string[][];
    _letterSpacing: number; // 字左右间距
    _lineHeight: number; // 字上下间距
    _x: number; // 当前操作行第几个字符 0开始
    _y: number; // 当前操作行数 0开始
    _maxWidth: number; // 记录当前最长的
    _contentPadding: number; // 内容padding
    constructor(config: TextConfig) {
        super(config);
        this._defaultHeight = 16; // 字体高度 和字体大小有关
        // this._text = config.text || '';
        this._type = ShapeEnum.text;
        this._isComplete = false;
        this._letterSpacing = 2;
        this._lineHeight = 0;
        this._x = -1;
        this._y = 0;
        this._maxWidth = 16;
        this._contentPadding = 4;
        this._textList = this.initText(config.text);
    }

    initCanvas(canvas: HTMLCanvasElement, onfire) {
        this.canvas = canvas;
        this._onfire = onfire;
        this.ctx = canvas.getContext('2d');
    }

    drawShape() {
        if (!this.data.length) {
            return;
        }
        const {x, y} = this.data[0];
        let j = 0; // 记录纵向宽度变化
        let strWidth = 0;
        this.ctx.textAlign = 'start';
        this.ctx.textBaseline = 'top';
        const textWidth = this._defaultHeight + this._lineHeight;
        if (!this._textList.length) {
            this.ctx.fillText('|', x, y);
            if (this.isSelect) {
                this.ctx.strokeRect(
                    this.data[0].x - this._contentPadding,
                    this.data[0].y - this._contentPadding,
                    this._maxWidth + 2 * this._contentPadding,
                    this._defaultHeight + 2 * this._contentPadding
                );
            }
            return;
        }
        let xPos: number = 0;
        // 循环渲染每个文字
        this._textList.forEach((item, itemIndex) => {
            strWidth = 0;
            item.forEach((text, textIndex) => {
                // 计算字符宽度
                this.ctx.fillText(text, x + strWidth, y + j * textWidth);
                const wordWidth = parseFloat(this.ctx.measureText(text).width.toFixed(1));
                strWidth += wordWidth + this._letterSpacing;
                if (textIndex <= this._x && itemIndex === this._y) {
                    xPos += wordWidth;
                    if (textIndex !== this._x) {
                        xPos += this._letterSpacing;
                    }
                }
            });
            this._maxWidth = Math.max(this._maxWidth, strWidth);
            j++;
        });
        // 选中时 绘制边框和输入光标
        if (this.isSelect) {
            this.ctx.fillText('|', x + xPos, y + this._y * textWidth);
            this.ctx.strokeRect(
                this.data[0].x - this._contentPadding,
                this.data[0].y - this._contentPadding,
                this._maxWidth + 2 * this._contentPadding,
                textWidth * this._textList.length + 2 * this._contentPadding
            );
        }
    }

    drawMoveShape() {}

    /**
     * 处理内部的文本变化
     */
    dealText({value, type}) {
        switch (type) {
            // 添加字符
            case 'add':
                if (!value) {
                    break;
                }
                // 中文输入会多个字符
                if (this._textList[this._y]) {
                    this._textList[this._y].splice(this._x + 1, 0, ...value.split(''));
                    this._x += value.length;
                } else {
                    this._textList[this._y] = [...value.split('')];
                    this._x += value.length;
                }
                break;
            case 'lineFeed':
                // 获取该行光标后的数据
                const text = this._textList[this._y].splice(this._x + 1);
                this._textList.splice(this._y + 1, 0, [...text]);
                this._y++;
                this._x = -1;
                break;
            case 'delete':
                this._maxWidth = 0;
                if (this._x === -1 && this._y === 0) {
                    break;
                }
                if (this._x > -1) {
                    this._textList[this._y].splice(this._x, 1);
                    this._x--;
                    break;
                }
                if (this._x === -1) {
                    this._x = this._textList[this._y - 1].length - 1;
                    this._textList[this._y - 1].push(...this._textList[this._y]);
                    this._textList.splice(this._y, 1);
                    this._y--;
                    break;
                }
            case 'leftBtn':
                if (!this._y && this._x === -1) {
                    break;
                }
                if (this._y > -1) {
                    if (this._x === -1) {
                        this._y--;
                        this._x = this._textList[this._y].length - 1;
                        break;
                    }
                    this._x--;
                    break;
                }
            case 'rightBtn':
                if (this._y === this._textList.length - 1 && this._x === this._textList[this._y].length - 1) {
                    break;
                }
                if (this._y <= this._textList.length - 1) {
                    if (this._x === this._textList[this._y].length - 1) {
                        this._y++;
                        this._x = -1;
                        break;
                    }
                    this._x++;
                    break;
                }
                break;
            case 'upBtn':
                if (this._y) {
                    if (this._textList[this._y - 1].length <= this._x) {
                        this._x = this._textList[this._y - 1].length - 1;
                    }
                    this._y--;
                }
                break;
            case 'downBtn':
                if (this._y < this._textList.length) {
                    if (this._textList[this._y + 1].length <= this._x) {
                        this._x = this._textList[this._y + 1].length - 1;
                    }
                    this._y++;
                }
                break;
            default:
                break;
        }
        this._onfire.fire('refresh');
    }
    onCanvasMouseDown = (point: Point) => {
        const {x, y} = point;
        this.data.push({x, y});
        this._onfire.fire('addShape');
    };

    isShapeSelect(point: Point) {
        const {x, y} = point;
        const textWidth = this._defaultHeight + this._lineHeight;
        const length = this._textList.length || 1;
        if (
            x > this.data[0].x &&
            x < this.data[0].x + this._maxWidth &&
            y > this.data[0].y &&
            y < this.data[0].y + length * textWidth
        ) {
            return true;
        }
        return false;
    }

    isSelectChange(value: boolean) {}

    // 选中点击后计算光标位置
    onSelectClick(point: Point) {
        // 计算偏移量
        const offsetX = point.x - this.data[0].x;
        const offsetY = point.y - this.data[0].y;
        // 计算列数
        const y = Math.ceil(offsetY / this._defaultHeight) - 1;
        if (y > this._textList.length) {
            return;
        }
        // 计算行位置
        const row = this._textList[y] || [];
        let x = null;
        let textWidth = 0;
        for (let i = 0; i < row.length; i++) {
            const word = row[i];
            const width = parseFloat(this.ctx.measureText(word).width.toFixed(1));
            textWidth += width + this._letterSpacing;
            if (offsetX < Math.round(textWidth)) {
                x = i;
                break;
            }
        }
        x = x === null ? row.length : x;
        if (x !== this._x || y !== this._y) {
            this._x = x;
            this._y = y;
            this._onfire.fire('refresh');
        }
    }

    getShapeLocation() {
        return {};
    }

    // 初始化text文本
    initText(text: string | undefined): string[][] {
        if (!text) {
            return [];
        }
        const list = [];
        const textList = text.split('\n');
        this._x = textList.length;
        textList.forEach((item, index) => {
            const itemList = item.split('');
            list.push(itemList);
            if (index === this._x) {
                this._y = itemList.length;
            }
        });

        return list;
    }

    // 获取数据文本
    public get text(): string {
        const list = this._textList.map(list => list.join(''));
        return list.join('\n');
    }

    _setShapeLocation() {}

    drawDrag() {}

    getOwnConfig() {
        return {
            text: this.text
        };
    }

    _setOwnConfig(config: Object) {
        const text = get(config, 'text');
        if (text !== undefined) {
            this._textList = this.initText(text);
        }
    }
}
