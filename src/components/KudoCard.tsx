import { useState } from 'react';
import { api } from '../api/client';
import type { Kudo } from '../api/types';
import { formatFileSize, roleLabel, timeAgo } from '../utils/format';
import { Avatar } from './Avatar';

const PREVIEW_CHARS = 280;

interface Props {
  kudo: Kudo;
  highlighted?: boolean;
}

export function KudoCard({ kudo, highlighted = false }: Props) {
  const [expanded, setExpanded] = useState(false);
  const isLong = kudo.content.length > PREVIEW_CHARS;
  const text = expanded || !isLong ? kudo.content : `${kudo.content.slice(0, PREVIEW_CHARS)}…`;

  return (
    <article className={`card kudo ${highlighted ? 'kudo--highlighted' : ''}`} data-testid="kudo-card">
      <header className="kudo__header">
        <Avatar name={kudo.author.fullName} />
        <div className="kudo__people">
          <strong>{kudo.author.fullName}</strong>
          <span className="muted"> reconoció a </span>
          <strong>{kudo.recipient.fullName}</strong>
          <div className="muted small">
            {roleLabel(kudo.recipient.role)} · {timeAgo(kudo.publishedAt)}
          </div>
        </div>
      </header>
      <span className="chip">🏅 {kudo.category.name}</span>
      <p className="kudo__content">{text}</p>
      {isLong && (
        <button className="link" type="button" onClick={() => setExpanded(!expanded)}>
          {expanded ? 'Ver menos' : 'Ver más'}
        </button>
      )}
      {kudo.attachments.length > 0 && (
        <ul className="attachments">
          {kudo.attachments.map((attachment) => (
            <li key={attachment.id}>
              <button type="button" className="attachment"
                      onClick={() => api.downloadAttachment(attachment.downloadPath, attachment.fileName)}>
                📎 {attachment.fileName} <span className="muted small">({formatFileSize(attachment.sizeBytes)})</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
