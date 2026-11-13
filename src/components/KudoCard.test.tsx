import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Kudo } from '../api/types';
import { KudoCard } from './KudoCard';

function kudo(overrides: Partial<Kudo> = {}): Kudo {
  return {
    id: 'k1',
    author: { id: 'u1', fullName: 'Docente Demo', role: 'DOCENTE' },
    recipient: { id: 'u2', fullName: 'Estudiante Demo', role: 'ESTUDIANTE' },
    category: { id: 'c1', name: 'Liderazgo' },
    content: 'Gracias por liderar el semillero',
    publishedAt: new Date().toISOString(),
    attachments: [],
    ...overrides,
  };
}

describe('KudoCard', () => {
  it('muestra autor, destinatario, categoría y mensaje', () => {
    render(<KudoCard kudo={kudo()} />);

    expect(screen.getByText('Docente Demo')).toBeInTheDocument();
    expect(screen.getByText('Estudiante Demo')).toBeInTheDocument();
    expect(screen.getByText(/Liderazgo/)).toBeInTheDocument();
    expect(screen.getByText('Gracias por liderar el semillero')).toBeInTheDocument();
  });

  it('recorta mensajes largos y permite expandirlos', async () => {
    const largo = 'x'.repeat(400);
    render(<KudoCard kudo={kudo({ content: largo })} />);

    expect(screen.queryByText(largo)).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Ver más' }));
    expect(screen.getByText(largo)).toBeInTheDocument();
  });

  it('lista los adjuntos con su tamaño', () => {
    render(<KudoCard kudo={kudo({
      attachments: [{ id: 'a1', fileName: 'certificado.pdf', contentType: 'application/pdf', sizeBytes: 2048,
        sha256: 'abc', downloadPath: '/api/v1/kudos/k1/attachments/a1' }],
    })} />);

    expect(screen.getByRole('button', { name: /certificado\.pdf/ })).toBeInTheDocument();
    expect(screen.getByText('(2.0 KB)')).toBeInTheDocument();
  });
});
