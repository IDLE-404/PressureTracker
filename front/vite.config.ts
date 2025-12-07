import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { visualizer } from "rollup-plugin-visualizer";
import { ProjectSettings } from "./project.settings";
import { createHtmlPlugin } from 'vite-plugin-html';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");

  const Config = {
    ...ProjectSettings,
    version: env.VITE_PROJECT_VERSION || ProjectSettings.version,
    defaultHost: env.VITE_DEFAULT_HOST || ProjectSettings.defaultHost,
  };

  return {
    plugins: [
      react(),
      visualizer({ filename: "./dist/stats.html" }),
      createHtmlPlugin({
        inject: {
          data: {
            PROJECT_NAME: ProjectSettings.name,
          },
        },
      }),
    ],
    server: {
      host: "0.0.0.0",
      port: Config.ports.dev,
      strictPort: true,
      hmr: true,
      allowedHosts: Config.allowedHosts,
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules")) {
              return "vendor";
            }
          },
        },
      },
    },
  };
});
