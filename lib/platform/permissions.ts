export const PERMISSIONS = [
  "orders.view",
  "orders.create",
  "orders.edit",
  "orders.delete",
  "customers.view",
  "customers.create",
  "customers.edit",
  "customers.delete",
  "expenses.view",
  "expenses.create",
  "expenses.edit",
  "expenses.delete",
  "reports.view",
  "products.view",
  "products.create",
  "products.edit",
  "products.delete",
  "landing_pages.view",
  "landing_pages.create",
  "landing_pages.edit",
  "landing_pages.delete",
  "landing_pages.publish",
  "team.view",
  "team.create",
  "team.edit",
  "team.delete",
  "integrations.view",
  "integrations.manage",
  "subscription.view",
  "subscription.manage",
  "organization.manage",
  "settings.view",
  "settings.manage",
  "ai.use",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

export type PermissionModule = {
  id: string;
  label: string;
  actions: Array<{
    permission: Permission | null;
    label: "VIEW" | "CREATE" | "EDIT" | "DELETE" | "PUBLISH" | "MANAGE";
  }>;
};

export const PERMISSION_MATRIX: PermissionModule[] = [
  {
    id: "orders",
    label: "Commandes",
    actions: [
      { permission: "orders.view", label: "VIEW" },
      { permission: "orders.create", label: "CREATE" },
      { permission: "orders.edit", label: "EDIT" },
      { permission: "orders.delete", label: "DELETE" },
    ],
  },
  {
    id: "customers",
    label: "Clients",
    actions: [
      { permission: "customers.view", label: "VIEW" },
      { permission: "customers.create", label: "CREATE" },
      { permission: "customers.edit", label: "EDIT" },
      { permission: "customers.delete", label: "DELETE" },
    ],
  },
  {
    id: "expenses",
    label: "Dépenses",
    actions: [
      { permission: "expenses.view", label: "VIEW" },
      { permission: "expenses.create", label: "CREATE" },
      { permission: "expenses.edit", label: "EDIT" },
      { permission: "expenses.delete", label: "DELETE" },
    ],
  },
  {
    id: "reports",
    label: "Rapports",
    actions: [
      { permission: "reports.view", label: "VIEW" },
      { permission: null, label: "CREATE" },
      { permission: null, label: "EDIT" },
      { permission: null, label: "DELETE" },
    ],
  },
  {
    id: "products",
    label: "Produits",
    actions: [
      { permission: "products.view", label: "VIEW" },
      { permission: "products.create", label: "CREATE" },
      { permission: "products.edit", label: "EDIT" },
      { permission: "products.delete", label: "DELETE" },
    ],
  },
  {
    id: "landing_pages",
    label: "Landing Pages",
    actions: [
      { permission: "landing_pages.view", label: "VIEW" },
      { permission: "landing_pages.create", label: "CREATE" },
      { permission: "landing_pages.edit", label: "EDIT" },
      { permission: "landing_pages.delete", label: "DELETE" },
    ],
  },
  {
    id: "team",
    label: "Équipe",
    actions: [
      { permission: "team.view", label: "VIEW" },
      { permission: "team.create", label: "CREATE" },
      { permission: "team.edit", label: "EDIT" },
      { permission: "team.delete", label: "DELETE" },
    ],
  },
];

/** Full org capability set for OWNER. */
export const OWNER_PERMISSIONS: Permission[] = [...PERMISSIONS];

export const MANAGER_PERMISSIONS: Permission[] = [
  "orders.view",
  "orders.create",
  "orders.edit",
  "customers.view",
  "customers.create",
  "customers.edit",
  "expenses.view",
  "expenses.create",
  "expenses.edit",
  "reports.view",
  "products.view",
  "products.create",
  "products.edit",
  "landing_pages.view",
  "landing_pages.create",
  "landing_pages.edit",
  "landing_pages.publish",
  "integrations.view",
  "settings.view",
  "ai.use",
];

export const VIEWER_PERMISSIONS: Permission[] = [
  "orders.view",
  "customers.view",
  "expenses.view",
  "reports.view",
  "products.view",
  "landing_pages.view",
  "settings.view",
];

export const DEFAULT_EMPLOYEE_PERMISSIONS: Permission[] = [
  "orders.view",
  "orders.edit",
  "customers.view",
  "landing_pages.view",
];

export function permissionsForRole(
  role: "PLATFORM_ADMIN" | "OWNER" | "MANAGER" | "EMPLOYEE" | "VIEWER",
  custom?: Permission[],
): Permission[] {
  switch (role) {
    case "PLATFORM_ADMIN":
      return [...PERMISSIONS];
    case "OWNER":
      return OWNER_PERMISSIONS;
    case "MANAGER":
      return MANAGER_PERMISSIONS;
    case "VIEWER":
      return VIEWER_PERMISSIONS;
    case "EMPLOYEE":
      return custom?.length ? [...custom] : DEFAULT_EMPLOYEE_PERMISSIONS;
    default:
      return [];
  }
}

export function hasPermission(
  granted: Permission[],
  required: Permission | Permission[],
): boolean {
  const needed = Array.isArray(required) ? required : [required];
  return needed.every((p) => granted.includes(p));
}

/** Nav module → minimum permission to see it. */
export const MODULE_PERMISSION: Record<string, Permission | null> = {
  dashboard: null,
  orders: "orders.view",
  expenses: "expenses.view",
  reports: "reports.view",
  products: "products.view",
  customers: "customers.view",
  landing_pages: "landing_pages.view",
  ai: "ai.use",
  premium: null,
  settings: "settings.view",
  team: "team.view",
  subscription: "subscription.view",
};
