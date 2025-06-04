import { useState } from 'react';
import DeviceCard from './components/DeviceCard';
import Charts from './components/Charts';
import './App.css';

export const mockData = [
  { deviceId: 1, temperature: 23.5, pressure: 1013.25, humidity: 45, readingDate: '2024-06-01 12:00' },
  { deviceId: 1, temperature: 23.9, pressure: 1013.1, humidity: 44, readingDate: '2024-06-01 13:00' },
  { deviceId: 2, temperature: 23.7, pressure: 1012.8, humidity: 44, readingDate: '2024-06-01 12:00' },
  { deviceId: 2, temperature: 24.1, pressure: 1012.5, humidity: 43, readingDate: '2024-06-01 13:00' },
  { deviceId: 3, temperature: 23.4, pressure: 1013.1, humidity: 46, readingDate: '2024-06-01 12:00' },
  { deviceId: 3, temperature: 23.6, pressure: 1012.9, humidity: 47, readingDate: '2024-06-01 13:00' },
  { deviceId: 4, temperature: 24.5, pressure: 990.4, humidity: 40.3, readingDate: '2024-06-01 12:00' },
  { deviceId: 4, temperature: 24.7, pressure: 991.0, humidity: 41, readingDate: '2024-06-01 13:00' }
];


function Dashboard() {
  const uniqueDeviceIds = Array.from(new Set(mockData.map(d => d.deviceId))).sort();
  const [activeDeviceId, setActiveDeviceId] = useState<number>(uniqueDeviceIds[0]);

  const deviceEntries = mockData.filter(d => d.deviceId === activeDeviceId);
  const activeDeviceData = deviceEntries[deviceEntries.length - 1];

  return (
        <div className="dashboard">
      {/* Górna sekcja */}
      <div className="centered-top">
        {activeDeviceData && (
          <div className="device-preview">
            <DeviceCard data={activeDeviceData} selected />
          </div>
        )}
        <div className="chart-container">
          <Charts selectedId={activeDeviceId} data={mockData} />
        </div>
      </div>

      {/* Siatka z urządzeniami */}
      <div className="device-grid">
        {Array.from({ length: 5 }).map((_, i) => {
          const deviceId = i;
          const all = mockData.filter(d => d.deviceId === deviceId);
          const last = all[all.length - 1];

          return (
            <DeviceCard
              key={deviceId}
              data={
                last ?? {
                  deviceId,
                  temperature: 0,
                  pressure: 0,
                  humidity: 0
                }
              }
              selected={deviceId === activeDeviceId}
              onClick={() => setActiveDeviceId(deviceId)}
            />
          );
        })}
      </div>
    </div>
  );
}

export default Dashboard;
