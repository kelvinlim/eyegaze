import glob
import os
import shutil
from PIL import Image

"""
copy and rename files as needed
"""

# Define a scale factor for resizing the images.
# 1.0 means original size, 0.5 means half the size, 2.0 means double the size.
scale_factor = 0.5

# get list of all the png images
path = os.path.join('eyegaze_ai_stim', 'eyegaze')
try:
    filelist = glob.glob('eyegaze_ai_stim/**/*.png', recursive=True)
    if not filelist:
        print("Warning: No PNG files were found in the specified directory.")
except Exception as e:
    print(f"An error occurred while searching for files: {e}")
    filelist = []


new_dir = "images"

# create directory new_dir if it doesn't exist
if not os.path.exists(new_dir):
    os.makedirs(new_dir)

# loop through all the images, resize them, and save them into the directory specified by new_dir
for fullpath in filelist:
    try:
        # The basename gets the filename from the full path
        filename = os.path.basename(fullpath)
        
        # Open the image
        with Image.open(fullpath) as img:
            # Calculate the new dimensions
            original_width, original_height = img.size
            new_width = int(original_width * scale_factor)
            new_height = int(original_height * scale_factor)
            
            # Resize the image
            resized_img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
            
            # Define the full path for the new (resized) image
            new_filepath = os.path.join(new_dir, filename)
            
            # Save the resized image to the new directory
            resized_img.save(new_filepath)
            
            print(f"Successfully resized and saved '{filename}' to '{new_dir}'")

    except FileNotFoundError:
        print(f"Error: The source file was not found at '{fullpath}'")
    except Exception as e:
        print(f"An error occurred while processing {fullpath}: {e}")