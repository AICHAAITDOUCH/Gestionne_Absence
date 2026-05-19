<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class StagiaireController extends Controller
{
    public function index()
    {
        return response()->json(User::with('groupe')->where('role', 'stagiaire')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
            'phone' => 'nullable|string|max:20',
            'groupe_id' => 'required|exists:groupes,id',
        ]);

        $validated['password'] = Hash::make($validated['password']);
        $validated['role'] = 'stagiaire';

        $stagiaire = User::create($validated);
        
        return response()->json($stagiaire->load('groupe'), 201);
    }

    public function show($id)
    {
        $stagiaire = User::with('groupe')->where('role', 'stagiaire')->findOrFail($id);
        return response()->json($stagiaire);
    }

    public function update(Request $request, $id)
    {
        $stagiaire = User::where('role', 'stagiaire')->findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|string|email|max:255|unique:users,email,' . $id,
            'phone' => 'nullable|string|max:20',
            'groupe_id' => 'sometimes|required|exists:groupes,id',
        ]);

        if ($request->filled('password')) {
            $validated['password'] = Hash::make($request->password);
        }

        $stagiaire->update($validated);
        return response()->json($stagiaire->load('groupe'));
    }

    public function destroy($id)
    {
        $stagiaire = User::where('role', 'stagiaire')->findOrFail($id);
        $stagiaire->delete();
        return response()->json(null, 204);
    }
}
