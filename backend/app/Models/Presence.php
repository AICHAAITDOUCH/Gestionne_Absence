<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Presence extends Model
{
    use HasFactory;

    protected $fillable = [
        'seance_id',
        'stagiaire_id',
        'status',
        'remarque'
    ];

    public function seance()
    {
        return $this->belongsTo(Seance::class);
    }

    public function stagiaire()
    {
        return $this->belongsTo(User::class, 'stagiaire_id');
    }

    public function justification()
    {
        return $this->hasOne(Justification::class);
    }
}
