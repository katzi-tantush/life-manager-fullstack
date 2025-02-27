/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_WEB_CLIENT_ID: string
  readonly GOOGLE_CLIENT_SECRET: string
  readonly GOOGLE_REDIRECT_URI: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}