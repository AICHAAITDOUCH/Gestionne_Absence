<?php

namespace App\Http\Controllers;

use App\Models\Groupe;
use Illuminate\Http\Request;

class GroupeController extends Controller
{
    public function index()
    {
        return response()->json(Groupe::withCount('stagiaires')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'filiere' => 'required|string|max:255',
            'annee' => 'required|string|max:50',
        ]);

        $groupe = Groupe::create($validated);
        return response()->json($groupe, 201);
    }

    public function show(Groupe $groupe)
    {
        return response()->json($groupe->load('stagiaires', 'seances'));
    }

    public function update(Request $request, Groupe $groupe)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'filiere' => 'sometimes|required|string|max:255',
            'annee' => 'sometimes|required|string|max:50',
        ]);

        $groupe->update($validated);
        return response()->json($groupe);
    }

    public function destroy(Groupe $groupe)
    {
        $groupe->delete();
        return response()->json(null, 204);
    }
}
