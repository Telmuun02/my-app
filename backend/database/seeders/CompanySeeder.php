<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Company;

class CompanySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Company::create(['name' => 'George Orwell']);
        Company::create(['name' => 'Stephen Hawking']);
        Company::create(['name' => 'Yuval Noah Harari']);
        Company::create(['name' => 'Robert C. Martin']);
        Company::create(['name' => 'Andrew Hunt']);
        Company::create(['name' => 'David Thomas']);
        Company::create(['name' => 'Richard Dawkins']);

        // Зохиомол bulk компаниуд
        Company::factory()->count(10)->create();
    }
}
