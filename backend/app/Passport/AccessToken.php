<?php

namespace App\Passport;

use DateTimeImmutable;
use Lcobucci\JWT\Configuration;
use Lcobucci\JWT\Signer\Key\InMemory;
use Lcobucci\JWT\Signer\Rsa\Sha256;
use League\OAuth2\Server\CryptKeyInterface;
use RuntimeException;
use SensitiveParameter;

/**
 */
class AccessToken extends \Laravel\Passport\Bridge\AccessToken
{
    /**
     * Эцэг классын $privateKey нь private тул бидэнд харагдахгүй.
     * Тиймээс өөрсдөө хуулбар хадгална.
     */
    protected CryptKeyInterface $signingKey;

    public function setPrivateKey(#[SensitiveParameter] CryptKeyInterface $privateKey): void {
        $this->signingKey = $privateKey;

        parent::setPrivateKey($privateKey);
    }

    /**
     * JWT-г өөрсдөө барина — стандарт claim-үүд дээр `role` нэмнэ.
     */
    public function toString(): string
    {
        $config = $this->buildJwtConfiguration();

        return $config->builder()
            ->permittedFor($this->getClient()->getIdentifier())
            ->identifiedBy($this->getIdentifier())
            ->issuedAt(new DateTimeImmutable())
            ->canOnlyBeUsedAfter(new DateTimeImmutable())
            ->expiresAt($this->getExpiryDateTime())
            ->relatedTo($this->getUserIdentifier() ?? $this->getClient()->getIdentifier())
            ->withClaim('scopes', $this->getScopes())
            ->withClaim('role', $this->resolveRole())
            ->getToken($config->signer(), $config->signingKey())
            ->toString();
    }

    /**
     * Токен эзэмшигчийн role. Клиентийн (хэрэглэгчгүй) токенд null.
     */
    protected function resolveRole(): ?string
    {
        $userId = $this->getUserIdentifier();

        if ($userId === null) {
            return null;
        }

        $model = config('auth.providers.users.model');

        return $model::find($userId)?->role;
    }

    /**
     * AccessTokenTrait::initJwtConfiguration()-ийн хуулбар — тэр нь үр дүнгээ
     * private property-д хадгалдаг тул бидэнд ашиглах боломжгүй.
     */
    protected function buildJwtConfiguration(): Configuration
    {
        $contents = $this->signingKey->getKeyContents();

        if ($contents === '') {
            throw new RuntimeException('Private key is empty');
        }

        return Configuration::forAsymmetricSigner(
            new Sha256(),
            InMemory::plainText($contents, $this->signingKey->getPassPhrase() ?? ''),
            InMemory::plainText('empty', 'empty')
        );
    }
}
