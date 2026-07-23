<?php

namespace Database\Factories;

use App\Models\Book;
use App\Models\Category;
use App\Models\Company;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Book>
 */
class BookFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $totalCopies = fake()->numberBetween(1, 20);

        return [
            'title'            => fake()->sentence(3),
            'isbn'             => fake()->unique()->isbn13(),
            'category_id'      => Category::inRandomOrder()->value('id'),
            'company_id'       => Company::inRandomOrder()->value('id'),
            'total_copies'     => $totalCopies,
            'available_copies' => fake()->numberBetween(0, $totalCopies),
        ];
    }
}
