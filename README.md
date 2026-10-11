# RéviseCI

**Slogan :** Ton cours devient plus facile à comprendre, à mémoriser et à maîtriser.

RéviseCI est une plateforme de révision en français destinée en priorité aux étudiants de Côte d’Ivoire. L’objectif du MVP est de permettre à un étudiant de créer un compte, importer ses cours PDF et générer progressivement des outils de révision fidèles au document source.

## État du MVP

Cette première base fournit le socle frontend React + TypeScript + Vite. Les fonctions qui nécessitent une configuration externe (authentification persistante, stockage privé, génération IA, OCR et paiements) ne seront pas présentées comme opérationnelles tant que leurs services backend et leurs tests ne seront pas configurés.

## Démarrage

Prérequis : Node.js 20 ou supérieur et npm.

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Configuration

- `VITE_SUPABASE_URL` : URL du projet Supabase.
- `VITE_SUPABASE_ANON_KEY` : clé publique/anon de Supabase. Ne jamais mettre de clé `service_role` dans le frontend.

Si Supabase n’est pas configuré, l’interface doit signaler que les fonctions nécessitant un compte ou un stockage ne sont pas disponibles, plutôt que d’inventer des données.

## Prochaines étapes

1. Authentification et profils Supabase.
2. Tables protégées par RLS et stockage privé des PDF.
3. Import PDF et extraction de texte côté serveur.
4. Génération pédagogique via une fonction serveur qui garde la clé IA secrète.
5. Historique des réponses et répétition espacée.
6. Quotas, paiements et administration après sécurisation du cœur pédagogique.

Fuseau horaire produit : `Africa/Abidjan`. Devise : FCFA/XOF.