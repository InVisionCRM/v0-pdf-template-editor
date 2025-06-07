declare namespace NodeJS {
  interface ProcessEnv {
    NEXTAUTH_SECRET: string
    NEXTAUTH_URL: string
    CRM_API_URL: string
    DATABASE_URL: string
    GOOGLE_CLIENT_ID: string
    GOOGLE_CLIENT_SECRET: string
    GOOGLE_MAPS_API_KEY?: string // Adding this since we have Google Maps integration
    NODE_ENV: 'development' | 'production' | 'test'
  }
} 