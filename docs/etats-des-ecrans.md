# Les quatre états de chaque écran

Chaque écran prévoit ce qu'il montre quand les données arrivent (**chargement**), quand il n'y en a pas (**vide**), quand elles sont là (**données**) et quand la lecture échoue (**erreur**).

- **Chargement :** un squelette gris qui a la forme de la page (`src/components/chargement.tsx`). La page ne saute pas quand les données arrivent.
- **Vide :** une phrase qui dit pourquoi il n'y a rien, et le bouton qui permet d'en sortir (`src/components/etat-vide.tsx`).
- **Erreur :** `src/app/error.tsx`, pour toute page. Il montre une explication sans détail technique, un bouton « Réessayer » qui recharge les données, et une référence qui retrouve l'erreur dans les journaux Vercel. `src/app/global-error.tsx` sert de dernier filet si même l'en-tête ne s'affiche pas.

## Écran par écran

| Écran | Chargement | Vide | Données | Erreur |
|---|---|---|---|---|
| **Liste des produits** `/produits` | squelette de filtres et de lignes | *avec filtre :* « Aucun produit ne correspond à ces filtres » + **Effacer les filtres** · *admin :* « Aucun produit pour l'instant » + **Ajouter un produit** · *lecteur :* « Aucun produit publié pour l'instant » | tableau filtrable par indication (et par statut pour l'admin) | page d'erreur commune |
| **Fiche produit** `/produits/12` | squelette de titre et de cartes | chaque carte dit ce qui manque et, pour l'admin, comment le compléter (prix, composition, fichiers) | prix converti en euros, composition et niveau de preuve, pièces jointes, cycle de vie | page d'erreur commune ; « Page introuvable » si le produit n'existe pas ; « Accès refusé » pour un lecteur sur un produit non publié ; conversion en euros indisponible : message dans la carte Prix, le reste s'affiche |
| **Ajouter / modifier un produit** | squelette de formulaire | formulaire vierge (ajout) | formulaire prérempli (modification) | erreurs sous chaque champ + message en tête ; bouton « Enregistrement… » pendant l'envoi |
| **Comptes** `/comptes` (admin) | squelettes du formulaire et des tableaux | « Aucune invitation pour l'instant » (la liste des comptes contient toujours l'admin) | comptes, invitations avec leur état, lien à copier | page d'erreur commune ; erreurs du formulaire d'invitation sous chaque champ |
| **Invitation** et **nouveau mot de passe** (liens reçus) | « Vérification du lien… » | — | formulaire du mot de passe | « Lien inutilisable » : expiré, déjà servi, annulé ou mal copié, avec la marche à suivre |
| **Connexion**, **mot de passe oublié** | bouton « Connexion… » / « Envoi… » | formulaire vierge | — | message sous le formulaire (identifiants refusés) |

## Voir un état sans casser la base

Sur une prévisualisation ou en local, ajoutez `?etat=` à l'adresse de la liste des produits, d'une fiche ou de la page Comptes :

- `?etat=chargement` : le squelette reste affiché 3 secondes ;
- `?etat=vide` : la page s'affiche comme si les données manquaient ;
- `?etat=erreur` : la lecture échoue et la page d'erreur apparaît.

Exemple : `https://veille-confort-menstruel-git-quatre-etats-forwomen1.vercel.app/produits?etat=vide`.

**En production, le paramètre est ignoré** : personne ne peut provoquer une fausse panne sur le vrai site (`src/lib/simulation.ts`, testé).
