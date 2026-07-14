import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const read = (path) => readFile(resolve(root, path), "utf8");
const [arrival, login, register, onboarding, jobs, navigation, settings, atlas, personas, locale] = await Promise.all([
  read("components/experience-zero/arrival.tsx"), read("app/login/page.tsx"), read("app/register/page.tsx"),
  read("app/onboarding/page.tsx"), read("components/opportunities/live-opportunity-universe.tsx"),
  read("lib/navigation.ts"), read("app/settings/page.tsx"), read("components/atlas/atlas-introduction.tsx"),
  read("data/project-simplicity-personas.ts"), read("lib/locale.ts"),
]);
const checks = {
  public_promise_is_clear: locale.includes("Find your next executive opportunity") && locale.includes("Bir sonraki yönetici fırsatını bul"),
  public_actions_are_obvious: arrival.includes("/login?next=/opportunities") && arrival.includes("/login?next=/import"),
  auth_is_bilingual: login.includes("Tekrar hoş geldin") || login.includes("copy[locale]"),
  registration_explains_next_value: register.includes("go straight to job search") && register.includes("doğrudan iş arayabilirsin"),
  onboarding_is_optional: onboarding.includes('value="upload"') && onboarding.includes('value="skip"'),
  search_and_recommendations_are_separate: jobs.includes('type JobsView = "Search" | "Recommended"'),
  navigation_is_familiar: ["Home", "Jobs", "Companies", "Applications", "Profile"].every((label) => navigation.includes(`label: "${label}"`)),
  notifications_are_opt_in: settings.includes('name="dailySummary"') && settings.includes("does not send email today"),
  atlas_introduction_is_skippable: atlas.includes("Skip for now") && atlas.includes("Şimdilik geç"),
  ten_isolated_personas_exist: (personas.match(/id:"ps-/g) ?? []).length === 10 && personas.includes('language:"tr"') && personas.includes('language:"en"'),
};
const failures = Object.entries(checks).filter(([, passed]) => !passed);
if (failures.length) throw new Error(`Project Simplicity checks failed: ${failures.map(([name]) => name).join(", ")}`);
console.log(`PASS Project Simplicity — ${Object.keys(checks).join(", ")}`);
