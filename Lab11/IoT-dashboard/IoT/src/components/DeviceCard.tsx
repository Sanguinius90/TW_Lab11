import Typography from '@mui/material/Typography';
import DeviceThermostatIcon from '@mui/icons-material/DeviceThermostat';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import OpacityIcon from '@mui/icons-material/Opacity';

interface DeviceData {
  temperature: number;
  pressure: number;
  humidity: number;
  deviceId: number;
}

interface Props {
  data: DeviceData;
  selected?: boolean;
  onClick?: () => void;
}

const DeviceCard = ({ data, selected = false, onClick }: Props) => {
  const { deviceId, temperature, pressure, humidity } = data;

  return (
    <div
      className={`card ${selected ? 'selected' : ''}`}
      onClick={onClick}
    >
      <Typography variant="h6">Device No. {deviceId}</Typography>
<hr />
{temperature === 0 && pressure === 0 && humidity === 0 ? (
  <Typography>No data</Typography>
) : (
  <>
    <Typography variant="h6" component="div">
      <DeviceThermostatIcon />
      <span className="value">{temperature}</span>
      <span>°C</span>
    </Typography>
    <Typography variant="h6" component="div">
      <CloudUploadIcon />
      <span className="value">{pressure}</span> hPa
    </Typography>
    <Typography variant="h6" component="div">
      <OpacityIcon />
      <span className="value">{humidity}</span>%
    </Typography>
  </>
)}
<Typography variant="caption" color="primary">
  DETAILS
</Typography>
    </div>
  );
};

export default DeviceCard;
