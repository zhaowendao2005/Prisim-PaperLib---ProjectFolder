/**
 * 图标生成脚本
 * 将 SVG Logo 转换为 Electron 所需的各种尺寸图标
 * 
 * 用法：
 *   pnpm generate:icons
 * 
 * 依赖：
 *   pnpm add -D sharp png-to-ico
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 路径配置
const ROOT_DIR = path.resolve(__dirname, '../..')
const SVG_SOURCE = path.join(ROOT_DIR, 'public/assets/PrisimPaperLib.logo.svg')
const BUILD_DIR = path.join(ROOT_DIR, 'build')
const ASSETS_DIR = path.join(ROOT_DIR, 'public/assets')

// Electron 图标尺寸规范
// Windows ICO: 16, 24, 32, 48, 64, 128, 256
// macOS ICNS: 16, 32, 64, 128, 256, 512, 1024
// Linux: 16, 24, 32, 48, 64, 128, 256, 512
const ICON_SIZES = [16, 24, 32, 48, 64, 128, 256, 512, 1024]

async function main() {
  // 动态导入 sharp（ESM）
  const sharp = (await import('sharp')).default
  
  console.log('🎨 开始生成图标...')
  console.log(`   源文件: ${SVG_SOURCE}`)
  
  // 检查源文件
  if (!fs.existsSync(SVG_SOURCE)) {
    console.error(`❌ 源文件不存在: ${SVG_SOURCE}`)
    process.exit(1)
  }

  // 确保输出目录存在
  fs.mkdirSync(BUILD_DIR, { recursive: true })
  fs.mkdirSync(path.join(BUILD_DIR, 'icons'), { recursive: true })

  const svgBuffer = fs.readFileSync(SVG_SOURCE)
  const pngFiles = []

  // 生成各尺寸 PNG
  console.log('\n📐 生成 PNG 图标...')
  for (const size of ICON_SIZES) {
    const outputPath = path.join(BUILD_DIR, 'icons', `${size}x${size}.png`)
    await sharp(svgBuffer)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toFile(outputPath)
    
    pngFiles.push({ size, path: outputPath })
    console.log(`   ✅ ${size}x${size}.png`)
  }

  // 生成主 icon.png (256x256)
  const mainIconPath = path.join(BUILD_DIR, 'icon.png')
  await sharp(svgBuffer)
    .resize(256, 256, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .png()
    .toFile(mainIconPath)
  console.log(`   ✅ icon.png (256x256)`)

  // 生成 Windows ICO
  console.log('\n🪟 生成 Windows ICO...')
  try {
    const pngToIco = (await import('png-to-ico')).default
    const icoSizes = [16, 24, 32, 48, 64, 128, 256]
    const icoPngs = pngFiles
      .filter(f => icoSizes.includes(f.size))
      .map(f => fs.readFileSync(f.path))
    
    const icoBuffer = await pngToIco(icoPngs)
    fs.writeFileSync(path.join(BUILD_DIR, 'icon.ico'), icoBuffer)
    console.log('   ✅ icon.ico')
  } catch (error) {
    console.log('   ⚠️ 跳过 ICO 生成（需要安装 png-to-ico）')
    console.log(`      运行: pnpm add -D png-to-ico`)
  }

  // macOS ICNS 需要使用系统工具或第三方库
  // 这里生成 iconset 目录，可以用 macOS 的 iconutil 转换
  console.log('\n🍎 生成 macOS iconset...')
  const iconsetDir = path.join(BUILD_DIR, 'icon.iconset')
  fs.mkdirSync(iconsetDir, { recursive: true })
  
  const icnsMapping = [
    { size: 16, name: 'icon_16x16.png' },
    { size: 32, name: 'icon_16x16@2x.png' },
    { size: 32, name: 'icon_32x32.png' },
    { size: 64, name: 'icon_32x32@2x.png' },
    { size: 128, name: 'icon_128x128.png' },
    { size: 256, name: 'icon_128x128@2x.png' },
    { size: 256, name: 'icon_256x256.png' },
    { size: 512, name: 'icon_256x256@2x.png' },
    { size: 512, name: 'icon_512x512.png' },
    { size: 1024, name: 'icon_512x512@2x.png' }
  ]

  for (const { size, name } of icnsMapping) {
    const srcPath = path.join(BUILD_DIR, 'icons', `${size}x${size}.png`)
    const destPath = path.join(iconsetDir, name)
    fs.copyFileSync(srcPath, destPath)
  }
  console.log('   ✅ icon.iconset/')
  console.log('      💡 在 macOS 上运行: iconutil -c icns build/icon.iconset')

  // 复制一份到 public/assets 作为应用内图标
  const appIconPath = path.join(ASSETS_DIR, 'icon.png')
  fs.copyFileSync(mainIconPath, appIconPath)
  console.log(`\n📦 复制到 public/assets/icon.png`)

  console.log('\n✅ 图标生成完成！')
  console.log('\n📁 输出文件:')
  console.log(`   ${BUILD_DIR}/icon.png      - 主图标 (256x256)`)
  console.log(`   ${BUILD_DIR}/icon.ico      - Windows 图标`)
  console.log(`   ${BUILD_DIR}/icon.iconset/ - macOS iconset`)
  console.log(`   ${BUILD_DIR}/icons/        - 各尺寸 PNG`)
}

main().catch(err => {
  console.error('❌ 生成失败:', err)
  process.exit(1)
})
