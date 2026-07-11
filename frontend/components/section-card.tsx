import type { CardProps } from "@/types/design-system";

export function SectionCard({ children, className = "" }: CardProps) {
  return <section className={`rounded-2xl border border-white/10 bg-white/[0.04] p-6 sm:p-7 ${className}`}>{children}</section>;
}
