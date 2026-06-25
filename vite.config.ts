import TOML from "@ltd/j-toml";
import react from '@vitejs/plugin-react';
import chokidar from 'chokidar';
import fs from 'fs-extra';
import path from 'path';
import { defineConfig, type PluginOption } from 'vite';
import svgr from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vite.dev/config/
export default defineConfig ({
  plugins: [
    react(),
    svgr(),
    tsconfigPaths(),
    tomlToJsonPlugin(),
    //prerender({
    //  staticDir: path.join(__dirname, 'dist'),
    //  routes: ["/", "/e/"],
    //}),
  ],
  optimizeDeps: {
    include: ['monaco-editor']
  },
  resolve: {
    alias: {
      "@src": path.resolve(__dirname, "src/"),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "@src/styles/mixins" as *;\n`,
      },
    },
  },
});

function tomlToJsonPlugin () : PluginOption {
  const srcDir = path.resolve('locale');
  const outDir = path.resolve('src/.gen/locale');

  return {
    name: 'toml-to-json',

    async buildStart () {
      convertLocaleFiles();
    },

    async buildEnd () {
      await convertLocaleFiles();
    },

    configureServer (server: any) {
      const watcher = chokidar.watch(srcDir, {
        cwd: process.cwd(),
        usePolling: true,
        interval: 500,
        awaitWriteFinish: true,
      });

      watcher.on(
        'ready',
        () => console.log("[Chokidar] Ready.", watcher.getWatched())
      );
      
      watcher.on('change', async (f) => {
        console.log("[Chokidar] Changed.", f);

        if (f.endsWith(".toml") === false) return;

        try {
          const tomlData = await fs.readFile(f, 'utf-8');
          const parsed = TOML.parse(tomlData);
          const jsonFile = path.join(
            outDir,
            path.basename(f).replace(/\.toml$/, '.json')
          );
          await fs.writeJSON(jsonFile, parsed, { spaces: 2 });
          
          //server.ws.send({ type: 'full-reload' });
        }
        catch (err) {
          console.error("[Chokidar]", err);
        }
      });
    },
  }

  async function convertLocaleFiles () {
    await fs.ensureDir(outDir);

    const files = await fs.readdir(srcDir);

    for (const f of files) {
      if (f.endsWith('.toml') === false) continue;

      const toml = await fs.readFile(path.join(srcDir, f), 'utf-8');
      const parsed = TOML.parse(toml);
      const outPath = path.join(outDir, f.replace(/\.toml$/, ".json"));

      await fs.writeJSON(outPath, parsed);
    }
  }
}
