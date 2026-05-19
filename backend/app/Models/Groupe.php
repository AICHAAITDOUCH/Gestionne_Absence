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

    public function formateurs()
    {
        return $this->belongsToMany(User::class, 'groupe_user', 'groupe_id', 'user_id')->where('role', 'formateur');
    }
}
