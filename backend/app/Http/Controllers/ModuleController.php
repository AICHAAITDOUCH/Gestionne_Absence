<?php

namespace App\Http\Controllers;

use App\Models\Module;
use Illuminate\Http\Request;

class ModuleController extends Controller
{
    public function index(Request $request)
    {
        $query = Module::with(['formateur', 'groupe']);
        
        if ($request->filled('formateur_id')) {
            $query->where('formateur_id', $request->input('formateur_id'));
        }
        
        if ($request->filled('groupe_id')) {
            $query->where('groupe_id', $request->input('groupe_id'));
        }
        
        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:255|unique:modules',
            'volume_horaire' => 'nullable|integer',
            'formateur_id' => 'nullable|exists:users,id',
            'groupe_id' => 'nullable|exists:groupes,id',
        ]);

        $module = Module::create($validated);
        return response()->json($module->load(['formateur', 'groupe']), 201);
    }

    public function show(Module $module)
    {
        return response()->json($module->load(['formateur', 'groupe']));
    }

    public function update(Request $request, Module $module)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'code' => 'sometimes|required|string|max:255|unique:modules,code,' . $module->id,
            'volume_horaire' => 'nullable|integer',
            'formateur_id' => 'nullable|exists:users,id',
            'groupe_id' => 'nullable|exists:groupes,id',
        ]);

        $module->update($validated);
        return response()->json($module->load(['formateur', 'groupe']));
    }

    public function destroy(Module $module)
    {
        $module->delete();
        return response()->json(null, 204);
    }
}
