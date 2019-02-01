#!/bin/bash
cd $1
mogrify -format jpg *.svg 
rm -rf *.svg 
cd ..
