/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  // добавьте здесь другие переменные окружения, если они понадобятся
}

interface ImportMeta {
  readonly env: ImportMetaEnv
  readonly url: string
} 