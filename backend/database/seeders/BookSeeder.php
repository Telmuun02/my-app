<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Book;
use App\Models\Category;
use App\Models\Author;
use App\Models\Company;

class BookSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Ном бүрийг нэг мөрөөр тодорхойлно: category болон authors-ыг НЭРЭЭР бичнэ,
        // доорх foreach давталт нэрийг нь id болгож хөрвүүлээд үүсгэнэ.
        $books = [
            ['title' => 'A Brief History of Time',   'isbn' => '978-0553380163', 'category' => 'Science',    'authors' => ['Stephen Hawking'],                 'copies' => 5],
            ['title' => 'Sapiens',                    'isbn' => '978-0062316097', 'category' => 'History',    'authors' => ['Yuval Noah Harari'],               'copies' => 3],
            ['title' => '1984',                       'isbn' => '978-0451524935', 'category' => 'Fiction',    'authors' => ['George Orwell'],                   'copies' => 4],
            ['title' => 'Animal Farm',                'isbn' => '978-0451526342', 'category' => 'Fiction',    'authors' => ['George Orwell'],                   'copies' => 7],
            ['title' => 'Clean Code',                 'isbn' => '978-0132350884', 'category' => 'Technology', 'authors' => ['Robert C. Martin'],                'copies' => 6],
            ['title' => 'The Pragmatic Programmer',   'isbn' => '978-0201616224', 'category' => 'Technology', 'authors' => ['Andrew Hunt', 'David Thomas'],     'copies' => 3],
            ['title' => 'Homo Deus',                  'isbn' => '978-1784703936', 'category' => 'History',    'authors' => ['Yuval Noah Harari'],               'copies' => 4],
            ['title' => 'The Selfish Gene',           'isbn' => '978-0198788607', 'category' => 'Science',    'authors' => ['Richard Dawkins'],                 'copies' => 5],
        ];

        foreach ($books as $data) {
            $book = Book::create([
                'title'            => $data['title'],
                'isbn'             => $data['isbn'],
                'category_id'      => Category::where('name', $data['category'])->value('id'),
                'company_id'       => Company::inRandomOrder()->value('id'),
                'total_copies'     => $data['copies'],
                'available_copies' => $data['copies'],
            ]);

            // Нэрсээр нь зохиолчдын id-г олоод pivot (author_book) руу холбоно
            $authorIds = Author::whereIn('name', $data['authors'])->pluck('id');
            $book->authors()->attach($authorIds);
        }
    }
}
