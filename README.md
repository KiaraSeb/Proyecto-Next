# 📚 Proyecto Next – Buscador de Libros

Aplicación web desarrollada en **Next.js** que permite buscar y consultar libros utilizando la **Google Books API**.  
El proyecto está preparado para correr en **Vercel** y también con **Docker**, con imágenes publicadas en **GitHub Container Registry (GHCR)**.

---

## 🚀 Demo

🔗 [Proyecto en Vercel](https://proyecto-next-eb5z.vercel.app)

---

## ⚙️ Tecnologías usadas

- [Next.js](https://nextjs.org/) – Framework React para SSR/SSG.  
- [TypeScript](https://www.typescriptlang.org/) – Tipado estático.  
- [Google Books API](https://developers.google.com/books) – Fuente de datos.  
- [Docker](https://www.docker.com/) – Contenerización.  
- [GitHub Actions](https://docs.github.com/actions) – CI/CD con build y push de imágenes.  
- [GHCR](https://ghcr.io) – Registro de contenedores.  

---

## 📂 Estructura 

├── .github/workflows/ # Workflows de GitHub Actions
├── lib/ # Funciones para consumir Google Books API
├── pages/ # Rutas de Next.js
├── public/ # Archivos estáticos
├── Dockerfile # Configuración de imagen Docker
├── package.json
└── README.md


---

## 🔑 Variables de entorno

Crear un archivo `.env.local` en desarrollo y `.env.production` para producción.  

### `.env.local`
# API de Google Books
NEXT_PUBLIC_GOOGLE_BOOKS_API_URL="https://www.googleapis.com/books/v1"

# Frontend URL en local
NEXT_PUBLIC_APP_URL="http://localhost:3000"

`.env.production`
# API de Google Books
NEXT_PUBLIC_GOOGLE_BOOKS_API_URL="https://www.googleapis.com/books/v1"

# URL desplegada en Vercel
NEXT_PUBLIC_APP_URL="https://proyecto-next-eb5z.vercel.app"

⚠️ Nunca subas tus .env al repositorio.
Usá .env.example como plantilla sin valores sensibles.

## 🖥️ Instalación y ejecución local
1. Clonar el repositorio:

git clone https://github.com/KiaraSeb/Proyecto-Next.git
cd Proyecto-Next

2. Instalar dependencias:

npm install

3. Crear .env.local con las variables de entorno.

4. Iniciar en desarrollo:

npm run dev

5. Abrir en el navegador:
http://localhost:3000

## 🐳 Uso con Docker
1. Construir la imagen:
docker build -t proyecto-next .

2. Correr el contenedor:
docker run -p 3000:3000 proyecto-next

3. Abrir en:
http://localhost:3000

## 🔄 CI/CD con GitHub Actions
Este repositorio tiene configurado un workflow (.github/workflows/docker.yml) que:
- Construye la imagen Docker.
- La publica en GitHub Container Registry (GHCR).

La imagen se sube a:
ghcr.io/kiaraseb/proyecto-next:latest

Para autenticarse, se usa un Personal Access Token (PAT) guardado en los Secrets del repositorio (GHCR_PAT).

## 📖 Funcionalidades
- Buscar libros por título, autor o palabra clave.
- Ver detalles de un libro.
- Mostrar portada (si está disponible).
- Manejo de errores si la API no responde o no encuentra resultados.