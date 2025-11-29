/**
 * ============================================================
 * ESLint 配置文件
 * ⚠️ 路径别名规则请勿在此修改，统一在 tsconfig.json 中管理
 * ============================================================
 */
import { defineConfig } from 'eslint/config'
import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import eslintPluginVue from 'eslint-plugin-vue'
import vueParser from 'vue-eslint-parser'
import checkFile from 'eslint-plugin-check-file'
import globals from 'globals'

export default defineConfig(
  // ========== 忽略目录 ==========
  { ignores: ['**/node_modules', '**/dist', '**/out', '**/electron.dist', '**/app.dist'] },

  // ========== 基础 JS 规则 ==========
  eslint.configs.recommended,

  // ========== 全局环境配置 ==========
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.es2021,
        ...globals.node
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
        ecmaVersion: 2022,
        sourceType: 'module'
      }
    }
  },

  // ========== TypeScript 规则 ==========
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,mts,tsx}'],
    rules: {
      // 允许 @ts-ignore 但需要描述
      '@typescript-eslint/ban-ts-comment': ['error', { 'ts-ignore': 'allow-with-description' }],
      // 函数必须声明返回类型（表达式、高阶函数、IIFE 除外）
      '@typescript-eslint/explicit-function-return-type': [
        'error',
        {
          allowExpressions: true,
          allowTypedFunctionExpressions: true,
          allowHigherOrderFunctions: true,
          allowIIFEs: true
        }
      ],
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      // 允许空箭头函数
      '@typescript-eslint/no-empty-function': ['error', { allow: ['arrowFunctions'] }],
      // 允许空 interface
      '@typescript-eslint/no-empty-object-type': ['error', { allowInterfaces: 'always' }],
      // 禁止使用 any
      '@typescript-eslint/no-explicit-any': 'error',
      // 允许非空断言 !
      '@typescript-eslint/no-non-null-assertion': 'off',
      // 禁止 require()
      '@typescript-eslint/no-require-imports': 'error',
      // 允许短路、三元、模板字符串表达式
      '@typescript-eslint/no-unused-expressions': [
        'error',
        {
          allowShortCircuit: true,
          allowTaggedTemplates: true,
          allowTernary: true
        }
      ]
    }
  },
  // JS 文件不要求返回类型
  {
    files: ['**/*.{js,mjs}'],
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off'
    }
  },

  // ========== Vue 规则 ==========
  ...eslintPluginVue.configs['flat/recommended'],
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        extraFileExtensions: ['.vue'],
        parser: tseslint.parser
      }
    },
    rules: {
      // 允许 props 不设默认值
      'vue/require-default-prop': 'off',
      // 允许单词组件名（如 App.vue）
      'vue/multi-word-component-names': 'off',
      // 强制 <script lang="ts">
      'vue/block-lang': ['error', { script: { lang: 'ts' } }],
      // 关闭过于严格的格式规则（交给 Prettier 处理）
      'vue/max-attributes-per-line': 'off',
      'vue/singleline-html-element-content-newline': 'off',
      'vue/html-self-closing': 'off'
    }
  },

  // ========== 路径与文件规范 ==========
  {
    files: ['**/*.{ts,mts,tsx,vue}'],
    plugins: {
      'check-file': checkFile
    },
    rules: {
      // 禁止深层相对路径（超过2级），强制使用别名
      // 静态资源（图片、字体、样式等）豁免：只限制 .ts/.tsx/.vue/.js 文件的引用
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '../../../*.ts',
                '../../../*.tsx',
                '../../../*.vue',
                '../../../*.js',
                '../../../../*',
                '../../../../../*'
              ],
              message: '禁止跨2级以上目录引用，请使用别名（如 @/、@shared/、@public/）'
            }
          ]
        }
      ],

      // stores 目录下的文件命名规范：*.store.ts, *.mock.ts, *.datasource.ts, *.electron.ts, index.ts
      // services 目录下的文件命名规范：*.service.ts, index.ts
      'check-file/filename-naming-convention': [
        'error',
        {
          '**/stores/**/!(*index).ts': '+([a-z0-9-]).@(store|mock|datasource|electron).ts',
          '**/services/**/!(*index).ts': '+([a-z0-9-]).service.ts'
        },
        { ignoreMiddleExtensions: true }
      ],

      // 指定目录下只能放目录，不能放散文件
      // services、stores、types、components 下面必须是目录结构
      'check-file/folder-match-with-fex': [
        'error',
        {
          '*.ts': '**/!(services|stores|types|components)/**',
          '*.vue': '**/!(components)/**'
        }
      ]
    }
  }
)
