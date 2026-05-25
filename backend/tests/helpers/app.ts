import request from 'supertest';
import { createApp } from '../../src/app';

let cachedApp: ReturnType<typeof createApp> | null = null;

export function getTestApp() {
  if (!cachedApp) {
    cachedApp = createApp();
  }
  return cachedApp;
}

export function api() {
  return request(getTestApp());
}
