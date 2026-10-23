# Veille confort menstruel

Outil de veille marché sur les produits alimentaires pour le confort menstruel (SPM, endométriose, post-partum, ménopause) : produits, composition, pays d'origine, et niveau de preuve de chaque ingrédient d'après les sources liées.

- Production : https://veille-confort-menstruel.vercel.app
- Données : entièrement fictives (marques, produits, références). Les liens des sources ouvrent une vraie recherche PubMed sur le sujet.

## Organisation

| Partie | Rôle |
| --- | --- |
| `src/app/` | Écrans (liste, fiche, formulaires, connexion) et actions serveur |
| `src/auth.ts` | Auth.js : connexion par e-mail et mot de passe, rôle `admin` ou `lecteur` dans la session |
| `src/lib/autorisation.ts` | Vérification des rôles côté serveur, appelée par chaque page et chaque action |
| `src/lib/niveau-preuve.ts` | Règle métier : 0 source = non étayé, 1-2 = exploratoire, 3+ = étayé (testée) |
| `src/lib/taux-change.ts` | Conversion du prix en euros via ExchangeRate-API (côté serveur, mise en cache 1 h) |
| `src/lib/courriel.ts` | Courriel Resend à chaque produit créé |
| `src/app/api/pieces-jointes/` | Lien privé vers les fichiers stockés dans Vercel Blob (session obligatoire) |
| `src/db/schema.ts` | Tables : produits, ingredients, sources, produit_ingredients, ingredient_sources, pieces_jointes, utilisateurs |
| `drizzle/` | Migrations SQL générées par Drizzle |
| `scripts/seed.ts` | Jeu de données fictif rejouable |

Rôles : **admin** crée, modifie, ajoute des fichiers et fait avancer le statut ; **lecteur** consulte seulement les produits publiés. Le cycle de vie est décrit dans [`docs/cycle-de-vie.md`](docs/cycle-de-vie.md). Toute tentative refusée est écrite dans les journaux (`acces_refuse`).

## Lancer en local (10 minutes)

Prérequis : Node.js 24, accès au projet Vercel.

```bash
npm install
npx vercel link                 # relier au projet Vercel veille-confort-menstruel
npx vercel env pull .env.local  # récupère DATABASE_URL, BLOB_READ_WRITE_TOKEN, etc.
```

Créer `.env.development.local` avec `AUTH_SECRET=` (une valeur aléatoire : `openssl rand -base64 33`), et `.env.seed.local` avec `SEED_MOT_DE_PASSE_ADMIN=` et `SEED_MOT_DE_PASSE_LECTEUR=`.

```bash
npm run db:migrate   # applique les migrations
npm run db:seed      # vide la base et la remplit avec les données fictives
npm run dev          # http://localhost:3000
```

Comptes de démonstration : `admin@veille.test` et `lecteur@veille.test`, mots de passe dans `.env.seed.local`.

## Variables d'environnement (Vercel)

| Variable | Service | Origine |
| --- | --- | --- |
| `DATABASE_URL`, `DATABASE_URL_UNPOOLED` | Neon | Intégration Neon de Vercel |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob (magasin privé `veille-fichiers`) | Créé par Vercel |
| `AUTH_SECRET` | Auth.js | Valeur aléatoire |
| `RESEND_API_KEY` | Resend | Tableau de bord Resend |
| `NOTIFICATION_EMAIL` | Resend | Adresse du compte Resend (seule adresse autorisée sans domaine) |
| `EXCHANGERATE_API_KEY` | ExchangeRate-API | Tableau de bord exchangerate-api.com |

## Vérifications

```bash
npm run lint && npm run typecheck && npm test
```

Les mêmes vérifications tournent sur GitHub Actions à chaque push.
