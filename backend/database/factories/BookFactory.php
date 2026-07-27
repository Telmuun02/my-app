<?php

namespace Database\Factories;

use App\Models\Author;
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

    /**
     * Ном үүссэний ДАРАА ажиллах callback — санамсаргүй зохиолч холбоно.
     */
    public function configure(): static
    {
        return $this->afterCreating(function (Book $book) {
            // Байгаа зохиолчдоос 1-3-ыг санамсаргүй сонгож author_book pivot-д холбоно
            $authorIds = Author::inRandomOrder()->take(rand(1, 3))->pluck('id');
            $book->authors()->attach($authorIds);
        });
    }
}
