import json
import os
import re
from collections import defaultdict
from typing import cast

from bs4 import BeautifulSoup, Tag

# 读取 index.html 文件
with open("index.html", "r", encoding="utf-8") as f:
    html = f.read()

soup = BeautifulSoup(html, "html.parser")

# 只查找 chooser 区域
chooser_section = soup.find("section", {"id": "chooser"})
if not chooser_section or not isinstance(chooser_section, Tag):
    raise RuntimeError("No chooser section found in index.html")

# 获取所有支持的animation类型
supported_animations = []
animation_checkboxes = chooser_section.find_all("input", {"name": "animation"})
for checkbox in animation_checkboxes:
    if not isinstance(checkbox, Tag):
        continue
    animation_id = checkbox.get("id")
    if animation_id:
        animation_id = cast(str, animation_id)
        # 从id中提取animation名称 (例如: animation-walk -> walk)
        animation_name = animation_id.replace("animation-", "")
        supported_animations.append(animation_name)

# 读取sheet_definitions目录下的所有JSON文件
sheet_definitions = {}
sheet_definitions_dir = "sheet_definitions"
for filename in os.listdir(sheet_definitions_dir):
    if filename.endswith(".json"):
        with open(
            os.path.join(sheet_definitions_dir, filename), "r", encoding="utf-8"
        ) as f:
            try:
                data = json.load(f)
                type_name = data.get("type_name")
                if type_name:
                    sheet_definitions[type_name] = data
            except json.JSONDecodeError:
                print(f"Error parsing {filename}")
                continue

params = defaultdict(list)

for input_tag in chooser_section.find_all("input", {"type": "radio"}):
    if not isinstance(input_tag, Tag):
        continue

    name = input_tag.get("name")
    variant = input_tag.get("variant")
    parent = input_tag.get("parentname")
    value = input_tag.get("value")
    id_ = input_tag.get("id")
    match_body_color = input_tag.get("matchbodycolor")

    # 只统计有 name 和 variant 的
    if name and (variant or value):
        param_data = {
            "id": id_,
            "parentName": parent,
            "variant": variant,
            "value": value,
            "matchBodyColor": match_body_color,
        }

        # 从sheet_definitions中获取支持的animation
        param_data = cast(dict, param_data)
        if name in sheet_definitions:
            animations = sheet_definitions[name].get("animations", [])
            if animations:
                param_data["supportedAnimations"] = animations
            else:
                param_data["supportedAnimations"] = supported_animations
        else:
            # 如果在sheet_definitions中找不到定义，默认支持所有animation
            param_data["supportedAnimations"] = supported_animations

        params[name].append(param_data)

# 输出参数字典
# 保存到文件
with open("chooser_params.json", "w", encoding="utf-8") as f:
    json.dump(params, f, indent=2, ensure_ascii=False)
