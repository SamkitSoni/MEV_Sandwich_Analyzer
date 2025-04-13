import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const SandwichChart = ({ data }) => {
    // Prepare chart data
    const chartData = {
        labels: data.map((item) => `Block ${item.block_number}`), // X-axis labels
        datasets: [
            {
                label: 'Number of Sandwich Attacks',
                data: data.map((item) => item.attack_count), // Y-axis values
                borderColor: '#053F5C',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                tension: 0.4, // Smooth curve
                pointRadius: 4, // Size of data points
            },
        ],
    };

    // Chart options
    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Sandwich Attacks Per Block',
            },
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Block Number',
                },
            },
            y: {
                title: {
                    display: true,
                    text: 'Number of Attacks',
                },
                beginAtZero: true,
            },
        },
    };

    return <Line data={chartData} options={options} />;
};

export default SandwichChart;