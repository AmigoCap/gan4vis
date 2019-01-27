# gan4vis - Style Transfer Matplotlib - D3

## Style Transfer Database

La première base d'entrainement générée est constituée de paires de bar charts. L'entrée correspond à un bar chart généré par matplotlib. La sortie correspond à un bar chart généré par D3.

## Requirements

``` sh
pip3 install matplotlib
pip3 install json
```

## Database Generation

Aller dans le dossier "data/"

``` sh
cd data
```

### Data Generation

Afin d'obtenir des paires entrée / sortie cohérentes, elles doivent s'appuyer sur les mêmes données. Un premier script python permet de générer un json "barchart_data.json". Pour générer un json de données, lancer la commande suivante en adaptant "--number_barcharts".

``` sh
python3 barchart_data_generation.py --number_barcharts 100
```

### Matplotlib Generation

Nous générons tout d'abord les images d'entrée (500x500) avec Python et Matplotlib dans le dossier "output/"

``` sh
python3 barchart_matplotlib_generation.py
```

### D3 Generation

Nous générons ensuite les images de sortie (500x500) avec Node et D3 dans le dossier "output/".

``` sh
node barchart_d3_generation.js
```

Les fichiers générées sont des svg. Lancer le script pré-existant suivant pour effectuer la conversion.

``` sh
sh svgtojpg.sh
```

### Preprocess

Concaténer images de sortie et d'entrée sous la forme d'image (1000x500) en lançant le script pré-existant suivant.

``` sh
python3 preprocess.py
```
