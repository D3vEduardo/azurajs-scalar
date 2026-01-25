import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true,
  clean: true,
  minify: false,
  sourcemap: true,
  target: "es2020",
  onSuccess: async () => {
    const fs = await import("fs");
    const path = await import("path");

    const srcPath = path.join(process.cwd(), "src", "api-docs.html");
    const destPath = path.join(process.cwd(), "dist", "api-docs.html");

    fs.copyFileSync(srcPath, destPath);
    console.log("Arquivo api-docs.html copiado para a pasta dist");
  },
});
