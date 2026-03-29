"use client";

import type { AccountUser } from "./SettingsContext";
import { SettingsAccountUserProvider } from "./SettingsContext";
import { Stack } from "./stackflow/settingsStack";

interface SettingsClientProps {
  initialAccountUser: AccountUser;
}

export function SettingsClient({ initialAccountUser }: SettingsClientProps) {
  return (
    <SettingsAccountUserProvider value={initialAccountUser}>
      <div className="relative">
        <Stack />
      </div>
    </SettingsAccountUserProvider>
  );
}
