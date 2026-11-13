import { formatFileSize, initials, roleLabel, timeAgo, validateFiles } from './format';

function fakeFile(name: string, type: string, size: number): File {
  const file = new File(['x'], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
}

describe('format', () => {
  it('muestra tamaños legibles', () => {
    expect(formatFileSize(500)).toBe('500 B');
    expect(formatFileSize(2048)).toBe('2.0 KB');
    expect(formatFileSize(3 * 1024 * 1024)).toBe('3.0 MB');
  });

  it('calcula tiempo relativo', () => {
    const now = new Date('2026-11-12T15:00:00Z');
    expect(timeAgo('2026-11-12T14:59:30Z', now)).toBe('hace un momento');
    expect(timeAgo('2026-11-12T14:30:00Z', now)).toBe('hace 30 min');
    expect(timeAgo('2026-11-12T10:00:00Z', now)).toBe('hace 5 h');
  });

  it('obtiene iniciales y etiquetas de rol', () => {
    expect(initials('Ana María Gómez')).toBe('AM');
    expect(roleLabel('COORDINADOR_ACADEMICO')).toBe('Coord. Académico');
  });
});

describe('validateFiles', () => {
  it('acepta adjuntos válidos', () => {
    expect(validateFiles([fakeFile('a.png', 'image/png', 1000)])).toBeNull();
  });

  it('rechaza archivos de más de 5 MB', () => {
    expect(validateFiles([fakeFile('grande.pdf', 'application/pdf', 6 * 1024 * 1024)])).toContain('5 MB');
  });

  it('rechaza tipos no permitidos', () => {
    expect(validateFiles([fakeFile('script.exe', 'application/x-msdownload', 10)])).toContain('no es PNG');
  });

  it('rechaza más de cinco adjuntos', () => {
    const six = Array.from({ length: 6 }, (_, i) => fakeFile(`${i}.png`, 'image/png', 10));
    expect(validateFiles(six)).toBe('Máximo 5 adjuntos');
  });
});
