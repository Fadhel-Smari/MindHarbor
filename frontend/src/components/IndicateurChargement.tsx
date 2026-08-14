import React from 'react';

type PropsIndicateurChargement = {
  message?: string;
  taille?: 'petite' | 'moyenne' | 'grande';
};

export const IndicateurChargement: React.FC<PropsIndicateurChargement> = ({
  message = "Chargement en cours...",
  taille = 'moyenne'
}) => {
  return (
    <div className="indicateur-chargement">
      <div className={`spinner spinner-${taille}`} />
      {message && <p className={`texte-chargement-${taille}`}>{message}</p>}
    </div>
  );
};