import { defineConfig, globalIgnores } from "eslint/config"
import nextVitals from "eslint-config-next/core-web-vitals"
import nextTs from "eslint-config-next/typescript"
import prettier from "eslint-config-prettier"
import checkFile from "eslint-plugin-check-file"
import simpleImportSort from "eslint-plugin-simple-import-sort"

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    plugins: {
      "check-file": checkFile,
      "simple-import-sort": simpleImportSort,
    },
    rules: {
      // Naming conventions from CLAUDE.md section 6 (kebab-case avoids
      // Windows/Linux casing bugs on deploy).
      "check-file/filename-naming-convention": [
        "error",
        { "**/*.{ts,tsx}": "KEBAB_CASE" },
        { ignoreMiddleExtensions: true },
      ],
      // Scoped to business dirs only: src/app/** uses App Router segments
      // like (public) and [slug] that are not kebab-case.
      "check-file/folder-naming-convention": [
        "error",
        {
          "src/features/**": "KEBAB_CASE",
          "src/lib/**": "KEBAB_CASE",
          "src/components/**": "KEBAB_CASE",
        },
      ],
      // Product images must always go through next/image (CLAUDE.md section 6).
      "@next/next/no-img-element": "error",
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
    },
  },
  prettier,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
])

export default eslintConfig
