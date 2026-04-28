# Arquitectura Next.js + Prisma + NextAuth (Credentials)

```
├── proxy.ts                          ← middleware (Edge-safe, solo auth.config)
├── auth.config.ts                    ← config edge-safe sin Prisma ni bcrypt
├── auth.ts                           ← NextAuth con Credentials + callbacks jwt/session
│
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx              ← importa LoginForm
│   │   └── register/
│   │       └── page.tsx              ← importa RegisterForm
│   ├── user/
│   │   └── me/
│   │       └── page.tsx              ← protegida por proxy.ts · lee session con auth()
│   └── api/
│       └── auth/
│           └── [...nextauth]/
│               └── route.ts          ← re-exporta handlers de auth.ts (necesario para NextAuth)
│
├── src/
│   ├── actions/
│   │   └── auth/
│   │       └── auth.actions.ts       ← "use server" · registerAction · loginAction · logoutAction
│   │
│   ├── features/
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx         ← "use client" · useTransition · llama loginAction
│   │   │   └── RegisterForm.tsx      ← "use client" · useTransition · llama registerAction
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       ├── Navbar.tsx
│   │       └── Footer.tsx
│   │
│   └── global/
│       ├── schemas/
│       │   └── auth.schema.ts        ← loginSchema · registerSchema · tipos inferidos con Zod
│       └── types/
│           └── next-auth.d.ts        ← augmenta Session y JWT con id y role
│
├── lib/
│   └── prisma.ts                     ← singleton PrismaClient
│
└── prisma/
    └── schema.prisma                 ← model User · enum Role
```

---

## Regla de dependencias

```
app/pages
  → features/
    → actions/          ("use server")
      → global/schemas  (Zod)
      → lib/prisma
      → auth.ts         (signIn · signOut)
        → auth.config.ts

proxy.ts
  → auth.config.ts      (solo esto — edge-safe)
```

| Capa | Puede importar de | Nunca importa de |
|---|---|---|
| `global/` | solo zod, tipos nativos | nada del proyecto |
| `lib/` | `@prisma/client` | nada del proyecto |
| `actions/` | `global/`, `lib/prisma`, `auth.ts` | `features/` |
| `features/` | `global/`, `actions/` | `lib/prisma`, `auth.ts` directamente |
| `app/pages` | `features/`, `auth` (solo leer session) | `lib/prisma`, `actions/` directamente |
| `proxy.ts` | `auth.config.ts` | `lib/prisma`, `auth.ts` |

---

## Flujo register

```
RegisterForm (features)
  └─ handleSubmit → startTransition
       └─ registerAction(formData)      "use server"
            ├─ registerSchema.safeParse()
            ├─ prisma.user.findUnique() → verifica duplicado
            ├─ bcrypt.hash(password, 12)
            ├─ prisma.user.create()
            └─ { success: true, message } | { success: false, error }
                 └─ si ok → router.push("/auth/login")
```

## Flujo login

```
LoginForm (features)
  └─ handleSubmit → startTransition
       └─ loginAction(formData)         "use server"
            ├─ loginSchema.safeParse()
            ├─ signIn("credentials")    (auth.ts)
            │    └─ authorize()
            │         ├─ loginSchema.safeParse()
            │         ├─ prisma.user.findUnique()
            │         └─ bcrypt.compare()
            └─ { success: true, message } | { success: false, error }
                 └─ si ok → router.push("/user/me")
```

## Flujo logout

```
/user/me page
  └─ <form action={logoutAction}>
       └─ logoutAction()               "use server"
            └─ signOut({ redirectTo: "/auth/login" })
```

## Protección de rutas

```
proxy.ts (Edge)
  └─ /user/me && !session → redirect /auth/login
  └─ resto → NextResponse.next()
```

---

## Setup

```bash
# 1. Instalar
npm install next-auth@beta prisma @prisma/client zod bcryptjs
npm install -D @types/bcryptjs

# 2. Variables de entorno (.env)
DATABASE_URL="postgresql://user:password@localhost:5432/mydb"
AUTH_SECRET="openssl rand -base64 32"

# 3. Prisma
npx prisma generate        # genera cliente en /generated/prisma
npx prisma migrate dev --name init

# 4. tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["./*"] }
  }
}
```