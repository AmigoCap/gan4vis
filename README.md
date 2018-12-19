# gan4vis

## Installation

### Requirements

This application is designed to be used with python > 3.5 on linux.

Pip requeriements are available in requirements.txt at the root of this repository.

This file can be used a it follows :

``` sh 
pip3 install -r requirements.txt

```

Additionnal libraries may be needed.




### Dataset

The dataset must be a folder containing 3 folders ['test','train','val'] containg images (jpg).

Dataset1 architecture:

├── dataset1/ <br/>
│   ├── train <br/>
|   ├── test <br/>
│   └── val<br/> 

The dataset folder must be present into the 'data' folder. Its name is will latter be used to start a training on it.


### Training

Using the folowing command line will start a traning over te dataset 'dataset1' 

``` sh 
python pix2pix.py --dataset_name 'dataset1' 

```

Other parameters can be changed, such as : n_epochs, batch_size, lr,  to name a few.


### Dataset generation

Dataset can be generated using node js scripts as 'vertical.js' in data folder.


To generate a dataset, use the following command line.

``` sh 
node vertical.js

```
Some node packages may need to be installed as described in the following.

``` sh 
npm install d3

```

The outcome will be in the output folder.

Parameters, such as the dataset size can be changed directly in the script.

Once the svg are generated, they can be transgorm into jpg (format that the GAN uses), using svgtojpg.sh as it follows :
``` sh 
./svgtojpg.sh

```
The outcome will be in the output folder.

Finally, image labels and inputs are concatened and formated as the model expets using the python script 'preprocess.py'

``` sh 
python preprocess.py

```
The outcome will be in the res folder.

