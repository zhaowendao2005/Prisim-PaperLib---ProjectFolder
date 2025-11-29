/**
 * 构建时豁免 ESLint 检查脚本
 * 
 * 用法：
 *   node Script/Extension/bypass-lint-build.js [build-command]
 * 
 * 示例：
 *   node Script/Extension/bypass-lint-build.js build:win
 *   node Script/Extension/bypass-lint-build.js build:mac
 *   node Script/Extension/bypass-lint-build.js build:linux
 * 
 * 原理：
 *   1. 临时修改 package.json 中的 build 脚本，移除 typecheck
 *   2. 执行构建命令
 *   3. 构建完成后恢复 package.json
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const packageJsonPath = path.resolve(__dirname, '../../package.json')

// 读取原始 package.json
const originalContent = fs.readFileSync(packageJsonPath, 'utf-8')
const packageJson = JSON.parse(originalContent)

// 备份原始 build 脚本
const originalBuildScript = packageJson.scripts.build

// 修改 build 脚本，移除 typecheck，直接执行 electron-vite build
packageJson.scripts.build = 'electron-vite build'

// 获取要执行的构建命令
const buildCommand = process.argv[2] || 'build'

console.log('🔧 临时修改 package.json，豁免 ESLint/TypeCheck...')
console.log(`   原始 build: ${originalBuildScript}`)
console.log(`   临时 build: ${packageJson.scripts.build}`)

// 写入修改后的 package.json
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n')

// 恢复函数
function restore() {
  console.log('\n🔄 恢复 package.json...')
  fs.writeFileSync(packageJsonPath, originalContent)
  console.log('✅ 已恢复原始配置')
}

// 捕获退出信号，确保恢复
process.on('SIGINT', () => {
  restore()
  process.exit(1)
})

process.on('SIGTERM', () => {
  restore()
  process.exit(1)
})

try {
  console.log(`\n🚀 执行构建命令: pnpm ${buildCommand}\n`)
  execSync(`pnpm ${buildCommand}`, { 
    stdio: 'inherit',
    cwd: path.resolve(__dirname, '../..')
  })
  console.log('\n✅ 构建成功！')
} catch (error) {
  console.error('\n❌ 构建失败')
  process.exitCode = 1
} finally {
  restore()
}
