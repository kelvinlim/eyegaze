import glob
import os
import shutil

"""
copy and rename files as needed
"""
# get list of all the png images
path = os.path.join('eyegaze_ai_stim','eyegaze')
filelist = glob.glob('eyegaze_ai_stim/**/*.png', recursive=True)

new_dir = "images"

# create directory new_dir if it doesn't exist
if not os.path.exists(new_dir):
    os.makedirs(new_dir)

# loop through all the images and copy them into the directory specified by new_dir
for fullpath in filelist:

    # copy file into the directory new_dir filename basename
    
    try:
        shutil.copy(fullpath, new_dir)
        # The basename gets the filename from the full path
        filename = os.path.basename(fullpath)
        print(f"Successfully copied '{filename}' to '{new_dir}'")

    except FileNotFoundError:
        print(f"Error: The source file was not found at '{fullpath}'")
    except Exception as e:
        print(f"An error occurred: {e}")
    pass    
pass
