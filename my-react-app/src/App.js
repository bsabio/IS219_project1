import React, { useEffect, useState } from 'react';
import './App.css';
import CombinedLineChart from './components/CombinedLineChart';
import NormalizedComparisonChart from './components/NormalizedComparisonChart';

function App() {
  const [selectedFile, setSelectedFile] = useState('combined-chart');
  const [title, setTitle] = useState('Depression Rates vs. Digital Media Usage Over Time');
  const [loading, setLoading] = useState(false);

  // Available chart options - removed individual charts
  const availableFiles = [
    {
      value: 'combined-chart',
      label: 'Combined Line Chart',
      title: 'Depression Rates vs. Digital Media Usage Over Time',
      isCustomComponent: true
    },
    {
      value: 'normalized-chart',
      label: 'Normalized Comparison Chart',
      title: 'Normalized Comparison: Depression vs. Digital Media Usage',
      isCustomComponent: true
    }
  ];

  // Handle file selection change
  const handleFileChange = (e) => {
    const selectedValue = e.target.value;
    setSelectedFile(selectedValue);
    const fileConfig = availableFiles.find(file => file.value === selectedValue);
    if (fileConfig) {
      setTitle(fileConfig.title);
    }
  };

  // Initialize with the first option
  useEffect(() => {
    const initialFileConfig = availableFiles.find(file => file.value === selectedFile);
    if (initialFileConfig) {
      setTitle(initialFileConfig.title);
    }
  }, []);

  // Render the appropriate chart component
  const renderChart = () => {
    if (loading) {
      return <p>Loading chart data...</p>;
    }

    if (selectedFile === 'combined-chart') {
      return <CombinedLineChart />;
    }

    if (selectedFile === 'normalized-chart') {
      return <NormalizedComparisonChart />;
    }

    // This shouldn't happen with our current options, but just in case
    return <p>Please select a chart to display</p>;
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>{title}</h1>
        
        <div className="file-selector">
          <label htmlFor="csv-selector">Select Chart: </label>
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
        
        {renderChart()}
      </header>
    </div>
  );
}

export default App;