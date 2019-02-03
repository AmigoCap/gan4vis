# Mise à jour du serveur

## Coté Interface

L'interface est actuellement divisée en trois parties :

![Architecture de la page](/index_explained.png)
Format: ![Alt Text](url)

### "charts"

Le container "charts" abrite :
 - La zone "preview" permettant de visualiser en temps réel le chart qui va être soumis.
 - La zone "submission" contenant le bouton d'envoi du svg contenu dans "preview" vers le serveur.
 - La zone "result" contenant le résultat du transfert de style renvoyé par le serveur. Actuellement in contient uniquement un placeholder.

### "selection"

Le container "selection" abrite :
 - La zone "interface_keys" donnant à voir les commandes du clavier permettant de modifier le graphique de "preview".
 - La zone "save" vide pour l'instant, qui pourra contenir à terme un bouton de sauvegarde de l'image.
 - La zone "interface_gans" permettant de sélectionner l'image de style référence. Quatre images de style existent, correspondant à un placeholder pour l'instant.

### Utilisation

1. L'utilisateur joue avec les touches du clavier données dans "interface_keys" et sélectionne une image de style dans "interface_gans".
2. L'utilisateur active le bouton "Apply Style" ce qui envoi une requête AJAX au serveur contenant la version binaire du svg contenu dans "preview", au préalable transformé en png.
3. L'utilisateur visualise le résultat du transfert de style dans "result" et peut recommencer à l'étape 1.

## Coté Serveur

La requête AJAX active la fonction "treatment". Cette fonction vise à transformer l'information binaire provenant de "preview" en png sur le serveur.

![Fonction treatment](/treatment_function.png)
Format: ![Alt Text](url)


1. L'information de l'image est récupérée en données base64 depuis le JSON communiquée par la requête AJAX. Les données base64 sont alors transformées en données binaires.
2. Un token aléatoire est généré pour sauvegarder l'image sur le serveur.
3. L'image est sauvagardée.
