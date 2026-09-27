import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { execSync } from "node:child_process";
import { mcpPlugin } from "@lovable.dev/mcp-js/stacks/supabase/vite";
import { inlineXlsxPlugin } from "./vite-inline-xlsx";
import { stagingTargetPlugin } from "./vite-staging-target";
import {
  parseDeploymentAllowances,
  resolveClientFacingFlag,
} from "./src/lib/clientFacing";

// Identifies the deployed build. `version.json` carries the same value, so a
// tab can tell whether it is running the current bundle or a cached older one
// (see src/lib/buildVersion.ts). Commit sha when available, timestamp otherwise.
function resolveBuildId(): string {
  const fromEnv =
    process.env.VITE_BUILD_ID ||
    process.env.VERCEL_GIT_COMMIT_SHA ||
    process.env.GITHUB_SHA ||
    process.env.COMMIT_REF;
  if (fromEnv) return fromEnv.slice(0, 12);
  try {
    return execSync("git rev-parse --short=12 HEAD", { stdio: ["ignore", "pipe", "ignore"] })
      .toString()
      .trim();
  } catch {
    return `t${Date.now().toString(36)}`;
  }
}

const BUILD_ID = resolveBuildId();

// Read once, here, so the two halves of the mode cannot be computed from
// different expressions: the constant below is what the running code reads,
// and the allowances are what the `__EXCLUDE_*__` gates are derived from.
const CLIENT_FACING = resolveClientFacingFlag(process.env.VITE_CLIENT_FACING);
const CLIENT_FACING_ALLOWANCES = parseDeploymentAllowances(
  process.env.VITE_CLIENT_FACING_ALLOW,
);

// src/App.tsx here follows npc-client-dashboard's, and it gates five pages on
// `__EXCLUDE_*__` constants. A name that `define` does not supply is not
// replaced: it stays a bare global, and reading it throws as the module loads.
// That is what every page here did from the 21 Sep 2026 cascade that brought
// the gates: `ReferenceError: __EXCLUDE_INTEGRATIONS__ is not defined`, and
// nothing rendered. Each gate is false unless a build opts into client-facing
// mode, so by default every page's chunk is built, as it was before the gates
// arrived. src/lib/__tests__/routeExclusionGates.test.ts pins the pairing.
const EXCLUDED = (hiddenPath: string) =>
  CLIENT_FACING && !CLIENT_FACING_ALLOWANCES.includes(hiddenPath);

/** Writes the build id next to the bundle so the running app can compare. */
function buildVersionManifest(): Plugin {
  return {
    name: "npc-build-version-manifest",
    apply: "build",
    generateBundle() {
      this.emitFile({
        type: "asset",
        fileName: "version.json",
        source: JSON.stringify({ buildId: BUILD_ID }),
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  define: {
    __BUILD_ID__: JSON.stringify(BUILD_ID),

    // Client-facing mode, as a literal. It has to be a `define` rather than a
    // function call: `isClientFacingDeployment()` reads THIS, and reading the
    // environment at runtime instead is what broke the mode once already (see
    // src/lib/clientFacing.ts). Both resolve to their off values unless a build
    // explicitly opts in, and nothing in this repository does.
    __CLIENT_FACING__: JSON.stringify(CLIENT_FACING),
    __CLIENT_FACING_ALLOW__: JSON.stringify(CLIENT_FACING_ALLOWANCES),

    // One literal per page App.tsx gates, because folding the ternary there is
    // what drops the `import()` behind it. Each is paired with its entry in
    // CLIENT_FACING_HIDDEN_PATHS.
    __EXCLUDE_INTEGRATIONS__: JSON.stringify(EXCLUDED("/integrations")),
    __EXCLUDE_WORKFLOW_PLAYGROUND__: JSON.stringify(EXCLUDED("/workflow-playground")),
    __EXCLUDE_CLOUDFLARE__: JSON.stringify(EXCLUDED("/cloudflare")),
    __EXCLUDE_MODEL_HUB__: JSON.stringify(EXCLUDED("/model-hub")),
    __EXCLUDE_API_USAGE__: JSON.stringify(EXCLUDED("/api-usage")),
  },
  plugins: [
    // Inert unless run with `--mode staging` AND the local staging variables
    // are set; see vite-staging-target.ts. Gating on the mode is what stops a
    // default build being retargeted by a `.env.local` on disk. Runs before
    // everything else so the retarget applies to source, not to output.
    stagingTargetPlugin(mode, loadEnv(mode, process.cwd(), ["STAGING_"])),
    inlineXlsxPlugin(),
    react(),
    mcpPlugin(),
    buildVersionManifest(),
  ],
  assetsInclude: ["**/*.xlsx", "**/*.docx"],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/, /src\/lib\/security\/vendor\/qrcode/],
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['@radix-ui/react-dialog', '@radix-ui/react-popover', '@radix-ui/react-select', '@radix-ui/react-tabs', '@radix-ui/react-tooltip', '@radix-ui/react-dropdown-menu'],
          'vendor-charts': ['recharts'],
          'vendor-pdf': ['pdf-lib', 'jspdf'],
          'vendor-utils': ['date-fns', 'lucide-react', 'zod', 'react-hook-form'],
          'vendor-supabase': ['@supabase/supabase-js'],
        },
      },
    },
  },
}));

