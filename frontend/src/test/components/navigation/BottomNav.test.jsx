import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import BottomNav from '../../../components/navigation/BottomNav';

describe('BottomNav', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    Object.defineProperty(window, 'scrollY', {
      value: 0,
      writable: true,
      configurable: true,
    });
    window.requestAnimationFrame = vi.fn((callback) => {
      callback();
      return 1;
    });
    window.cancelAnimationFrame = vi.fn();
  });

  it('muestra la navegación móvil y resalta la ruta activa', () => {
    render(
      <MemoryRouter initialEntries={['/categories']}>
        <BottomNav />
      </MemoryRouter>
    );

    expect(screen.getByRole('link', { name: /Categorías/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Categorías/i }).getAttribute('href')).toBe('/categories');
  });

  it('oculta la barra al bajar y la vuelve a mostrar al subir', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/categories']}>
        <BottomNav />
      </MemoryRouter>
    );

    const nav = container.querySelector('nav');
    expect(nav).toHaveClass('translate-y-0');

    Object.defineProperty(window, 'scrollY', {
      value: 80,
      writable: true,
      configurable: true,
    });
    fireEvent.scroll(window);
    expect(nav).toHaveClass('translate-y-full');

    Object.defineProperty(window, 'scrollY', {
      value: 20,
      writable: true,
      configurable: true,
    });
    fireEvent.scroll(window);
    expect(nav).toHaveClass('translate-y-0');
  });

  it('vuelve a mostrarse cuando el usuario sube sin llegar al tope', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/categories']}>
        <BottomNav />
      </MemoryRouter>
    );

    const nav = container.querySelector('nav');

    Object.defineProperty(window, 'scrollY', {
      value: 90,
      writable: true,
      configurable: true,
    });
    fireEvent.scroll(window);
    expect(nav).toHaveClass('translate-y-full');

    Object.defineProperty(window, 'scrollY', {
      value: 70,
      writable: true,
      configurable: true,
    });
    fireEvent.scroll(window);
    expect(nav).toHaveClass('translate-y-0');
  });

  it('permanece oculta dentro del detalle de protocolo', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/protocol/medicion-del-peso/objective']}>
        <BottomNav />
      </MemoryRouter>
    );

    expect(container.querySelector('nav')).toHaveClass('translate-y-full');
  });
});
