/**
 * @file 图片处理
 * @author jiangchunhui
 */
import {normalizeId, calculateMediaSize} from '../utils';
import {ToolMarkConfig} from '../type/index.type';
import defultImage from '../../assets/img/default-image.png';
import ToolMark from '../mark';

type TargetType = HTMLElement | number | string;

interface ImageMarkCongfig {
    src: string;
}

export default class ImageMark {
    _parentDom: any;
    _imgDom: HTMLImageElement;
    _canvasMark: ToolMark;
    _canvasConfig: ToolMarkConfig;
    _config: ImageMarkCongfig;
    _observer: ResizeObserver;
    constructor(target: TargetType, config: ImageMarkCongfig, canvasConfig: ToolMarkConfig) {
        this._config = config || {};
        this._canvasConfig = canvasConfig || {};
        this.appendParentDom(target);
        this.appendImg(config);
        this.addObserver();
    }

    // 初始化方法
    // 绑定操作节点
    appendParentDom(target: TargetType) {
        let targetDom = null;
        if (!target) {
            this.throwException('请输入初始化节点绑定');
            return;
        }
        if (typeof target === 'string') {
            targetDom = document.getElementById(normalizeId(target));
        } else if (target instanceof HTMLElement) {
            targetDom = target;
        }
        this._parentDom = document.createElement('div');
        this._parentDom.style.width = '100%';
        this._parentDom.style.height = '100%';
        targetDom.appendChild(this._parentDom);
    }

    addObserver() {
        // 进行监听处理
        if (!this._observer) {
            this._observer = new ResizeObserver(async entries => {
                console.log('高度变化');
                const pos = await this.getCanvasPos();
                if (!pos) {
                    this.throwException('图片大小加载异常');
                    return;
                }
                this.resetCanvas(pos);
            });
            this._observer.observe(this._parentDom);
        }
    }

    // 添加图片
    appendImg(config: ImageMarkCongfig) {
        this._imgDom = document.createElement('img');
        this._imgDom.src = config.src || '';
        this._imgDom.style.width = '100%';
        this._imgDom.style.height = '100%';
        this._imgDom.style.objectFit = 'contain';
        this._imgDom.style.zIndex = 100;
        this._imgDom.onload = () => this.imgLoaded();
        this._parentDom.appendChild(this._imgDom);
        this._imgDom.onerror = () => this.imgError();
    }

    // 图片方法
    // 设置图片链接
    setImageSrc(src: string) {
        console.log('变更图片路径', src);
        this._config.src = src;
        this._imgDom.src = src || '';
    }

    // 图片加载完成
    async imgLoaded() {
        console.log('图片加载完成');
        const pos = await this.getCanvasPos();
        if (!pos) {
            this.throwException('图片大小加载异常');
            return;
        }
        // 创建绘制层
        if (!this._canvasMark) {
            this._canvasMark = new ToolMark(this._parentDom, this._canvasConfig);
        }
        this.resetCanvas(pos);
    }

    // 重设画布大小和位置
    resetCanvas(config: any) {
        const {offsetHeight, offsetWidth, videoWidth, videoHeight} = config;
        if (!this._canvasMark) {
            return;
        }
        this._canvasMark.resetCanvasPos({top: offsetHeight.toFixed(2), left: offsetWidth.toFixed(2)});
        this._canvasMark.resetCanvasSize({
            width: parseFloat(videoWidth.toFixed(2)),
            height: parseFloat(videoHeight.toFixed(2))
        });
    }

    // 图片加载失败
    imgError() {
        this.throwException('图片加载失败');
        this._imgDom.src = defultImage;
    }

    // 获取画布实际位置
    async getCanvasPos() {
        // 获取父元素实际宽高
        const pWidth = this._parentDom.clientWidth;
        const pHeight = this._parentDom.clientHeight;
        // 获取图片原始宽高
        const config = await this.getImgCurrentSize();
        let res = null;
        if (config && pWidth && pHeight) {
            res = calculateMediaSize(config.width, config.height, pWidth, pHeight);
        }
        return res;
    }

    // 获取图片原始宽高
    getImgCurrentSize(): Promise<{width: number; height: number} | undefind> {
        return new Promise(resolve => {
            let img = document.createElement('img');
            img.src = this._config.src;
            img.onload = () => {
                resolve({width: img.width, height: img.height});
            };
            img.onerror = () => {
                resolve();
            };
        });
    }

    // 设置画布数据
    setMarkConfig(config: ToolMarkConfig) {
        console.log(config);

        this._canvasMark.resetCanvasConfig(config);
    }

    // 报错提示
    throwException(msg: string) {
        console.log('图片画布异常：' + msg);
    }
}
