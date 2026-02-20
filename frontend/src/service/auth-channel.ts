export type AuthBroadcastMessage =
  | { type: 'LOGIN' }
  | { type: 'LOGOUT' }
  | { type: 'TOKEN_REFRESHED' }
  | { type: 'REQUEST_TOKEN' }
  | { type: 'TOKEN_RESPONSE'; accessToken: string };

let channel: BroadcastChannel | null = null;

export function getAuthChannel() {
  if (typeof window === 'undefined') return null;
  if (!channel) {
    channel = new BroadcastChannel('auth-channel');
  }
  return channel;
}

export function closeAuthChannel() {
  if (channel) {
    channel.close();
    channel = null;
  }
}