import { fireEvent, render, screen } from '@testing-library/react';
import ErrorBoundary from '../../components/ErrorBoundary';

const BrokenComponent = () => {
  throw new Error('Fallo forzado');
};

describe('ErrorBoundary', () => {
  it('muestra una interfaz de recuperación cuando un hijo falla', () => {
    const reloadMock = vi.fn();
    Object.defineProperty(window, 'location', {
      value: {
        ...window.location,
        reload: reloadMock,
      },
      writable: true,
    });

    const consoleErrorMock = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <BrokenComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText(/Algo salió mal/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Recargar página/i }));

    expect(reloadMock).toHaveBeenCalledTimes(1);
    consoleErrorMock.mockRestore();
  });
});
