# Third-Party Dependencies und Lizenzen

Dieses Projekt verwendet die folgenden Open-Source-Bibliotheken und deren Lizenzen:

## Production Dependencies

### @prisma/client (^5.14.0)
- **Lizenz**: Apache License 2.0
- **Repository**: https://github.com/prisma/prisma
- **Kostenfrei**: ✅ Ja (Open Source)

### @sendgrid/mail (^8.1.3)
- **Lizenz**: MIT License
- **Repository**: https://github.com/sendgrid/sendgrid-nodejs
- **Kostenfrei**: ✅ Ja (Open Source Library)
- **Hinweis**: SendGrid-Service bietet kostenloses Tier (100 E-Mails/Tag), danach kostenpflichtig

### bcryptjs (^2.4.3)
- **Lizenz**: MIT License
- **Repository**: https://github.com/dcodeIO/bcrypt.js
- **Kostenfrei**: ✅ Ja

### clsx (^2.1.1)
- **Lizenz**: MIT License
- **Repository**: https://github.com/lukeed/clsx
- **Kostenfrei**: ✅ Ja

### exceljs (^4.4.0)
- **Lizenz**: MIT License
- **Repository**: https://github.com/exceljs/exceljs
- **Kostenfrei**: ✅ Ja

### lucide-react (^0.378.0)
- **Lizenz**: ISC License
- **Repository**: https://github.com/lucide-icons/lucide
- **Kostenfrei**: ✅ Ja

### next (^14.2.35)
- **Lizenz**: MIT License
- **Repository**: https://github.com/vercel/next.js
- **Kostenfrei**: ✅ Ja

### next-auth (^4.24.7)
- **Lizenz**: Apache License 2.0
- **Repository**: https://github.com/nextauthjs/next-auth
- **Kostenfrei**: ✅ Ja

### react (^18.2.0)
- **Lizenz**: MIT License
- **Repository**: https://github.com/facebook/react
- **Kostenfrei**: ✅ Ja

### react-dom (^18.2.0)
- **Lizenz**: MIT License
- **Repository**: https://github.com/facebook/react
- **Kostenfrei**: ✅ Ja

### recharts (^2.12.7)
- **Lizenz**: MIT License
- **Repository**: https://github.com/recharts/recharts
- **Kostenfrei**: ✅ Ja

### tailwind-merge (^2.3.0)
- **Lizenz**: MIT License
- **Repository**: https://github.com/dcastil/tailwind-merge
- **Kostenfrei**: ✅ Ja

### zod (^3.23.8)
- **Lizenz**: MIT License
- **Repository**: https://github.com/colinhacks/zod
- **Kostenfrei**: ✅ Ja

## Development Dependencies

### @types/bcryptjs (^2.4.6)
- **Lizenz**: MIT License
- **Kostenfrei**: ✅ Ja

### @types/node (^20.12.12)
- **Lizenz**: MIT License
- **Kostenfrei**: ✅ Ja

### @types/react (^18.3.2)
- **Lizenz**: MIT License
- **Kostenfrei**: ✅ Ja

### @types/react-dom (^18.3.0)
- **Lizenz**: MIT License
- **Kostenfrei**: ✅ Ja

### autoprefixer (^10.4.19)
- **Lizenz**: MIT License
- **Repository**: https://github.com/postcss/autoprefixer
- **Kostenfrei**: ✅ Ja

### eslint (^8.57.0)
- **Lizenz**: MIT License
- **Repository**: https://github.com/eslint/eslint
- **Kostenfrei**: ✅ Ja

### eslint-config-next (^14.2.35)
- **Lizenz**: MIT License
- **Kostenfrei**: ✅ Ja

### postcss (^8.4.38)
- **Lizenz**: MIT License
- **Repository**: https://github.com/postcss/postcss
- **Kostenfrei**: ✅ Ja

### prisma (^5.14.0)
- **Lizenz**: Apache License 2.0
- **Repository**: https://github.com/prisma/prisma
- **Kostenfrei**: ✅ Ja

### tailwindcss (^3.4.3)
- **Lizenz**: MIT License
- **Repository**: https://github.com/tailwindlabs/tailwindcss
- **Kostenfrei**: ✅ Ja

### tsx (^4.10.5)
- **Lizenz**: MIT License
- **Repository**: https://github.com/esbuild-kit/tsx
- **Kostenfrei**: ✅ Ja

### typescript (^5.4.5)
- **Lizenz**: Apache License 2.0
- **Repository**: https://github.com/microsoft/TypeScript
- **Kostenfrei**: ✅ Ja

## Zusammenfassung

✅ **Alle Dependencies sind kostenfrei und Open Source**

- **MIT License**: Die Mehrheit der Dependencies verwendet die MIT-Lizenz
- **Apache 2.0**: Prisma, NextAuth, TypeScript verwenden die Apache 2.0 Lizenz
- **ISC License**: lucide-react verwendet die ISC-Lizenz

Alle diese Lizenzen sind permissive und erlauben die kommerzielle Nutzung ohne Einschränkungen.

## Externe Services

### SendGrid (E-Mail-Versand)
- **Kostenloses Tier**: 100 E-Mails pro Tag
- **Preise**: Ab 100 E-Mails/Tag werden Kosten fällig
- **Link**: https://sendgrid.com/pricing/

### PostgreSQL (Datenbank)
- **Kostenfrei**: ✅ Ja (Open Source)
- **Docker Image**: postgres:16-alpine (offiziell, kostenlos)

## Aktualisierung der Lizenzen

Um die aktuellen Lizenzen aller Dependencies zu überprüfen, führen Sie aus:

```bash
npm list --depth=0
npm info <package-name> license
```

Oder verwenden Sie Tools wie:
- `license-checker`: https://www.npmjs.com/package/license-checker
- `npm-license-checker`: https://www.npmjs.com/package/npm-license-checker
