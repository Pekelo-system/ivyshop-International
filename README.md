# 🛒 IvyShop International

E-commerce moderno y completo desarrollado con **Next.js 16**, **AWS Amplify Gen2** y servicios de **IA Generativa** de Amazon Bedrock. Diseñado como una tienda online con catálogo de productos, carrito de compras, checkout y panel de administración.

---

## 📋 Descripción

IvyShop International es una aplicación de comercio electrónico full-stack que permite a los usuarios navegar un catálogo de productos, filtrar por categorías, agregar items al carrito y completar el proceso de compra. Los administradores pueden gestionar productos y generar contenido (descripciones e imágenes) mediante IA Generativa.

### Características principales

- 🛍️ Catálogo de productos con filtros por categoría y búsqueda
- 🛒 Carrito de compras persistente
- 💳 Flujo de checkout completo
- 🔐 Autenticación con roles (Admin / Usuario final)
- 🤖 Generación de descripciones con Amazon Bedrock Nova Lite
- 🖼️ Generación de imágenes con Amazon Bedrock Nova Canvas
- 📱 Diseño responsive con TailwindCSS
- ⚡ Server-Side Rendering con Next.js App Router

---

## 🏗️ Arquitectura y Tech Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js 16, React 19, TailwindCSS 4 |
| UI Components | shadcn/ui, Lucide Icons |
| State Management | Zustand |
| Formularios | React Hook Form + Zod |
| Autenticación | AWS Cognito (via Amplify Gen2) |
| Base de Datos | Amazon DynamoDB |
| Almacenamiento | Amazon S3 (via Amplify Storage) |
| IA Generativa | Amazon Bedrock (Nova Lite, Nova Canvas) |
| Despliegue | AWS Amplify Hosting |
| Testing | Vitest, Testing Library, fast-check |

---

## 🔐 Flujo de Autenticación y Roles

El sistema utiliza **AWS Cognito** con los siguientes roles:

| Rol | Acceso | Restricción |
|-----|--------|-------------|
| **Administrador** | Panel admin (`/admin/*`), CRUD de productos, GenAI | Grupo `Administradores` en Cognito |
| **Usuario autenticado** | Catálogo, carrito, checkout, confirmación de orden | Login requerido para `/checkout` |
| **Visitante (guest)** | Catálogo, búsqueda, detalle de productos | Solo lectura |

### Flujo de compra simulado

1. El usuario navega el catálogo y agrega productos al carrito
2. Al ir a `/checkout`, el middleware valida que esté autenticado
3. Si no lo está, redirige a `/auth/login` con return URL
4. Completa el formulario de envío y confirma la orden
5. Se crea la orden en DynamoDB y se muestra la confirmación

---

## 👥 Usuarios de Prueba

| Rol | Email | Contraseña |
|-----|-------|------------|
| Admin | `pendiente@ejemplo.com` | `pendiente` |
| Usuario final 1 | `pendiente@ejemplo.com` | `pendiente` |
| Usuario final 2 | `pendiente@ejemplo.com` | `pendiente` |

> ⚠️ Estos usuarios deben crearse manualmente en el User Pool de Cognito una vez desplegado el backend.

---

## 📁 Estructura del Proyecto

```
ivyshop/
├── amplify/                  # Backend Amplify Gen2
│   ├── auth/resource.ts      # Configuración de Cognito
│   ├── data/resource.ts      # Schema de datos (GraphQL)
│   ├── storage/resource.ts   # Configuración de S3
│   └── backend.ts            # Definición del backend
├── src/
│   ├── app/
│   │   ├── (admin)/          # Rutas del panel admin
│   │   ├── (shop)/           # Rutas de la tienda
│   │   └── api/              # API Routes (REST)
│   ├── components/
│   │   ├── admin/            # Componentes del admin
│   │   ├── carrito/          # Componentes del carrito
│   │   ├── catalogo/         # Componentes del catálogo
│   │   ├── shared/           # Navbar, Footer, FilterPanel
│   │   └── ui/              # shadcn/ui components
│   ├── hooks/                # Custom hooks (useCart)
│   ├── lib/
│   │   ├── amplify/          # Configuración cliente/servidor Amplify
│   │   ├── bedrock/          # Clientes de IA Generativa
│   │   ├── dynamo/           # Operaciones DynamoDB
│   │   ├── search/           # Lógica de filtrado
│   │   ├── seed/             # Datos semilla
│   │   └── validations/      # Schemas Zod
│   ├── middleware.ts         # Protección de rutas
│   └── types/                # Tipos TypeScript
├── amplify.yml               # Build spec para Amplify Hosting
├── vitest.config.ts          # Configuración de tests
└── package.json
```

---

## ⚙️ Requisitos Previos

- **Node.js** >= 18.x
- **npm** >= 9.x
- **Cuenta de AWS** con acceso a:
  - AWS Amplify
  - Amazon DynamoDB
  - Amazon Cognito
  - Amazon Bedrock (modelos Nova Lite y Nova Canvas habilitados)
  - Amazon S3
- **AWS CLI** configurado con credenciales válidas
- **Amplify CLI** (se instala como dependencia del proyecto)

---

## 🚀 Instalación y Despliegue Local

### 1. Clonar el repositorio

```bash
git clone https://github.com/Pekelo-system/ivyshop-International.git
cd ivyshop-International
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

```bash
cp .env.example .env.local
```

Edita `.env.local` con tus valores:

```env
AWS_REGION=us-east-1
DYNAMODB_TABLE_NAME=ivyshop
SEED_SECRET=tu-secreto-aqui
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 4. Desplegar el backend (Amplify Sandbox)

```bash
npx ampx sandbox
```

Esto creará los recursos de Cognito, DynamoDB y S3 en tu cuenta de AWS.

### 5. Poblar datos de prueba (Seed)

Con el servidor corriendo, visita:
```
GET http://localhost:3000/api/seed
```

Esto carga 22 productos de ejemplo en 5 categorías.

### 6. Ejecutar en desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`.

---

## 🌐 Despliegue en AWS Amplify Hosting

1. Conecta el repositorio de GitHub en la consola de AWS Amplify
2. Amplify detectará automáticamente el `amplify.yml` para el build
3. Configura las variables de entorno en la consola de Amplify
4. El despliegue es automático con cada push a la rama `main`

---

## 📜 Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia el servidor de desarrollo (Next.js) |
| `npm run build` | Genera el build de producción |
| `npm run start` | Sirve el build de producción |
| `npm run lint` | Ejecuta ESLint |
| `npm run test` | Ejecuta tests en modo watch (Vitest) |
| `npm run test:run` | Ejecuta todos los tests una sola vez |
| `npm run test:coverage` | Ejecuta tests con reporte de cobertura |

---

## 🛍️ Categorías de Productos

El catálogo maneja 5 categorías:

| Categoría | Productos de ejemplo |
|-----------|---------------------|
| 👟 Zapatos | Zapatillas Running, Botas de Cuero, Sandalias, Mocasines |
| 👕 Ropa | Camisetas, Jeans, Chaquetas, Sudaderas, Vestidos |
| 📱 Electrónicos | Auriculares, Smartwatch, Cargadores, Altavoces, Teclados |
| 📚 Libros | El Arte de la Guerra, Código Limpio, Sapiens, Sistemas Distribuidos |
| 🎒 Otros | Mochilas, Botellas térmicas, Yoga, Lámparas |

---

## 🤖 IA Generativa (Amazon Bedrock)

El panel de administración incluye funcionalidades de GenAI:

- **Generación de descripciones**: Usa el modelo Nova Lite para crear descripciones atractivas de productos a partir del nombre y categoría.
- **Generación de imágenes**: Usa el modelo Nova Canvas para crear imágenes de producto basadas en un prompt descriptivo.

> Requiere que los modelos `amazon.nova-lite-v1:0` y `amazon.nova-canvas-v1:0` estén habilitados en tu cuenta de AWS Bedrock.

---

## 🧪 Testing

El proyecto incluye:

- **Tests unitarios** — Validaciones, componentes UI
- **Tests de integración** — Flujo de checkout, API routes
- **Property-based tests** — Con fast-check para validar invariantes (filtrado, acceso, eliminación de productos)

Ejecutar:
```bash
npm run test:run
```

---

## 📝 Detalles Relevantes del Desarrollo

- **App Router (Next.js 16)**: Usa Route Groups `(admin)` y `(shop)` para separar layouts.
- **Single-Table Design en DynamoDB**: Productos, carritos y órdenes conviven en una sola tabla con claves compuestas (`PK`, `SK`, `GSI1PK`, `GSI1SK`).
- **Middleware de Next.js**: Protege rutas `/admin/*` (requiere grupo Administradores) y `/checkout` (requiere autenticación).
- **Amplify Gen2**: Backend definido como código TypeScript (IaC) en la carpeta `amplify/`.
- **Zustand**: Manejo de estado del carrito en el cliente con persistencia.
- **Zod v4**: Validación de formularios tanto en cliente como servidor.
- **React 19 + Next.js 16**: Utiliza Server Components por defecto, Client Components solo donde es necesario.

---

## 📄 Licencia

Este proyecto está bajo la licencia **MIT**. Consulta el archivo [LICENSE](./LICENSE) para más detalles.

---

## 👨‍💻 Autores

- **Pekelo System** — [GitHub](https://github.com/Pekelo-system)

---

> Proyecto desarrollado como parte de un programa de formación en desarrollo cloud con AWS.
