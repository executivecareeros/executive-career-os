import type { ReactNode } from "react";

export type ComponentSize = "sm" | "md" | "lg";
export type StatusTone = "neutral" | "info" | "success" | "warning";

export type CardProps = {
  children: ReactNode;
  className?: string;
  id?: string;
};

export type ButtonLinkProps = {
  children: ReactNode;
  href?: string;
  className?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  onClick?: () => void;
};

export type NavigationItem = {
  label: string;
  href: string;
  marker: string;
};
