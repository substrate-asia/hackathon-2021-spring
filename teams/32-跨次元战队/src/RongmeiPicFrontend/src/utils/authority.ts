import {reloadAuthorized} from './Authorized';

// use localStorage to store the authority info, which might be sent from server in actual project.
export function getAuthority(str?: string): string | string[] {
  const authorityString =
    typeof str === 'undefined' && localStorage ? localStorage.getItem('token') : str;
  // authorityString could be admin, "admin", ["admin"]
  let authority;
  try {
    if (authorityString) {
      authority = JSON.parse(authorityString);
    }
  } catch (e) {
    authority = authorityString;
  }
  return authority;
}

export async function setAuthority(authority: string): Promise<void> {
  await localStorage.setItem('token', authority);
  // auto reload
  reloadAuthorized();
}
