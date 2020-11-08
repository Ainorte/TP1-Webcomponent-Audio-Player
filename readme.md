# TP1 Webcomponent Audio Player 

> [Lien vers l'énoncé](http://miageprojet2.unice.fr/Intranet_de_Michel_Buffa/Technlogies_Web_2_-_Master_2_Miage)

Tp réalisé par William POITEVIN (MBDS 2020)

## Démo 

<https://ainorte.github.io/TP1-Webcomponent-Audio-Player/>

> L'autoplay est désactivé par défaut dans les navigateurs, pensez à autoriser le site pour tester cette fonctionnalité

Code de la page :
```html
<html lang="fr">

<head>
    <meta charset="utf-8">
    <title>Exemple lecteur multimedia</title>
</head>

<body>
    <my-audioplayer volume="50" play="true" src="assets/sounds/Niwel_Bad_Love_Vocal_Edit.mp3"></my-audioplayer>
    <my-audioplayer gain="0.3" current-time="65" src="assets/sounds/Olivaw-Airwaves.mp3"></my-audioplayer>
    <my-audioplayer balance="-0.5" loop="true" src="http://mainline.i3s.unice.fr/mooc/horse.mp3"></my-audioplayer>


    <script type="module" src="./myComponents/myAudioPlayer/index.js"></script>
</body>

</html>
```


## Utilisation du webcomponent

Il faut importer le script du webcomponent (le webcomponent complet est dans le dossier `/myComponents/myAudioPlayer`) : 

```html
<script type="module" src="./myComponents/myAudioPlayer/index.js"></script>
```
Ensuite vous pouvez l'utiliser comme ceci :

```html
  <my-audioplayer src="http://mainline.i3s.unice.fr/mooc/horse.mp3"></my-audioplayer>
```
> L'attribut src est obligatoire

## Liste des attributs supportés

- `src` : source du son à jouée (obligatoire)
- `volume` : valeur de 0 à 100 pour contrôler le volume (défaut = `100`)
- `play` : `true` ou `false` pour lancer la lecture du son (défaut = `false`)
> Attention si vous voulez que le son se lance au chargement de la page, l'utilisateur doit autoriser ce comportement dans son navigateur
- `loop` : `true` ou `false` pour activer la lecture en boucle (défaut = `false`)
- `current-time` : valeur en secondes, position dans le son (défaut = `0`)
- `gain` : valeur de `0.00` à `2.00` pour le réglage du gain (défaut = `1`)
- `balance` valeur de `-1.00` à `1.00` pour le réglage de la balance (défaut = `0`)
Ces attributs sont controllables via javascript.
