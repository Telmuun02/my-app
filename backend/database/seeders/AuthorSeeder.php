<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Author;

class AuthorSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Author::create(['name' => 'George Orwell']);
        Author::create(['name' => 'Stephen Hawking']);
        Author::create(['name' => 'Yuval Noah Harari']);
        Author::create(['name' => 'Robert C. Martin']);
        Author::create(['name' => 'Andrew Hunt']);
        Author::create(['name' => 'David Thomas']);
        Author::create(['name' => 'Richard Dawkins']);
    }
}
