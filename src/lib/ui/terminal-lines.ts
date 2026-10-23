/** Prefix for successful terminal / CLI feedback lines (render with Check icon in UI). */
export const TERMINAL_OK_PREFIX = "[OK] ";

export function formatTerminalOk(message: string): string {
  return `${TERMINAL_OK_PREFIX}${message}`;
}

export function isTerminalOkLine(line: string): boolean {
  return line.startsWith(TERMINAL_OK_PREFIX);
}

export function terminalOkMessage(line: string): string {
  return line.slice(TERMINAL_OK_PREFIX.length);
}
