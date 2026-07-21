"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type AuthUser = {
  id: string;
  email: string;
  name: string;
  roles: string[];
  workspaceIds: string[];
};

type AuthState = {
  token: string | null;
  workspaceId: string | null;
  user: AuthUser | null;
  /** When true, LegalOS runs inside WOXOX CRM chrome (no nested sidebar). */
  embeddedInCrm: boolean;
  setSession: (input: {
    token: string;
    workspaceId: string;
    user: AuthUser;
    embeddedInCrm?: boolean;
  }) => void;
  setEmbeddedInCrm: (embedded: boolean) => void;
  clearSession: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      workspaceId: null,
      user: null,
      embeddedInCrm: false,
      setSession: ({ token, workspaceId, user, embeddedInCrm }) =>
        set({
          token,
          workspaceId,
          user,
          embeddedInCrm: Boolean(embeddedInCrm),
        }),
      setEmbeddedInCrm: (embeddedInCrm) => set({ embeddedInCrm }),
      clearSession: () =>
        set({ token: null, workspaceId: null, user: null, embeddedInCrm: false }),
    }),
    {
      name: "legalos-auth",
      partialize: (s) => ({
        token: s.token,
        workspaceId: s.workspaceId,
        user: s.user,
        embeddedInCrm: s.embeddedInCrm,
      }),
    }
  )
);

export function getAuthSnapshot() {
  return useAuthStore.getState();
}
