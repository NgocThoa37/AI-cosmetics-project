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