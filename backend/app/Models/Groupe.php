<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Groupe extends Model
{
    /** @use HasFactory<\Database\Factories\GroupeFactory> */
    use HasFactory;

    protected $fillable = ['name', 'filiere', 'annee'];

    public function stagiaires()
    {
        return $this->hasMany(User::class);
    }

    public function seances()
    {
        return $this->hasMany(Seance::class);
    }
}
