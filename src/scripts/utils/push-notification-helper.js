import CONFIG from '../config';
import NotificationHelper from './notification-helper';
import { subscribePushNotification, unsubscribePushNotification } from '../data/api';

const PushNotificationHelper = {
  async init({ subscribeButton }) {
    this._subscribeButton = subscribeButton;
    this._registration = null;

    if (!this._checkAvailability()) {
      console.log('Push Notification not supported in the browser');
      return;
    }

    await this._registerServiceWorker();
    await this._initialServiceWorkerRegistration();
    await this._initialSubscribeButtonState();
    await this._setupSubscribeButtonListener();
  },

  async _registerServiceWorker() {
    try {
      const registration = await navigator.serviceWorker.register('./sw.js');
      console.log('Service Worker berhasil didaftarkan:', registration);
      return registration;
    } catch (error) {
      console.error('Service Worker gagal didaftarkan:', error);
      throw error;
    }
  },

  async _initialServiceWorkerRegistration() {
    this._registration = await navigator.serviceWorker.ready;
  },

  async _initialSubscribeButtonState() {
    this._isSubscribed = await this._isCurrentSubscribed();
    if (this._isSubscribed) {
      this._setSubscribeButtonState('Unsubscribe Push Notification');
    } else {
      this._setSubscribeButtonState('Subscribe Push Notification');
    }
  },

  async _setupSubscribeButtonListener() {
    this._subscribeButton.addEventListener('click', async (event) => {
      event.stopPropagation();
      
      try {
        if (this._isSubscribed) {
          await this._unsubscribeFromPushNotification();
        } else {
          await this._subscribeFromPushNotification();
        }
      } catch (error) {
        console.error('Error handling subscription:', error);
        alert('Failed to handle push notification subscription. Please try again later.');
      }
    });
  },

  async _isCurrentSubscribed() {
    try {
      const subscription = await this._registration?.pushManager.getSubscription();
      return Boolean(subscription);
    } catch (error) {
      console.error('Error checking subscription status:', error);
      return false;
    }
  },

  _setSubscribeButtonState(state) {
    this._subscribeButton.textContent = state;
  },

  _checkAvailability() {
    return Boolean(
      'serviceWorker' in navigator &&
      'PushManager' in window,
    );
  },

  async _subscribeFromPushNotification() {
    try {
      const subscribeResponse = await this._registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this._urlB64ToUint8Array(CONFIG.PUSH_KEY),
      });
      
      const subscriptionData = {
        endpoint: subscribeResponse.endpoint,
        keys: {
          p256dh: btoa(String.fromCharCode.apply(null, 
            new Uint8Array(subscribeResponse.getKey('p256dh'))
          )),
          auth: btoa(String.fromCharCode.apply(null,
            new Uint8Array(subscribeResponse.getKey('auth'))
          )),
        },
      };
      
      await subscribePushNotification(subscriptionData);
      
      this._isSubscribed = true;
      this._setSubscribeButtonState('Unsubscribe Push Notification');

      await NotificationHelper.sendNotification({
        title: 'Berhasil Subscribe',
        options: {
          body: 'Anda telah berhasil subscribe push notification!',
          icon: './icons/icon-192x192.png',
          badge: './icons/icon-72x72.png',
          vibrate: [100, 50, 100],
        },
      });
    } catch (error) {
      console.error('Failed to subscribe:', error);
      throw error;
    }
  },

  async _unsubscribeFromPushNotification() {
    try {
      const subscription = await this._registration.pushManager.getSubscription();
      if (!subscription) return;

      await subscription.unsubscribe();
      await unsubscribePushNotification(subscription.endpoint);
      
      this._isSubscribed = false;
      this._setSubscribeButtonState('Subscribe Push Notification');

      await NotificationHelper.sendNotification({
        title: 'Berhasil Unsubscribe',
        options: {
          body: 'Anda telah berhenti berlangganan push notification',
          icon: './icons/icon-192x192.png',
          badge: './icons/icon-72x72.png',
          vibrate: [100, 50, 100],
        },
      });
    } catch (error) {
      console.error('Failed to unsubscribe:', error);
      throw error;
    }
  },

  _urlB64ToUint8Array: (base64String) => {
    try {
      const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
      const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');
      const rawData = window.atob(base64);
      const outputArray = new Uint8Array(rawData.length);

      for (let i = 0; i < rawData.length; i++) {
        outputArray[i] = rawData.charCodeAt(i);
      }

      return outputArray;
    } catch (error) {
      console.error('Error converting base64 to Uint8Array:', error);
      throw error;
    }
  },
};

export default PushNotificationHelper; 