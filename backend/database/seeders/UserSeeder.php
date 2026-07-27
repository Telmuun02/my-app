<?php

namespace Database\Seeders;

use App\Models\Company;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Туршилтын admin хэрэглэгч
        User::create([
            'name'       => 'Admin',
            'email'      => 'admin@example.com',
            'password'   => Hash::make('password'),
            'role'       => 'admin',
            'company_id' => Company::inRandomOrder()->value('id'),
        ]);

        // Туршилтын энгийн хэрэглэгч
        User::create([
            'name'       => 'Test User',
            'email'      => 'test@example.com',
            'password'   => Hash::make('password'),
            'role'       => 'user',
            'company_id' => Company::inRandomOrder()->value('id'),
        ]);

        // Зохиомол bulk хэрэглэгчид
        User::factory()->count(1000)->create();
    }
}
