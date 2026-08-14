import React from 'react';

type PropsChampFormulaire = {
  etiquette: string;
  nom: string;
  type?: string;
  valeur: string | number;
  surChangement: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  erreur?: string;
  texteAide?: string;
  obligatoire?: boolean;
  estZoneTexte?: boolean;
  placeholder?: string;
  min?: number;
  max?: number;
};

export const ChampFormulaire: React.FC<PropsChampFormulaire> = ({
  etiquette,
  nom,
  type = 'text',
  valeur,
  surChangement,
  erreur,
  texteAide,
  obligatoire = false,
  estZoneTexte = false,
  placeholder,
  min,
  max
}) => {
  const classeEntree = `champ-saisie ${erreur ? 'champ-saisie-erreur' : ''}`;

  return (
    <div className="groupe-champ">
      <label htmlFor={nom} className="etiquette-champ">
        {etiquette} {obligatoire && <span className="asterisque-obligatoire">*</span>}
      </label>

      {estZoneTexte ? (
        <textarea
          id={nom}
          name={nom}
          value={valeur}
          onChange={surChangement}
          placeholder={placeholder}
          rows={4}
          className={classeEntree}
        />
      ) : (
        <input
          id={nom}
          name={nom}
          type={type}
          value={valeur}
          onChange={surChangement}
          placeholder={placeholder}
          min={min}
          max={max}
          className={classeEntree}
        />
      )}

      {texteAide && !erreur && (
        <small className="texte-aide">{texteAide}</small>
      )}

      {erreur && (
        <small className="texte-erreur-validation">{erreur}</small>
      )}
    </div>
  );
};