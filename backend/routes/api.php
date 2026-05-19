<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\GroupeController;
use App\Http\Controllers\ModuleController;
use App\Http\Controllers\SeanceController;
use App\Http\Controllers\PresenceController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\StagiaireController;
use App\Http\Controllers\FormateurController;
use App\Http\Controllers\JustificationController;
use App\Http\Controllers\NotificationController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Auth routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    // Dashboards
    Route::get('/dashboard/admin', [DashboardController::class, 'adminStats']);
    Route::get('/dashboard/formateur', [DashboardController::class, 'formateurStats']);
    Route::get('/dashboard/stagiaire', [DashboardController::class, 'stagiaireStats']);

    // API Resources
    Route::post('stagiaires/import', [StagiaireController::class, 'import']);
    Route::apiResource('stagiaires', StagiaireController::class);
    Route::get('formateurs/{id}/groupes', [FormateurController::class, 'getGroupes']);
    Route::apiResource('formateurs', FormateurController::class);
    Route::apiResource('groupes', GroupeController::class);
    Route::apiResource('modules', ModuleController::class);
    Route::apiResource('seances', SeanceController::class);
    Route::post('/presences/batch', [PresenceController::class, 'saveBatch']);
    Route::apiResource('presences', PresenceController::class);
    Route::apiResource('justifications', JustificationController::class);
    
    // Additional endpoints for specific roles or queries could be added here
    Route::get('/dashboard/stagiaire', [DashboardController::class, 'stagiaireStats']);
    Route::get('/stagiaire/sessions', [StagiaireController::class, 'mySessions']);
    Route::get('/stagiaire/absences', [StagiaireController::class, 'myAbsences']);
    Route::get('/stagiaire/profile', [StagiaireController::class, 'myProfile']);
    Route::post('/stagiaire/profile', [StagiaireController::class, 'updateProfile']);
    Route::get('/stagiaire/justifications', [JustificationController::class, 'myJustifications']);
    Route::get('/stagiaire/notifications', [NotificationController::class, 'index']);
    Route::post('/stagiaire/notifications/read', [NotificationController::class, 'markAllRead']);
    Route::post('/stagiaire/notifications/{id}/read', [NotificationController::class, 'markRead']);
    Route::delete('/stagiaire/notifications/{id}', [NotificationController::class, 'destroy']);

    Route::get('/formateur/groupes', [FormateurController::class, 'myGroupes']);
    Route::get('/formateur/modules', [FormateurController::class, 'myModules']);
    Route::get('/formateur/seances', [FormateurController::class, 'mySeances']);
    Route::get('/seances/formateur/{formateur_id}', [SeanceController::class, 'byFormateur']);
    Route::get('/presences/seance/{seance_id}', [PresenceController::class, 'bySeance']);
});
