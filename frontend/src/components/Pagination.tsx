import React from 'react';
import type { Meta } from '../types';

type PropsPagination = {
  meta: Meta;
  surChangementPage: (page: number) => void;
};

export const Pagination: React.FC<PropsPagination> = ({ meta, surChangementPage }) => {
  const { page, totalPages } = meta;

  if (totalPages <= 1) return null;

  return (
    <div className="conteneur-pagination">
      <button
        disabled={page <= 1}
        onClick={() => surChangementPage(page - 1)}
        className="bouton-pagination"
      >
        Précédent
      </button>

      <span className="texte-pagination">
        Page <strong>{page}</strong> sur <strong>{totalPages}</strong>
      </span>

      <button
        disabled={page >= totalPages}
        onClick={() => surChangementPage(page + 1)}
        className="bouton-pagination"
      >
        Suivant
      </button>
    </div>
  );
};