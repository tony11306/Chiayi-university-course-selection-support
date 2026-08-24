import { render, screen } from '@testing-library/react';
import App from './App';

test('renders app without crashing', () => {
  render(<App />);
  expect(screen.getByText(/嘉義大學/i)).toBeInTheDocument();
});
