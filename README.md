# AI pdf parser
![Uploading output.gif…]()

Simple project made using React and Tailwind for the frontend and Python FastAPI for the backend.
[Link to the backend](https://github.com/bibkin-maks/animated-barnacle-AI-doc-parser) | [https://github.com/bibkin-maks/animated-barnacle-AI-doc-parser](https://github.com/bibkin-maks/animated-barnacle-AI-doc-parser)

Project structure:
Simple landing for all pages, adopting design patterns such as liquid glass, with a Three.js library example used for the background decoration. The 
@react-oauth/google library was used for the authorisation purposes. Implemented own backend api with JWT verification for safety purposes.

How to run: 

# Step 1:
# Install all the dependencies
```
npm i
pnpm i
```

# Step 2 
Create .env files in the root folders for each back-end and front-end

.env for front-end:
```
VITE_GOOGLE_CLIENT_ID=""
VITE_BACKEND_URL=""
```

.env for the back-end:
```
OPENAI_API_KEY=
GOOGLE_CLIENT_ID=
SECRET_KEY=
MONGODB_URI_FIRST=
MONGODB_URI_PASS=
MONGODB_URI_LAST=
```

#Step 3:
Run the code!

```
npm run dev
pnpm run dev
```
