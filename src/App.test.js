import { render } from '@testing-library/react';
import App from './App';

test('renders BitMart app without crashing', () => {
  render(<App />);
});
