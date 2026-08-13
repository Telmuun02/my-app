<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    /*
     | Cloudinary — номын нүүр зургийн хадгалалт.
     |
     | cloud_name нь зургийн хүргэлтийн URL бүрд ил харагддаг тул нууц биш.
     | api_key / api_secret нь зөвхөн БАЙРШУУЛАХ үед хэрэгтэй — зураг харуулахад
     | огт шаардлагагүй. Тиймээс production дээр secret байхгүй байсан ч
     | каталог хэвийн ажиллана.
     */
    'cloudinary' => [
        'cloud_name' => env('CLOUDINARY_CLOUD_NAME'),
        'api_key'    => env('CLOUDINARY_API_KEY'),
        'api_secret' => env('CLOUDINARY_API_SECRET'),

        // Бүх номд харагдах ганц нүүр зургийн Cloudinary дахь public_id.
        'default_cover' => env('CLOUDINARY_DEFAULT_COVER', 'folio/book-cover-default'),
    ],

];
