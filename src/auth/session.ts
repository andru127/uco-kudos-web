import type { User } from '../api/types';

const TOKEN_KEY = 'uco-kudos.token';
const USER_KEY = 'uco-kudos.user';

export const session = {
  token(): string | null {
    return sessionStorage.getItem(TOKEN_KEY);
  },
  user(): User | null {
    const raw = sessionStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  },
  save(token: string, user: User): void {
    sessionStorage.setItem(TOKEN_KEY, token);
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  updateUser(user: User): void {
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  clear(): void {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
  },
};
