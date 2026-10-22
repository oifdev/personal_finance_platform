# OG Finance

Plataforma moderna para gestionar finanzas personales y empresariales con dashboard analítico, control de presupuestos, seguimiento de ingresos y gastos, reportes financieros y asistencia basada en IA.

Demo en producción: https://ogfinanceb.vercel.app/

## Descripción

OG Finance es una aplicación web construida con Next.js para ayudar a usuarios y equipos a:

- Registrar ingresos y egresos
- Clasificar movimientos por categoría
- Definir presupuestos mensuales
- Monitorear flujo de caja y tendencias
- Visualizar métricas con gráficos interactivos
- Exportar reportes en PDF y Excel
- Recibir recomendaciones y análisis con IA generativa

La plataforma está desplegada en Vercel y está pensada para ofrecer una experiencia clara, rápida y útil para la toma de decisiones financieras.

## Características principales

- Dashboard financiero con KPIs clave
- Seguimiento de gastos e ingresos
- Presupuestos personalizables
- Reportes visuales con Recharts
- Exportación de documentos en PDF y Excel
- Integración con Supabase
- IA generativa para insights financieros
- Soporte multidioma Español / English
- Diseño responsive y moderno con Tailwind CSS

## Stack tecnológico

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Supabase
- Google Generative AI
- Recharts
- jsPDF / jspdf-autotable
- xlsx
- Vercel

## Requisitos previos

- Node.js 20 o superior
- npm, pnpm, yarn o bun
- Cuenta de Supabase
- Clave de API de Google Generative AI

## Instalación

1. Clona el repositorio:

```bash
git clone https://github.com/oifdev/personal_finance_platform.git
cd personal_finance_platform
```

2. Instala las dependencias:

```bash
npm install
```

3. Configura las variables de entorno:

Crea un archivo `.env.local` con las siguientes variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
GOOGLE_API_KEY=tu_google_api_key
```

4. Ejecuta el proyecto en modo desarrollo:

```bash
npm run dev
```

Abre http://localhost:3000 para visualizar la aplicación.

## Scripts disponibles

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Despliegue en Vercel

Este proyecto está preparado para publicarse en Vercel.

1. Conecta el repositorio en Vercel
2. Selecciona la rama principal
3. Agrega las variables de entorno necesarias
4. Haz deploy

URL de producción:
https://ogfinanceb.vercel.app/

## Estructura del proyecto

```text
.
├── app/
│   ├── api/
│   ├── auth/
│   ├── dashboard/
│   └── page.tsx
├── components/
│   ├── landing/
│   ├── ui/
│   └── ...
├── lib/
├── public/
├── styles/
├── .env.example
├── package.json
├── next.config.ts
├── tsconfig.json
├── README.md
└── ...
```

## Contribución

Las contribuciones son bienvenidas. Si deseas colaborar:

1. Haz un fork del proyecto
2. Crea una rama para tu cambio
3. Realiza tus modificaciones y guarda tus commits
4. Abre un Pull Request

## Licencia

Este proyecto se distribuye bajo la licencia definida en el repositorio.

## Autor

Desarrollado por el equipo de OG Finance.

---

Si quieres, puedo dejarte una versión del README todavía más premium para mostrarlo en portafolio o para clientes.
