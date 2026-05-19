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

    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|file'
        ]);

        $file = $request->file('file');
        $path = $file->getRealPath();
        $extension = strtolower($file->getClientOriginalExtension());

        $rows = [];

        if ($extension === 'csv' || $extension === 'txt') {
            if (($handle = fopen($path, 'r')) !== false) {
                // Read header row
                $header = fgetcsv($handle, 1000, ',');
                if ($header) {
                    $header = array_map(function($h) {
                        return trim(strtolower($h));
                    }, $header);
                }

                while (($data = fgetcsv($handle, 1000, ',')) !== false) {
                    if (count($data) >= count($header)) {
                        $rows[] = array_combine(array_slice($header, 0, count($data)), array_slice($data, 0, count($header)));
                    }
                }
                fclose($handle);
            }
        } else {
            // Excel import using PhpSpreadsheet
            $spreadsheet = \PhpOffice\PhpSpreadsheet\IOFactory::load($path);
            $worksheet = $spreadsheet->getActiveSheet();
            $highestRow = $worksheet->getHighestRow();
            $highestColumn = $worksheet->getHighestColumn();
            
            $headerRow = $worksheet->rangeToArray('A1:' . $highestColumn . '1', null, true, false)[0];
            $header = array_map(function($h) {
                return trim(strtolower($h ?? ''));
            }, $headerRow);

            for ($row = 2; $row <= $highestRow; $row++) {
                $rowData = $worksheet->rangeToArray('A' . $row . ':' . $highestColumn . $row, null, true, false)[0];
                if (empty(array_filter($rowData))) {
                    continue;
                }
                $rows[] = array_combine(array_slice($header, 0, count($rowData)), array_slice($rowData, 0, count($header)));
            }
        }

        $imported = 0;
        $errors = [];

        foreach ($rows as $index => $row) {
            $rowNum = $index + 2;
            
            $nameKey = isset($row['nom']) ? 'nom' : (isset($row['name']) ? 'name' : (isset($row['nom complet']) ? 'nom complet' : null));
            $emailKey = isset($row['email']) ? 'email' : (isset($row['mail']) ? 'mail' : null);
            $phoneKey = isset($row['telephone']) ? 'telephone' : (isset($row['téléphone']) ? 'téléphone' : (isset($row['phone']) ? 'phone' : null));
            $groupKey = isset($row['groupe']) ? 'groupe' : (isset($row['group']) ? 'group' : null);
            $passwordKey = isset($row['password']) ? 'password' : (isset($row['mot de passe']) ? 'mot de passe' : null);

            $name = $nameKey ? trim($row[$nameKey] ?? '') : '';
            $email = $emailKey ? trim($row[$emailKey] ?? '') : '';
            $phone = $phoneKey ? trim($row[$phoneKey] ?? '') : null;
            $groupName = $groupKey ? trim($row[$groupKey] ?? '') : '';
            $passwordStr = $passwordKey ? trim($row[$passwordKey] ?? '') : 'password';

            if (empty($name) || empty($email)) {
                $errors[] = "Ligne $rowNum : Le nom et l'email sont obligatoires.";
                continue;
            }

            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                $errors[] = "Ligne $rowNum : L'email '$email' n'est pas valide.";
                continue;
            }

            if (\App\Models\User::where('email', $email)->exists()) {
                $errors[] = "Ligne $rowNum : L'email '$email' est déjà utilisé (doublon).";
                continue;
            }

            $group = \App\Models\Groupe::where('name', $groupName)->first();
            if (!$group) {
                $errors[] = "Ligne $rowNum : Le groupe '$groupName' n'existe pas.";
                continue;
            }

            \App\Models\User::create([
                'name' => $name,
                'email' => $email,
                'password' => \Illuminate\Support\Facades\Hash::make($passwordStr),
                'phone' => $phone,
                'role' => 'stagiaire',
                'groupe_id' => $group->id,
            ]);

            $imported++;
        }

        return response()->json([
            'message' => "$imported stagiaires importés avec succès.",
            'imported_count' => $imported,
            'errors' => $errors
        ]);
    }

    public function mySessions(Request $request)
    {
        $user = $request->user();
        $sessions = \App\Models\Seance::with(['module', 'formateur'])
            ->where('groupe_id', $user->groupe_id)
            ->orderBy('date', 'desc')
            ->orderBy('heure_debut', 'desc')
            ->get();
        return response()->json($sessions);
    }

    public function myAbsences(Request $request)
    {
        $user = $request->user();
        $presences = \App\Models\Presence::with(['seance.module', 'seance.formateur', 'justification'])
            ->where('stagiaire_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();
        return response()->json($presences);
    }

    public function myProfile(Request $request)
    {
        return response()->json($request->user()->load('groupe'));
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();
        
        $validated = $request->validate([
            'phone' => 'nullable|string|max:20',
            'password' => 'nullable|string|min:6|confirmed',
            'avatar' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);
        
        if ($request->filled('password')) {
            $validated['password'] = Hash::make($request->password);
        } else {
            unset($validated['password']);
        }
        
        if ($request->hasFile('avatar')) {
            $path = $request->file('avatar')->store('avatars', 'public');
            $validated['avatar'] = '/storage/' . $path;
        }

        $user->update($validated);
        return response()->json($user->load('groupe'));
    }
}
