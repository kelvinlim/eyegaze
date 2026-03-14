#!/bin/bash
# Convert original_pics BMPs to PNGs for use in the eyegaze task.
# Renames from {Gaze}_{Model}.bmp to {Model}_{Gaze}.png
# Uses the non-"1" suffix files (300x400 resolution).
#
# Models selected to maintain 3M/3F distribution:
#   Male:   Dean, Bro2, Raymond
#   Female: Glo, Sherry, Oli

MODELS=("Dean" "Raymond" "Glo" "Oli" "Bro2" "Sherry")
GAZES=("Center" "L5" "R5" "L10" "R10" "L15" "R15" "L20" "R20" "L25" "R25" "L30" "R30")

SRC_DIR="original_pics"
DST_DIR="images_orig"

mkdir -p "$DST_DIR"

count=0
for model in "${MODELS[@]}"; do
    for gaze in "${GAZES[@]}"; do
        src="${SRC_DIR}/${gaze}_${model}.bmp"
        dst="${DST_DIR}/${model}_${gaze}.png"
        if [ -f "$src" ]; then
            sips -s format png "$src" --out "$dst" > /dev/null 2>&1
            ((count++))
        else
            echo "MISSING: $src"
        fi
    done
done

# Copy fixation cross
cp images_ai/fixation_cross.svg "$DST_DIR/" 2>/dev/null

echo "Converted $count images to $DST_DIR/"
