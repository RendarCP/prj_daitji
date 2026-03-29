"use client";

import { createContext, useContext } from "react";
import type { User } from "@supabase/supabase-js";

export type AccountUser = User | null;

const SettingsAccountUserContext = createContext<AccountUser>(null);

interface SettingsAccountUserProviderProps {
  children: React.ReactNode;
  value: AccountUser;
}

export function SettingsAccountUserProvider({
  children,
  value,
}: SettingsAccountUserProviderProps) {
  return (
    <SettingsAccountUserContext.Provider value={value}>
      {children}
    </SettingsAccountUserContext.Provider>
  );
}

export function useSettingsAccountUser() {
  return useContext(SettingsAccountUserContext);
}
