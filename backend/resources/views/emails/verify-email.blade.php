{{--
    Баталгаажуулах и-мэйлийн загвар — frontend-ийн "Folio" дизайн системтэй ижил өнгө.

    Мэйлийн HTML нь вэбийн HTML биш тул дараах дүрмүүдийг баримталсан:
      • CSS хувьсагч (var(--primary)) ажиллахгүй → hex кодыг шууд бичсэн
      • flexbox / grid ажиллахгүй → бүх байрлуулалт <table>-ээр
      • <style> тэгийг Gmail-ийн апп хаядаг → бүх загвар inline style=""
      • <button> ажиллахгүй → товчийг <a> + table cell-ээр хийсэн
--}}
<!--[if mso]><style>body,table,td,a{font-family:Arial,Helvetica,sans-serif !important}</style><![endif]-->

{{-- Preheader: inbox-ийн жагсаалтад гарчгийн хажууд харагдах текст, мэйл дотор нуугдана --}}
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">
    Бүртгэлээ дуусгахын тулд и-мэйл хаягаа баталгаажуулна уу.
</div>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
       style="background-color:#f4f2ec;margin:0;padding:32px 12px;
              font-family:system-ui,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <tr>
        <td align="center">

            {{-- ===== Голын карт (--surface) ===== --}}
            <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0"
                   style="width:100%;max-width:600px;background-color:#faf9f5;border:1px solid #e4e2d8;
                          border-radius:12px;overflow:hidden;">

                {{-- Лого / брэнд --}}
                <tr>
                    <td style="padding:32px 40px 0 40px;">
                        <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                                <td style="background-color:#2f5233;border-radius:8px;width:36px;height:36px;
                                           text-align:center;vertical-align:middle;">
                                    <span style="color:#ffffff;font-size:18px;font-weight:700;line-height:36px;">F</span>
                                </td>
                                <td style="padding-left:12px;">
                                    <span style="color:#2c2b27;font-size:20px;font-weight:700;letter-spacing:-0.2px;">
                                        {{ config('app.name') }}
                                    </span>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>

                {{-- Гарчиг + үндсэн текст --}}
                <tr>
                    <td style="padding:28px 40px 0 40px;">
                        <h1 style="margin:0 0 16px 0;color:#2c2b27;font-size:24px;font-weight:700;
                                   line-height:1.3;letter-spacing:-0.3px;">
                            Сайн байна уу, {{ $user->name }}
                        </h1>

                        <p style="margin:0 0 12px 0;color:#2c2b27;font-size:15px;line-height:1.65;">
                            <strong>{{ config('app.name') }}</strong> номын санд тавтай морил.
                            Бүртгэлээ дуусгаж, ном зээлж эхлэхийн тулд и-мэйл хаягаа
                            баталгаажуулна уу.
                        </p>
                    </td>
                </tr>

                {{-- Товч --}}
                <tr>
                    <td align="center" style="padding:28px 40px 0 40px;">
                        <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                                <td align="center" bgcolor="#2f5233" style="border-radius:8px;">
                                    <a href="{{ $url }}"
                                       style="display:inline-block;padding:14px 32px;color:#ffffff;
                                              font-size:15px;font-weight:600;text-decoration:none;
                                              border-radius:8px;">
                                        И-мэйлээ баталгаажуулах
                                    </a>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>

                {{-- Хугацааны сануулга --}}
                <tr>
                    <td align="center" style="padding:16px 40px 0 40px;">
                        <p style="margin:0;color:#8b897e;font-size:13px;line-height:1.6;">
                            Энэ холбоос {{ $expireHours }} цагийн дараа хүчингүй болно.
                        </p>
                    </td>
                </tr>

                {{-- Товч ажиллахгүй үеийн нөөц холбоос --}}
                <tr>
                    <td style="padding:28px 40px 0 40px;">
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                               style="background-color:#f4f2ec;border-radius:8px;">
                            <tr>
                                <td style="padding:16px 18px;">
                                    <p style="margin:0 0 8px 0;color:#8b897e;font-size:12px;line-height:1.5;">
                                        Товч дарагдахгүй бол доорх хаягийг хөтчийнхөө хаягийн мөрөнд хуулж тавина уу:
                                    </p>
                                    <a href="{{ $url }}"
                                       style="color:#2f5233;font-size:12px;line-height:1.5;
                                              word-break:break-all;text-decoration:underline;">{{ $url }}</a>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>

                {{-- Тусгаарлагч --}}
                <tr>
                    <td style="padding:28px 40px 0 40px;">
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                                <td style="border-top:1px solid #e4e2d8;font-size:0;line-height:0;">&nbsp;</td>
                            </tr>
                        </table>
                    </td>
                </tr>

                {{-- Хөл --}}
                <tr>
                    <td style="padding:20px 40px 32px 40px;">
                        <p style="margin:0 0 6px 0;color:#8b897e;font-size:12px;line-height:1.6;">
                            Хэрэв та бүртгүүлээгүй бол энэ захидлыг үл тоомсорлоно уу —
                            ямар нэг үйлдэл хийх шаардлагагүй.
                        </p>
                        <p style="margin:0;color:#8b897e;font-size:12px;line-height:1.6;">
                            &copy; {{ date('Y') }} {{ config('app.name') }}
                        </p>
                    </td>
                </tr>

            </table>
        </td>
    </tr>
</table>
