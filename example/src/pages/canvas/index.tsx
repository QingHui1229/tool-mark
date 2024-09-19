/**
 * @file 基础展示
 * @author jiangchunhui
 */
import React, {useEffect, useRef, useState} from 'react';
import {ToolMark, Shape, Line, Arrow, Rectangle, Text, Circle, Polygon} from '../../../../src/sdk';
// import {ToolMark, Shape, Line, Arrow, Rectangle, Text, Circle, Polygon} from 'tool-mark';
import {Button, Collapse, Divider, Input, Modal} from 'antd';
import JSONEditor from 'jsoneditor';
import 'jsoneditor/dist/jsoneditor.css';

const {Panel} = Collapse;

import './index.less';

interface BtnItem {
    label: string;
    value: string;
    change?: Function;
}

const shapeMap = new Map([
    ['line', Line],
    ['arrow', Arrow],
    ['rect', Rectangle],
    ['text', Text],
    ['circle', Circle],
    ['polygon', Polygon]
]);

const shapeList: BtnItem[] = [
    {label: '线段', value: 'line'},
    {label: '箭头', value: 'arrow'},
    {label: '矩形', value: 'rect'},
    {label: '文本', value: 'text'},
    {label: '圆形', value: 'circle'},
    {label: '自定义闭合图形', value: 'polygon'}
];

const callbackList: BtnItem[] = [
    // {label: '画布点击', value: 'canvas'}
];

const canvasAttrMap = new Map([
    ['line', '线段类样式'],
    ['arrow', '箭头类样式'],
    ['rectangle', '矩形类样式'],
    ['text', '文本类样式'],
    ['circle', '圆形类样式'],
    ['polygon', '自定义闭合图形类样式']
]);

const canvasAttrObj = {
    line: {
        data: [
            {x: 100, y: 100},
            {x: 200, y: 200}
        ]
    },
    arrow: {
        data: {
            start: {x: 120, y: 140},
            end: {x: 150, y: 160}
        },
        headlen: 10,
        theta: 30
    },
    rect: {
        data: {
            top: 10,
            left: 40,
            width: 200,
            height: 200
        }
    },
    text: {
        data: [{x: 130, y: 250}],
        text: '请输入文本\n换行'
    },
    circle: {
        data: {
            center: {x: 120, y: 160},
            radius: 50
        }
    },
    polygon: {
        isFill: false,
        data: [
            {x: 80, y: 80},
            {x: 90, y: 90},
            {x: 90, y: 120},
            {x: 60, y: 190},
            {x: 70, y: 70}
        ]
    }
};

const Base = () => {
    const baseCls = 'tool-mark-base';
    const wrapperRef = useRef(null);
    const canvasRef = useRef(null);
    const editorRef = useRef(null);
    const editor = useRef(null);
    const [title, setTitle] = useState<string>('');
    const [btnType, setBtnType] = useState<string>('');
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [canvasConfig, setCanvasConfig] = useState<Object>({
        editAble: true
    });
    // 当前选中图形
    const [selectShape, setSelectShape] = useState<any>(null);
    // 画布通用样式
    const [canvasStyle, setCanvasStyle] = useState<Object>({});
    // 画布图形类的样式
    const [shapesStyle, setShapesStyle] = useState<Object>({});
    // 选中图形的样式
    const [selectShapeStyle, setSelectShapeStyle] = useState<Object>({});
    // 选中图形的点位信息
    const [selectShapeData, setSelectShapeData] = useState<[] | {}>();
    // 选中图形的自定义信息
    const [selectShapeOwnAttr, setSelectShapeOwnAttr] = useState<{}>();

    useEffect(() => {
        if (!canvasRef.current) {
            canvasRef.current = new ToolMark(wrapperRef.current, canvasConfig);
            const style = canvasRef.current.getStyle();
            setCanvasStyle(style);
            const shapesStyle = canvasRef.current.getShapesStyle();
            setShapesStyle(shapesStyle);
            // 绑定事件
            canvasRef.current.addListener('click', (graphics: any) => {
                if (!graphics) {
                    setSelectShape(null);
                    setSelectShapeStyle({});
                    setSelectShapeData(null);
                    setSelectShapeOwnAttr({});
                    return;
                }
                setSelectShape(graphics);
                if (graphics.type === 'drag') {
                    setSelectShapeStyle({});
                    setSelectShapeData(null);
                    setSelectShapeOwnAttr({});
                } else {
                    setSelectShapeStyle(graphics.getStyle());
                    setSelectShapeData(graphics.getShapeLocation());
                    setSelectShapeOwnAttr(graphics.getOwnConfig());
                }
            });
            // 绑定监听
            canvasRef.current.addListener('drawEnd', shape => {
                console.log('end', shape.data);
            });
        }
    }, []);

    useEffect(() => {
        if (!editorRef || !editorRef.current) {
            return;
        }
        if (!editor || !editor.current) {
            editor.current = new JSONEditor(editorRef.current, {
                mode: 'code'
            });
        }
        editor.current.set(canvasConfig);
    }, [isModalOpen]);

    const renderTitle = (title: string) => {
        return <div className={`${baseCls}-title`}>{title}</div>;
    };

    const renderBtnList = (btnList: BtnItem[], type: string) => {
        return btnList.map(btn => (
            <Button className="btn btn-light" onClick={() => shapeBtnClick(btn, type)}>
                {btn.label}
            </Button>
        ));
    };

    const renderSelectShape = () => {
        return (
            <>
                <div className={`${baseCls}-form-item`}>
                    <label>ID:</label>
                    <span>{selectShape ? selectShape.id : '暂无选中'}</span>
                </div>
                <div className={`${baseCls}-form-item`}>
                    <label>类型:</label>
                    <span>{selectShape ? selectShape.type : '暂无选中'}</span>
                </div>
            </>
        );
    };

    // 绘制各自属性
    const renderAttribute = () => {
        if (!canvasRef.current) {
            return;
        }
        if (selectShape === null) {
            return (
                <>
                    <Collapse className="mt16" key="全局类样式" size="small">
                        <Panel header="全局类样式" key="1">
                            {renderStyle(canvasStyle, '')}
                        </Panel>
                    </Collapse>
                    {shapesStyle &&
                        Object.keys(shapesStyle).map(key => {
                            const item = shapesStyle[key];
                            const label = canvasAttrMap.get(key) || '';
                            return (
                                <Collapse className="mt16" key={key} size="small">
                                    <Panel header={label} key="1">
                                        {renderStyle(item, key)}
                                    </Panel>
                                </Collapse>
                            );
                        })}
                </>
            );
        } else {
            return (
                <>
                    {renderStyle(selectShapeStyle, '')}
                    {selectShapeOwnAttr &&
                        Object.keys(selectShapeOwnAttr).map(key => (
                            <div className={`${baseCls}-form-item`}>
                                <label>{key}:</label>
                                <Input
                                    value={selectShapeOwnAttr[key]}
                                    onChange={e => ownChange({[key]: e.target.value})}
                                />
                            </div>
                        ))}
                </>
            );
        }
    };

    // 自定义属性
    const ownChange = (config: Object) => {
        selectShape.setOwnConfig(config);
        setSelectShapeOwnAttr(selectShape.getOwnConfig());
    };

    // 渲染颜色模块
    const renderStyle = (style: any, type: string) => {
        return (
            <>
                <div className={`${baseCls}-form-item`}>
                    <label>填充颜色:</label>
                    <Input value={style.fillStyle} onChange={e => styleChange({fillStyle: e.target.value}, type)} />
                </div>
                <div className={`${baseCls}-form-item`}>
                    <label>边框颜色:</label>
                    <Input value={style.strokeStyle} onChange={e => styleChange({strokeStyle: e.target.value}, type)} />
                </div>
                <div className={`${baseCls}-form-item`}>
                    <label>线条宽度:</label>
                    <Input value={style.lineWidth} onChange={e => styleChange({lineWidth: e.target.value}, type)} />
                </div>
                <div className={`${baseCls}-form-item`}>
                    <label>字体样式:</label>
                    <Input value={style.font} onChange={e => styleChange({font: e.target.value}, type)} />
                </div>
            </>
        );
    };

    // 点击触发函数
    const shapeBtnClick = (data: BtnItem, type: string) => {
        if (type === 'static') {
            setCanvasConfig(canvasAttrObj[data.value]);
            setBtnType(data.value);
            setIsModalOpen(true);
        } else if (type === 'draw') {
            setBtnType('');
            const shapeModal = shapeMap.get(data.value);
            canvasRef.current.setDrawShape(new shapeModal({}));
        }
    };

    const renderOther = () => {
        return (
            <>
                <Button onClick={logCanvasData}>打印画布数据</Button>
            </>
        );
    };

    const logCanvasData = () => {
        const config = canvasRef.current.getConfig();
        setCanvasConfig(config);
        setIsModalOpen(true);
    };

    // 样式变更函数
    const styleChange = (param: Object, type: string) => {
        if (selectShape === null) {
            if (!type) {
                canvasRef.current.setStyle(param);
                const style = canvasRef.current.getStyle();
                setCanvasStyle(style);
            } else {
                canvasRef.current.setShapesStyle({
                    [type]: param
                });
                const shapesStyle = canvasRef.current.getShapesStyle();
                setShapesStyle(shapesStyle);
            }
        } else {
            selectShape.setStyle(param);
            setSelectShapeStyle(selectShape.getStyle());
        }
    };

    const handleOk = () => {
        const shapeModal = shapeMap.get(btnType);
        const config = editor.current.get();
        canvasRef.current.addShape(new shapeModal(config));
        setIsModalOpen(false);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    return (
        <div className={baseCls}>
            <div className={`${baseCls}-left`}>
                {renderTitle('生成图形')}
                {renderBtnList(shapeList, 'static')}
                {renderTitle('绘制图形')}
                {renderBtnList(shapeList, 'draw')}
                {renderTitle('画布回调事件')}
                {renderBtnList(callbackList, 'click')}
            </div>
            <div className={`${baseCls}-content`} ref={wrapperRef}></div>
            <div className={`${baseCls}-right`}>
                <div className={`${baseCls}-right-content`}>
                    {renderTitle('当前选中的图形')}
                    {renderSelectShape()}
                    {renderTitle(`其他`)}
                    {renderOther()}
                    {renderTitle(`当前${selectShape ? '图形' : '画布'}属性`)}
                    {renderAttribute()}
                </div>
            </div>
            <Modal title={title} open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
                <div ref={editorRef} style={{height: '400px'}}></div>
            </Modal>
        </div>
    );
};

export default Base;
