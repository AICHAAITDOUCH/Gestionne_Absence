<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Module extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'code', 'volume_horaire'];

    public function seances()
    {
        return $this->hasMany(Seance::class);
    }
}
