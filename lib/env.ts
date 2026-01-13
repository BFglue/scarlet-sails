export const ENV_KEYS = {
  N8N_WEBHOOK_URL: "N8N_WEBHOOK_URL",
  WEBAPP_URL: "WEBAPP_URL",
  PUBLIC_SITE_URL: "PUBLIC_SITE_URL",
  TELEGRAM_BOT_TOKEN: "TELEGRAM_BOT_TOKEN",
  TELEGRAM_BOT_USERNAME: "TELEGRAM_BOT_USERNAME",
  NODE_ENV: "NODE_ENV"
} as const;

export type EnvKey = (typeof ENV_KEYS)[keyof typeof ENV_KEYS];

export function getOptionalEnv(key: EnvKey): string | undefined {
  const value = process.env[key];
  return value?.length ? value : undefined;
}

export function getRequiredEnv(key: EnvKey): string {
  const value = getOptionalEnv(key);
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
}
