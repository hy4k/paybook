import re

with open('index.js', 'r', encoding='utf-8') as f:
    content = f.read()

keywords = ['staff', 'employee', 'payroll', 'salary', 'attendance', 'advance', 'loan', 'designation']
found = set()

for k in keywords:
    if k in content.lower():
        found.add(k)

print("Found keywords:", found)

# Extract typical supabase calls structure if possible
# .from('table').select('col')
matches = re.findall(r"from\(['\"](\w+)['\"]\)", content)
print("Supabase from() calls:", set(matches))
