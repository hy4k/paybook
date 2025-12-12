import re

with open('index.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Find strings in double or single quotes
strings = re.findall(r'["\']([a-z_]+)["\']', content)

# Filter for likely table names (longer than 3 chars, maybe has underscore or is a common word)
candidates = set()
for s in strings:
    if len(s) > 3:
        candidates.add(s)

print("\n".join(sorted(list(candidates))))
