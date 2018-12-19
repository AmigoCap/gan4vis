#!/bin/bash
cd output
mogrify -format jpg *.svg 
rm -rf *.svg 
cd ..
