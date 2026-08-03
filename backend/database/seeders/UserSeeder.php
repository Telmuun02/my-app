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
        $admin = User::create([
            'name'       => 'Admin',
            'email'      => 'admin@example.com',
            'password'   => Hash::make('password'),
            'role'       => 'admin',
            'company_id' => Company::inRandomOrder()->value('id'),
        ]);

        // Туршилтын энгийн хэрэглэгч
        $test = User::create([
            'name'       => 'Test User',
            'email'      => 'test@example.com',
            'password'   => Hash::make('password'),
            'role'       => 'user',
            'company_id' => Company::inRandomOrder()->value('id'),
        ]);

        // Demo бүртгэлүүдийг баталгаажсан гэж тэмдэглэнэ — эс бөгөөс хатуу горимд
        // нэвтэрч чадахгүй. email_verified_at нь fillable-д байхгүй тул
        // массаар онооход алгасагдана; markEmailAsVerified() ашиглах ёстой.
        $admin->markEmailAsVerified();
        $test->markEmailAsVerified();

        // Зохиомол bulk хэрэглэгчид
        User::factory()->count(1000)->create();
    }
}
