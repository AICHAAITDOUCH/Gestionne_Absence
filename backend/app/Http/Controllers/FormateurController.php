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
}
