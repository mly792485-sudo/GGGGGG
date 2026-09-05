from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
for path in sorted(ROOT.rglob('*')):
    if any(part in {'node_modules', '.git', 'ios', 'dist'} for part in path.parts):
        continue
    if path.suffix.lower() not in {'.png', '.jpg', '.jpeg', '.webp', '.gif', '.heic', '.tiff'}:
        continue
    try:
        with Image.open(path) as im:
            print(f'{path.relative_to(ROOT)}\tformat={im.format}\tsize={im.size}\tmode={im.mode}\tframes={getattr(im, "n_frames", 1)}\tbytes={path.stat().st_size}')
    except Exception as exc:
        print(f'{path.relative_to(ROOT)}\tERROR={exc}')
