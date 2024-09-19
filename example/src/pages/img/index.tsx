/**
 * @file 图片功能展示页
 * @author jiangchunhui
 */
/**
 **/
import React, {useEffect, useRef, useState} from 'react';
import {ToolImgMark} from '../../../../src/sdk';
// import {ToolImgMark} from 'tool-mark';
import {Input, Button, Modal} from 'antd';
import JSONEditor from 'jsoneditor';
import 'jsoneditor/dist/jsoneditor.css';

import './index.less';

const imgUrl = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT2F9FvmpkkmNKpbfwI9i50XKZxvjq-zEBjUQ&usqp=CAU';
// const imgUrl = 'https://hellorfimg.zcool.cn/provider_image/preview260/hi2242867437.jpg?x-oss-process=image/format,webp';

const Img = () => {
    const baseCls = 'tool-mark-img';
    const targetRef = useRef<any>(null);
    const imgMarkRef = useRef<any>(null);
    const [width, setWidth] = useState('400px');
    const [height, setHeight] = useState('400px');
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [imgSrc, setImgSrc] = useState<string>('');
    const editorRef = useRef(null);
    const editor = useRef(null);
    const [config, setConfig] = useState<any>({
        shapeList: [
            {
                name: '11',
                type: 'rectangle',
                data: {
                    top: 10,
                    left: 10,
                    width: 60,
                    height: 60
                }
            }
        ]
    });

    useEffect(() => {
        if (!imgMarkRef.current && targetRef.current) {
            imgMarkRef.current = new ToolImgMark(
                targetRef.current,
                {
                    src: imgUrl
                },
                config
            );
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
        editor.current.set(config);
    }, [isModalOpen]);

    const imgSrcChange = e => {
        setImgSrc(e.target.value);
        imgMarkRef.current.setImageSrc(e.target.value);
    };

    const heightChange = e => {
        setHeight(e.target.value);
    };

    const widthChange = e => {
        setWidth(e.target.value);
    };

    const btnClick = () => {
        setIsModalOpen(true);
    };

    const handleOk = () => {
        const config = editor.current.get();
        imgMarkRef.current.setMarkConfig(config);
        setConfig({...config});
        setIsModalOpen(false);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    return (
        <div className={baseCls}>
            <div className={`${baseCls}-action`}>
                <p>提供几个测试图片链接，也可自行查找</p>
                <p>
                    https://hellorfimg.zcool.cn/provider_image/preview260/hi2242867437.jpg?x-oss-process=image/format,webp
                </p>
                <p>
                    https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT2F9FvmpkkmNKpbfwI9i50XKZxvjq-zEBjUQ&usqp=CAU
                </p>
                <div className={`${baseCls}-action-item`}>
                    <label className="label">图片链接：</label>
                    <Input value={imgSrc} onChange={imgSrcChange} />
                </div>
                <div className={`${baseCls}-action-item`}>
                    <label className="label">容器高度：</label>
                    <Input value={height} onChange={heightChange} />
                    <label className="label">容器宽度：</label>
                    <Input value={width} onChange={widthChange} />
                </div>
                <div className={`${baseCls}-action-item`}>
                    <Button onClick={btnClick}>编辑画布数据</Button>
                    <span>只支持图形修改，其他在补充</span>
                </div>
            </div>
            <div className={`${baseCls}-content`}>
                <div ref={targetRef} style={{width, height}} className={`${baseCls}-content-img`}></div>
            </div>
            <Modal title="编辑" open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
                <div ref={editorRef} style={{height: '400px'}}></div>
            </Modal>
        </div>
    );
};

export default Img;
