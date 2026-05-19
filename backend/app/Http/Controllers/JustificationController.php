<?php

namespace App\Http\Controllers;

use App\Models\Justification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Carbon\Carbon;

class JustificationController extends Controller
{
    public function index()
    {
        return response()->json(Justification::with('presence.stagiaire')->get());
    }

    public function myJustifications(Request $request)
    {
        $user = $request->user();
        $justifications = Justification::with(['presence.seance.module', 'presence.seance.formateur'])
            ->whereHas('presence', function($q) use ($user) {
                $q->where('stagiaire_id', $user->id);
            })
            ->orderBy('created_at', 'desc')
            ->get();
        return response()->json($justifications);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'presence_id' => 'required|exists:presences,id',
            'document' => 'required|file|mimes:pdf,jpg,jpeg,png|max:2048',
            'motif' => 'required|string|max:500',
        ]);

        $presence = \App\Models\Presence::findOrFail($validated['presence_id']);

        // Security check: Stagiaire can only justify their own absences
        if ($presence->stagiaire_id !== $request->user()->id) {
            return response()->json(['message' => 'Action non autorisée. Vous ne pouvez pas justifier l\'absence d\'un autre stagiaire.'], 403);
        }

        // Check if justification already exists for this presence
        $existing = Justification::where('presence_id', $validated['presence_id'])->first();
        if ($existing) {
            return response()->json(['message' => 'Une justification a déjà été soumise pour cette absence.'], 422);
        }

        $path = $request->file('document')->store('justifications', 'public');

        $justification = Justification::create([
            'presence_id' => $validated['presence_id'],
            'document_path' => '/storage/' . $path,
            'status' => 'en_attente',
            'motif' => $validated['motif']
        ]);

        return response()->json($justification, 201);
    }

    public function show(Justification $justification)
    {
        return response()->json($justification->load('presence.stagiaire'));
    }

    public function update(Request $request, Justification $justification)
    {
        $validated = $request->validate([
            'status' => 'required|in:en_attente,accepte,refuse',
            'admin_remarque' => 'nullable|string',
        ]);

        $justification->update($validated);
        
        if($validated['status'] == 'accepte'){
            $justification->presence()->update(['status' => 'justifie']);
        }

        // Trigger notification for justification status change
        $statusLabel = $validated['status'] == 'accepte' ? 'acceptée ✅' : 'refusée ❌';
        $presence = $justification->presence;
        if ($presence) {
            $seance = $presence->seance;
            $dateStr = $seance ? Carbon::parse($seance->date)->format('d/m/Y') : '';
            DB::table('notifications')->insert([
                'id' => Str::uuid(),
                'type' => 'App\Notifications\JustificationStatusChanged',
                'notifiable_type' => 'App\Models\User',
                'notifiable_id' => $presence->stagiaire_id,
                'data' => json_encode([
                    'title' => 'Justification d\'absence traitée 📄',
                    'message' => "Votre justification d'absence pour la séance du " . $dateStr . " a été " . $statusLabel . ".",
                    'type' => 'justification',
                    'justification_id' => $justification->id
                ]),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        return response()->json($justification);
    }

    public function destroy(Justification $justification)
    {
        $justification->delete();
        return response()->json(null, 204);
    }
}
