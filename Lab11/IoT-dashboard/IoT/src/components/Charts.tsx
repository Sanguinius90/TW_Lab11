import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Typography } from '@mui/material';

interface DeviceData {
    temperature: number;
    pressure: number;
    humidity: number;
    deviceId: number;
    readingDate?: string | number;
}

interface Props {
    selectedId: number;
    data: DeviceData[];
}

const Charts = ({ selectedId, data }: Props) => {
    const filtered = data.filter((d) => d.deviceId === selectedId);

    const chartData = filtered.map((entry, index) => ({
        name: entry.readingDate ?? (index + 1).toString(),
        temperature: entry.temperature,
        pressure: entry.pressure / 10,
        humidity: entry.humidity,
    }));

    return (
        <>
            <Typography variant="h6" style={{ color: '#fff', padding: '1rem 0' }}>
                Device No. {selectedId}
            </Typography>

            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="pressure" stroke="#00FFFF" name="Pressure x10 [hPa]" />
                    <Line type="monotone" dataKey="humidity" stroke="#66FF66" name="Humidity [%]" />
                    <Line type="monotone" dataKey="temperature" stroke="#FF33FF" name="Temperature [°C]" />
                </LineChart>
            </ResponsiveContainer>
        </>
    );
};

export default Charts;
