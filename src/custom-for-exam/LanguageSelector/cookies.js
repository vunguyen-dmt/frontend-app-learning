import Cookies from 'universal-cookie';

export const setCookie = (name, value, days, domain) => {
  let expires = '';
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = `; expires=${date.toUTCString()}`;
  }
  document.cookie = `${name}=${value || ''}${expires}; path=/;domain=${domain}`;
};

export function getCookie(cookieName) {
  const cookies = new Cookies();
  return cookies.get(cookieName);
}
