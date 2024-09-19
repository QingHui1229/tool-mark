/**
 * @file 顶部布局
 * @author jiangchunhui
 */

import React, {useState} from 'react';
import {Outlet, useNavigate} from 'react-router-dom';
import {Menu} from 'antd';
import type {MenuProps} from 'antd';

import './index.less';

const LayoutComp = (props: any) => {
    const baseCls = 'tool-mark-layout';
    const navigate = useNavigate();
    const menuList: MenuProps['items'] = [
        {label: '基础画布', key: 'canvas'},
        {label: '图片', key: 'img'},
        {label: '视频', key: 'video'},
        {label: '使用文档', key: 'doc'}
    ];

    const [current, setCurrent] = useState('canvas');

    // 点击菜单
    const onClick: MenuProps['onClick'] = e => {
        setCurrent(e.key);
        navigate(e.key);
    };

    return (
        <div className={baseCls}>
            <div className={`${baseCls}-header`}>
                <Menu onClick={onClick} selectedKeys={[current]} mode="horizontal" items={menuList} />
            </div>
            <div className={`${baseCls}-content`}>
                <Outlet />
            </div>
        </div>
    );
};

export default LayoutComp;
