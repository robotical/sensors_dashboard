1. npx create-react-app cra-package --template typescript
2. babel.config.json {
  "presets": [
    [
      "@babel/env",
      {
        "targets": {
          "edge": "17",
          "firefox": "60",
          "chrome": "67",
          "safari": "11.1"
        },
        "useBuiltIns": "usage",
        "corejs": "3.6.5"
      }
    ],
    ["@babel/preset-typescript"],
    ["@babel/preset-react", {"runtime": "automatic"}]
  ]
}
3. tsconfig.json {
  "compilerOptions": {
    "target": "es5",
    "lib": [
      "dom",
      "dom.iterable",
      "esnext"
    ],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "outDir": "dist",
    "forceConsistentCasingInFileNames": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "declaration": true,
    "emitDeclarationOnly": true,
    "isolatedModules": true,
    // "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": [
    "src"
  ],
  "exclude": [
    "node_modules",
    "dist"
  ]
}

