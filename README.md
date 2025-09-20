# MindBloom Local Development Setup

This guide will walk you through setting up and running the MindBloom application on your local machine using Vite, a modern and fast build tool for web development.

## Prerequisites

Before you begin, ensure you have **Node.js** installed on your computer. This will also install `npm` (Node Package Manager), which is required to manage the project's dependencies.

- [Download Node.js](https://nodejs.org/) (We recommend the LTS version).

You will also need a **Gemini API Key** to use the AI features of the application.

- [Get a Gemini API Key](https://aistudio.google.com/app/apikey)

## Step 1: Set Up Your Project Files

1.  Create a new folder on your computer for this project. Let's call it `mindbloom-app`.
2.  Copy all the existing application files (`index.html`, `index.tsx`, `App.tsx`, `components/`, etc.) into this new folder, making sure to preserve the folder structure.

## Step 2: Create Configuration Files

You'll need to create a few configuration files in the root of your `mindbloom-app` folder for Vite and TypeScript to work correctly.

**1. Vite Configuration (`vite.config.ts`)**

Create a file named `vite.config.ts` and add the following code:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
})
```

**2. TypeScript Configuration (`tsconfig.json`)**

Create a file named `tsconfig.json` and add the following:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["**/*.ts", "**/*.tsx"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

**3. TypeScript Node Configuration (`tsconfig.node.json`)**

Create a file named `tsconfig.node.json` and add the following:

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

## Step 3: Initialize Project and Install Dependencies

1.  Open your terminal or command prompt.
2.  Navigate into your project folder:
    ```bash
    cd mindbloom-app
    ```
3.  Initialize a `package.json` file, which tracks your project's dependencies:
    ```bash
    npm init -y
    ```
4.  Install the required libraries for the application:
    ```bash
    npm install react react-dom @google/genai marked
    ```
5.  Install the development tools needed to build and run the app:
    ```bash
    npm install --save-dev vite @vitejs/plugin-react typescript @types/react @types/react-dom @types/marked
    ```

## Step 4: Configure for Local Development

Make the following three adjustments to the application code.

**1. Create an Environment File (`.env`) for Your API Key**

The application needs your Gemini API key.

- In the root of your `mindbloom-app` folder, create a new file named `.env`.
- Inside this file, add the following line, replacing `YOUR_GEMINI_API_KEY` with your actual key:
  ```
  VITE_API_KEY=YOUR_GEMINI_API_KEY
  ```
  > **Note:** The `VITE_` prefix is required by Vite to make the key available in your app's code.

**2. Update `services/geminiService.ts`**

- Open the file `services/geminiService.ts`.
- Find this line near the top:
  ```typescript
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  ```
- Change it to use the variable from your new `.env` file:
  ```typescript
  const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });
  ```

**3. Update `index.html`**

Vite handles dependencies automatically, so the `importmap` script is no longer needed.

- Open `index.html`.
- **Delete** the entire `<script type="importmap">...</script>` block.

## Step 5: Run the Application

1.  Open your `package.json` file and add a `dev` script inside the `"scripts"` section:
    ```json
    "scripts": {
      "dev": "vite"
    },
    ```
2.  You're all set! Run the development server from your terminal with:
    ```bash
    npm run dev
    ```

Vite will start the server and print a local URL (usually `http://localhost:5173`). Open that URL in your web browser, and your application should be running!

Add the key in GeminiServices.tsx
