#!/bin/bash
cd $1
if [[ "$OSTYPE" == "msys" ]]; then
	exec_name="magick.exe mogrify"
else
	exec_name="mogrify"
fi
$exec_name -format jpg *.svg 
rm -rf *.svg 
cd ..
