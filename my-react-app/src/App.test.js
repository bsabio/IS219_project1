import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Adult Depression Percentage Over Years heading', () => {
  render(<App />);
  const headingElement = screen.getByText(/Adult Depression Percentage Over Years/i);
  expect(headingElement).toBeInTheDocument();
});

test('renders loading state initially', () => {
  render(<App />);
  const loadingElement = screen.getByText(/Loading.../i);
  expect(loadingElement).toBeInTheDocument();
});