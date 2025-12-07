import type { ReactNode, FC } from "react";
import DefaultLayout from "./default/DefaultLayout";

export type LayoutComponent = FC<{ children: ReactNode }>;

export const layouts: Record<string, LayoutComponent> = {
  default: DefaultLayout,
};