import re

with open('index.js', 'r', encoding='utf-8') as f:
    content = f.read()

keywords = ['shift', 'agent', 'mission', 'task', 'note', 'inventory', 'stock', 'product']
found = set()

for k in keywords:
    if k in content.lower():
        found.add(k)

print("Found keywords:", found)
