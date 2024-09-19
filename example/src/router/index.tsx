/**
 * @file 路由文件
 * @author jiangchunhui
 */
import {RouterProvider, createBrowserRouter, Route, Routes, useRoutes} from 'react-router-dom';

import Home from '../pages/home';
import LayoutComp from '../pages/layout';
import DocComp from '../pages/doc';
import ImgComp from '../pages/img';
import CanvasComp from '../pages/canvas';
import VideoComp from '../pages/video';

const AppRouter = () => {
    const routes = useRoutes([
        {
            path: '/home',
            element: <Home />
        },
        {
            path: '/main',
            element: <LayoutComp />,
            children: [
                {
                    path: 'doc',
                    element: <DocComp />
                },
                {
                    path: 'img',
                    element: <ImgComp />
                },
                {
                    path: 'canvas',
                    element: <CanvasComp />
                },
                {
                    path: 'video',
                    element: <VideoComp />
                }
            ]
        }
    ]);
    return routes;
};

export default AppRouter;
