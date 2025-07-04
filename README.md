# OutilDeDeuxMVP

## Démarrage du projet en local sans Docker

Vous pouvez lancer l'application en local avec un simple serveur HTTP Python (aucune dépendance à installer, Python 3 est suffisant).

### Étapes :

1. Ouvrez un terminal dans le dossier du projet (là où se trouve `index.html`).
2. Lancez la commande suivante :

#### Sous Windows, macOS ou Linux (Python 3)
```
python -m http.server 8000
```

3. Ouvrez votre navigateur à l'adresse :
```
http://localhost:8000
```

L'application sera accessible et fonctionnera normalement.

---

**Remarque :**
- Ne pas ouvrir directement `index.html` dans le navigateur (problème de chargement du JSON en local sans serveur).
- Pour arrêter le serveur, faites `Ctrl+C` dans le terminal.
