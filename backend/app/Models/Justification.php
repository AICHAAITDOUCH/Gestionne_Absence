<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Justification extends Model
{
    use HasFactory;

    protected $fillable = [
        'presence_id',
        'document_path',
        'status',
        'admin_remarque',
        'motif'
    ];

    public function presence()
    {
        return $this->belongsTo(Presence::class);
    }
}
