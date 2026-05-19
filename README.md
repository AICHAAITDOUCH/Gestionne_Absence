# SmartAbsence SaaS

SmartAbsence SaaS est une plateforme moderne et professionnelle de gestion des absences pour les établissements de formation. Construite avec une architecture de niveau production, elle intègre un backend Laravel 12 robuste et un frontend React 19 ultra-rapide avec un design premium inspiré de Notion et Linear.

## 🌟 Fonctionnalités

- **Authentification & Rôles**: Système sécurisé (Sanctum) avec 3 rôles (Admin, Formateur, Stagiaire).
- **Dashboards Personnalisés**: Tableaux de bord spécifiques à chaque rôle avec des graphiques interactifs (Recharts).
- **Design System Premium**: Interface Glassmorphism, mode sombre/clair, animations fluides (Framer Motion).
- **Gestion Complète**: CRUD pour Stagiaires, Formateurs, Groupes, Modules, Séances.
- **Suivi des Absences**: Appel interactif, gestion des justifications, statistiques en temps réel.
- **Haute Performance**: Zustand pour la gestion d'état, React Query pour la mise en cache API.

## 💻 Stack Technique

- **Frontend**: React 19, Vite, TypeScript, TailwindCSS v4, Shadcn/ui (custom), Framer Motion, Zustand, React Query.
- **Backend**: Laravel 12, MySQL 8, Sanctum, Policies, API Resources.

## 🚀 Guide d'Installation

### 1. Prérequis
- PHP 8.2+
- Composer
- Node.js 20+
- MySQL (XAMPP/WAMP)

### 2. Installation du Backend (Laravel)
```bash
cd backend
cp .env.example .env
# Modifiez le .env pour inclure vos identifiants MySQL (DB_DATABASE=smart_absence)
composer install
php artisan key:generate
php artisan migrate --seed
php artisan storage:link
php artisan serve
```

*Note: Le seeder génère des comptes de test : `admin@smartabsence.com`, `formateur@smartabsence.com`, `stagiaire@smartabsence.com` (Mot de passe: `password`).*

### 3. Installation du Frontend (React)
```bash
cd frontend
npm install
npm run dev
```

L'application sera accessible sur `http://localhost:5173`.

## 📂 Architecture

Le projet est divisé en deux répertoires principaux :
- `/backend`: Code Laravel (APIs, Base de données, Modèles Eloquent).
- `/frontend`: Code React (Composants UI, Pages, Store Zustand, Intercepteurs Axios).
