import CONFIG from '../config';
import NotificationHelper from './notification-helper';

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
      await navigator.serviceWorker.register('/sw.js');
    } catch (error) {
      console.log('Failed to register service worker:', error);
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
      
      if (this._isSubscribed) {
        await this._unsubscribeFromPushNotification();
      } else {
        await this._subscribeFromPushNotification();
      }
    });
  },

  async _isCurrentSubscribed() {
    const subscription = await this._registration.pushManager.getSubscription();
    return Boolean(subscription);
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
    const subscribeResponse = await this._registration.pushManager.subscribe(
      this._generateSubscribeOptions(),
    );
    
    await this._sendSubscriptionToServer(subscribeResponse);
    
    this._isSubscribed = true;
    this._setSubscribeButtonState('Unsubscribe Push Notification');

    await NotificationHelper.sendNotification({
      title: 'Success Subscribe to Push Notification',
      options: {
        body: 'Hooray! You have successfully subscribed to push notification!',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
      },
    });
  },

  async _unsubscribeFromPushNotification() {
    const subscription = await this._registration.pushManager.getSubscription();
    await subscription.unsubscribe();
    
    await this._sendSubscriptionToServer({
      endpoint: subscription.endpoint,
      unsubscribe: true,
    });
    
    this._isSubscribed = false;
    this._setSubscribeButtonState('Subscribe Push Notification');
  },

  _generateSubscribeOptions() {
    return {
      userVisibleOnly: true,
      applicationServerKey: this._urlB64ToUint8Array(`${CONFIG.PUSH_KEY}`),
    };
  },

  async _sendSubscriptionToServer(subscription) {
    const response = await fetch(`${CONFIG.BASE_URL}/push-notification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subscription),
    });

    return response.json();
  },

  _urlB64ToUint8Array: (base64String) => {
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
  },
};

export default PushNotificationHelper; 