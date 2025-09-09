import NetInfo from '@react-native-community/netinfo';
import { pingOnce } from './Pinger';

type State = { online: boolean; okStreak: number; failStreak: number };

const s: State = { online: false, okStreak: 0, failStreak: 0 };

// Event-Loop: alle 5s prüfen, aber ohne Überlappung
let timer: any;

export function startConnectivityLoop(onChange: (online: boolean) => void) {
  if (timer) clearInterval(timer);

  async function check() {
    const ni = await NetInfo.fetch();
    const netReachable = !!(ni.isConnected && (ni.isInternetReachable ?? true));
    const pingOK = await pingOnce(3000);
    const ok = netReachable && pingOK;

    if (ok) {
      s.okStreak++; s.failStreak = 0;
      if (!s.online && s.okStreak >= 2) { s.online = true; onChange(true); }
    } else {
      s.failStreak++; s.okStreak = 0;
      if (s.online && s.failStreak >= 2) { s.online = false; onChange(false); }
    }
  }

  check();
  timer = setInterval(check, 5000);
  return () => clearInterval(timer);
}