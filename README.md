# Démarrer le projet avec Docker

Si vous n'avez pas Python ou les droits d'installation, vous pouvez utiliser Docker pour servir ce projet statique.

## Étapes

1. Construisez l'image Docker :

```powershell
docker build -t outil-de-deux .
```

2. Lancez le conteneur :

```powershell
docker run -d -p 8080:80 --name outil-de-deux outil-de-deux
```

3. Accédez à l'application sur : http://localhost:8080

## Fichiers importants
- `Dockerfile` : instructions pour construire l'image
- `.dockerignore` : fichiers à ignorer lors de la construction

Pour arrêter le conteneur :
```powershell
docker stop outil-de-deux
```

Pour le supprimer :
```powershell
docker rm outil-de-deux
```
