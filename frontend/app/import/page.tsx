import { ImportWorkspace } from "@/components/import/import-workspace";
import { getLocale } from "@/lib/locale";
export default async function Page() { return <ImportWorkspace locale={await getLocale()}/>; }
