# AI PDF Parser

![output](https://github.com/user-attachments/assets/895ba002-c52c-4752-9ffc-604930cb8e11)


This is a simple project using React and Tailwind CSS for the frontend and Python FastAPI for the backend.

- [Backend Repository](https://github.com/bibkin-maks/animated-barnacle-AI-doc-parser)

## Features

- Modern landing pages employing Liquid Glass design patterns.
- Three.js for rich animated backgrounds.
- Authentication via [@react-oauth/google](https://www.npmjs.com/package/@react-oauth/google).
- Custom backend API with JWT verification for secure access.

## Project Structure

- **Frontend:** React, Tailwind CSS, Three.js, @react-oauth/google
- **Backend:** Python FastAPI, JWT authentication

## Getting Started

### 1. Install Dependencies

You can use either `npm`, `pnpm`, or `yarn`:

```bash
npm install
pnpm install
yarn install
```

### 2. Configure Environment Variables

Create `.env` files in the root folders for frontend and backend.

#### Frontend `.env` Example

```env
VITE_GOOGLE_CLIENT_ID=""
VITE_BACKEND_URL=""
```

#### Backend `.env` Example

```env
OPENAI_API_KEY=
GOOGLE_CLIENT_ID=
SECRET_KEY=
MONGODB_URI_FIRST=
MONGODB_URI_PASS=
MONGODB_URI_LAST=
```

### 3. Run the Application

You can use your preferred package manager:

```bash
npm run dev
pnpm run dev
yarn dev
```

---

Enjoy building and exploring the AI PDF parser!  
Pull requests and contributions are welcome.
