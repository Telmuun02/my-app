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
        // Бүх компанийг factory-гоор дараалсан нэртэй үүсгэнэ: Company1 ... Company17
        Company::factory()->count(17)->create();
    }
}
