import { createContext, useContext } from "react";

/**
 * Acciones y estado compartido del escritorio XP (ventanas, explorador, modales).
 */
export const DesktopActionsContext = createContext(null);

export function useDesktopActions() {
  const ctx = useContext(DesktopActionsContext);
  if (!ctx) {
    throw new Error("useDesktopActions debe usarse dentro de DesktopActionsContext.Provider");
  }
  return ctx;
}
