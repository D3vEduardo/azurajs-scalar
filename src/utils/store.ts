/**
 * @fileoverview Store utility for managing application state
 * This module provides a typed store for managing scalar configuration values
 */

import { ScalarStoreType } from "../config/types";

/**
 * Typed store class for managing scalar configuration values
 */
class ScalarStore {
  private store: Map<keyof ScalarStoreType, string | undefined> = new Map();

  /**
   * Sets a value in the store
   * @param key The key to set
   * @param value The value to set (if undefined, the key will be removed)
   */
  set<K extends keyof ScalarStoreType>(
    key: K,
    value: ScalarStoreType[K],
  ): void {
    this.store.set(key, value as string | undefined);
  }

  /**
   * Gets a value from the store
   * @param key The key to get
   * @returns The value associated with the key
   */
  get<K extends keyof ScalarStoreType>(key: K): ScalarStoreType[K] {
    return this.store.get(key) as ScalarStoreType[K];
  }

  /**
   * Checks if a key exists in the store
   * @param key The key to check
   * @returns True if the key exists, false otherwise
   */
  has(key: keyof ScalarStoreType): boolean {
    return this.store.has(key);
  }

  /**
   * Deletes a key from the store
   * @param key The key to delete
   * @returns True if the key existed and was deleted, false otherwise
   */
  delete(key: keyof ScalarStoreType): boolean {
    return this.store.delete(key);
  }

  /**
   * Clears all values from the store
   */
  clear(): void {
    this.store.clear();
  }

  /**
   * Gets all values from the store
   * @returns An object containing all key-value pairs in the store
   */
  getAll(): ScalarStoreType {
    const result: Partial<ScalarStoreType> = {};
    for (const [key, value] of this.store.entries()) {
      result[key] = value as ScalarStoreType[keyof ScalarStoreType];
    }
    return result as ScalarStoreType;
  }

  // Index signature to allow direct property access
  [key: string]: any;
}

export const store = new ScalarStore();
