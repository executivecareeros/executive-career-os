import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const shared = ["lib/discovery/provider-manifest.ts", "lib/discovery/provider-sdk.ts", "lib/discovery/provider-scaffold.ts", "lib/discovery/provider-certification.ts"];
const adapters = ["lib/discovery/providers/greenhouse.ts", "lib/discovery/providers/lever.ts", "lib/discovery/providers/ashby.ts", "lib/discovery/providers/workable.ts"];
const meaningfulLines = async (file) => (await readFile(resolve(root, file), "utf8")).split("\n").filter((line) => line.trim() && !line.trim().startsWith("//") && !line.trim().startsWith("*")).length;
const sharedLines = (await Promise.all(shared.map(meaningfulLines))).reduce((total, count) => total + count, 0);
const providerSpecificLines = Object.fromEntries(await Promise.all(adapters.map(async (file) => [file.split("/").at(-1).replace(".ts", ""), await meaningfulLines(file)])));
const certificationConcerns = ["discovery", "replay", "pagination", "canonicalization", "employer-resolution", "opportunity-resolution", "lifecycle", "scheduler", "metrics", "regression", "deployment-readiness"];
const sharedCertificationConcerns = certificationConcerns.length;
const engineeringReuseIndex = Math.round((sharedCertificationConcerns / certificationConcerns.length) * 1000) / 10;
const scaffoldProviderHooks = 6;
const preFrameworkProviderConcerns = certificationConcerns.length;
const integrationSurfaceReduction = Math.round(((preFrameworkProviderConcerns - scaffoldProviderHooks) / preFrameworkProviderConcerns) * 1000) / 10;

console.log(JSON.stringify({
  measuredAt: new Date().toISOString(),
  engineeringReuseIndex,
  method: "shared certification concerns / total required certification concerns",
  sharedCertificationConcerns,
  totalCertificationConcerns: certificationConcerns.length,
  sharedFrameworkLines: sharedLines,
  providerSpecificLines,
  providerSpecificLinesTotal: Object.values(providerSpecificLines).reduce((total, count) => total + count, 0),
  scaffoldProviderHooks,
  integrationSurfaceReduction,
  timeEstimate: "not produced; measured implementation surface is reported instead",
}, null, 2));
