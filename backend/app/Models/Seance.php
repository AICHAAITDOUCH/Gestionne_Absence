<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Seance extends Model
{
    use HasFactory;

    protected $fillable = [
        'module_id',
        'groupe_id',
        'formateur_id',
        'date',
        'heure_debut',
        'heure_fin',
        'type',
        'is_validated'
    ];

    public function module()
    {
        return $this->belongsTo(Module::class);
    }

    public function groupe()
    {
        return $this->belongsTo(Groupe::class);
    }

    public function formateur()
    {
        return $this->belongsTo(User::class, 'formateur_id');
    }

    public function presences()
    {
        return $this->hasMany(Presence::class);
    }
}
