/**
 * @file 工具文件
 * @author jiangchunhui
 */
import {Point} from './type/index.type';

// 标准化id
export const normalizeId = id => (id.indexOf('#') === 0 ? id.slice(1) : id);

// 输出随机8位随机字符串
export const randomString = () => {
    const str = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz';
    const length = str.length;
    let id = '';
    for (let i = 0; i < 32; i++) {
        id += str.charAt(Math.floor(Math.random() * length));
    }
    return id;
};

/**
 * 获取箭头绘制数据
 * @param {*} point1 起始点
 * @param {*} point2 结束点
 * @param {*} headlen 箭头长度
 * @param {*} theta 箭头张开角度
 * @returns
 */
export const getArrowData = (point1: Point, point2: Point, headlen: number = 30, theta: number = 30) => {
    // 计算各角度和对应的P2,P3坐标
    const angle = (Math.atan2(point1.y - point2.y, point1.x - point2.x) * 180) / Math.PI;
    const angle1 = ((angle + theta) * Math.PI) / 180;
    const angle2 = ((angle - theta) * Math.PI) / 180;
    const topX = headlen * Math.cos(angle1);
    const topY = headlen * Math.sin(angle1);
    const botX = headlen * Math.cos(angle2);
    const botY = headlen * Math.sin(angle2);
    return {topX, topY, botX, botY};
};

const ADSORB_RANGE = 4; // 自动闭合范围值

// 闭合条件判定（两个点距离是否在闭合值内）
export const checkClose = (point1, point2) => {
    return Math.abs(point1.x - point2.x) < ADSORB_RANGE && Math.abs(point1.y - point2.y) < ADSORB_RANGE;
};

// 判断两个点是否在某个距离内
export const isPointsBearby = (point1: Point, point2: Point, range: number = 2) => {
    const squareRadius = getPointsDis(point1, point2);
    return squareRadius < Math.pow(range, 2);
};

// 返回两点之间的距离
export const getPointsDis = (point1: Point, point2: Point) => {
    const squareRadius = Math.pow(Math.abs(point1.x - point2.x), 2) + Math.pow(Math.abs(point1.y - point2.y), 2);
    return Math.sqrt(squareRadius);
};

// 判断点是否在线段附近
export const isPointNearLine = (point: Point, line: Point[], range: number = 4) => {
    // 如果两点一致
    if (line[0].x === line[1].x && line[0].y === line[1].y) {
        return isPointsBearby(point, line[0]);
    }

    // 判断点是否在两个端的附近
    if (isPointsBearby(point, line[0]) || isPointsBearby(point, line[1])) {
        return true;
    }

    // 斜率
    const k = parseFloat(((line[0].y - line[1].y) / (line[0].x - line[1].x)).toFixed(2));
    const c = line[0].y - k * line[0].x;
    // 最短距离
    const d = Math.abs(k * point.x - point.y + c) / Math.sqrt(k * k + 1);
    return d <= 4;
};

/**
 * 判断某个点是否在对应的区域内
 * @param {*} checkPoint Point
 * @param {*} polygonPoints Point[]
 * @returns
 */
export const isInArea = (checkPoint: Point, polygonPoints: Point[]) => {
    let counter = 0;
    const pointCount = polygonPoints.length;
    let p1 = polygonPoints[0];
    for (let i = 1; i <= pointCount; i++) {
        let p2 = polygonPoints[i % pointCount];
        if (checkPoint.x > Math.min(p1.x, p2.x) && checkPoint.x <= Math.max(p1.x, p2.x)) {
            if (checkPoint.y <= Math.max(p1.y, p2.y)) {
                if (p1.x !== p2.x) {
                    let xinters = ((checkPoint.x - p1.x) * (p2.y - p1.y)) / (p2.x - p1.x) + p1.y;
                    if (p1.y === p2.y || checkPoint.y <= xinters) {
                        counter++;
                    }
                }
            }
        }
        p1 = p2;
    }
    if (counter % 2 === 0) {
        return false;
    } else {
        return true;
    }
};

/**
 * 将子元素尺寸进行计算，避免非等比的子元素与父元素大小不匹配
 * @param {number} childWidth 素材宽度
 * @param {number} childHeight 素材高度
 * @param {number} parentWidth 画布宽度
 * @param {number} parentHeight 画布高度
 * @return {Object} 返回x, y偏移量以及宽高
 */
export const calculateMediaSize = (childWidth, childHeight, parentWidth, parentHeight) => {
    let videoWidth = childWidth; // 媒体源宽
    let videoHeight = childHeight; // 媒体源高
    // 对图片进行等比缩放
    const widthRatio = childWidth / parentWidth;
    const heightRatio = childHeight / parentHeight;

    if (widthRatio >= heightRatio) {
        videoWidth = parentWidth;
        videoHeight = childHeight / widthRatio;
    } else {
        videoHeight = parentHeight;
        videoWidth = childWidth / heightRatio;
    }
    const offsetWidth = (parentWidth - videoWidth) / 2;
    const offsetHeight = (parentHeight - videoHeight) / 2;
    return {offsetWidth, offsetHeight, videoWidth, videoHeight};
};
