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

function CombinedChart() {
  const [depressionData, setDepressionData] = useState([]);
  const [combinedData, setCombinedData] = useState({
    labels: [],
    datasets: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Digital media data from your existing code
  const digitalMediaData = {
    years: ['2012', '2013', '2014', '2015', '2016', '2017', '2018', '2019', '2020'],
    values: [4.3, 4.9, 5.3, 5.9, 6.3, 6.5, 6.9, 7.3, 8.1]
  };

  useEffect(() => {
    // Load depression data
    fetch('/adult-depression-lghc-indicator-24.csv')
      .then(response => {
        if (!response.ok) {
          throw new Error('Depression CSV file not found');
        }
        return response.text();
      })
      .then(data => {
        const parsedData = Papa.parse(data, { header: true }).data;
        
        // Filter for Total strata
        const filteredData = parsedData.filter(row => row['Strata'] === 'Total');
        
        // Create an array of objects with year and percentage
        const processedData = filteredData.map(row => ({
          year: row['Year'],
          percent: parseFloat(row['Percent']) || 0
        }));
        
        setDepressionData(processedData);
        
        // Find overlapping years between datasets
        const depressionYears = processedData.map(item => item.year);
        const mediaYears = digitalMediaData.years;
        
        // Get all unique years, sorted chronologically
        const allYears = [...new Set([...depressionYears, ...mediaYears])].sort();
        
        // Create combined dataset
        setCombinedData({
          labels: allYears,
          datasets: [
            {
              label: 'Depression (%)',
              data: allYears.map(year => {
                const match = processedData.find(item => item.year === year);
                return match ? match.percent : null;
              }),
              fill: false,
              backgroundColor: 'rgba(255, 99, 132, 0.2)',
              borderColor: 'rgba(255, 99, 132, 1)',
              yAxisID: 'y',
            },
            {
              label: 'Digital Media Usage (hours/day)',
              data: allYears.map(year => {
                const index = digitalMediaData.years.indexOf(year);
                return index !== -1 ? digitalMediaData.values[index] : null;
              }),
              fill: false,
              backgroundColor: 'rgba(54, 162, 235, 0.2)',
              borderColor: 'rgba(54, 162, 235, 1)',
              yAxisID: 'y1',
            }
          ]
        });
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading data:', err);
        setError('Could not load depression data.');
        setLoading(false);
      });
  }, []);

  const options = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    stacked: false,
    plugins: {
      title: {
        display: true,
        text: 'Depression Rates vs. Digital Media Usage Over Time',
        font: {
          size: 16
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              if (context.datasetIndex === 0) {
                label += context.parsed.y + '%';
              } else {
                label += context.parsed.y + ' hours/day';
              }
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Depression Rate (%)'
        },
        min: 0,
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Digital Media Usage (hours/day)'
        },
        min: 0,
        // Grid lines for the second y-axis will be hidden to reduce clutter
        grid: {
          drawOnChartArea: false,
        },
      },
      x: {
        title: {
          display: true,
          text: 'Year'
        }
      }
    }
  };

  if (loading) {
    return <div>Loading chart data...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div style={{ width: '800px', height: '500px', margin: '0 auto' }}>
      <Line data={combinedData} options={options} />
      <div style={{ fontSize: '0.8rem', textAlign: 'center', marginTop: '10px' }}>
        Note: This chart uses dual Y-axes to compare two different metrics. The left Y-axis (red) shows depression percentage, 
        while the right Y-axis (blue) shows digital media consumption in hours per day.
      </div>
    </div>
  );
}

export default CombinedChart;