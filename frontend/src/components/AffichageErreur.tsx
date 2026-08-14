import React from 'react';

type PropsAffichageErreur = {
  titre?: string;
  message?: string;
  texteBouton?: string;
  surReessayer?: () => void;
};

export const AffichageErreur: React.FC<PropsAffichageErreur> = ({
  titre = "Une erreur est survenue",
  message = "Une erreur inattendue s'est produite. Veuillez réessayez.",
  texteBouton = "Réessayer",
  surReessayer
}) => {
  return (
    <div className="conteneur-erreur">
      <h4 className="titre-erreur">{titre}</h4>
      <p className="message-erreur">{message}</p>
      {surReessayer && (
        <button onClick={surReessayer} className="bouton-reessayer">
          {texteBouton}
        </button>
      )}
    </div>
  );
};