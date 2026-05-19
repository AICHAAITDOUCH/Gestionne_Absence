<?php

namespace App\Http\Controllers;

use App\Models\Seance;
use Illuminate\Http\Request;

class SeanceController extends Controller
{
    public function index()
    {
        return response()->json(Seance::with(['module', 'groupe', 'formateur'])->orderBy('date', 'desc')->get());
    }

    public function byFormateur($formateur_id)
    {
        return response()->json(Seance::with(['module', 'groupe'])->where('formateur_id', $formateur_id)->orderBy('date', 'desc')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'module_id' => 'required|exists:modules,id',
            'groupe_id' => 'required|exists:groupes,id',
            'formateur_id' => 'required|exists:users,id',
            'date' => 'required|date',
            'heure_debut' => 'required',
            'heure_fin' => 'required',
            'type' => 'required|in:cours,tp,td,examen',
        ]);

        $seance = Seance::create($validated);
        return response()->json($seance, 201);
    }

    public function show(Seance $seance)
    {
        return response()->json($seance->load(['module', 'groupe', 'formateur', 'presences.stagiaire']));
    }

    public function update(Request $request, Seance $seance)
    {
        $validated = $request->validate([
            'module_id' => 'sometimes|required|exists:modules,id',
            'groupe_id' => 'sometimes|required|exists:groupes,id',
            'formateur_id' => 'sometimes|required|exists:users,id',
            'date' => 'sometimes|required|date',
            'heure_debut' => 'sometimes|required',
            'heure_fin' => 'sometimes|required',
            'type' => 'sometimes|required|in:cours,tp,td,examen',
            'is_validated' => 'sometimes|boolean',
        ]);

        $seance->update($validated);
        return response()->json($seance);
    }

    public function destroy(Seance $seance)
    {
        $seance->delete();
        return response()->json(null, 204);
    }
}
