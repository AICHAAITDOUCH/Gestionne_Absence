<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create Admin
        $admin = User::create([
            'name' => 'Admin Manager',
            'email' => 'admin@smartabsence.com',
            'password' => bcrypt('password'),
            'role' => 'admin',
        ]);

        // Create Groupe
        $groupe = \App\Models\Groupe::create([
            'name' => 'DEVOWFS 201',
            'filiere' => 'Développement Web',
            'annee' => '2025/2026',
        ]);

        // Create Formateur
        $formateur = User::create([
            'name' => 'John Doe',
            'email' => 'formateur@smartabsence.com',
            'password' => bcrypt('password'),
            'role' => 'formateur',
        ]);

        // Attach formateur to group
        $formateur->groupes()->attach($groupe->id);

        // Create Stagiaire
        $stagiaire = User::create([
            'name' => 'Jane Smith',
            'email' => 'stagiaire@smartabsence.com',
            'password' => bcrypt('password'),
            'role' => 'stagiaire',
            'groupe_id' => $groupe->id,
        ]);

        // Create Module
        $module = \App\Models\Module::create([
            'name' => 'Développement Front-end',
            'code' => 'M104',
            'volume_horaire' => 120,
            'formateur_id' => $formateur->id,
            'groupe_id' => $groupe->id,
        ]);

        // Create Seance
        $seance = \App\Models\Seance::create([
            'module_id' => $module->id,
            'groupe_id' => $groupe->id,
            'formateur_id' => $formateur->id,
            'date' => now()->format('Y-m-d'),
            'heure_debut' => '08:30:00',
            'heure_fin' => '11:00:00',
            'type' => 'cours',
            'is_validated' => true,
        ]);

        // Create Presence
        $presence = \App\Models\Presence::create([
            'seance_id' => $seance->id,
            'stagiaire_id' => $stagiaire->id,
            'status' => 'absent',
            'remarque' => 'Non justifié',
        ]);
    }
}
