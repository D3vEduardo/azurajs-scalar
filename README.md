# @azurajs/scalar 📘

> Proxy middleware and controller to scalar documentation. 🔗

---

## 🚀 Features

- ⚡ Fast and lightweight proxy middleware
- 🎨 Customizable HTML templates
- 🌐 Seamless integration with Scalar API references
- 🔧 Easy configuration and setup

---

## 📦 Installation

Choose your favorite package manager:

### npm

```bash
npm i azurajs-scalar
```

### pnpm

```bash
pnpm i azurajs-scalar
```

---

## 🛠️ Usage

### Configuration

#### src/index.ts

```ts
import { AzuraClient } from "azurajs";
import { Scalar } from "azurajs-scalar";
import path from "path";
import { fileURLToPath } from "url";
import { applyDecorators } from "azurajs/decorators";
import * from "./controllers"


const app = new AzuraClient();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const baseUrl = env.APP_URL || "http://localhost:4002";

new Scalar({
  apiSpecPath: "/api-spec.json",
  proxyPath: "/scalar/proxy/",
  docPath: "/docs/",
  customHtmlPath: path.join(__dirname, "./public/html/api-docs.html"),
  app,
  baseUrl,
});

applyDecorators(app, Object.values(Controllers))
```

---

## 🎨 Custom HTML Template

Create a custom HTML template for your API documentation with full control over styling and layout.

### Example:

```html
<!doctype html>
<html>
  <head>
    <title>Versum API - Sistine Chapel Theme</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />

    <link
      href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=swap"
      rel="stylesheet"
    />

    <style>
      :root {
        --scalar-font: "Libre Baskerville", serif;
        --scalar-font-code: "Courier New", monospace;
      }

      .light-mode {
        --scalar-color-1: #2b2b26;
        --scalar-color-2: #5f5a4f;
        --scalar-color-accent: #8b3f2f;
        --scalar-background-1: #f8f3ea;
        --scalar-background-2: #efe6d6;
        --scalar-background-3: #e3d7c3;
        --scalar-border-color: rgba(139, 63, 47, 0.18);
      }

      .dark-mode {
        --scalar-color-1: #f3eadb;
        --scalar-color-2: #d6c7a1;
        --scalar-color-accent: #b86b2f;
        --scalar-background-1: #1c170f;
        --scalar-background-2: #241e14;
        --scalar-background-3: #2e2619;
        --scalar-border-color: rgba(184, 107, 47, 0.25);
      }

      h1,
      h2,
      h3 {
        font-family: "Cinzel", serif;
        font-weight: 700;
        color: var(--scalar-color-accent) !important;
        letter-spacing: 0.5px;
      }
    </style>
  </head>

  <body>
    <div id="app">Carregando...</div>

    <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
    <script>
      // Busca o spec da porta 4002
      fetch("&{api_spec_url}")
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        })
        .then((spec) => {
          console.log("Spec carregado:", spec);

          Scalar.createApiReference("#app", {
            spec: {
              content: spec,
            },
            proxy: "&{proxy_url}",
            theme: "none",
            showSidebar: true,
            withDefaultFonts: false,
          });
        })
        .catch((err) => {
          console.error("Erro ao carregar spec:", err);
          document.getElementById("app").innerHTML =
            `<pre style="color: red; padding: 20px;">
Erro ao carregar API spec: ${err.message}

Verifique se a API está rodando em &{proxy_url}
            </pre>`;
        });
    </script>
  </body>
</html>
```

### 🔧 External Variables

- `&{proxy_url}` - The proxy URL configured in your [configuration](#srcindexts)
- `&{api_spec_url}` - The API specification URL configured in your [configuration](#srcindexts)

---

## 🌐 References

- [AzuraJS](https://github.com/azurajs/azura) - The framework this package integrates with
- [Scalar](https://scalar.com/products/api-references/integrations/html-js) - The API reference tool

---

## 👨‍💻 Author

**Eduardo Developer**
[![GitHub Profile](https://img.shields.io/badge/GitHub-D3vEduardo-blue?logo=github)](https://github.com/D3vEduardo)

---

## 📄 License

This project is licensed under the [MIT License](./LICENSE) - see the LICENSE file for details.

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/D3vEduardo">@D3vEduardo</a>
</p>
