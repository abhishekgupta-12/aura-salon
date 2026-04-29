import { Role } from "@prisma/client";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: Role;
  salonId: string | null;
}

export interface NavItem {
  label: string;
  href: string;
  icon: string;
  badge?: number;
  roles?: Role[];
}

export interface KPIData {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: string;
  iconBg: string;
  iconColor: string;
  sparkline?: number[];
}
