<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Groupe;
use App\Models\Seance;
use App\Models\Presence;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Gate;

class ProfileController extends Controller
{
    /**
     * Get the authenticated user's profile with statistics and relationships.
     */
    public function getProfile(Request $request)
    {
        $user = $request->user();

        // Enforce policy check (though Sanctum middleware ensures authenticated, we check ownership)
        Gate::authorize('view', $user);

        $responseData = [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'role' => $user->role,
            'avatar' => $user->avatar,
            'specialite' => $user->specialite,
            'created_at' => $user->created_at,
        ];

        if ($user->role === 'admin') {
            $responseData['stats'] = [
                'total_stagiaires' => User::where('role', 'stagiaire')->count(),
                'total_formateurs' => User::where('role', 'formateur')->count(),
                'total_groupes' => Groupe::count(),
                'total_seances' => Seance::count(),
            ];
        } elseif ($user->role === 'formateur') {
            // Fetch groups affected to this formateur
            $groupes = $user->groupes()->withCount('stagiaires')->get();
            if ($groupes->isEmpty()) {
                $groupeIds = Seance::where('formateur_id', $user->id)->pluck('groupe_id')->unique();
                $groupes = Groupe::whereIn('id', $groupeIds)->withCount('stagiaires')->get();
            }

            // Calculate presence rate for their seances
            $totalAbsences = Presence::where('status', 'absent')
                ->whereHas('seance', function($q) use ($user) {
                    $q->where('formateur_id', $user->id);
                })->count();

            $presencesCount = Presence::whereIn('status', ['present', 'retard'])
                ->whereHas('seance', function($q) use ($user) {
                    $q->where('formateur_id', $user->id);
                })->count();
            
            $tauxPresence = 100;
            if (($presencesCount + $totalAbsences) > 0) {
                $tauxPresence = round(($presencesCount / ($presencesCount + $totalAbsences)) * 100, 1);
            }

            $responseData['groupes'] = $groupes;
            $responseData['stats'] = [
                'total_groupes' => $groupes->count(),
                'total_seances' => $user->seances()->count(),
                'total_stagiaires' => $groupes->sum('stagiaires_count'),
                'taux_presence' => $tauxPresence,
            ];
        }

        return response()->json($responseData);
    }

    /**
     * Update the authenticated user's profile.
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        // Enforce policy check for security
        Gate::authorize('update', $user);

        // Define base validation rules
        $rules = [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'phone' => 'nullable|string|max:20',
            'password' => 'nullable|string|min:6|confirmed',
            'avatar' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ];

        // Formateur-specific validation rule for specialty
        if ($user->role === 'formateur') {
            $rules['specialite'] = 'nullable|string|max:255';
        }

        $validated = $request->validate($rules);

        // Update fields
        $user->name = $validated['name'];
        $user->email = $validated['email'];
        $user->phone = $validated['phone'] ?? null;

        if ($user->role === 'formateur') {
            $user->specialite = $validated['specialite'] ?? null;
        }

        // Handle password update if provided
        if ($request->filled('password')) {
            $user->password = Hash::make($request->password);
        }

        // Handle avatar upload if provided
        if ($request->hasFile('avatar')) {
            // Delete old avatar if it exists
            if ($user->avatar) {
                $oldPath = str_replace('/storage/', '', $user->avatar);
                Storage::disk('public')->delete($oldPath);
            }

            $path = $request->file('avatar')->store('avatars', 'public');
            $user->avatar = '/storage/' . $path;
        }

        $user->save();

        // Return updated profile
        return $this->getProfile($request);
    }
}
