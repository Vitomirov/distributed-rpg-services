/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ACCOUNT_URL: string;
  readonly VITE_CHARACTER_URL: string;
  readonly VITE_COMBAT_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
