const NotificationHelper = {
  async sendNotification({ title, options }) {
    if (!this._checkAvailability()) {
      return;
    }

    if (!this._checkPermission()) {
      const status = await Notification.requestPermission();
      
      if (status === 'denied') {
        console.log('Notification Denied');
        return;
      }

      if (status === 'default') {
        console.log('Permission closed');
        return;
      }
    }

    try {
      const serviceWorkerRegistration = await navigator.serviceWorker.ready;
      await serviceWorkerRegistration.showNotification(title, options);
    } catch (error) {
      console.log('Notification Error:', error);
    }
  },

  _checkAvailability() {
    return Boolean('Notification' in window);
  },

  _checkPermission() {
    return Notification.permission === 'granted';
  },
};

export default NotificationHelper; 