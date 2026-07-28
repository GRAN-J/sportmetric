// =============================================================================
// Tests del AdminLayout
// =============================================================================
// Verifica que el layout de admin muestra el sidebar, el menu de navegacion
// y permite hacer logout.
// =============================================================================

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

vi.mock('../../services/authService', () => ({
  logout: vi.fn().mockResolvedValue(),
}));

vi.mock('../../pages/admin/AdminDashboard', () => ({
  default: () => <div data-testid="dashboard">Dashboard Mock</div>,
}));

import { logout } from '../../services/authService';
import AdminLayout from '../../layout/AdminLayout';

const renderAdmin = (path = '/admin') =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<div data-testid="dashboard">Dashboard Mock</div>} />
        </Route>
        <Route path="/login" element={<div data-testid="login">Login Mock</div>} />
      </Routes>
    </MemoryRouter>
  );

describe('AdminLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza el titulo del sidebar y los items del menu', () => {
    renderAdmin();

    expect(screen.getByText('Admin Panel')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Usuarios')).toBeInTheDocument();
    expect(screen.getByText('Categorías')).toBeInTheDocument();
    expect(screen.getByText('Protocolos')).toBeInTheDocument();
    expect(screen.getByText('Registros')).toBeInTheDocument();
    expect(screen.getByText('Estadísticas')).toBeInTheDocument();
    expect(screen.getByText('Configuración')).toBeInTheDocument();
  });

  it('renderiza el contenido del Outlet del dashboard', () => {
    renderAdmin();

    expect(screen.getByTestId('dashboard')).toBeInTheDocument();
  });

  it('llama al servicio de logout y navega a /login', async () => {
    logout.mockResolvedValue();

    renderAdmin();

    fireEvent.click(screen.getByText('Cerrar Sesión'));

    expect(logout).toHaveBeenCalled();
    await waitFor(() => {
      expect(screen.getByTestId('login')).toBeInTheDocument();
    });
  });

  it('permite colapsar y expandir el sidebar', () => {
    renderAdmin();

    // El primer boton del sidebar es el toggle (X/Menu)
    const buttons = screen.getAllByRole('button');
    const toggle = buttons[0];

    expect(screen.getByText('Admin Panel')).toBeInTheDocument();

    fireEvent.click(toggle);

    // Tras colapsar, el titulo "Admin Panel" deberia desaparecer
    expect(screen.queryByText('Admin Panel')).not.toBeInTheDocument();

    fireEvent.click(toggle);

    expect(screen.getByText('Admin Panel')).toBeInTheDocument();
  });
});
