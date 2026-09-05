from pathlib import Path

app = Path('/home/ubuntu/noor-work/src/App.tsx')
lines = app.read_text().splitlines(keepends=True)
updated = []
for line in lines:
    if 'icon:' in line and 'className="w-5 h-5"' in line:
        line = line.replace('className="w-5 h-5"', 'className="w-6 h-6"')
    updated.append(line)
text = ''.join(updated)
text = text.replace('className={`w-full ${isEn ? \'text-left\' : \'text-right\'} p-3 sm:p-3.5', 'className={`w-full ${isEn ? \'text-left\' : \'text-right\'} p-4 sm:p-5')
text = text.replace('className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl', 'className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl')
text = text.replace('className="w-7 h-7 sm:w-8 sm:h-8 rounded-full', 'className="w-8 h-8 sm:w-9 sm:h-9 rounded-full')
app.write_text(text)

css = Path('/home/ubuntu/noor-work/src/index.css')
css_text = css.read_text()
css_text = css_text.replace('font-size: 15px;', 'font-size: 16px;', 1)
css_text = css_text.replace('padding-left: 10px !important;', 'padding-left: 12px !important;', 1)
css_text = css_text.replace('padding-right: 10px !important;', 'padding-right: 12px !important;', 1)
css_text = css_text.replace('width: 38px;\n    height: 38px;', 'width: 44px;\n    height: 44px;', 1)
css_text = css_text.replace('font-size: 0.9rem !important;', 'font-size: 0.95rem !important;', 1)
css_text = css_text.replace('font-size: 14px;', 'font-size: 15px;', 1)
css_text = css_text.replace('width: 34px;\n    height: 34px;', 'width: 40px;\n    height: 40px;', 1)
css_text = css_text.replace('font-size: 0.82rem !important;', 'font-size: 0.88rem !important;', 1)
css.write_text(css_text)
print('updated app icons and compact phone sizing')
