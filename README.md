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

## Fonctionnalités déjà codées dans le dépôt

- Page d’accueil responsive et sections de présentation.
- Formulaires d’inscription, de connexion et de réinitialisation du mot de passe via Supabase Auth.
- Formulaire d’inscription avec nom, pays, filière, niveau et établissement facultatif.
- Sélection locale et validation de fichiers PDF (type et limite de 20 Mo).
- Flux d’envoi d’un PDF vers le bucket privé `course-pdfs` et enregistrement dans `courses`, une fois Supabase configuré.
- Migration SQL initiale dans `supabase/migrations/`, incluant les tables et les règles RLS.

## Étapes obligatoires pour lancer les fonctions connectées

1. Créer un projet Supabase.
2. Appliquer `supabase/migrations/202610110001_initial_schema.sql` dans l’éditeur SQL Supabase.
3. Copier `.env.example` vers `.env.local` et remplir `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`.
4. Configurer les URL de redirection d’authentification dans Supabase.
5. Lancer `npm install`, puis `npm run dev`.

L’extraction PDF, l’OCR, la génération IA, les QCM corrigés et le suivi de progression restent à implémenter. Ils ne doivent pas être présentés comme fonctionnels avant leur réalisation et leurs tests.
