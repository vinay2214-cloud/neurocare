let wearableDevice = null;
let hrCharacteristic = null;
let onDataCallback = null;
let connectionStatus = 'simulation';

export function getConnectionStatus() {
  return connectionStatus;
}

export function setOnDataCallback(cb) {
  onDataCallback = cb;
}

export async function connectWearable() {
  if (!navigator.bluetooth) {
    console.warn('Web Bluetooth not supported, staying in simulation mode');
    connectionStatus = 'simulation';
    return false;
  }

  try {
    wearableDevice = await navigator.bluetooth.requestDevice({
      filters: [{ services: ['heart_rate'] }],
      optionalServices: ['heart_rate'],
    });

    wearableDevice.addEventListener('gattserverdisconnected', () => {
      connectionStatus = 'simulation';
      console.log('Wearable disconnected, falling back to simulation');
    });

    const server = await wearableDevice.gatt.connect();
    const service = await server.getPrimaryService('heart_rate');
    hrCharacteristic = await service.getCharacteristic('heart_rate_measurement');

    hrCharacteristic.addEventListener('characteristicvaluechanged', (event) => {
      const value = event.target.value;
      const flags = value.getUint8(0);
      let hr;
      if (flags & 0x01) {
        hr = value.getUint16(1, true);
      } else {
        hr = value.getUint8(1);
      }
      if (onDataCallback) {
        onDataCallback({ hr, source: 'wearable' });
      }
    });

    await hrCharacteristic.startNotifications();
    connectionStatus = 'connected';
    return true;
  } catch (err) {
    console.warn('Wearable connection failed:', err.message);
    connectionStatus = 'simulation';
    return false;
  }
}

export async function disconnectWearable() {
  if (wearableDevice && wearableDevice.gatt.connected) {
    wearableDevice.gatt.disconnect();
  }
  connectionStatus = 'simulation';
  wearableDevice = null;
  hrCharacteristic = null;
}
