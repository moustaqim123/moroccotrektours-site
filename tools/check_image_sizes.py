from PIL import Image
files = [
    'images/hero_home.jpg',
    'images/hero_tours.jpg',
    'images/hero_customize.jpg',
    'images/hero_about.jpg',
    'images/hero_guide.jpg',
    'images/team4.jpg',
    'images/guide_culture_flavors.jpg'
]
for f in files:
    try:
        with Image.open(f) as im:
            print(f, im.size, im.mode)
    except Exception as e:
        print(f, 'ERROR:', e)
