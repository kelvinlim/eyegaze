from PIL import Image, ImageDraw

# Image dimensions
width = 512
height = 512
bg_color = (128, 128, 128) # Gray background (standard for psych experiments, or white?)
# Let's check the other images. Usually they are gray or white.
# I'll assume gray (128,128,128) is safer for experiments, or I can make it white.
# The user asked for "same size", didn't specify color.
# Let's make it white background with black cross, or transparent?
# Most standard is gray background. But let's stick to white if unsure, or maybe transparent?
# Let's check the background of Dean_Center.png if possible? No easy way.
# I'll go with a standard white background and black cross.
bg_color = (255, 255, 255) 
cross_color = (0, 0, 0)
cross_length = 50
cross_thickness = 5

img = Image.new('RGB', (width, height), bg_color)
draw = ImageDraw.Draw(img)

# Center coordinates
cx, cy = width // 2, height // 2

# Draw horizontal line
draw.rectangle(
    [cx - cross_length // 2, cy - cross_thickness // 2, cx + cross_length // 2, cy + cross_thickness // 2],
    fill=cross_color
)

# Draw vertical line
draw.rectangle(
    [cx - cross_thickness // 2, cy - cross_length // 2, cx + cross_thickness // 2, cy + cross_length // 2],
    fill=cross_color
)

img.save('images/fixation_cross.png')
print("Created images/fixation_cross.png")
