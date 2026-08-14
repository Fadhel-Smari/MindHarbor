import React, { useState } from 'react';

export const AideUrgence: React.FC = () => {
  const [estOuvert, setEstOuvert] = useState(false);

  return (
    <div className="conteneur-flottant-urgence">
      {estOuvert && (
        <div className="boite-dialogue-urgence">
          <h4 className="titre-urgence">Lignes d'aide d'urgence 🆘</h4>
          <p className="description-urgence">
            Si vous traversez un moment difficile, des professionnels sont disponibles gratuitement 24/7 :
          </p>
          <ul className="liste-lignes-urgence">
            <li><strong>Ligne de crise (Canada) :</strong> 988</li>
            <li><strong>Info-Social :</strong> 811</li>
            <li><strong>Jeunesse, J'écoute :</strong> 1-800-668-6868</li>
          </ul>
          <button
            onClick={() => setEstOuvert(false)}
            className="bouton-fermer-urgence"
          >
            Fermer
          </button>
        </div>
      )}

      <button
        onClick={() => setEstOuvert(!estOuvert)}
        className="bouton-declencheur-urgence"
      >
        {estOuvert ? 'Masquer l\'aide' : 'Besoin d\'aide immédiate ?'}
      </button>
    </div>
  );
};