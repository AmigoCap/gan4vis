#!/bin/bash
NB_ANIM=$2
DEST_DIR=$1

for index in $(seq 0 $(expr $NB_ANIM - 1));
do
	node bar2donut_img_gen.js $DEST_DIR $index
	echo "Generation $(expr $index + 1) out of $NB_ANIM done"
	./svgtojpg.sh gifs/
	echo "Processing $(expr $index + 1) out of $NB_ANIM done"
done
