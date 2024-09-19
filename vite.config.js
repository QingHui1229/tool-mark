/**
 * @file vite 配置
 * @author jiangchunhui
 */
import {defineConfig} from 'vite';
import path from 'path';
import react from '@vitejs/plugin-react';

export default defineConfig({
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src')
        }
    }
});
