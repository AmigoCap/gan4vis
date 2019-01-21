import matplotlib.pyplot as plt
import json

# Load barchart_data.json
with open('barchart_data.json') as json_data:
    data = json.load(json_data)

# Generate simple bar charts using the data
for x in data.keys():
    x_values = data[x]['x_values']
    y_values = data[x]['y_values']
    x_ticks = data[x]['x_ticks']
    fig = plt.figure(int(x),figsize=(5,5)) # The size of the pictures is set to 500 x 500
    plt.bar(x_values, y_values)
    plt.xticks(x_values, x_ticks)
    fig.savefig('output/barchart{}.jpg'.format(x))
    plt.close('all')
