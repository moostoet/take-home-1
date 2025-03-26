import { defineConfig } from 'drizzle-kit'
import process from 'node:process'

export default defineConfig({
    schema: './src/**/table.ts',
    out: './drizzle',
    dialect: 'sqlite',
    breakpoints: true,

    dbCredentials: {
        url: process.env.DATABASE_URL ?? '',
    },

})