# Système de Commentaires

Ce document décrit le système de commentaires implémenté dans l'API, similaire à Twitter avec support des réponses imbriquées et des likes.

## Architecture

### Entités

1. **Comment** : Commentaire principal avec support des réponses imbriquées
2. **CommentLike** : Gestion des likes par utilisateur

### Relations

- Un utilisateur peut créer plusieurs commentaires
- Un commentaire peut avoir plusieurs réponses (commentaires enfants)
- Un commentaire peut être liké par plusieurs utilisateurs
- Un utilisateur ne peut liker un commentaire qu'une seule fois

## Endpoints API

### 1. Créer un commentaire

**POST** `/comments`

```json
{
  "content": "Ceci est un commentaire principal",
  "parentCommentId": null
}
```

**Réponse :**
```json
{
  "idComment": 1,
  "content": "Ceci est un commentaire principal",
  "idPerson": 123,
  "person": {
    "idPerson": 123,
    "firstname": "John",
    "surname": "Doe",
    "email": "john@example.com"
  },
  "parentCommentId": null,
  "isDeleted": false,
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z",
  "likeCount": 0,
  "replyCount": 0,
  "isLikedByCurrentUser": false,
  "replies": []
}
```

### 2. Répondre à un commentaire

**POST** `/comments`

```json
{
  "content": "Ceci est une réponse au commentaire",
  "parentCommentId": 1
}
```

### 3. Récupérer tous les commentaires principaux

**GET** `/comments`

**Réponse :**
```json
[
  {
    "idComment": 1,
    "content": "Commentaire principal",
    "likeCount": 5,
    "replyCount": 3,
    "isLikedByCurrentUser": true,
    "replies": [
      {
        "idComment": 2,
        "content": "Réponse 1",
        "likeCount": 2,
        "replyCount": 1,
        "isLikedByCurrentUser": false
      }
    ]
  }
]
```

### 4. Récupérer les réponses d'un commentaire

**GET** `/comments/replies/:id`

### 5. Récupérer un commentaire spécifique

**GET** `/comments/:id`

### 6. Modifier un commentaire

**PATCH** `/comments/:id`

```json
{
  "content": "Contenu modifié"
}
```

### 7. Supprimer un commentaire

**DELETE** `/comments/:id`

### 8. Liker/Unliker un commentaire

**POST** `/comments/:id/like`

**Réponse :**
```json
{
  "liked": true
}
```

## Fonctionnalités

### Réponses Imbriquées

- Les commentaires peuvent avoir des réponses illimitées
- Chaque réponse peut elle-même avoir des réponses
- Les réponses sont automatiquement chargées avec le commentaire parent

### Système de Likes

- Un utilisateur ne peut liker un commentaire qu'une seule fois
- Cliquer sur un like existant le retire
- Le nombre de likes est calculé automatiquement

### Soft Delete

- Les commentaires ne sont jamais supprimés physiquement
- Ils sont marqués comme supprimés (`isDeleted: true`)
- Les commentaires supprimés ne sont pas retournés par l'API

### Sécurité

- Seul l'auteur d'un commentaire peut le modifier ou le supprimer
- L'authentification JWT est requise pour les opérations de création/modification/suppression
- Les likes sont liés à l'utilisateur authentifié

## Exemples d'utilisation

### Créer un fil de discussion

1. Créer un commentaire principal
2. Répondre au commentaire principal
3. Répondre aux réponses pour créer des discussions imbriquées

### Gestion des likes

1. Liker un commentaire
2. Vérifier le statut de like avec `isLikedByCurrentUser`
3. Compter les likes avec `likeCount`

### Récupération des données

1. Récupérer tous les commentaires principaux
2. Charger les réponses automatiquement
3. Afficher les compteurs de likes et réponses

## Base de données

### Tables

- `comment` : Commentaires avec support des réponses imbriquées
- `comment_like` : Likes des commentaires

### Index

- Index sur `id_person` pour les requêtes par utilisateur
- Index sur `parent_comment_id` pour les réponses
- Index sur `created_at` pour le tri chronologique
- Index sur `is_deleted` pour filtrer les commentaires supprimés

### Contraintes

- Contrainte unique sur `(id_person, id_comment)` pour les likes
- Contrainte de longueur minimale sur le contenu
- Clés étrangères avec suppression en cascade 