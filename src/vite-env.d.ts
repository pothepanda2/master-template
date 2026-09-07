/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SANITY_PROJECT_ID?: string;
  readonly VITE_SANITY_DATASET?: string;
  readonly VITE_SANITY_API_VERSION?: string;
  readonly VITE_SANITY_API_READ_TOKEN?: string;
  readonly NEXT_PUBLIC_SANITY_PROJECT_ID?: string;
  readonly NEXT_PUBLIC_SANITY_DATASET?: string;
  readonly NEXT_PUBLIC_SANITY_API_VERSION?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
