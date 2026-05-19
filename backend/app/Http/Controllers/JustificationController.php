<?php

namespace App\Http\Controllers;

use App\Models\Justification;
use Illuminate\Http\Request;

class JustificationController extends Controller
{
    public function index()
    {
        return response()->json(Justification::with('presence.stagiaire')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'presence_id' => 'required|exists:presences,id',
            'document' => 'required|file|mimes:pdf,jpg,jpeg,png|max:2048',
        ]);

        $path = $request->file('document')->store('justifications', 'public');

        $justification = Justification::create([
            'presence_id' => $validated['presence_id'],
            'document_path' => $path,
            'status' => 'en_attente'
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

        return response()->json($justification);
    }

    public function destroy(Justification $justification)
    {
        $justification->delete();
        return response()->json(null, 204);
    }
}
