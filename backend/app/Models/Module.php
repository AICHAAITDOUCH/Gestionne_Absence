<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Module extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'code', 'volume_horaire', 'formateur_id', 'groupe_id'];

    public function seances()
    {
        return $this->hasMany(Seance::class);
    }

    public function formateur()
    {
        return $this->belongsTo(User::class, 'formateur_id');
    }

    public function groupe()
    {
        return $this->belongsTo(Groupe::class, 'groupe_id');
    }
}
