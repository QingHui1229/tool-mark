/**
 * @file 常量存储
 * @author jiangchunhui
 */
import {GeneralStyle} from './type/index.type';

// 画布默认样式
const baseStyle: GeneralStyle = {
    fillStyle: '#2468f2',
    strokeStyle: '#2468f2',
    lineWidth: 1,
    font: '16px 微软雅黑'
};

// 图形选中样式
const baseSelectStyle: GeneralStyle = {
    fillStyle: '#f33e3e',
    strokeStyle: '#f33e3e',
    lineWidth: 1,
    font: '16px 微软雅黑'
};

/**
 * 避免部分merge操作污染基础变量
 * @returns GeneralStyle
 */
export const getBaseStyle = () => {
    return {...baseStyle};
};

export const getBaseSelectStyle = () => {
    return {...baseSelectStyle};
};

/**
 * 图形类的枚举类型
 */
export enum ShapeEnum {
    shape = 'shape',
    arrow = 'arrow',
    circle = 'circle',
    line = 'line',
    polygon = 'polygon',
    rectangle = 'rectangle',
    text = 'text'
}

/**
 * 监听事件的枚举类型
 */
export type ListenerType = 'click' | 'drawStart' | 'drawEnd' | 'shapeAdded' | 'beforeShapeDelete' | 'shapeDeleted';
export enum ListenerEnum {
    'click',
    'drawStart',
    'drawEnd',
    'shapeAdded',
    'beforeShapeDelete',
    'shapeDeleted',
    'refresh'
}
