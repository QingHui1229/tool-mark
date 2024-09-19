/**
 * @file vite 配置
 * @author jiangchunhui
 */
import {defineConfig} from 'vite';
import path from 'path';
import react from '@vitejs/plugin-react';

export default defineConfig({
    server: {
        host: '0.0.0.0',
        port: 8747,
        open: true
    },
    alias: {}
});
