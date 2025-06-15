import re
from collections import defaultdict
from bs4 import BeautifulSoup, Tag

# 读取 index.html 文件
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

soup = BeautifulSoup(html, 'html.parser')

# 只查找 chooser 区域
chooser_section = soup.find('section', {'id': 'chooser'})
if not chooser_section or not isinstance(chooser_section, Tag):
    raise RuntimeError('No chooser section found in index.html')

params = defaultdict(list)

for input_tag in chooser_section.find_all('input', {'type': 'radio'}):
    if not isinstance(input_tag, Tag):
        continue
    name = input_tag.get('name')
    variant = input_tag.get('variant')
    parent = input_tag.get('parentname')
    value = input_tag.get('value')
    id_ = input_tag.get('id')
    match_body_color = input_tag.get('matchbodycolor')
    # 只统计有 name 和 variant 的
    if name and (variant or value):
        params[name].append({
            'id': id_,
            'parentName': parent,
            'variant': variant,
            'value': value,
            'matchBodyColor': match_body_color
        })

# 输出参数字典
import json
# 保存到文件
with open('chooser_params.json', 'w', encoding='utf-8') as f:
    json.dump(params, f, indent=2, ensure_ascii=False)