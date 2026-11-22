import type { DataBackend } from './backend';
import { storage } from './storage';

export const localBackend: DataBackend = {
  load: async (userId) => storage.getData(userId),
  save: async (userId, _prev, next) => storage.saveData(userId, next),
};
