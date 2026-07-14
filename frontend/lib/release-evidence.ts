export const PRODUCT_RELEASE = "0.9";

type ReleaseEnvironment = Readonly<Record<string, string | undefined>>;

export function currentReleaseEvidence(environment: ReleaseEnvironment = process.env): string {
  const revision = environment.VERCEL_GIT_COMMIT_SHA?.trim() || environment.GITHUB_SHA?.trim();
  return revision ? `${PRODUCT_RELEASE}+${revision.slice(0, 12)}` : PRODUCT_RELEASE;
}
