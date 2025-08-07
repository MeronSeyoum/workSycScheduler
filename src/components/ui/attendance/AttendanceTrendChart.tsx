import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface AttendanceTrendChartProps {
  data: {
    labels: string[];
    present: number[];
    late: number[];
    absent: number[];
  };
}

export default function AttendanceTrendChart({ data }: AttendanceTrendChartProps) {
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: 'Present',
        data: data.present,
        backgroundColor: '#4ade80',
      },
      {
        label: 'Late',
        data: data.late,
        backgroundColor: '#fbbf24',
      },
      {
        label: 'Absent',
        data: data.absent,
        backgroundColor: '#f87171',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Attendance Trends',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Employees',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Date',
        },
      },
    },
  };

  return <Bar options={options} data={chartData} />;
}