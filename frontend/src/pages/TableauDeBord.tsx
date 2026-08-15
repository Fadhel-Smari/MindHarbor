import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/axios';
import { IndicateurChargement } from '../components/IndicateurChargement';
import { AideUrgence } from '../components/AideUrgence';

type ResumeBord = {
  journalAujourdhuiFait: boolean;
  suggestionJour?: { id: string; titre: string; categorie: string; contenu: string };
};

export const TableauDeBord: React.FC = () => {
  const [donnees, setDonnees] = useState<ResumeBord>({ journalAujourdhuiFait: false });
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    const chargerTableauDeBord = async () => {
      try {
        const [resJournal, resSuggestion] = await Promise.allSettled([
          api.get('/journal?limit=10'),
          api.get('/me/suggestions')
        ]);

        let aFaitJournalAujourdhui = false;

        if (resJournal.status === 'fulfilled' && resJournal.value.data) {
          const reponseData = resJournal.value.data;
          const listeEntrees = Array.isArray(reponseData) 
            ? reponseData 
            : (Array.isArray(reponseData.data) ? reponseData.data : []);

          const aujourdhui = new Date().toISOString().split('T')[0];
          aFaitJournalAujourdhui = listeEntrees.some((e: any) => 
            e.date && e.date.startsWith(aujourdhui)
          );
        }

        let suggestion = undefined;
        if (resSuggestion.status === 'fulfilled' && resSuggestion.value.data) {
          suggestion = resSuggestion.value.data;
        }

        setDonnees({
          journalAujourdhuiFait: aFaitJournalAujourdhui,
          suggestionJour: suggestion
        });
      } catch (err) {
        console.error("Erreur lors de la récupération des données du tableau de bord", err);
      } finally {
        setChargement(false);
      }
    };

    chargerTableauDeBord();
  }, []);

  if (chargement) return <IndicateurChargement message="Préparation de votre tableau de bord..." />;

  return (
    <div className="page-conteneur">
      <h1>Tableau de bord personnel</h1>
      
      <div className="tableau-bord-grille">
        
        <div className="carte carte-statut-journal">
          <h3>Saisie du journal</h3>
          {donnees.journalAujourdhuiFait ? (
            <p className="texte-succes">✨ Vous avez déjà complété votre journal aujourd'hui. Bravo !</p>
          ) : (
            <div>
              <p>Prenez un instant pour vous : comment vous sentez-vous aujourd'hui ?</p>
              <Link to="/journal" className="bouton-primaire">Remplir mon journal du jour</Link>
            </div>
          )}
        </div>

        {donnees.suggestionJour && (
          <div className="carte carte-suggestion">
            <h3>💡 Suggestion personnalisée</h3>
            <span className="badge">{donnees.suggestionJour.categorie}</span>
            <h4>{donnees.suggestionJour.titre}</h4>
            <p>{donnees.suggestionJour.contenu}</p>
            <Link to="/ressources" className="lien-accent">Consulter la ressource →</Link>
          </div>
        )}

        <div className="carte carte-resume">
          <h3>Raccourcis rapide</h3>
          <ul className="liste-liens-rapides">
            <li><Link to="/journal">📝 Mon journal de bord</Link></li>
            <li><Link to="/tendances">📈 Voir mes statistiques et tendances</Link></li>
            <li><Link to="/groupes">👥 Groupes d'entraide et de soutien</Link></li>
            <li><Link to="/messagerie">💬 Mes discussions privées</Link></li>
          </ul>
        </div>

      </div>

      <AideUrgence />
    </div>
  );
};