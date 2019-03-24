# Documentation

Le fichier suivant détail le fonctionnement de l'application ainsi que la configuration du serveur Digital Ocean, à l'issue du mois de mars 2019.

## Application

### Structure

Le [site](https://gan4vis.net) actuel est constitué de quatre pages web. 

* [/index](https://gan4vis.net/index) : accueil accessible à [https://gan4vis.net](https://gan4vis.net) permettant d'effectuer le transfert de style.
* [/process](https://gan4vis.net/process) : page accessible depuis l'accueil détaillant le processus de création de la plateforme
* [/dashboard](https://gan4vis.net/dashboard) : page non accessible depuis l'accueil, uniquement accessible à [https://gan4vis.net/dashboard](https://gan4vis.net/dashboard) présentant un tableau de bord d'utilisation de la fonctionnalité transfert de style.
* [/transitions]() : page seulement accessible à 

L'application permettant de gérer ce site a une structure MVT (Model View Template). Elle fait appel à un ensemble de fichiers statiques ainsi qu'une base de donnée SQLite. Ci-dessous un schéma de l'architecture de l'application :

<p align="center">
<img src="server/app/static/utilitaries_images/structure.png" width="75%">
</p>

Sur le schéma précédent, les templates sont en bleu. En blanc se trouvent les View (routes.py) et les Model (models.py). Un fichier python appelé neural_style.py permet le chargement et l'application des modèles de transfert de style utilisés.

### Données

Les données manipulées par l'application sont de trois formes, modèles, images et base SQLite

**Modèles**

Les modèles sont des fichiers .pth stockés dans le dossier gan4vis/server/app/gan/saved_models/. Nous pouvons générer les modèles pour l'application de transfert de style comme pour celle de transitions. [William]

**Images**

Les images stockées sur le serveur correspondent aux images générées lors de chaque transfer de style ainsi que les images utiles dans les affichages divers. Toutes les images se trouve dans les sous dossiers de gan4vis/server/app/static.

**Base SQLite**

Nous avons opté pour une base SQLite pour enregistrée les configurations des transferts de style réalisés. Cette base correspond au fichier gan4vis/server/app.db. Elle est constituée d'une unique table appelée transfer. Nous avons fait le choix d'utiliser [SQLAlchemy](https://www.sqlalchemy.org/) pour travailler avec la base dans notre application. La structure de la base est reliée au fichier "models.py". Celui-ci defini une class appelée "Transfer" qui correspond à la table de la base. Les colonnes de cette table correspondent aux aspects des transferts de style dont nous souhaitons garder la trace. Ci-dessous un exemple d'entrée de la table.

<p align="center">
<img src="server/app/static/utilitaries_images/database.png" width="100%">
</p>

* **token** : identifiant unique généré automatiquement correspondant à un transfert de style. Cet identifiant permet de nommer l'image et est intégré à l'URL afin de pouvoir partager et recharger un transfert de style. Ce point sera détaillé plus bas.
* **date** : date du transfert de style.
* **model** : modèle utilisé
* **distribution** : distribution utilisée
* **datapoints** : valeurs des points utilisés dans le graphique, reliés par des "_"
* **grid** : type de grille utilisé
* **orientation** : orientation de la figure
* **ratio** : niveau de zoom décidé par l'utilisateur

**Attention** Tout changement dans le fichier "models.py" doit être effectué avec précaution. Tout changement doit être suivi d'une migration avec les étapes suivantes 

```console
$ flask db migrate
$ flask db upgrade
```

Des modifications importantes pourront nécessiter une adaptation des données précédentes et donc une intervention sur la base. Nous renvoyons vers le [tutoriel Flask de Miguel Grinberg](https://blog.miguelgrinberg.com/post/the-flask-mega-tutorial-part-iv-database) pour voir comment accéder et modifier la base de données depuis la ligne de commande.

### Processus

Nous allons à présent détailler le processus à l'oeuvre lors de l'utilisation de chacune des pages web. Nous détaillerons plus particulièrement les opérations liées au transfert de style et à la transition.

**Transfert et transition**

<p align="center">
<img src="server/app/static/utilitaries_images/structure_process.png" width="75%">
</p>

<table>
  <tr>
    <td></td>
    <td>Transfert</td>
    <td>Transition</td>
  </tr>
  <tr>
    <td>1</td>
    <td colspan="2">L'utilisateur se connecte à l'interface de transfert ou de transition.</td>
  </tr>
  <tr>
    <td>2</td>
    <td colspan="2">L'interface est générée par aggrégation de l'information venant du serveur et un ensemble de fichiers (html, js, css et images). L'utilisateur peut alors paramètrer le transfert de style ou la transition.</td>
  </tr>
  <tr>
    <td>3</td>
    <td colspan="2">L'utilisateur clique sur le bouton d'application du transfert de style ou de la transition. Une requête AJAX part alors du serveur contenant les paramètres de l'opération ainsi qu'une chaîne de caractères correspondant à l'image d'entrée.</td>
  </tr>
  <tr>
    <td>4</td>
    <td>Transfert. Une fonction "treatment" présente dans le fichier "routes.py" est alors en charge du transfert de style, un token est défini correspondant à l'opération. La fonction appelle une fonction présente dans "neural_style.py" qui sauvegarde l'image de sortie en la nommant à l'aide du token. 
    <td>-</td>
  </tr>
  <tr>
    <td>5</td>
    <td>Les paramètres d'entée et de sortie du transfert sont sauvegardés dans la base de données grâce au fichier "models.py" en utilisant le token défini précédemment.</td>
    <td>-</td>
  </tr>
  <tr>
    <td>6</td>
    <td colspan="2">Le token de l'opération est envoyé sur le client. Son arrivée sur le client permet une mise à jour de l'URL par jQuery et une mise à jour de l'image de sortie par requête GET de l'image correspondant à l'identifiant au serveur.</td>
  </tr>
</table>

**Dashboard**

Un système de dashboard a été mis en place afin de rendre compte de l'utilisation de la partie transfer de style ouverte au public. Une simple route appelée "dashboard" a été créée. Elle parcourt la base de données afin d'envoyer au client les données d'utilisation. Le client les exploite ensuite à l'aide de D3.js (version 5) afin de créer les graphiques.

**Partage d'URL**

Nous avons souhaité pourvoir partager notre application de transfert de style par URL. Le but étant qu'après avoir généré un transfert, je puisse le partager à quelqu'un qui rechargerait la page à son tour avec toutes les données d'entrée et sortie de l'image initiale. La route "index" est le coeur du processus qui permet cela

```python
@app.route('/index', methods=['GET', 'POST'])
def index():
    token = request.args.get('token')
    app.logger.info("index token={}".format(token))
    dict_transfer = {"token":"placeholder","model":"mosaic.pth","distribution":"random","datapoints":"","grid":"vertical","orientation":"up","ratio":2} # Start ratio at 2 to be able to activate both zooms on page load
    if token:
        transfer = Transfer.query.filter_by(token=token).first()
        dict_transfer = {"token":transfer.token,"model":transfer.model,"distribution":transfer.distribution,"datapoints":transfer.datapoints,"grid":transfer.grid,"orientation":transfer.orientation,"ratio":transfer.ratio}
    return render_template('index.html', title='GAN4VIS', dict_transfer=dict_transfer)
```

Cette route est la fonction déclenchée sur le serveur à chaque fois qu'un utilisateur se rend sur l'URL https://gan4vis.net/index. Bien qu'aucun argument ne soit présent dans la route, la fonction reçoit en réalité systématiquement une information du client. En effet, la ligne : `token = request.args.get('token')` va rechercher une information de l'URL du client du type "y a-t-il un argument "token dans l'URL ?". Ainsi :

* https://gan4vis.net/index : token = None
* https://gan4vis.net/index?token=558af5eb-db76-4f7f-b500-536d123f3b30 : token = 558af5eb-db76-4f7f-b500-536d123f3b30

Par la suite, un dictionaire est initialisé dans la route en fonction de la présence d'information sur le token. Si le token est spécifié, une configuration lui correspondant sera cherchée dans la base de donnée. Sinon une configuration par défaut sera utilisée. Enfin, les codes html et javascript utilisés sur le client on été adaptés afin de fonctionner dans les deux cas. 

## Serveur

À fin mars 2019 le serveur à la configuration suivante : 

* 8 GB Memory 
* 160 GB Disk
* Ubuntu 18.04.1 x64

Nous détaillons ci-dessous les aspects important de la gestion et de la mise en place du serveur

### Accès au serveur

L'accès au serveur se fait par SSH. Nous déconseillons très fortement d'utiliser la console de l'hébergeur depuis un navigateur car les copier-collers fonctionnent mal et toutes les touches du clavier n'y fonctionnent correctement. Depuis une console et avec un accès SSH, il est possible de se connecter en mode root `ssh root@ip-server` ou utilisateur `ssh utilisateur@ip-server`. Nous résumons ci-dessous succintement les étapes nécessaires à la création d'un nouvel utilisateur. 

**1. Créer un nouvel utilisateur**

```console
$ adduser utilisateur
```

**2. Donner l'accès root à l'utilisateur** 
```console
$ usermod -aG sudo utilisateur
```

**3. Configurer le SSH du nouvel utilisateur pour l'accès root** 

Se connecter en root au serveur depuis une console : 

```console
$ ssh root@ip-server
```

Ouvrir le fichier "~/.ssh/authorized_keys" du root :

```console
$ nano ~/.ssh/authorized_keys
```

Puis y ajouter la clé ssh de l'utilisateur. Cette suite d'étape terminée, vérifier que l'utilisateur arrive bien à se connecter en root.

**4. Configurer le SSH du nouvel utilisateur pour accès utilisateur** 

La configuration se fait automatiquement sur demande de l'utilisateur. Il lui suffit d'ouvrir une session dans sa console et de rentrer la ligne suivante. Il aura alors à rentrer le mot de passe root.

```console
$ ssh-copy-id utilisateur@ip-server
```

Les ressources nécessaires à la création d'un utilisateur et à l'administration de ses droits peuvent être trouvées ci-dessous :
* [Server Setup](https://www.digitalocean.com/community/tutorials/initial-server-setup-with-ubuntu-18-04)
* [SSH Connection Setup](https://www.digitalocean.com/community/tutorials/how-to-set-up-ssh-keys-on-ubuntu-1804)

### NGINX

[NGINX](https://fr.wikipedia.org/wiki/NGINX) est la première couche sur laquelle est assise l'application. NGINX permet entre autres la gestion des requêtes. Nous détaillons ci-dessous les étapes nécessaire au paramétrage de NGINX sur une machine Ubuntu 18.04.1. En pré-requis de cette étape, nous considérons que :
*Un utilisateur disposant des droits administrateur connaissant le mot de passe root est configuré et exécute ces étapes.

**1. Installation**

Installer tout dabord la dernière version de NGINX.

```console
$ sudo apt update
$ sudo apt install nginx
```

**2. Configuration du pare-feu**

Autoriser NGINX à gérer les requêtes :

```console
$ sudo ufw allow 'Nginx HTTP'
```

**3. Vérification**

Vérifier que les requêtes avec NGINX sont bien autorisées :

```console
$ sudo ufw status
```

Vérifier que tout fonctionne bien :

```console
$ systemctl status nginx
```
```console
Output
nginx.service - A high performance web server and a reverse proxy server
   Loaded: loaded (/lib/systemd/system/nginx.service; enabled; vendor preset: enabled)
   Active: active (running) since Fri 2018-04-20 16:08:19 UTC; 3 days ago
     Docs: man:nginx(8)
 Main PID: 2369 (nginx)
    Tasks: 2 (limit: 1153)
   CGroup: /system.slice/nginx.service
           ├─2369 nginx: master process /usr/sbin/nginx -g daemon on; master_process on;
           └─2380 nginx: worker process
```

Les ressources utilisées pour la configuration du pare-feu sont disponibles ici :
* [How To Install Nginx on Ubuntu](https://www.digitalocean.com/community/tutorials/how-to-install-nginx-on-ubuntu-18-04)

### Python, Gunicorn & Flask

Cette étape permet la configuration des seconde et troisième couche de l'application. La seconde couche consiste en [Gunicorn](https://fr.wikipedia.org/wiki/Gunicorn) qui est un serveur web HTTP WSGI. La troisième couche correspond au serveur Flask. Nous présentons ci-dessous les étapes nécessaires à la configuration de ces deux couches. En pré-requis de cette étape, nous considérons que :
*Un utilisateur disposant des droits administrateur connaissant le mot de passe root est configuré et exécute ces étapes.
*NGINX a été configuré et fonctionne comme présenté précédemment.

**1. Installation Python et dépendances**

Installons tout d'abord Python et l'ensemble des ressources associées

```console
$ sudo apt update
$ sudo apt install python3-pip python3-dev build-essential libssl-dev libffi-dev python3-setuptools
```

**2. Création du dossier du serveur**

L'application utilise un certain nombre de modules Python. Nous allons donc créer un environnement virtuel afin de délimiter clairement le périmètre du serveur. Installons tout d'abord la ressource permettant de créer un environnement virtuel :

```console
sudo apt install python3-venv
```

Avant d'aller plus loin, faisons un point sur la structure actuelle des dossiers de la machine. 

```console
├── home
   └── utilisateur
```

Nous voulons aller vers une structure qui ressemble à ça :

```console
├── home
   └── utilisateur
      └── gan4vis
```

Nous allons donc à présent devoir créer le dossier de l'application. Nous allons simplement effectuer un git clone du directory GitHub. Avant cela installer Git :

```console
sudo apt-get install -y git
```

Assurez-vous ensuite d'être dans le dossier `/home/utilisateur`? Créer maintenant un clone du directory GitHub :

```console
git clone https://github.com/AmigoCap/gan4vis.git
```



ici le dossier correspondant à l'application et déplaçons nous-y, 

**3. Créer un environnement virtuel**


```console
mkdir gan4vis
cd gan4vis
```

### Flask

### Mise à jour

Le serveur utilise la version de l'application présente sur GitHub. Le serveur tourne à partir de la branche master. Voici les étapes nécessaires à la mise à jour du serveur à la suite d'une modification sur GitHub.

**1. Se connecter en SSH en tant qu'utilisateur au serveur** 

**2. Se rendre dans le dossier "home/guillaume/gan4vis"**

**3. Faire un pull des modifications**

```console
$ git pull origin master
```

**4. Relancer Gunicorn** 

```console
$ sudo systemctl restart server
$ sudo systemctl enable server
$ sudo systemctl status server 
```

**5. Relancer NGINX**

```console
$ sudo systemctl restart nginx 
```

Le serveur est alors à jour et peut être accédé normalement par URL.

**DNS et Réseau**




