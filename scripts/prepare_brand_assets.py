from pathlib import Path
from PIL import Image

PROJECT = Path('/home/ubuntu/noor-working')
SOURCE = Path('/home/ubuntu/webdev-static-assets/noor-al-islam-logo-square.png')

# Android launcher sizes. The source is already a square, so only high-quality
# downsampling is needed; no creative alteration is applied here.
launcher_sizes = {
    'mipmap-mdpi': 48,
    'mipmap-hdpi': 72,
    'mipmap-xhdpi': 96,
    'mipmap-xxhdpi': 144,
    'mipmap-xxxhdpi': 192,
}

# Capacitor's legacy splash drawable is a full-screen bitmap. Use the real
# logo on a dark brand background instead of the generated blue placeholder.
splash_sizes = {
    'drawable-port-mdpi': (320, 480),
    'drawable-port-hdpi': (480, 800),
    'drawable-port-xhdpi': (720, 1280),
    'drawable-port-xxhdpi': (1080, 1920),
    'drawable-port-xxxhdpi': (1440, 2560),
    'drawable-land-mdpi': (480, 320),
    'drawable-land-hdpi': (800, 480),
    'drawable-land-xhdpi': (1280, 720),
    'drawable-land-xxhdpi': (1920, 1080),
    'drawable-land-xxxhdpi': (2560, 1440),
}

source = Image.open(SOURCE).convert('RGBA')

# For launcher icons, keep the supplied square image intact and export with alpha.
for folder, size in launcher_sizes.items():
    out_dir = PROJECT / 'android/app/src/main/res' / folder
    out_dir.mkdir(parents=True, exist_ok=True)
    icon = source.resize((size, size), Image.Resampling.LANCZOS)
    icon.save(out_dir / 'ic_launcher.png', optimize=True)
    icon.save(out_dir / 'ic_launcher_round.png', optimize=True)
    icon.save(out_dir / 'ic_launcher_foreground.png', optimize=True)

# Keep the same source logo in iOS app-icon and Splash image slots.
ios_icon_dir = PROJECT / 'ios/App/App/Assets.xcassets/AppIcon.appiconset'
ios_icon_dir.mkdir(parents=True, exist_ok=True)
source.resize((1024, 1024), Image.Resampling.LANCZOS).save(
    ios_icon_dir / 'AppIcon-512@2x.png', optimize=True
)

# For splash screens, compose the logo centered on a Noor Al Islam dark green canvas.
# This removes the old white screen and blue mark while keeping the launch frame readable.
brand_bg = (4, 9, 10, 255)
for folder, (width, height) in splash_sizes.items():
    out_dir = PROJECT / 'android/app/src/main/res' / folder
    out_dir.mkdir(parents=True, exist_ok=True)
    canvas = Image.new('RGBA', (width, height), brand_bg)
    max_logo = int(min(width, height) * 0.46)
    logo = source.resize((max_logo, max_logo), Image.Resampling.LANCZOS)
    left = (width - max_logo) // 2
    top = (height - max_logo) // 2
    canvas.alpha_composite(logo, (left, top))
    canvas.convert('RGB').save(out_dir / 'splash.png', optimize=True)

# Capacitor's base style references drawable/splash directly on some Android versions.
# Keep that fallback branded too, instead of the old white 480x320 placeholder.
base_splash = Image.new('RGBA', (480, 320), brand_bg)
base_logo_size = int(min(480, 320) * 0.46)
base_logo = source.resize((base_logo_size, base_logo_size), Image.Resampling.LANCZOS)
base_splash.alpha_composite(base_logo, ((480 - base_logo_size) // 2, (320 - base_logo_size) // 2))
base_splash.convert('RGB').save(PROJECT / 'android/app/src/main/res/drawable/splash.png', optimize=True)

# iOS Splash.imageset is square and keeps the native launch screen consistent.
ios_splash_dir = PROJECT / 'ios/App/App/Assets.xcassets/Splash.imageset'
ios_splash_dir.mkdir(parents=True, exist_ok=True)
for filename, size in {
    'splash-2732x2732-2.png': 910,
    'splash-2732x2732-1.png': 1820,
    'splash-2732x2732.png': 2732,
}.items():
    canvas = Image.new('RGBA', (size, size), brand_bg)
    logo_size = int(size * 0.46)
    logo = source.resize((logo_size, logo_size), Image.Resampling.LANCZOS)
    offset = (size - logo_size) // 2
    canvas.alpha_composite(logo, (offset, offset))
    canvas.convert('RGB').save(ios_splash_dir / filename, optimize=True)

print('Prepared Android and iOS launcher and splash assets.')
