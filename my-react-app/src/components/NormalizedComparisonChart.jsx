import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import Papa from 'papaparse';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function NormalizedComparisonChart() {
  const [chartData, setChartData] = useState({
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

  // Function to normalize data to a 0-100 scale
  const normalizeData = (data, min, max) => {
    return data.map(value => ((value - min) / (max - min)) * 100);
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
        
        // Extract years and percentages
        const depressionData = filteredData.map(row => ({
          year: row['Year'],
          percent: parseFloat(row['Percent']) || 0
        }));
        
        // Find overlapping years
        const overlappingYears = depressionData
          .filter(item => digitalMediaData.years.includes(item.year))
          .map(item => item.year)
          .sort();
        
        if (overlappingYears.length === 0) {
          setError('No overlapping years between the two datasets.');
          setLoading(false);
          return;
        }
        
        // Extract values for overlapping years
        const depressionValues = overlappingYears.map(year => {
          const match = depressionData.find(item => item.year === year);
          return match ? match.percent : null;
        }).filter(val => val !== null);
        
        const mediaValues = overlappingYears.map(year => {
          const index = digitalMediaData.years.indexOf(year);
          return index !== -1 ? digitalMediaData.values[index] : null;
        }).filter(val => val !== null);
        
        // Calculate min and max for normalization
        const depressionMin = Math.min(...depressionValues);
        const depressionMax = Math.max(...depressionValues);
        const mediaMin = Math.min(...mediaValues);
        const mediaMax = Math.max(...mediaValues);
        
        // Normalize the data
        const normalizedDepression = normalizeData(depressionValues, depressionMin, depressionMax);
        const normalizedMedia = normalizeData(mediaValues, mediaMin, mediaMax);
        
        // Store original values for tooltips
        const originalValues = overlappingYears.map((year, index) => ({
          year,
          depression: depressionValues[index],
          media: mediaValues[index]
        }));
        
        // Set chart data
        setChartData({
          labels: overlappingYears,
          datasets: [
            {
              label: 'Depression (normalized)',
              data: normalizedDepression,
              backgroundColor: 'rgba(255, 99, 132, 0.7)',
              borderColor: 'rgba(255, 99, 132, 1)',
              borderWidth: 1,
            },
            {
              label: 'Digital Media Usage (normalized)',
              data: normalizedMedia,
              backgroundColor: 'rgba(54, 162, 235, 0.7)',
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 1,
            }
          ],
          originalValues // Store original values for tooltip display
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
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Normalized Comparison: Depression vs. Digital Media Usage',
        font: {
          size: 16
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            const datasetIndex = context.datasetIndex;
            const index = context.dataIndex;
            const originalValues = chartData.originalValues?.[index];
            
            if (label) {
              label += ': ';
            }
            
            if (context.parsed.y !== null) {
              // Add normalized value
              label += context.parsed.y.toFixed(1) + '% (normalized)';
              
              // Add original value if available
              if (originalValues) {
                if (datasetIndex === 0) {
                  label += ` - Original: ${originalValues.depression.toFixed(1)}%`;
                } else if (datasetIndex === 1) {
                  label += ` - Original: ${originalValues.media.toFixed(1)} hours/day`;
                }
              }
            }
            
            return label;
          },
          footer: function(tooltipItems) {
            return 'Values normalized to 0-100% scale for comparison';
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'Normalized Values (%)'
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

  if (loading) {
    return <div>Loading chart data...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div style={{ width: '800px', height: '500px', margin: '0 auto' }}>
      <Bar data={chartData} options={options} />
      <div style={{ fontSize: '0.8rem', textAlign: 'center', marginTop: '10px' }}>
        Note: Both datasets have been normalized to a 0-100% scale to allow direct comparison of trends regardless of 
        their different units and ranges. Red bars show depression rates, blue bars show digital media usage.
      </div>
    </div>
  );
}

export default NormalizedComparisonChart;