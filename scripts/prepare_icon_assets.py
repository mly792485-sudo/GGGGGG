from pathlib import Path
from PIL import Image

root = Path('/home/ubuntu/noor-work')
source = root / 'src/assets/images/noor-al-islam-logo-square.png'
image = Image.open(source).convert('RGB')

# Web/store master copies.
for destination, size in [
    (root / 'public/app-icon.png', 1024),
    (root / 'public/apple-touch-icon.png', 180),
    (root / 'public/favicon.png', 192),
    (root / 'ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png', 1024),
]:
    destination.parent.mkdir(parents=True, exist_ok=True)
    image.resize((size, size), Image.Resampling.LANCZOS).save(destination, format='PNG', optimize=True)

android_sizes = {
    'mipmap-mdpi': 48,
    'mipmap-hdpi': 72,
    'mipmap-xhdpi': 96,
    'mipmap-xxhdpi': 144,
    'mipmap-xxxhdpi': 192,
}
for folder, size in android_sizes.items():
    directory = root / 'android/app/src/main/res' / folder
    directory.mkdir(parents=True, exist_ok=True)
    resized = image.resize((size, size), Image.Resampling.LANCZOS)
    for name in ('ic_launcher.png', 'ic_launcher_round.png'):
        resized.save(directory / name, format='PNG', optimize=True)

print('prepared icon assets from', source)
