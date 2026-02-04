import { useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';

export function useCapacitor() {
  const isNative = Capacitor.isNativePlatform();
  const platform = Capacitor.getPlatform();

  useEffect(() => {
    if (!isNative) return;

    // Configurar StatusBar
    StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
    StatusBar.setBackgroundColor({ color: '#B71C1C' }).catch(() => {});

    // Ocultar SplashScreen después de cargar
    SplashScreen.hide().catch(() => {});

    // Handler para botón "atrás" en Android
    const backHandler = App.addListener('backButton', ({ canGoBack }) => {
      if (canGoBack) {
        window.history.back();
      } else {
        App.exitApp();
      }
    });

    return () => {
      backHandler.then((listener) => listener.remove());
    };
  }, [isNative]);

  const exitApp = useCallback(() => {
    if (isNative) {
      App.exitApp();
    }
  }, [isNative]);

  const getAppInfo = useCallback(async () => {
    if (!isNative) return null;
    return App.getInfo();
  }, [isNative]);

  return {
    isNative,
    platform,
    exitApp,
    getAppInfo,
  };
}
