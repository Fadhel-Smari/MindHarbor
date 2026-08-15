import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/axios';
import { IndicateurChargement } from '../components/IndicateurChargement';
import { AideUrgence } from '../components/AideUrgence';

export const Groupes: React.FC = () => {
  const [groupes, setGroupes] = useState<any[]>([]);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    const chargerGroupes = async () => {
      try {
        const res = await api.get('/groups');
        setGroupes(res.data.data || []);
      } catch (e) {
        console.error("Erreur de chargement des groupes", e);
      } finally {
        setChargement(false);
      }
    };
    chargerGroupes();
  }, []);

  if (chargement) return <IndicateurChargement message="Chargement des groupes..." />;

  return (
    <div className="page-conteneur">
      <h1>Groupes de soutien</h1>
      <p>Rejoignez un espace d'échange sécurisé avec des membres partageant le même vécu.</p>

      <div className="grille-cartes">
        {groupes.map(g => (
          <div key={g.id} className="carte carte-groupe">
            <span className="badge">{g.visibilite}</span>
            <h3>{g.nom}</h3>
            <h4>{g.thematique}</h4>
            <p>{g.description}</p>
            <Link to={`/groupes/${g.id}`} className="bouton-primaire">Consulter le groupe</Link>
          </div>
        ))}
      </div>

      <AideUrgence />
    </div>
  );
};