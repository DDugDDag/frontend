import { Linking } from 'react-native';
import InAppBrowser from 'react-native-inappbrowser-reborn';

export async function openBrowserAsync(url: string) {
  if (await InAppBrowser.isAvailable()) {
    const res = await InAppBrowser.open(url, { // 옵션은 필요에 맞게
      dismissButtonStyle: 'close',
      showTitle: true,
    });
    return { type: res.type === 'cancel' ? 'cancel' : 'opened' } as const;
  }
  const ok = await Linking.canOpenURL(url);
  if (ok) { await Linking.openURL(url); return { type: 'opened' } as const; }
  return { type: 'unavailable' as const };
}
