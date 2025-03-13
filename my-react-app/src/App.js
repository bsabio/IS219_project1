import React, { useEffect, useState } from 'react';
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
import { Line } from 'react-chartjs-2';
import Papa from 'papaparse';  // Properly import Papa Parse
import './App.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function App() {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Sample data to use if CSV loading fails
    const fallbackData = {
      labels: ['2018', '2019', '2020', '2021', '2022', '2023'],
      datasets: [
        {
          label: 'Adult Depression Percentage',
          data: [12.5, 13.2, 18.6, 20.3, 19.8, 18.5],
          fill: false,
          backgroundColor: 'rgba(75,192,192,0.2)',
          borderColor: 'rgba(75,192,192,1)',
        },
      ],
    };

    // Try to fetch the CSV file
    fetch('/adult-depression-lghc-indicator-24.csv')
      .then(response => {
        if (!response.ok) {
          throw new Error('CSV file not found');
        }
        return response.text();
      })
      .then(data => {
        try {
          // Use the imported Papa Parse directly - no need to check if it's defined
          const parsedData = Papa.parse(data, { header: true }).data;
          
          // Filter the data for 'Total' strata
          const totalData = parsedData.filter(row => row.Strata === 'Total');
          
          // Extract years and percentages
          const years = totalData.map(row => row.Year);
          const percentages = totalData.map(row => parseFloat(row.Percent) || 0);
          
          setChartData({
            labels: years,
            datasets: [
              {
                label: 'Adult Depression Percentage',
                data: percentages,
                fill: false,
                backgroundColor: 'rgba(75,192,192,0.2)',
                borderColor: 'rgba(75,192,192,1)',
              },
            ],
          });
        } catch (err) {
          console.error('Error parsing CSV:', err);
          setChartData(fallbackData);
          setError('Error parsing CSV data. Using sample data instead.');
        }
      })
      .catch(err => {
        console.error('Error loading data:', err);
        setChartData(fallbackData);
        setError('Could not load CSV data. Using sample data instead.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Adult Depression Trends',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Percentage (%)'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Year'
        }
      }
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Adult Depression Percentage Over Years</h1>
        {loading ? (
          <p>Loading chart data...</p>
        ) : (
          <>
            {error && <p className="error-message">{error}</p>}
            <div style={{ width: '80%', maxWidth: '800px' }}>
              <Line data={chartData} options={options} />
            </div>
          </>
        )}
      </header>
    </div>
  );
}

export default App;