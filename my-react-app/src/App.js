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
import Papa from 'papaparse';
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
  const [selectedFile, setSelectedFile] = useState('/adult-depression-lghc-indicator-24.csv');
  const [title, setTitle] = useState('Adult Depression Percentage Over Years');
  const [yAxisLabel, setYAxisLabel] = useState('Percentage (%)');

  // Digital media consumption data (hardcoded from Statista)
  const digitalMediaData = {
    labels: ['2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023'],
    datasets: [
      {
        label: 'Digital Media Consumption',
        data: [5.2, 5.6, 5.9, 6.3, 6.8, 7.5, 7.9, 8.2, 8.5],
        fill: false,
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
      },
    ],
  };

  // Available CSV files
  const availableFiles = [
    { 
      value: '/adult-depression-lghc-indicator-24.csv', 
      label: 'Adult Depression', 
      title: 'Adult Depression Percentage Over Years',
      yLabel: 'Percentage (%)',
      dataColumn: 'Percent',
      filterColumn: 'Strata',
      filterValue: 'Total',
      labelColumn: 'Year'
    },
    { 
      value: 'digital-media', 
      label: 'Digital Media Consumption', 
      title: 'Daily Time Spent with Digital Media by US Consumers',
      yLabel: 'Hours per day',
      isHardcoded: true
    }
  ];

  // Function to load CSV data
  const loadCSVData = (fileConfig) => {
    setLoading(true);
    setError(null);
    setTitle(fileConfig.title);
    setYAxisLabel(fileConfig.yLabel);

    // If we're using the hardcoded digital media consumption data
    if (fileConfig.isHardcoded) {
      setChartData(digitalMediaData);
      setLoading(false);
      return;
    }

    // Sample data to use if CSV loading fails
    const fallbackData = {
      labels: ['2018', '2019', '2020', '2021', '2022', '2023'],
      datasets: [
        {
          label: fileConfig.label,
          data: [12.5, 13.2, 18.6, 20.3, 19.8, 18.5],
          fill: false,
          backgroundColor: 'rgba(75,192,192,0.2)',
          borderColor: 'rgba(75,192,192,1)',
        },
      ],
    };

    // Try to fetch the CSV file
    fetch(fileConfig.value)
      .then(response => {
        if (!response.ok) {
          throw new Error(`${fileConfig.label} CSV file not found`);
        }
        return response.text();
      })
      .then(data => {
        try {
          const parsedData = Papa.parse(data, { header: true }).data;
          
          // Filter the data if a filter is specified
          let filteredData = parsedData;
          if (fileConfig.filterColumn && fileConfig.filterValue) {
            filteredData = parsedData.filter(row => 
              row[fileConfig.filterColumn] === fileConfig.filterValue
            );
          }
          
          // Extract labels and data values
          const labels = filteredData.map(row => row[fileConfig.labelColumn]);
          const dataValues = filteredData.map(row => 
            parseFloat(row[fileConfig.dataColumn]) || 0
          );
          
          setChartData({
            labels: labels,
            datasets: [
              {
                label: fileConfig.label,
                data: dataValues,
                fill: false,
                backgroundColor: 'rgba(75,192,192,0.2)',
                borderColor: 'rgba(75,192,192,1)',
              },
            ],
          });
        } catch (err) {
          console.error('Error parsing CSV:', err);
          setChartData(fallbackData);
          setError(`Error parsing ${fileConfig.label} CSV data. Using sample data instead.`);
        }
      })
      .catch(err => {
        console.error('Error loading data:', err);
        setChartData(fallbackData);
        setError(`Could not load ${fileConfig.label} CSV data. Using sample data instead.`);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Handle file selection change
  const handleFileChange = (e) => {
    const selectedValue = e.target.value;
    setSelectedFile(selectedValue);
    const fileConfig = availableFiles.find(file => file.value === selectedValue);
    if (fileConfig) {
      loadCSVData(fileConfig);
    }
  };

  // Load initial data
  useEffect(() => {
    const initialFileConfig = availableFiles.find(file => file.value === selectedFile);
    if (initialFileConfig) {
      loadCSVData(initialFileConfig);
    }
  }, []);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: title,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: yAxisLabel
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
        <h1>{title}</h1>
        
        <div className="file-selector">
          <label htmlFor="csv-selector">Select Data: </label>
          <select 
            id="csv-selector" 
            value={selectedFile} 
            onChange={handleFileChange}
            className="csv-dropdown"
          >
            {availableFiles.map(file => (
              <option key={file.value} value={file.value}>
                {file.label}
              </option>
            ))}
          </select>
        </div>
        
        {loading ? (
          <p>Loading chart data...</p>
        ) : (
          <>
            {error && <p className="error-message">{error}</p>}
            <div style={{ width: '80%', maxWidth: '800px' }}>
              <Line data={chartData} options={options} />
            </div>
            
            {selectedFile === 'digital-media' && (
              <div className="data-source" style={{ fontSize: '0.8rem', marginTop: '10px' }}>
                Data source: Statista - Daily time spent with digital media by US consumers
              </div>
            )}
          </>
        )}
      </header>
    </div>
  );
}

export default App;