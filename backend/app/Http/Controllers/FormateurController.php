<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class FormateurController extends Controller
{
    public function index()
    {
        return response()->json(User::where('role', 'formateur')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
            'phone' => 'nullable|string|max:20',
        ]);

        $validated['password'] = Hash::make($validated['password']);
        $validated['role'] = 'formateur';

        $formateur = User::create($validated);
        
        return response()->json($formateur, 201);
    }

    public function show($id)
    {
        $formateur = User::where('role', 'formateur')->findOrFail($id);
        return response()->json($formateur);
    }

    public function update(Request $request, $id)
    {
        $formateur = User::where('role', 'formateur')->findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|string|email|max:255|unique:users,email,' . $id,
            'phone' => 'nullable|string|max:20',
        ]);

        if ($request->filled('password')) {
            $validated['password'] = Hash::make($request->password);
        }

        $formateur->update($validated);
        return response()->json($formateur);
    }

    public function destroy($id)
    {
        $formateur = User::where('role', 'formateur')->findOrFail($id);
        $formateur->delete();
        return response()->json(null, 204);
    }

    public function getGroupes($id)
    {
        $formateur = \App\Models\User::findOrFail($id);
        $groupes = $formateur->groupes;
        
        if ($groupes->isEmpty()) {
            $groupeIds = \App\Models\Seance::where('formateur_id', $id)
                ->pluck('groupe_id')
                ->unique();
                
            if ($groupeIds->isNotEmpty()) {
                $groupes = \App\Models\Groupe::whereIn('id', $groupeIds)->get();
            } else {
                $groupes = \App\Models\Groupe::all();
            }
        }
        
        return response()->json($groupes);
    }

    public function myGroupes(Request $request)
    {
        $formateur = $request->user();
        $groupes = $formateur->groupes()->withCount('stagiaires')->get();
        if ($groupes->isEmpty()) {
            $groupeIds = \App\Models\Seance::where('formateur_id', $formateur->id)->pluck('groupe_id')->unique();
            $groupes = \App\Models\Groupe::whereIn('id', $groupeIds)->withCount('stagiaires')->get();
        }
        return response()->json($groupes);
    }

    public function myModules(Request $request)
    {
        $formateur = $request->user();
        $modules = \App\Models\Module::where('formateur_id', $formateur->id)->with('groupe')->get();
        return response()->json($modules);
    }

    public function mySeances(Request $request)
    {
        $formateur = $request->user();
        $seances = \App\Models\Seance::where('formateur_id', $formateur->id)->with(['module', 'groupe'])->get();
        return response()->json($seances);
    }
}
