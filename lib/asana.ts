const ASANA_API = "https://app.asana.com/api/1.0";
const PAT = process.env.ASANA_PAT ?? "";
const PROJECT_GID = process.env.ASANA_PROJECT_GID ?? "";
const TRACKING_FIELD_NAMES = {
  reminderStatus:
    process.env.ASANA_FIELD_REMINDER_STATUS_NAME ?? "Reminder Status",
  lastReminderDate:
    process.env.ASANA_FIELD_LAST_REMINDER_DATE_NAME ?? "Last Reminder Date",
  lastReminderError:
    process.env.ASANA_FIELD_LAST_REMINDER_ERROR_NAME ?? "Last Reminder Error",
  orderStatus: process.env.ASANA_FIELD_ORDER_STATUS_NAME ?? "Order Status",
} as const;

const FIELD = {
  email: "1210157673564302",
  phone: "1210157673564291",
  minimalUnits: "1210157673564287",
  locations: "1210160724942029",
  frequency: "1210157673564282",
  lastOrderDate: "1210157673564280",
  automation: "1210235119807466",
} as const;

async function asanaFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${ASANA_API}${path}`, {
    ...init,
    headers: {
      ...init?.headers,
      Authorization: `Bearer ${PAT}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Asana API ${res.status}: ${text}`);
  }
  return (await res.json()) as T;
}

type AsanaCustomFieldSetting = {
  custom_field?: {
    gid: string;
    name: string;
  };
};

type TrackingFieldGids = {
  reminderStatus?: string;
  lastReminderDate?: string;
  lastReminderError?: string;
  orderStatus?: string;
};

let trackingFieldGidsPromise: Promise<TrackingFieldGids> | null = null;

async function getTrackingFieldGids(): Promise<TrackingFieldGids> {
  if (trackingFieldGidsPromise) return trackingFieldGidsPromise;

  trackingFieldGidsPromise = (async () => {
    const data = await asanaFetch<{ data: AsanaCustomFieldSetting[] }>(
      `/projects/${PROJECT_GID}/custom_field_settings?opt_fields=custom_field.gid,custom_field.name&limit=100`,
    );

    const byName = new Map<string, string>();
    for (const setting of data.data) {
      const gid = setting.custom_field?.gid;
      const name = setting.custom_field?.name;
      if (gid && name) byName.set(name.trim().toLowerCase(), gid);
    }

    return {
      reminderStatus: byName.get(
        TRACKING_FIELD_NAMES.reminderStatus.trim().toLowerCase(),
      ),
      lastReminderDate: byName.get(
        TRACKING_FIELD_NAMES.lastReminderDate.trim().toLowerCase(),
      ),
      lastReminderError: byName.get(
        TRACKING_FIELD_NAMES.lastReminderError.trim().toLowerCase(),
      ),
      orderStatus: byName.get(TRACKING_FIELD_NAMES.orderStatus.trim().toLowerCase()),
    };
  })();

  return trackingFieldGidsPromise;
}

export interface AsanaSection {
  gid: string;
  name: string;
}

export async function getProjectSections(): Promise<AsanaSection[]> {
  const data = await asanaFetch<{ data: AsanaSection[] }>(
    `/projects/${PROJECT_GID}/sections`,
  );
  return data.data;
}

export async function getSectionTasks(sectionGid: string) {
  const optFields = [
    "name",
    "notes",
    "custom_fields",
    "custom_fields.gid",
    "custom_fields.name",
    "custom_fields.display_value",
    "custom_fields.date_value",
    "custom_fields.enum_options",
  ].join(",");

  const data = await asanaFetch<{ data: any[] }>(
    `/sections/${sectionGid}/tasks?opt_fields=${optFields}&limit=100`,
  );
  return data.data;
}

export async function getTask(gid: string) {
  const data = await asanaFetch<{ data: any }>(`/tasks/${gid}`);
  return data.data;
}

export async function updateLastOrderDate(taskGid: string, date: string) {
  return asanaFetch(`/tasks/${taskGid}`, {
    method: "PUT",
    body: JSON.stringify({
      data: {
        custom_fields: {
          [FIELD.lastOrderDate]: { date },
        },
      },
    }),
  });
}

export async function updateTaskCustomFields(
  taskGid: string,
  customFields: Record<string, unknown>,
) {
  if (!Object.keys(customFields).length) return;
  return asanaFetch(`/tasks/${taskGid}`, {
    method: "PUT",
    body: JSON.stringify({
      data: {
        custom_fields: customFields,
      },
    }),
  });
}

export type ReminderStatus =
  | "READY_TO_SEND"
  | "NO_PHONE"
  | "NO_WHATSAPP"
  | "AI_EMPTY"
  | "SENT"
  | "ERROR"
  | "ORDER_RECEIVED";

export async function updateReminderTracking(
  taskGid: string,
  params: {
    status: ReminderStatus;
    lastReminderDate?: string;
    errorMessage?: string;
  },
) {
  const gids = await getTrackingFieldGids();
  const customFields: Record<string, unknown> = {};

  if (gids.reminderStatus) {
    customFields[gids.reminderStatus] = params.status;
  }

  if (gids.lastReminderDate && params.lastReminderDate) {
    customFields[gids.lastReminderDate] = { date: params.lastReminderDate };
  }

  if (gids.lastReminderError) {
    customFields[gids.lastReminderError] = params.errorMessage ?? "";
  }

  return updateTaskCustomFields(taskGid, customFields);
}

export async function updateOrderStatus(taskGid: string, status: string) {
  const gids = await getTrackingFieldGids();
  if (!gids.orderStatus) return;
  return updateTaskCustomFields(taskGid, { [gids.orderStatus]: status });
}

export interface ClientData {
  gid: string;
  name: string;
  email?: string;
  description?: string;
  phoneNumber?: string;
  minimalUnitsPerOrder?: string;
  locations?: { gid: string; color: string; enabled: boolean; name: string; resource_type: string }[];
  frequencyByMonth?: string;
  lastOrderDate?: string;
  isAutomatizationEnabled?: boolean;
  reminderStatus?: ReminderStatus;
  lastReminderDate?: string;
}

function fieldValue(task: any, gid: string): string | undefined {
  const f = task.custom_fields?.find((cf: any) => cf.gid === gid);
  return f?.display_value ?? undefined;
}

function fieldDateValue(task: any, gid: string): string | undefined {
  const f = task.custom_fields?.find((cf: any) => cf.gid === gid);
  return f?.date_value?.date ?? undefined;
}

function fieldEnumOptions(task: any, gid: string): any[] | undefined {
  const f = task.custom_fields?.find((cf: any) => cf.gid === gid);
  return f?.enum_options ?? undefined;
}

function fieldValueByName(task: any, name: string): string | undefined {
  const key = name.trim().toLowerCase();
  const f = task.custom_fields?.find(
    (cf: any) => cf.name?.trim().toLowerCase() === key,
  );
  return f?.display_value ?? undefined;
}

function fieldDateValueByName(task: any, name: string): string | undefined {
  const key = name.trim().toLowerCase();
  const f = task.custom_fields?.find(
    (cf: any) => cf.name?.trim().toLowerCase() === key,
  );
  return f?.date_value?.date ?? undefined;
}

export function parseClientData(task: any): ClientData {
  return {
    gid: task.gid,
    name: task.name,
    description: task.notes ?? undefined,
    email: fieldValue(task, FIELD.email),
    phoneNumber: fieldValue(task, FIELD.phone),
    minimalUnitsPerOrder: fieldValue(task, FIELD.minimalUnits),
    locations: fieldEnumOptions(task, FIELD.locations),
    frequencyByMonth: fieldValue(task, FIELD.frequency),
    lastOrderDate: fieldDateValue(task, FIELD.lastOrderDate),
    isAutomatizationEnabled: fieldValue(task, FIELD.automation) === "Da",
    reminderStatus: fieldValueByName(task, TRACKING_FIELD_NAMES.reminderStatus) as ReminderStatus | undefined,
    lastReminderDate: fieldDateValueByName(task, TRACKING_FIELD_NAMES.lastReminderDate),
  };
}

const REMINDER_COOLDOWN_DAYS = 2;

export function clientNeedsReminder(client: ClientData): boolean {
  if (!client.isAutomatizationEnabled) return false;
  if (!client.lastOrderDate || !client.frequencyByMonth) return false;

  const freq = Number(client.frequencyByMonth);
  if (!freq || freq <= 0) return false;

  const now = new Date();
  const lastOrder = new Date(client.lastOrderDate);
  const daysSinceLastOrder = Math.floor(
    (now.getTime() - lastOrder.getTime()) / (1000 * 60 * 60 * 24),
  );

  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const reminderThreshold = Math.ceil(daysInMonth / freq);

  // Not yet due for a reminder
  if (daysSinceLastOrder <= reminderThreshold) return false;

  // Permanent-skip statuses — don't retry until manually reset in Asana
  if (
    client.reminderStatus === "NO_PHONE" ||
    client.reminderStatus === "NO_WHATSAPP"
  ) {
    return false;
  }

  // Cooldown: if we sent a reminder recently, wait before sending another
  if (client.lastReminderDate && client.reminderStatus === "SENT") {
    const daysSinceReminder = Math.floor(
      (now.getTime() - new Date(client.lastReminderDate).getTime()) /
        (1000 * 60 * 60 * 24),
    );
    if (daysSinceReminder < REMINDER_COOLDOWN_DAYS) return false;
  }

  return true;
}
