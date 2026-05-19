<?php

namespace App\Http\Controllers;

use App\Models\Groupe;
use Illuminate\Http\Request;

class GroupeController extends Controller
{
    public function index(Request $request)
    {
        $query = Groupe::query();

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('filiere', 'like', "%{$search}%")
                  ->orWhere('annee', 'like', "%{$search}%");
            });
        }

        if ($request->filled('filiere')) {
            $query->where('filiere', $request->input('filiere'));
        }

        return response()->json($query->withCount('stagiaires')->with('formateurs')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'filiere' => 'required|string|max:255',
            'annee' => 'required|string|max:50',
            'formateur_ids' => 'sometimes|array',
            'formateur_ids.*' => 'exists:users,id',
        ]);

        $groupe = Groupe::create([
            'name' => $validated['name'],
            'filiere' => $validated['filiere'],
            'annee' => $validated['annee']
        ]);

        if (!empty($validated['formateur_ids'])) {
            $groupe->formateurs()->sync($validated['formateur_ids']);
        }

        $groupe->load('formateurs');
        return response()->json($groupe, 201);
    }

    public function show(Groupe $groupe)
    {
        $groupe->load(['stagiaires', 'formateurs']);
        return response()->json($groupe);
    }

    public function update(Request $request, Groupe $groupe)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'filiere' => 'sometimes|required|string|max:255',
            'annee' => 'sometimes|required|string|max:50',
            'formateur_ids' => 'sometimes|array',
            'formateur_ids.*' => 'exists:users,id',
        ]);

        $groupe->update(array_filter($request->only(['name', 'filiere', 'annee'])));

        if ($request->has('formateur_ids')) {
            $groupe->formateurs()->sync($request->input('formateur_ids'));
        }

        $groupe->load('formateurs');
        return response()->json($groupe);
    }

    public function destroy(Groupe $groupe)
    {
        $groupe->delete();
        return response()->json(null, 204);
    }
}
