# GestaGlic Admin

Painel administrativo do GestaGlic.

| Domínio | Projeto |
|---------|---------|
| **admin.gestaglic.com.br** | `admin-gestaglic` |
| **app.gestaglic.com.br** | `app_v2` |
| **gestaglic.com.br** | `lp-gestaglic` |
| API | `api-glicemia` |

## Setup local

```bash
# Copiar ícone
cp ../lp-gestaglic/public/icone-app-1024.png public/

cp .env.example .env.local
# NEXT_PUBLIC_API_URL=https://sua-api.vercel.app

npm install
npm run dev   # http://localhost:3003
```

## Acesso admin

1. Na API, configure `ADMIN_EMAILS=seu@email.com` (ou `is_admin: true` no MongoDB)
2. Faça login com a mesma conta do app
3. Apenas e-mails autorizados acessam o painel

### Tornar usuário admin no MongoDB

```javascript
db.users.updateOne(
  { email: "seu@email.com" },
  { $set: { is_admin: true } }
)
```

## Deploy (Vercel)

1. Importe o projeto `admin-gestaglic`
2. Domínio: `admin.gestaglic.com.br` (CNAME → Vercel)
3. Env: `NEXT_PUBLIC_API_URL` apontando para a API

## API — variáveis admin

```env
ADMIN_EMAILS=marcusvf.silva@outlook.com.br
VERCEL_ANALYTICS_URL=https://vercel.com/seu-time/gestaglic/analytics
```

## Métricas disponíveis

- **Usuárias:** total e novos cadastros (7 dias)
- **Infra:** documentos MongoDB, uso estimado vs 512MB M0, link Vercel Analytics
- **Financeiro:** pagamentos premium (R$ 14,90) gerados vs pagos, receita
- **Notificações:** lembretes ativos e dispositivos push
