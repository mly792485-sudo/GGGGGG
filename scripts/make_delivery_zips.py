from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile

root = Path('/home/ubuntu/noor-work')
out = Path('/home/ubuntu')

common = [
    'src', 'public', 'scripts', 'package.json', 'package-lock.json',
    'index.html', 'tsconfig.json', 'vite.config.ts', 'capacitor.config.json',
    'metadata.json', '.env.example', 'server.ts', 'README.md',
    'BUILD-README-AR.md', 'qa-findings.md', '.github',
]

def existing_paths(items):
    for item in items:
        path = root / item
        if path.is_file():
            yield path
        elif path.is_dir():
            for child in sorted(path.rglob('*')):
                if child.is_file() and 'node_modules' not in child.parts:
                    yield child

def write_zip(filename, extra):
    entries = list(existing_paths(common + extra))
    destination = out / filename
    with ZipFile(destination, 'w', compression=ZIP_DEFLATED, compresslevel=6) as archive:
        for path in entries:
            archive.write(path, path.relative_to(root).as_posix())
    print(f'{destination}: {destination.stat().st_size} bytes, {len(entries)} files')

write_zip('noor-al-islam-ios-xcode.zip', ['ios'])
write_zip('noor-al-islam-android-project.zip', ['android'])
write_zip('noor-al-islam-full-fixed.zip', ['ios', 'android', 'dist'])
