import argparse
from random import randint
import json

# Parser getting the number of barcharts to generate with the future json
parser = argparse.ArgumentParser()
parser.add_argument('--number_barcharts', type=int, default=10, help='number of barcharts that we want to generate with this data')
opt = parser.parse_args()

# X ticks used in the future bar charts
letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z']

# Number of images that we want to generate from the data that will be generated
number_images = opt.number_barcharts

# File to store the future json in
plot_data = {}

# Filling plot_data with random values
for i in range(number_images):
    number_letters = randint(1, len(letters)) # Y values range from 0 to 9 included
    x_values = [i for i in range(len(letters[0:number_letters]))]
    y_values = [randint(0, 100) for x in letters[0:number_letters]]
    plot_data[str(i)]={"x_values":x_values,"y_values":y_values,"x_ticks":letters[0:number_letters]}

# Export the json
with open('barchart_data.json', 'w') as outfile:
    json.dump(plot_data, outfile)
