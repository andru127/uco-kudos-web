import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { api } from '../api/client';
import type { User } from '../api/types';
import { PublishKudoView } from './PublishKudoView';

const me: User = { id: 'u1', fullName: 'Docente Demo', email: 'd@uco.edu.co', phone: '+573000000006', role: 'DOCENTE' };

describe('PublishKudoView', () => {
  beforeEach(() => {
    vi.spyOn(api, 'users').mockResolvedValue([
      { id: 'u1', fullName: 'Docente Demo', role: 'DOCENTE' },
      { id: 'u2', fullName: 'Estudiante Demo', role: 'ESTUDIANTE' },
    ]);
    vi.spyOn(api, 'categories').mockResolvedValue([{ id: 'c1', name: 'Liderazgo' }]);
  });

  afterEach(() => vi.restoreAllMocks());

  it('no permite elegirse a uno mismo como destinatario', async () => {
    render(<PublishKudoView currentUser={me} onPublished={vi.fn()} />);

    await screen.findByRole('option', { name: /Estudiante Demo/ });
    expect(screen.queryByRole('option', { name: /Docente Demo/ })).not.toBeInTheDocument();
  });

  it('envía el Kudo con los datos del formulario', async () => {
    const published = vi.spyOn(api, 'publishKudo').mockResolvedValue({
      id: 'k1', author: { id: 'u1', fullName: 'Docente Demo', role: 'DOCENTE' },
      recipient: { id: 'u2', fullName: 'Estudiante Demo', role: 'ESTUDIANTE' },
      category: { id: 'c1', name: 'Liderazgo' }, content: '¡Bien!', publishedAt: '2026-11-12T15:00:00Z', attachments: [],
    });
    const onPublished = vi.fn();
    render(<PublishKudoView currentUser={me} onPublished={onPublished} />);

    await screen.findByRole('option', { name: /Estudiante Demo/ });
    await userEvent.selectOptions(screen.getByLabelText(/A quién/), 'u2');
    await userEvent.selectOptions(screen.getByLabelText('Categoría'), 'c1');
    await userEvent.type(screen.getByLabelText('Mensaje'), '¡Bien!');
    await userEvent.click(screen.getByRole('button', { name: 'Publicar Kudo' }));

    await waitFor(() => expect(onPublished).toHaveBeenCalled());
    expect(published).toHaveBeenCalledWith('u2', 'c1', '¡Bien!', []);
  });
});
