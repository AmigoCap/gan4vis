# gan4vis - Style Transfer D3 - D3 with style

## Style Transfer Database

La base d'entrainement générée est constituée de paires de bar charts. L'entrée correspond à un bar chart généré par en D3 avec seulement les bares. La sortie correspond à un bar chart généré par en D3 et la librairie rough.js, dans lequel a été ajouté axes et couleurs.

## Requirements

``` sh
pip3 install matplotlib
pip3 install json
```

``` sh
npm install --save roughjs
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

### Images Generation

Nous générons tout d'abord les images d'entrée et de sortie(500x500) avec Node et D3 dans le dossier "output/".

``` sh
node barchart_simple_d3_generation.js
node barchart_rough_generation.js
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
