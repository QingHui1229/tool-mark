/**
 * @file 容器类型
 * @author jiangchunhui
 */
// 组件初始化参数
export interface ToolMarkConfig {
    /**
     * 设置的canvas实际内容宽度
     */
    width?: string | number;
    /**
     * 设置的canvas实际内容高度
     */
    height?: string | number;
    /**
     * 设置的canvas位置
     */
    top?: string | number;
    /**
     * 设置的canvas位置
     */
    left?: string | number;
    /**
     * 画布全局样式
     */
    style?: GeneralStyle;
    /**
     * 图形类样式
     */
    shapeStyle?: ShapeStyle;
    /**
     * 是否可以编辑
     */
    editAble?: boolean;
    /**
     * 是否可以拖拽
     */
    dragAble?: boolean;
    /**
     * 图形数据
     */
    shapeList?: ShapeConfig[];
}

// 图形初始化参数
export interface ShapeConfig {
    id?: string;
    data?: Point[];
    style?: GeneralStyle | {};
    type?: string;
    name?: string;
}

// 图形内部使用类
export interface GraphicConfig extends ShapeConfig {
    _id: string;
    _type: string;
    canvas: HTMLCanvasElement;
}

// 通用样式
export interface GeneralStyle {
    /**
     * 图形填充颜色
     */
    fillStyle?: string;
    /**
     * 图形轮廓颜色
     */
    strokeStyle?: string;
    /**
     * 线条宽度
     */
    lineWidth?: number;
    /**
     * 字体样式
     */
    font?: string;
}

// 图形类样式
export interface ShapeStyle {
    [key: string]: GeneralStyle;
}

// 点位信息
export interface Point {
    x: number;
    y: number;
}
