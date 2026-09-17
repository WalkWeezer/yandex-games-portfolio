/**
 * localSave — persistence for `slf_club_v1`
 * Thin facade over GameState load/persist.
 */
import { SAVE_KEY } from '../types';
import { loadOrCreate, newGame, persist, getState } from './GameState';

export { SAVE_KEY, loadOrCreate, newGame, persist, getState };

export function hasSave(): boolean {
  try {
    return localStorage.getItem(SAVE_KEY) != null;
  } catch {
    return false;
  }
}

export function clearSave(): void {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch {
    // ignore
  }
}
