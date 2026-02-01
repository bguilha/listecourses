# Déploiement sur Cloud Run avec Database sur VM (GCE)

Puisque votre base de données PostgreSQL est sur une VM Google Compute Engine (et non Cloud SQL), Cloud Run ne peut pas y accéder directement via l'IP publique (pour des raisons de sécurité) ni l'IP interne par défaut.

Il faut utiliser un **Connecteur d'accès au VPC sans serveur** (Serverless VPC Access Connector).

## Étape 1 : Préparer la VM PostgreSQL

1.  **IP Interne** : Notez l'adresse IP interne de votre VM (ex: `10.128.0.2`).
2.  **Configuration Postgres** :
    *   Assurez-vous que Postgres écoute sur l'IP interne (fichier `postgresql.conf` : `listen_addresses = '*'`).
    *   Autorisez les connexions venant du réseau VPC (fichier `pg_hba.conf`). Ajoutez une ligne comme :
        ```
        host    all             all             10.0.0.0/8              md5
        ```
        (Adaptez le masque `10.0.0.0/8` à votre sous-réseau VPC).
3.  **Firewall** : Assurez-vous qu'une règle firewall autorise le trafic entrant sur le port 5432 (Postgres) depuis le réseau interne.

## Étape 2 : Créer un Connecteur VPC

Le connecteur permet à Cloud Run de "rentrer" dans votre réseau privé pour parler à la VM.

1.  Activez l'API VPC Access :
    ```bash
    gcloud services enable vpcaccess.googleapis.com
    ```

2.  Créez le connecteur (remplacez `europe-west9` par la région de votre VM et Cloud Run) :
    ```bash
    gcloud compute networks vpc-access connectors create mon-connecteur \
        --region europe-west9 \
        --range 10.8.0.0/28
    ```
    *Note : La plage `10.8.0.0/28` doit être une plage IP inutilisée dans votre réseau. Si elle est prise, essayez-en une autre.*

## Étape 3 : Déployer sur Cloud Run

Déployez l'application en lui indiquant d'utiliser le connecteur et l'IP interne de la VM.

Remplacez les valeurs entre crochets :
*   `[IP_INTERNE_VM]` : L'IP de votre VM (ex: `10.128.0.2`).
*   `[VOTRE_MOT_DE_PASSE]` : Le mot de passe de votre utilisateur DB sur la VM.

```bash
gcloud run deploy liste-courses \
    --source . \
    --region europe-west9 \
    --allow-unauthenticated \
    --vpc-connector mon-connecteur \
    --set-env-vars DB_HOST=[IP_INTERNE_VM] \
    --set-env-vars DB_USER=benoit \
    --set-env-vars DB_PASSWORD=[VOTRE_MOT_DE_PASSE] \
    --set-env-vars DB_NAME=liste_courses \
    --set-env-vars DB_PORT=5432
```

## Résumé
1.  **Cloud Run** passe par le **Connecteur VPC**.
2.  Le **Connecteur VPC** a accès au réseau interne.
3.  L'application se connecte à l'**IP Interne** de la VM.

Si vous avez une erreur de connexion ("Connection timeout" ou "refused"), vérifiez en premier les logs Cloud Run, et assurez-vous que les firewalls de la VM acceptent bien le trafic venant de la plage IP du connecteur (`10.8.0.0/28` dans l'exemple).
