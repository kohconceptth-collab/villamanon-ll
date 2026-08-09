# Villa Manon

Site vitrine statique, sans framework ni étape de compilation.

## Structure

```text
.
├── index.html
├── agence.html
├── css/
│   ├── style.css
│   └── *.css (correctifs isolés dans leur ordre d’origine)
├── js/
│   ├── script.js
│   ├── fullscreen.js
│   ├── gallery-map-zoom.js
│   ├── simulator-layout.js
│   ├── premium-interactions.js
│   └── rawai-video.js
├── assets/
│   ├── images/
│   ├── videos/
│   └── icons/
└── tools/
    ├── restructure.mjs
    └── validate.mjs
```

Les images auparavant embarquées dans le fichier HTML sont dédupliquées et
stockées dans `assets/images/`. Les répertoires `assets/videos/` et
`assets/icons/` sont prêts à recevoir de futures ressources.

`index.html` est la version propriétaire. `agence.html` est la version destinée
aux agences et partage strictement les mêmes feuilles de style, scripts et
assets.

La vidéo Rawai est stockée dans `assets/videos/rawai-district-phuket.mp4`. Elle
se lance automatiquement et active le son lors de la première interaction.

## Prévisualisation

Les pages peuvent être ouvertes directement avec `index.html` et `agence.html`,
ou servies par n’importe quel serveur HTTP statique.

## Validation

Depuis la racine du projet :

```powershell
Get-ChildItem js/*.js | ForEach-Object { node --check $_.FullName }
node tools/validate.mjs .
```

Le second script contrôle les fichiers liés, les ancres internes et la présence
des feuilles de style et scripts externes au document.

## Déploiement

Le contenu de la racine peut être publié tel quel sur GitHub Pages, Nginx,
Apache ou tout autre hébergement statique.
