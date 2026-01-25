/**
 * Debug utility function that only logs when DEBUG environment variable is set to 'true'
 */

export function debug(message: string, ...optionalParams: any[]) {
  if (process.env.DEBUG === 'true' || process.env.DEBUG === '1') {
    console.log(`[DEBUG] ${message}`, ...optionalParams);
  }
}