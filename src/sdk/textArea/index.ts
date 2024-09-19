/**
 * @file 文本输入类
 * @author jiangchunhui
 */

type TextAreaStatus = 'chinese' | '' | 'keydown' | 'input';

interface TextAreaProps {
    onfire: any;
}

const actionMap = new Map([
    ['Enter', 'lineFeed'],
    ['Backspace', 'delete'],
    ['ArrowLeft', 'leftBtn'],
    ['ArrowRight', 'rightBtn'],
    ['ArrowUp', 'upBtn'],
    ['ArrowDown', 'downBtn']
]);

export default class TextArea {
    _textArea: HTMLTextAreaElement;
    _status: TextAreaStatus;
    _onfire: any;
    _key: string;
    _chineseStr: string;
    _isMeta: boolean;
    constructor(props: TextAreaProps) {
        this._onfire = props.onfire;
        this._status = 'input';
        this._textArea = document.createElement('textarea');
        // 绑定样式
        this._textArea.style.width = '1px';
        this._textArea.style.opacity = '0';
        // this._textArea.style.top = '0';
        // this._textArea.style.left = '0';
        // this._textArea.style.zIndex = '999';
        // this._textArea.style.position = 'absolute';
        // 绑定事件
        this._textArea.addEventListener('keydown', e => {
            // 记录当前按键
            this._key = e.key;
            // 移动位置或删除、空格
            this.keydownAction(e);
        });
        // 中文处理
        this._textArea.addEventListener(
            'compositionstart',
            e => {
                this._status = 'chinese';
            },
            false
        );
        this._textArea.addEventListener(
            'compositionend',
            event => {
                if (this._key !== 'Enter') {
                    this._onfire.fire('textAreaChange', {type: 'add', value: this._chineseStr});
                }
                this._status = 'input';
            },
            false
        );
        this._textArea.addEventListener('input', event => {
            this.textAreaInput(event);
        });
        this._textArea.addEventListener('keyup', event => {
            this._isMeta = false;
        });
    }

    focus() {
        this._textArea.focus();
    }

    getCurrent() {
        return this._textArea;
    }

    textAreaInput(event: Event) {
        if (this._status === 'chinese') {
            this._chineseStr = event.data;
            if (this._key === 'Enter') {
                this._onfire.fire('textAreaChange', {type: 'add', value: this._chineseStr});
                this._status = 'input';
            }
            return;
        }
        if (this._status !== 'input') {
            this._status = 'input';
            return;
        }
        this._chineseStr = '';
        this._onfire.fire('textAreaChange', {type: 'add', value: event.data});
    }

    keydownAction(e: KeyboardEvent) {
        const type = actionMap.get(e.key);
        if (type) {
            if (this._status !== 'chinese') {
                this._status = '';
                this._onfire.fire('textAreaChange', {type, value: ''});
            }
            return;
        }
        if (e.key === 'Meta') {
            this._isMeta = true;
            return;
        }
        // 组合按键监听
        // ctrl + v
        if (this._isMeta && e.code === 'KeyV') {
            console.log('ctrl + v');

            return;
        }
    }
}
