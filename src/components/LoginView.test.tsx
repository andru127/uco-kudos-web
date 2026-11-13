import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { api, ApiError } from '../api/client';
import { LoginView } from './LoginView';

describe('LoginView', () => {
  afterEach(() => vi.restoreAllMocks());

  it('entrega la sesión cuando las credenciales son válidas', async () => {
    const response = {
      accessToken: 'jwt', tokenType: 'Bearer', expiresIn: 3600,
      user: { id: 'u1', fullName: 'Docente Demo', email: 'docente@uco.edu.co', phone: '+573000000006', role: 'DOCENTE' as const },
    };
    vi.spyOn(api, 'login').mockResolvedValue(response);
    const onLoggedIn = vi.fn();
    render(<LoginView onLoggedIn={onLoggedIn} />);

    await userEvent.type(screen.getByLabelText('Correo institucional'), 'docente@uco.edu.co');
    await userEvent.type(screen.getByLabelText('Contraseña'), 'secreta');
    await userEvent.click(screen.getByRole('button', { name: 'Ingresar' }));

    expect(onLoggedIn).toHaveBeenCalledWith(response);
  });

  it('muestra el error del servidor si falla', async () => {
    vi.spyOn(api, 'login').mockRejectedValue(new ApiError(401, 'Credenciales inválidas'));
    render(<LoginView onLoggedIn={vi.fn()} />);

    await userEvent.type(screen.getByLabelText('Correo institucional'), 'x@uco.edu.co');
    await userEvent.type(screen.getByLabelText('Contraseña'), 'mala');
    await userEvent.click(screen.getByRole('button', { name: 'Ingresar' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Credenciales inválidas');
  });
});
