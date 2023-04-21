import dts from 'rollup-plugin-dts'
import typescript from 'rollup-plugin-typescript2'
import terser from '@rollup/plugin-terser'

export default [
  {
    input: './src/main.ts',
    output: {
      file: './dist/columns-resize.js',
      format: 'es'
    },
    plugins: [typescript()]
  },
  {
    input: './src/main.ts',
    output: {
      file: './dist/columns-resize.min.js',
      compact: true,
      format: 'iife',
      name: 'ColumnsResize'
    },
    plugins: [typescript(), terser()]
  },
  {
    input: './src/main.ts',
    output: {
      file: './dist/columns-resize.d.ts',
      format: 'es'
    },
    plugins: [dts()]
  }
]