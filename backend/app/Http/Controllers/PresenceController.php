<?php

namespace App\Http\Controllers;

use App\Models\Presence;
use Illuminate\Http\Request;

class PresenceController extends Controller
{
    public function index()
    {
        return response()->json(Presence::with(['seance', 'stagiaire', 'justification'])->get());
    }

    public function bySeance($seance_id)
    {
        return response()->json(Presence::with('stagiaire', 'justification')->where('seance_id', $seance_id)->get());
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
