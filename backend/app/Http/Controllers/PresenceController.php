<?php

namespace App\Http\Controllers;

use App\Models\Presence;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PresenceController extends Controller
{
    public function index()
    {
        return response()->json(Presence::with(['seance', 'stagiaire', 'justification'])->get());
    }

    public function bySeance($seance_id)
    {
        $seance = \App\Models\Seance::with('groupe')->findOrFail($seance_id);
        $presences = Presence::with('stagiaire', 'justification')->where('seance_id', $seance_id)->get();

        if ($presences->isEmpty()) {
            $stagiaires = \App\Models\User::where('role', 'stagiaire')
                ->where('groupe_id', $seance->groupe_id)
                ->get();
                
            $presences = $stagiaires->map(function($stagiaire) use ($seance_id) {
                return [
                    'id' => null,
                    'seance_id' => $seance_id,
                    'stagiaire_id' => $stagiaire->id,
                    'stagiaire' => $stagiaire,
                    'status' => 'present',
                    'remarque' => null,
                    'justification' => null
                ];
            });
        }

        return response()->json($presences);
    }

    public function saveBatch(Request $request)
    {
        $validated = $request->validate([
            'seance_id' => 'required|exists:seances,id',
            'presences' => 'required|array',
            'presences.*.stagiaire_id' => 'required|exists:users,id',
            'presences.*.status' => 'required|in:present,absent,retard,justifie',
            'presences.*.remarque' => 'nullable|string',
            'is_validated' => 'sometimes|boolean',
        ]);

        $seance = \App\Models\Seance::findOrFail($validated['seance_id']);

        if ($seance->is_validated && $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Cette séance est validée et verrouillée. Les modifications ne sont pas autorisées.'], 403);
        }

        foreach ($validated['presences'] as $presData) {
            $oldPresence = Presence::where('seance_id', $validated['seance_id'])
                ->where('stagiaire_id', $presData['stagiaire_id'])
                ->first();

            Presence::updateOrCreate(
                [
                    'seance_id' => $validated['seance_id'],
                    'stagiaire_id' => $presData['stagiaire_id']
                ],
                [
                    'status' => $presData['status'],
                    'remarque' => $presData['remarque'] ?? null
                ]
            );

            // Trigger notification on new absence
            if ($presData['status'] === 'absent' && (!$oldPresence || $oldPresence->status !== 'absent')) {
                DB::table('notifications')->insert([
                    'id' => Str::uuid(),
                    'type' => 'App\Notifications\AbsenceMarked',
                    'notifiable_type' => 'App\Models\User',
                    'notifiable_id' => $presData['stagiaire_id'],
                    'data' => json_encode([
                        'title' => 'Nouvelle absence signalée 🚫',
                        'message' => "Une absence a été enregistrée pour la séance du " . Carbon::parse($seance->date)->format('d/m/Y') . " (" . $seance->heure_debut . " - " . $seance->heure_fin . ").",
                        'type' => 'absence',
                        'seance_id' => $seance->id
                    ]),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        if (isset($validated['is_validated'])) {
            $seance->update(['is_validated' => $validated['is_validated']]);
        }

        return response()->json(['message' => 'Présences enregistrées avec succès.']);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'seance_id' => 'required|exists:seances,id',
            'stagiaire_id' => 'required|exists:users,id',
            'status' => 'required|in:present,absent,retard,justifie',
            'remarque' => 'nullable|string',
        ]);

        $presence = Presence::create($validated);
        return response()->json($presence, 201);
    }

    public function show(Presence $presence)
    {
        return response()->json($presence->load(['seance', 'stagiaire', 'justification']));
    }

    public function update(Request $request, Presence $presence)
    {
        $validated = $request->validate([
            'status' => 'sometimes|required|in:present,absent,retard,justifie',
            'remarque' => 'nullable|string',
        ]);

        $presence->update($validated);
        return response()->json($presence);
    }

    public function destroy(Presence $presence)
    {
        $presence->delete();
        return response()->json(null, 204);
    }
}
