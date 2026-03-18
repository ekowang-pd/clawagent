# Memory Extractor Skill
# 自动从对话中提取关键记忆并持久化

 name: memory-extractor
version: 1.0.0
description: 自动提取对话中的显著信息，生成结构化记忆
author:小七

## 记忆架构

```
memory/
├── raw/                    # 📁 原始记忆（按日期）
│   └── 2026-03-02.md
├── working/                # 📁 工作记忆（处理中）
│   └── daily-evolution-2026-03-02.md
├── longterm/               # 📁 长期记忆（结构化JSON）
│   ├── _meta.json          # 元数据和统计
│   ├── facts.json          # 事实记忆
│   ├── decisions.json      # 决策记录
│   └── preferences.json    # 用户偏好
├── profile/                # 📁 用户画像
│   └── user.md
└── index/                  # 📁 索引层
    ├── chronological.json  # 时间索引
    └── tags.json           # 标签索引
```

## 记忆类型定义

### 1. 原始记忆 (Raw Memory)
- **存储位置**: `raw/YYYY-MM-DD.md`
- **内容**: 每日完整对话日志
- **格式**: Markdown，时间戳+对话内容
- **生命周期**: 永久保留，作为溯源依据

### 2. 工作记忆 (Working Memory)
- **存储位置**: `working/daily-evolution-YYYY-MM-DD.md`
- **内容**: 每日提取的记忆草稿，待确认
- **格式**: Markdown，结构化列表
- **生命周期**: 7天后归档或确认后迁移到长期记忆

### 3. 长期记忆 (Long-term Memory)

#### facts.json - 事实记忆
```json
{
  "facts": [
    {
      "id": "fact_001",
      "content": "Eko 是产品经理",
      "category": "user",
      "source": "raw/2026-03-18.md",
      "confidence": 0.95,
      "createdAt": "2026-03-18T10:30:00+08:00",
      "updatedAt": "2026-03-18T10:30:00+08:00",
      "accessCount": 3
    }
  ]
}
```

#### decisions.json - 决策记录
```json
{
  "decisions": [
    {
      "id": "dec_001",
      "content": "选择 Kimi k2.5 作为主要模型",
      "context": "评估了多个模型后决定",
      "alternatives": ["GPT-4", "Claude 3.5"],
      "outcome": "运行良好",
      "createdAt": "2026-03-13T08:35:00+08:00"
    }
  ]
}
```

#### preferences.json - 用户偏好
```json
{
  "preferences": [
    {
      "id": "pref_001",
      "content": "喜欢简洁直接的回复",
      "type": "communication",
      "strength": "strong",
      "createdAt": "2026-03-18T14:20:00+08:00",
      "confirmedCount": 2
    }
  ]
}
```

### 4. 用户画像 (Profile)
- **存储位置**: `profile/user.md`
- **内容**: 用户基本信息、偏好汇总、重要日期
- **更新频率**: 每周自动更新

### 5. 索引层 (Index)
- **chronological.json**: 按时间排序的记忆索引
- **tags.json**: 标签体系和关联关系

## 使用方式

### 手动提取
```
老大: 提取刚才的记忆
小七: 正在分析对话... 已提取 3 条记忆：
   - [事实] Eko 正在开发外贸平台
   - [决策] 使用 Kimi k2.5 模型
   - [偏好] 喜欢简洁回复
   已写入 working/daily-evolution-2026-03-18.md
```

### 自动提取 (Cron)
每日 02:00 自动处理前一天的对话

### 记忆确认
```
小七: 检测到以下记忆待确认：
   1. "Eko 喜欢晚上工作" [确认/修改/忽略]
   2. "项目截止时间是月底" [确认/修改/忽略]
```

## 脚本

- `extract.py` - 从 raw/ 提取记忆
- `consolidate.py` - 整合 working/ 到 longterm/
- `query.py` - 查询记忆
