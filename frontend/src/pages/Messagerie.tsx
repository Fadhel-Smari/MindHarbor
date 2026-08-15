import React, { useEffect, useState } from 'react';
import { api } from '../api/axios';
import { IndicateurChargement } from '../components/IndicateurChargement';
import { AideUrgence } from '../components/AideUrgence';

export const Messagerie: React.FC = () => {
  const [conversations, setConversations] = useState<any[]>([]);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    const chargerMessagerie = async () => {
      try {
        const res = await api.get('/messages');
        setConversations(res.data.data || []);
      } catch (e) {
        console.error("Erreur de chargement des conversations", e);
      } finally {
        setChargement(false);
      }
    };
    chargerMessagerie();
  }, []);

  if (chargement) return <IndicateurChargement message="Ouverture de vos discussions..." />;

  return (
    <div className="page-conteneur">
      <h1>Messagerie privée</h1>
      
      {conversations.length === 0 ? (
        <p className="etat-vide">Vous n'avez aucune conversation en cours.</p>
      ) : (
        <div className="liste-conversations carte">
          {conversations.map((conv, idx) => (
            <div key={idx} className="element-conversation">
              <strong>{conv.correspondant?.surnom || 'Utilisateur'}</strong>
              <p>{conv.dernierMessage}</p>
            </div>
          ))}
        </div>
      )}

      <AideUrgence />
    </div>
  );
};