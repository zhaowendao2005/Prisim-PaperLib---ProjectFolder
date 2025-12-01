/**
 * 目录树生成器
 * 
 * 用法：
 *   node Script/Extension/generate-directory-tree.js [输出文件路径]
 * 
 * 示例：
 *   node Script/Extension/generate-directory-tree.js
 *   node Script/Extension/generate-directory-tree.js ./docs/Wiki/directory-tree.txt
 *   node Script/Extension/generate-directory-tree.js D:/output/tree.txt
 * 
 * 功能：
 *   1. 读取所有 .gitignore 文件中的忽略规则（排除 # 注释行）
 *   2. 结合脚本内配置的额外忽略规则
 *   3. 遍历扫描所有非忽略目录，生成完整的目录树
 *   4. 输出到指定文件（支持相对/绝对路径，兼容正反斜杠）
 * 
 * 参数：
 *   [输出文件路径] - 可选，指定输出文件位置，优先级高于配置区域的 OUTPUT_FILE
 * 
 * 特性：
 *   - 支持 gitignore 通配符格式（*, **, ?, [abc], {a,b}）
 *   - 自动读取所有层级的 .gitignore 文件
 *   - 递归扫描所有深度的目录
 *   - 生成树形结构输出
 */

const fs = require('fs')
const path = require('path')

// ==================== 配置区域 ====================

// 额外忽略的目录/文件（使用 gitignore 通配格式）
const CUSTOM_IGNORES = [
  'node_modules',
  '.git',
  'dist',
  'build',
  '*.log',
  '.DS_Store',
  'Thumbs.db'
]

// 输出文件路径（支持相对路径和绝对路径，兼容正反斜杠）
// 注意：命令行参数优先级更高
const OUTPUT_FILE = './directory-tree.txt'

// ==================== 配置区域结束 ====================

// 标准化路径（统一使用正斜杠）
function normalizePath(filePath) {
  return filePath.replace(/\\/g, '/')
}

// 解析 gitignore 文件内容
function parseGitignore(content) {
  return content
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#')) // 排除空行和注释
    .map(pattern => pattern.replace(/\\/g, '/')) // 统一路径分隔符
}

// 读取指定目录下的 .gitignore 文件
function readGitignore(dir) {
  const gitignorePath = path.join(dir, '.gitignore')
  if (fs.existsSync(gitignorePath)) {
    try {
      const content = fs.readFileSync(gitignorePath, 'utf-8')
      return parseGitignore(content)
    } catch (error) {
      console.warn(`⚠️  读取 .gitignore 失败: ${gitignorePath}`)
      return []
    }
  }
  return []
}

// 收集所有 .gitignore 规则
function collectAllGitignores(rootDir) {
  const allPatterns = []
  
  function traverse(dir) {
    const patterns = readGitignore(dir)
    if (patterns.length > 0) {
      const relativePath = path.relative(rootDir, dir)
      allPatterns.push({
        dir: relativePath || '.',
        patterns: patterns
      })
    }
    
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true })
      for (const entry of entries) {
        if (entry.isDirectory() && entry.name !== '.git' && entry.name !== 'node_modules') {
          traverse(path.join(dir, entry.name))
        }
      }
    } catch (error) {
      // 忽略无法访问的目录
    }
  }
  
  traverse(rootDir)
  return allPatterns
}

// 将 gitignore 模式转换为正则表达式
function patternToRegex(pattern) {
  // 处理目录模式（以 / 结尾）
  const isDirectory = pattern.endsWith('/')
  if (isDirectory) {
    pattern = pattern.slice(0, -1)
  }
  
  // 转义特殊字符
  let regex = pattern
    .replace(/\./g, '\\.')
    .replace(/\+/g, '\\+')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/\|/g, '\\|')
    .replace(/\^/g, '\\^')
    .replace(/\$/g, '\\$')
  
  // 处理通配符
  regex = regex
    .replace(/\*\*/g, '§DOUBLESTAR§')
    .replace(/\*/g, '[^/]*')
    .replace(/§DOUBLESTAR§/g, '.*')
    .replace(/\?/g, '[^/]')
  
  // 处理 [abc] 和 {a,b} 模式
  regex = regex.replace(/\{([^}]+)\}/g, (_, group) => {
    return '(' + group.split(',').join('|') + ')'
  })
  
  // 如果模式不以 / 开头，则匹配任意位置
  if (!pattern.startsWith('/')) {
    regex = '(^|/)' + regex
  } else {
    regex = '^' + regex.slice(1)
  }
  
  // 如果是目录模式，添加目录匹配
  if (isDirectory) {
    regex = regex + '(/|$)'
  } else {
    regex = regex + '($|/)'
  }
  
  return new RegExp(regex)
}

// 检查路径是否应该被忽略
function shouldIgnore(relativePath, allIgnorePatterns) {
  const normalizedPath = normalizePath(relativePath)
  
  for (const { dir, patterns } of allIgnorePatterns) {
    for (const pattern of patterns) {
      const regex = patternToRegex(pattern)
      
      // 如果 pattern 来自子目录的 .gitignore，需要调整匹配路径
      let testPath = normalizedPath
      if (dir !== '.') {
        const dirPrefix = normalizePath(dir) + '/'
        if (normalizedPath.startsWith(dirPrefix)) {
          testPath = normalizedPath.slice(dirPrefix.length)
        } else {
          continue // 不在该 .gitignore 的作用域内
        }
      }
      
      if (regex.test(testPath) || regex.test('/' + testPath)) {
        return true
      }
    }
  }
  
  return false
}

// 生成目录树
function generateTree(dir, allIgnorePatterns, prefix = '', isLast = true, rootDir = null) {
  if (rootDir === null) {
    rootDir = dir
  }
  
  const relativePath = path.relative(rootDir, dir)
  const lines = []
  
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true })
      .sort((a, b) => {
        // 目录优先，然后按名称排序
        if (a.isDirectory() && !b.isDirectory()) return -1
        if (!a.isDirectory() && b.isDirectory()) return 1
        return a.name.localeCompare(b.name)
      })
    
    const filteredEntries = entries.filter(entry => {
      const entryPath = path.join(relativePath, entry.name)
      return !shouldIgnore(entryPath, allIgnorePatterns)
    })
    
    filteredEntries.forEach((entry, index) => {
      const isLastEntry = index === filteredEntries.length - 1
      const connector = isLastEntry ? '└── ' : '├── '
      const newPrefix = prefix + (isLastEntry ? '    ' : '│   ')
      
      if (entry.isDirectory()) {
        lines.push(prefix + connector + entry.name + '/')
        const subDir = path.join(dir, entry.name)
        const subLines = generateTree(subDir, allIgnorePatterns, newPrefix, isLastEntry, rootDir)
        lines.push(...subLines)
      } else {
        lines.push(prefix + connector + entry.name)
      }
    })
  } catch (error) {
    lines.push(prefix + '    [无法访问]')
  }
  
  return lines
}

// 主函数
function main() {
  console.log('🌲 开始生成目录树...\n')
  
  // 获取执行目录
  const rootDir = process.cwd()
  console.log(`📁 扫描目录: ${rootDir}\n`)
  
  // 收集所有 .gitignore 规则
  console.log('📋 收集 .gitignore 规则...')
  const gitignorePatterns = collectAllGitignores(rootDir)
  
  if (gitignorePatterns.length > 0) {
    console.log(`   找到 ${gitignorePatterns.length} 个 .gitignore 文件`)
    gitignorePatterns.forEach(({ dir, patterns }) => {
      console.log(`   - ${dir}: ${patterns.length} 条规则`)
    })
  } else {
    console.log('   未找到 .gitignore 文件')
  }
  
  // 添加自定义忽略规则
  if (CUSTOM_IGNORES.length > 0) {
    console.log(`\n📋 应用自定义忽略规则: ${CUSTOM_IGNORES.length} 条`)
    gitignorePatterns.unshift({
      dir: '.',
      patterns: CUSTOM_IGNORES
    })
  }
  
  // 生成目录树
  console.log('\n🔍 扫描目录结构...')
  const rootName = path.basename(rootDir)
  const treeLines = [rootName + '/', ...generateTree(rootDir, gitignorePatterns)]
  const treeContent = treeLines.join('\n')
  
  // 解析输出路径（命令行参数优先）
  const outputFile = process.argv[2] || OUTPUT_FILE
  const outputPath = path.isAbsolute(outputFile) 
    ? outputFile 
    : path.resolve(rootDir, outputFile)
  
  console.log(`\n📝 输出配置: ${process.argv[2] ? '命令行参数' : '默认配置'}`)
  console.log(`   目标路径: ${outputPath}`)
  
  // 确保输出目录存在
  const outputDir = path.dirname(outputPath)
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }
  
  // 写入文件
  fs.writeFileSync(outputPath, treeContent, 'utf-8')
  
  console.log(`\n✅ 目录树已生成！`)
  console.log(`📄 输出文件: ${outputPath}`)
  console.log(`📊 统计: ${treeLines.length} 行\n`)
  
  // 预览前20行
  console.log('📋 预览（前20行）:')
  console.log('─'.repeat(50))
  console.log(treeLines.slice(0, 20).join('\n'))
  if (treeLines.length > 20) {
    console.log('...')
    console.log(`（还有 ${treeLines.length - 20} 行）`)
  }
  console.log('─'.repeat(50))
}

// 错误处理
try {
  main()
} catch (error) {
  console.error('\n❌ 生成失败:', error.message)
  process.exit(1)
}
