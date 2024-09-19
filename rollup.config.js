/**
 * @file 配置
 */
import path from 'path';
import babel from 'rollup-plugin-babel';
import {defineConfig} from 'rollup';
import dts from 'rollup-plugin-dts';
import nodeResolve from '@rollup/plugin-node-resolve';
import image from '@rollup/plugin-image';
import pkg from './package.json';

const extensions = ['.js', '.ts'];

const resolve = function (...args) {
    return path.resolve(__dirname, ...args);
};

export default defineConfig([
    {
        input: resolve('./src/sdk/index.ts'),
        output: {
            file: resolve('./', pkg.main), // 为了项目的统一性，这里读取 package.json 中的配置项
            format: 'esm'
        },
        plugins: [
            nodeResolve({
                extensions,
                modulesOnly: true
            }),
            babel({
                exclude: 'node_modules/**',
                extensions
            }),
            image()
        ]
    }
]);
