<?php

namespace Database\Seeders;

use App\Models\Book;
use App\Models\Company;
use App\Models\User;
use Illuminate\Database\Seeder;

class FakeDataSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Компани эхэлж (users, books эдгээрийг заана)
        Company::factory()->count(10)->create();

        // 2. Хэрэглэгч (байгаа компаниас санамсаргүй сонгоно)
        User::factory()->count(1000)->create();

        // 3. Ном (компани + category-оос санамсаргүй сонгоно)
        Book::factory()->count(100)->create();
    }
}
