import { flow, getEnv, getRoot, types } from 'mobx-state-tree';
import axios, { AxiosRequestConfig } from 'axios';

import { RootStore } from '../RootStore';
import { Loader } from '../shared';
import { getProject } from '@/i18n';
import { getCookie, setCookie, deleteCookie } from '@/utils';
import { cancelPendingRequests } from '@/rpc/httpRpc';
import { generateTraceId } from '@/utils';
import { Options } from '@/utils/cookie';
import { cancelAnalyticPendingRequests } from '@/rpc/httpRpcAnalytic';

export type LoginUser = {
    login: string;
    password: string;
    dont_keep_me_signed_in: boolean;
};

type Auth = {
    jwt: string;
    refresh: string;
};

const isApp2 = ['analytics2.comagic.ru', 'go2.comagic.ru', 'analytics2.uiscom.ru', 'go2.uiscom.ru'].includes(
    window.location.hostname
);
let AUTH_KEY = 'auth';

if (isApp2) {
    AUTH_KEY += '_pp';
}

const getCookieDomain = () => {
    return window.location.hostname
        .split('.')
        .slice(-2)
        .join('.');
};

export const setAuthHeaders = (config?: AxiosRequestConfig): void => {
    const auth = getToken();

    if (auth) {
        const { jwt } = auth;
        const headers = config?.headers || axios.defaults.headers.common;

        headers['Authorization'] = `Bearer ${jwt}`;
        headers['X-Auth-Type'] = 'jwt';
    }
};

export const getToken = (): Auth => {
    const token = getCookie(AUTH_KEY);

    if (!token) return;

    return JSON.parse(token);
};

const setToken = (auth: Auth, dontKeepMeSignedIn = false) => {
    const options = {
        secure: true,
        domain: getCookieDomain(),
    } as Options;
    if (!dontKeepMeSignedIn) {
        const twoWeeks = new Date(Date.now() + 2 * 7 * 24 * 60 * 60 * 1000);
        options.expires = twoWeeks;
    }
    setCookie(AUTH_KEY, JSON.stringify(auth), options);

    setAuthHeaders();
    window.dispatchEvent(new Event('tokenChange'));
};

type JwtPayload = {
    app_id: number;
    user_id: number;
    exp: number;
};

const getJwtPayload = (): JwtPayload => {
    const token = getToken();
    if (!token) {
        return null;
    }
    const jwt = token.jwt;
    if (!jwt) {
        return null;
    }
    const jwtPayload = jwt.split('.')[1];
    if (!jwtPayload) {
        return null;
    }
    return JSON.parse(atob(jwtPayload));
};

const removeToken = (skipLocalStorage = false) => {
    if (!skipLocalStorage) {
        deleteCookie(AUTH_KEY, { secure: true, domain: getCookieDomain() });
        sessionStorage.removeItem(AUTH_KEY);
        sessionStorage.removeItem('access_token');
    }

    delete axios.defaults.headers.common['Authorization'];
    delete axios.defaults.headers.common['X-Auth-Type'];

    window.dispatchEvent(new Event('tokenRemove'));
};

export const AuthStore = Loader.named('AuthStore')
    .props({
        isAuthorized: types.optional(types.boolean, Boolean(getToken())),
        isTokenRefreshing: types.optional(types.boolean, false),
        windowId: types.optional(types.string, generateTraceId('local')),
    })
    .actions(self => {
        const { httpRpcAuth } = getEnv(self);
        const { resetStore, authStore, accountStore } = getRoot<typeof RootStore>(self);

        let isTokenRefreshing = false,
            refreshingCall: Promise<void>;

        const setAuthorized = (isAuthorized: boolean) => {
            self.isAuthorized = isAuthorized;
        };

        const setIsTokenRefreshing = (value: boolean) => {
            self.isTokenRefreshing = value;
            isTokenRefreshing = value;
        };

        const logout = (skipLocalStorage = false) => {
            resetStore();
            setAuthorized(false);
            cancelPendingRequests('canceled by logout');
            cancelAnalyticPendingRequests('canceled by logout');
            removeToken(skipLocalStorage);
            self.setLoading(false);
        };

        const fetchLoginUser = flow(function*({
            login,
            password,
            dont_keep_me_signed_in: dontKeepMeSignedIn,
        }: LoginUser) {
            self.setLoading(true);

            try {
                const auth = yield httpRpcAuth('login', {
                    login,
                    password,
                    project: getProject(),
                });

                setToken(auth, dontKeepMeSignedIn);
                setAuthorized(true);
            } catch (e) {
                removeToken();

                return Promise.reject(e);
            } finally {
                self.setLoading(false);
            }
        });

        const fetchRefresh = flow(function*() {
            let resolve = (): void => null,
                reject = (e: any): void => null;

            if (isTokenRefreshing) {
                return refreshingCall;
            }

            refreshingCall = new Promise((value1, value2) => {
                resolve = value1;
                reject = value2;
            });

            try {
                setIsTokenRefreshing(true);

                const auth = getToken();

                const nextAuth = yield httpRpcAuth('refresh', auth);

                setToken(nextAuth);
                resolve();
            } catch (e) {
                reject(e);
                void fetchLogoutUser();
                return Promise.reject(e);
            } finally {
                setIsTokenRefreshing(false);
            }
        });

        const fetchLogoutUser = flow(function*() {
            self.setLoading(true);

            try {
                const token = getToken();
                const jwt = token?.jwt;

                yield httpRpcAuth('logout', {
                    jwt,
                });
            } catch (e) {
                return Promise.reject(e);
            } finally {
                logout();
            }
        });

        const afterCreate = () => {
            isTokenRefreshing = false;
            refreshingCall = null;

            window.addEventListener('doLogoutUser', (event: CustomEvent) => {
                const eventWindowId = event.detail;
                if (eventWindowId !== authStore.windowId) {
                    void authStore.logout(true);
                }
            });
            window.addEventListener('doRefreshToken', (event: CustomEvent) => {
                const eventWindowId = event.detail;
                if (eventWindowId !== authStore.windowId) {
                    authStore
                        .fetchRefresh()
                        .then(() => {
                            const tokenRefreshedEvent = new Event('tokenRefreshed');
                            window.dispatchEvent(tokenRefreshedEvent);
                        })
                        .catch(e => console.error(e));
                }
            });

            window.setInterval(() => {
                if (authStore.isAuthorized) {
                    const payload = getJwtPayload();

                    if (payload) {
                        const jwtUserId = payload.user_id;
                        const accountStoreUserId = accountStore.account.user_id;

                        if (accountStoreUserId !== null && jwtUserId !== accountStoreUserId) {
                            window.location.href = '/';
                        }
                    }
                }
            }, 1000);
        };

        return {
            fetchLoginUser,
            fetchLogoutUser,
            fetchRefresh,
            logout,
            setIsTokenRefreshing,
            afterCreate,
        };
    });
