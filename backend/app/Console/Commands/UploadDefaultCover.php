<?php

namespace App\Console\Commands;

use Cloudinary\Cloudinary;
use Illuminate\Console\Command;
use Throwable;

/**
 * Бүх номд харагдах ганц нүүр зургийг Cloudinary руу байршуулна.
 *
 * Нэг удаа ажиллуулахад хангалттай. Зургийг солихыг хүсвэл дахин ажиллуулахад
 * ижил public_id дээр дарж бичнэ (overwrite), тиймээс frontend дэх URL
 * өөрчлөгдөхгүй — зөвхөн агуулга нь солигдоно.
 */
class UploadDefaultCover extends Command
{
    protected $signature = 'cover:upload
                            {source? : Байршуулах зургийн зам эсвэл URL}
                            {--public-id= : Cloudinary дахь нэр (өгөхгүй бол үндсэн нүүр зураг)}';

    protected $description = 'Номын үндсэн нүүр зургийг Cloudinary руу байршуулах';

    public function handle(): int
    {
        $config = config('services.cloudinary');

        // Байршуулахад api_secret зайлшгүй. Харуулахад хэрэггүй тул энэ шалгалт
        // зөвхөн энэ командад хамаарна.
        if (empty($config['api_secret'])) {
            $this->components->error('CLOUDINARY_API_SECRET .env дотор хоосон байна.');
            $this->line('  Cloudinary dashboard → API Keys хэсгээс хуулж тавина уу.');

            return self::FAILURE;
        }

        // Эх сурвалж заагаагүй бол одоо frontend дээр хатуу бичээстэй байгаа
        // зургийг ашиглана — ингэснээр харагдах байдал өөрчлөгдөхгүй.
        // Cloudinary-ийн upload API нь алсын URL-ыг шууд хүлээж авдаг.
        $source = $this->argument('source')
            ?? 'https://covers.openlibrary.org/b/isbn/9780451524935-L.jpg';

        $publicId = $this->option('public-id') ?: $config['default_cover'];

        $this->components->info("Байршуулж байна: {$source}");
        $this->line("  public_id: {$publicId}");

        try {
            $cloudinary = new Cloudinary([
                'cloud' => [
                    'cloud_name' => $config['cloud_name'],
                    'api_key'    => $config['api_key'],
                    'api_secret' => $config['api_secret'],
                ],
            ]);

            $result = $cloudinary->uploadApi()->upload($source, [
                'public_id'     => $publicId,
                'overwrite'     => true,
                'resource_type' => 'image',
            ]);
        } catch (Throwable $e) {
            $this->components->error('Байршуулалт амжилтгүй: ' . $e->getMessage());

            return self::FAILURE;
        }

        $this->newLine();
        $this->components->info('Амжилттай байршууллаа.');
        $this->line('  URL:    ' . $result['secure_url']);
        $this->line('  Хэмжээ: ' . $result['width'] . '×' . $result['height']
            . ' (' . number_format($result['bytes'] / 1024, 1) . ' KB)');

        return self::SUCCESS;
    }
}
