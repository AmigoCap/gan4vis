# Documentation

Le fichier suivant détail le fonctionnement de l'application ainsi que la configuration du serveur Digital Ocean, à l'issue du mois de mars 2019.

## Application

### Structure

Le [site](https://gan4vis.net) actuel est constitué de quatre pages. 

* /index : accueil accessible à [https://gan4vis.net](https://gan4vis.net) permettant d'effectuer le transfert de style
* /process : page accessible depuis l'accueil détaillant le processus de création de la plateforme
* /dashboard : page non accessible depuis l'accueil, accessible à [https://gan4vis.net/dashboard](https://gan4vis.net/dashboard) présentant un tableau de bord d'utilisation du transfert de style
* /transitions : page seulement accessible à 

L'application permettant de gérer ce site a une structure MVT (Model View Template). Elle fait appel à un ensemble de fichiers statiques ainsi qu'une base de donnée SQLite. Ci-dessous un schéma de l'architecture de l'application :

Image de la structure

Sur le schéma précédent, les composantes principales de l'application sont :

1. A
2. A
3. A

### Processus

À chaque fois détailler ressources utilisées et routes

**Transfert de style**

**Transition**

**Dashboard**

**Partage d'URL**

### Données

Fichiers (Images / Modèles(+génération de modèle)

Base de données et Modèles (SQLite, SQAlchemy, mise à jour de la base de données 

## Serveur

### Vue d'ensemble

**Spécifications**

**Accès**
SSH (utilisateurs / root) éviter la console Digital Ocean ! Configuration d'accès avec ressource

### Configuration

**NGINX**

**Gunicorn**

**Flask**

**Gestion**
Logs et mise à jour utilisant Git

**DNS et Réseau**


