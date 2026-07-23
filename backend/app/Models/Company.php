<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Company extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'email',
        'phone_number',
    ];

    public function books()
    {
        return $this->hasMany(Book::class, 'company_id', 'id');
    }

    public function users()
    {
        return $this->hasMany(User::class, 'company_id', 'id');
    }
}
