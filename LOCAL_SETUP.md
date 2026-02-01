# Configuration de l'environnement local

Pour tester le site en local avec une base de données PostgreSQL, suivez ces étapes :

## 1. Installer PostgreSQL
Comme vous êtes sur Mac, la méthode la plus simple (si vous n'avez pas Docker) est d'utiliser **Postgres.app**.

1.  Téléchargez et installez [Postgres.app](https://postgresapp.com/).
2.  Ouvrez l'application **Postgres**.
3.  Cliquez sur "Initialize" si demandé pour créer un nouveau serveur.
4.  Assurez-vous que le serveur est "Running" (en cours d'exécution).

## 2. Créer la base de données
1.  Dans Postgres.app, double-cliquez sur l'icone ou la ligne de votre utilisateur (souvent `benoit` ou `postgres`) pour ouvrir un terminal SQL.
2.  Dans ce terminal, tapez la commande suivante pour créer la base de données :
    ```sql
    CREATE DATABASE liste_courses;
    ```
    (N'oubliez pas le point-virgule à la fin !)
3.  Vous pouvez fermer le terminal SQL une fois que vous voyez le message `CREATE DATABASE`.

## 3. Configuration
Un fichier `.env` a déjà été créé pour vous à la racine du projet avec la configuration suivante :
```env
DB_HOST=localhost
DB_USER=benoit
DB_PASSWORD=
DB_NAME=liste_courses
DB_PORT=5432
PORT=8080
```
*Note : Si votre utilisateur Postgres.app n'est pas `benoit`, modifiez `DB_USER` dans ce fichier.*

## 4. Lancer le serveur
1.  Ouvrez votre terminal dans le dossier du projet.
2.  Installez les dépendances (si ce n'est pas déjà fait) :
    ```bash
    npm install
    ```
3.  Lancez le serveur :
    ```bash
    node server.js
    ```
4.  Le serveur devrait afficher : `Server running on port 8080` et `Database initialized successfully`.

## 5. Tester
Ouvrez votre navigateur et allez sur `http://localhost:8080`.
