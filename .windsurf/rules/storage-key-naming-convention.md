---
trigger: model_decision
description: 当需要将数据存储在indexdb或者localstorage时加载该规则
---

## 📋 规范核心要点

### 命名格式
```
{module}_{type}_{id?}_{timestamp?}
```

### 关键规则
1. **模块前缀强制** - `novel_`, `user_`, `general_`, `cache_`
2. **类型标识清晰** - `meta`, `source`, `config`, `backup`
3. **ID格式统一** - 推荐使用 `sub-1234-abc` 带前缀格式
4. **下划线分隔** - 全部使用下划线，禁止驼峰和其他分隔符

### 自动识别逻辑
```typescript
// 系统会自动解析
'novel_source_sub123' 
  → module: 'novel' (📚 小说模块)
  → type: 'data' (实体数据)
  
'novel_source_sub123_backup_1699999999'
  → module: 'novel'
  → type: 'backup' (备份数据)
```

### 实际示例
```typescript
// ✅ 正确
'novel_subscription_sub-1763401832766-hgypexvro'
'novel_source_sub-1763401832766-hgypexvro'
'novel_config'
'user_profile'
'user_history_book-12345'

// ❌ 错误
'subscriptions'                    // 缺少模块前缀
'novelSource_sub123'               // 使用驼峰
'novel-source-sub123'              // 错误分隔符
'novel_sub123'                     // 缺少类型
```

**这样设计后，任何遵循规范的新功能都会自动出现在存储清理页面，无需手动注册！**