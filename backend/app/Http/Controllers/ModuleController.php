<?php

namespace App\Http\Controllers;

use App\Models\Module;
use Illuminate\Http\Request;

class ModuleController extends Controller
{
    public function index()
    {
        return response()->json(Module::all());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:255|unique:modules',
            'volume_horaire' => 'nullable|integer',
        ]);

        $module = Module::create($validated);
        return response()->json($module, 201);
    }

    public function show(Module $module)
    {
        return response()->json($module);
    }

    public function update(Request $request, Module $module)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'code' => 'sometimes|required|string|max:255|unique:modules,code,' . $module->id,
            'volume_horaire' => 'nullable|integer',
        ]);

        $module->update($validated);
        return response()->json($module);
    }

    public function destroy(Module $module)
    {
        $module->delete();
        return response()->json(null, 204);
    }
}
