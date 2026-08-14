import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/axios';
import { IndicateurChargement } from '../components/IndicateurChargement';
import { AideUrgence } from '../components/AideUrgence';

type GroupeApercu = { id: string; nom: string; thematique: string; description: string };
type RessourceApercu = { id: string; titre: string; categorie: string; type: string };

export const Accueil: React.FC = () => {
  const [groupes, setGroupes] = useState<GroupeApercu[]>([]);
  const [ressources, setRessources] = useState<RessourceApercu[]>([]);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    const chargerAccueil = async () => {
      try {
        const [resGroupes, resRessources] = await Promise.all([
          api.get('/groups?limit=3'),
          api.get('/resources?limit=3')
        ]);
        setGroupes(resGroupes.data.data || []);
        setRessources(resRessources.data.data || []);
      } catch (e) {
        console.error("Erreur de chargement de la page d'accueil", e);
      } finally {
        setChargement(false);
      }
    };
    chargerAccueil();
  }, []);

  if (chargement) return <IndicateurChargement message="Bienvenue sur MindHarbor..." />;

  return (
    <div className="page-conteneur">
      <header className="hero-section">
        <h1>Un espace bienveillant pour votre santé mentale</h1>
        <p>Un havre de paix pour suivre vos émotions, accéder à des ressources et échanger sans jugement.</p>
        <div className="hero-actions">
          <Link to="/inscription" className="bouton-primaire">Commencer dès maintenant</Link>
          <Link to="/connexion" className="bouton-secondaire">Se connecter</Link>
        </div>
      </header>

      <section className="section-accueil">
        <h2>Groupes de soutien publics</h2>
        <div className="grille-cartes">
          {groupes.map(g => (
            <div key={g.id} className="carte">
              <h3>{g.nom}</h3>
              <span className="badge">{g.thematique}</span>
              <p>{g.description}</p>
            </div>
          ))}
        </div>
        <Link to="/groupes" className="lien-voir-plus">Explorer tous les groupes →</Link>
      </section>

      <section className="section-accueil">
        <h2>Ressources et exercices</h2>
        <div className="grille-cartes">
          {ressources.map(r => (
            <div key={r.id} className="carte">
              <h3>{r.titre}</h3>
              <p>Type: {r.type} | Catégorie: {r.categorie}</p>
            </div>
          ))}
        </div>
        <Link to="/ressources" className="lien-voir-plus">Voir toutes les ressources →</Link>
      </section>

      <AideUrgence />
    </div>
  );
};