export const storage = {
  get: <T>(key: string): T | null => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },
  
  set: <T>(key: string, value: T): void => {
    localStorage.setItem(key, JSON.stringify(value));
  },
  
  remove: (key: string): void => {
    localStorage.removeItem(key);
  },
  
  clear: (): void => {
    localStorage.clear();
  },
};

export const TOKEN_KEY = 'access_token';
export const REFRESH_TOKEN_KEY = 'refresh_token';
export const USER_KEY = 'user';

export const getAccessToken = (): string | null => storage.get<string>(TOKEN_KEY);
export const setAccessToken = (token: string): void => storage.set(TOKEN_KEY, token);
export const removeAccessToken = (): void => storage.remove(TOKEN_KEY);

export const getRefreshToken = (): string | null => storage.get<string>(REFRESH_TOKEN_KEY);
export const setRefreshToken = (token: string): void => storage.set(REFRESH_TOKEN_KEY, token);
export const removeRefreshToken = (): void => storage.remove(REFRESH_TOKEN_KEY);

export const getUser = (): any => storage.get(USER_KEY);
export const setUser = (user: any): void => storage.set(USER_KEY, user);
export const removeUser = (): void => storage.remove(USER_KEY);

export const ADMIN_TOKEN_KEY = 'admin_token';
export const ADMIN_USER_KEY = 'admin_user';

export const getAdminToken = (): string | null => storage.get<string>(ADMIN_TOKEN_KEY);
export const setAdminToken = (token: string): void => storage.set(ADMIN_TOKEN_KEY, token);
export const removeAdminToken = (): void => storage.remove(ADMIN_TOKEN_KEY);

export const getAdminUser = (): any => storage.get(ADMIN_USER_KEY);
export const setAdminUser = (user: any): void => storage.set(ADMIN_USER_KEY, user);
export const removeAdminUser = (): void => storage.remove(ADMIN_USER_KEY);