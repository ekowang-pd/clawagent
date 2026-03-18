#!/usr/bin/env python3
"""
Memory Extractor - 自动从对话日志中提取结构化记忆
"""

import json
import re
import os
from datetime import datetime, timedelta
from pathlib import Path
from typing import List, Dict, Any

# 记忆目录
MEMORY_DIR = Path("/root/.openclaw/workspace/memory")
RAW_DIR = MEMORY_DIR / "raw"
WORKING_DIR = MEMORY_DIR / "working"
LONGTERM_DIR = MEMORY_DIR / "longterm"
PROFILE_DIR = MEMORY_DIR / "profile"
INDEX_DIR = MEMORY_DIR / "index"

def load_json(path: Path) -> dict:
    """加载 JSON 文件，不存在则返回空结构"""
    if not path.exists():
        return {}
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_json(path: Path, data: dict):
    """保存 JSON 文件"""
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def generate_id(prefix: str) -> str:
    """生成唯一 ID"""
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    return f"{prefix}_{timestamp}"

def extract_facts_from_text(text: str) -> List[Dict[str, Any]]:
    """从文本中提取事实（简化版，实际应调用 LLM）"""
    facts = []
    
    # 简单模式匹配示例（实际应用应使用 LLM）
    patterns = [
        # 职业/身份
        (r'(\w+)\s*是\s*(产品经理|工程师|设计师|开发者)', 'user', 0.9),
        # 项目名称
        (r'(开发|做|负责)\s*(\w+平台|\w+项目|\w+系统)', 'project', 0.8),
        # 技术栈
        (r'使用\s*(Kimi|GPT|Claude|OpenClaw)', 'tech', 0.85),
    ]
    
    for pattern, category, confidence in patterns:
        matches = re.findall(pattern, text)
        for match in matches:
            content = ''.join(match) if isinstance(match, tuple) else match
            facts.append({
                'id': generate_id('fact'),
                'content': content,
                'category': category,
                'confidence': confidence,
                'createdAt': datetime.now().isoformat()
            })
    
    return facts

def process_daily_log(date_str: str) -> Dict[str, Any]:
    """处理单日日志"""
    log_path = RAW_DIR / f"{date_str}.md"
    if not log_path.exists():
        return {'status': 'skipped', 'reason': 'no log file'}
    
    with open(log_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 提取事实
    facts = extract_facts_from_text(content)
    
    # 生成工作记忆文件
    working_file = WORKING_DIR / f"daily-evolution-{date_str}.md"
    working_content = f"""# 每日记忆提取 - {date_str}

## 提取时间
{datetime.now().isoformat()}

## 提取的事实 ({len(facts)} 条)

"""
    for fact in facts:
        working_content += f"""### {fact['id']}
- **内容**: {fact['content']}
- **类别**: {fact['category']}
- **置信度**: {fact['confidence']}
- **状态**: 🟡 待确认

"""
    
    working_content += """
## 待办
- [ ] 人工确认上述事实
- [ ] 确认后迁移到 longterm/facts.json
"""
    
    with open(working_file, 'w', encoding='utf-8') as f:
        f.write(working_content)
    
    return {
        'status': 'success',
        'facts_extracted': len(facts),
        'working_file': str(working_file)
    }

def consolidate_to_longterm():
    """将已确认的工作记忆迁移到长期记忆"""
    # 加载现有长期记忆
    facts_file = LONGTERM_DIR / "facts.json"
    facts_data = load_json(facts_file)
    if 'facts' not in facts_data:
        facts_data = {'facts': [], '_meta': {'count': 0}}
    
    # 扫描 working/ 目录
    confirmed_facts = []
    for working_file in WORKING_DIR.glob("daily-evolution-*.md"):
        with open(working_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 检查是否有已确认的事实（实际应用应解析 Markdown）
        if "[x] 人工确认" in content or "状态**: 🟢 已确认" in content:
            # 提取并添加到长期记忆
            pass  # 简化版，实际应解析并迁移
    
    save_json(facts_file, facts_data)
    return {'consolidated': len(confirmed_facts)}

def main():
    """主函数"""
    # 确保目录存在
    for dir_path in [RAW_DIR, WORKING_DIR, LONGTERM_DIR, PROFILE_DIR, INDEX_DIR]:
        dir_path.mkdir(parents=True, exist_ok=True)
    
    # 处理昨日日志
    yesterday = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")
    result = process_daily_log(yesterday)
    
    # 如果是周日，执行整合
    if datetime.now().weekday() == 6:  # Sunday
        consolidate_result = consolidate_to_longterm()
        result['consolidate'] = consolidate_result
    
    # 输出结果（用于 cron 汇报）
    print(json.dumps(result, ensure_ascii=False, indent=2))

if __name__ == "__main__":
    main()
