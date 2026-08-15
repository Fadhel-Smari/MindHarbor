import React, { useState, useEffect } from 'react';
import { getJournal, getJournalParDate, createEntreeJournal, updateEntreeJournal } from '../api/journal';
import type { JournalEntry, TypeActivitee } from '../types';
import { IndicateurChargement } from '../components/IndicateurChargement';
import { AideUrgence } from '../components/AideUrgence';

// Tableau vide en attendant que l'administrateur configure les activités via l'API
const CATALOGUE_ACTIVITES: { id: string; type: TypeActivitee; nom: string }[] = [
  { id: '1', type: 'EXERCICE', nom: 'Exercice autre' },
  { id: '4', type: 'MEDITATION', nom: 'Meditation autre' },
  { id: '7', type: 'SOCIAL', nom: 'Social autre' },
  { id: '8', type: 'TRAVAIL', nom: 'Travail autre' },
  { id: '11', type: 'LOISIRS', nom: 'Loisirs autre' },
];

const dateAujourdhui = (): string => {
  const d = new Date();
  const annee = d.getUTCFullYear();
  const mois = String(d.getUTCMonth() + 1).padStart(2, '0');
  const jour = String(d.getUTCDate()).padStart(2, '0');
  return `${annee}-${mois}-${jour}`;
};

export const Journal: React.FC = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [chargement, setChargement] = useState<boolean>(true);
  const [erreur, setErreur] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  const [entreeDuJour, setEntreeDuJour] = useState<JournalEntry | null>(null);

  // Formulaire état (1-5)
  const [humeur, setHumeur] = useState<number>(3);
  const [energie, setEnergie] = useState<number>(3);
  const [sommeil, setSommeil] = useState<number>(3);
  const [anxiete, setAnxiete] = useState<number>(3);
  const [evenements, setEvenements] = useState<string>('');
  const [gratitude, setGratitude] = useState<string>('');

  // Formulaire activités
  const [activitesSelectionnees, setActivitesSelectionnees] = useState<{ type: TypeActivitee; nom: string }[]>([]);
  const [categorieSelectionnee, setCategorieSelectionnee] = useState<TypeActivitee>('EXERCICE');
  const [activiteIdSelectionnee, setActiviteIdSelectionnee] = useState<string>('');

  const [envoi, setEnvoi] = useState<boolean>(false);


  const activitesDisponibles = CATALOGUE_ACTIVITES.filter(a => a.type === categorieSelectionnee);

  useEffect(() => {
    if (activitesDisponibles.length > 0) {
      setActiviteIdSelectionnee(activitesDisponibles[0].id);
    } else {
      setActiviteIdSelectionnee('');
    }
  }, [categorieSelectionnee]);

  const ajouterActivite = () => {
    const activiteTrouvee = CATALOGUE_ACTIVITES.find((a) => a.id === activiteIdSelectionnee);

    if (activiteTrouvee && !activitesSelectionnees.some((a) => a.nom === activiteTrouvee.nom)) {
      setActivitesSelectionnees([
        ...activitesSelectionnees,
        { type: activiteTrouvee.type, nom: activiteTrouvee.nom }
      ]);
    }
  };

  const supprimerActivite = (indexASupprimer: number) => {
    setActivitesSelectionnees(activitesSelectionnees.filter((_, index) => index !== indexASupprimer));
  };

  const chargerJournal = async (pageCible: number) => {
    setChargement(true);
    setErreur(null);
    try {
      const reponse = await getJournal(pageCible);
      setEntries(reponse.data || []);
      setTotalPages(reponse.meta?.totalPages || 1);
    } catch {
      setErreur("Impossible de charger les entrées du journal.");
    } finally {
      setChargement(false);
    }
  };

  const chargerEntreeDuJour = async () => {
    try {
      const entree = await getJournalParDate(dateAujourdhui());
      setEntreeDuJour(entree);
      setHumeur(entree.humeur);
      setEnergie(entree.energie);
      setSommeil(entree.sommeil);
      setAnxiete(entree.anxiete);
      setEvenements(entree.evenements || '');
      setGratitude(entree.gratitude || '');
    } catch {
      setEntreeDuJour(null);
    }
  };

  useEffect(() => {
    chargerJournal(page);
  }, [page]);

  useEffect(() => {
    chargerEntreeDuJour();
  }, []);

  const soumettreFormulaire = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnvoi(true);
    setErreur(null);

    try {
      const donneesEntree = {
        date: dateAujourdhui(),
        humeur,
        energie,
        sommeil,
        anxiete,
        evenements: evenements.trim(),
        gratitude: gratitude.trim(),
        activitees: activitesSelectionnees,
      };

      if (entreeDuJour) {
        await updateEntreeJournal(dateAujourdhui(), donneesEntree as any);
      } else {
        await createEntreeJournal(donneesEntree as any);
      }

      setActivitesSelectionnees([]);
      await chargerEntreeDuJour();

      if (page === 1) {
        chargerJournal(1);
      } else {
        setPage(1);
      }
    } catch {
      setErreur("Erreur lors de la sauvegarde de l'entrée.");
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <div className="page-conteneur">
      <section className="section-accueil">
        <h2>Nouvelle entrée du journal</h2>
        <div className="carte">
          {entreeDuJour && (
            <div className="journal-avis-edition">
              Mise a jour du journal !
            </div>
          )}
          <form onSubmit={soumettreFormulaire}>
            {/* Métriques de 1 à 5 */}
            <div className="journal-grille-metriques">
              <div className="groupe-champ">
                <label className="etiquette-champ">Humeur (1-5)</label>
                <input type="number" min="1" max="5" className="champ-saisie" value={humeur} onChange={(e) => setHumeur(Number(e.target.value))} required />
              </div>
              <div className="groupe-champ">
                <label className="etiquette-champ">Énergie (1-5)</label>
                <input type="number" min="1" max="5" className="champ-saisie" value={energie} onChange={(e) => setEnergie(Number(e.target.value))} required />
              </div>
              <div className="groupe-champ">
                <label className="etiquette-champ">Sommeil (1-5)</label>
                <input type="number" min="1" max="5" className="champ-saisie" value={sommeil} onChange={(e) => setSommeil(Number(e.target.value))} required />
              </div>
              <div className="groupe-champ">
                <label className="etiquette-champ">Anxiété (1-5)</label>
                <input type="number" min="1" max="5" className="champ-saisie" value={anxiete} onChange={(e) => setAnxiete(Number(e.target.value))} required />
              </div>
            </div>

            {/* Sélection d'activités */}
            <div className="groupe-champ journal-section-activites">
              <label className="etiquette-champ">Ajouter une activité</label>

              <div className="journal-selection-controles">
                {/* 1er Dropdown : Catégorie */}
                <div className="journal-champ-mini">
                  <span className="journal-champ-mini-etiquette">Catégorie</span>
                  <select
                    className="champ-saisie"
                    value={categorieSelectionnee}
                    onChange={(e) => setCategorieSelectionnee(e.target.value as TypeActivitee)}
                  >
                    <option value="EXERCICE">Exercice</option>
                    <option value="MEDITATION">Méditation</option>
                    <option value="SOCIAL">Social</option>
                    <option value="TRAVAIL">Travail</option>
                    <option value="LOISIRS">Loisirs</option>
                  </select>
                </div>

                {/* 2ème Dropdown : Activité */}
                <div className="journal-champ-mini journal-champ-mini--activite">
                  <span className="journal-champ-mini-etiquette">Activité</span>
                  <select
                    className="champ-saisie"
                    value={activiteIdSelectionnee}
                    onChange={(e) => setActiviteIdSelectionnee(e.target.value)}
                    disabled={activitesDisponibles.length === 0}
                  >
                    {activitesDisponibles.length === 0 ? (
                      <option value="">Aucune activité disponible</option>
                    ) : (
                      activitesDisponibles.map((act) => (
                        <option key={act.id} value={act.id}>
                          {act.nom}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={ajouterActivite}
                  className="bouton-secondaire journal-bouton-ajouter"
                  disabled={activitesDisponibles.length === 0}
                >
                  Ajouter
                </button>
              </div>

              {/* Badges des activités sélectionnées */}
              {activitesSelectionnees.length > 0 && (
                <div className="journal-badges-liste">
                  {activitesSelectionnees.map((act, index) => (
                    <span key={index} className="journal-badge-activite">
                      <small className="journal-badge-activite-type">{act.type}</small> | {act.nom}
                      <button
                        type="button"
                        onClick={() => supprimerActivite(index)}
                        className="journal-badge-supprimer"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Champs textes */}
            <div className="groupe-champ">
              <label className="etiquette-champ">Événements de la journée</label>
              <textarea className="champ-saisie" rows={3} value={evenements} onChange={(e) => setEvenements(e.target.value)} />
            </div>

            <div className="groupe-champ">
              <label className="etiquette-champ">Gratitude</label>
              <textarea className="champ-saisie" rows={2} value={gratitude} onChange={(e) => setGratitude(e.target.value)} />
            </div>

            <button type="submit" className="bouton-primaire" disabled={envoi} style={{ marginTop: '0.5rem' }}>
              {envoi ? 'Enregistrement...' : entreeDuJour ? 'Mettre à jour mon entrée' : 'Enregistrer dans mon journal'}
            </button>
          </form>
        </div>
      </section>

      {/* Affichage d'erreur */}
      {erreur && (
        <div className="conteneur-erreur">
          <h4 className="titre-erreur">Erreur</h4>
          <p className="message-erreur">{erreur}</p>
          <button onClick={() => chargerJournal(page)} className="bouton-reessayer">Réessayer</button>
        </div>
      )}

      {/* Affichage de la liste */}
      <section className="section-accueil">
        <h2>Mes entrées précédentes</h2>
        {chargement ? (
          <IndicateurChargement message="Chargement de votre journal..." />
        ) : entries.length === 0 ? (
          <p style={{ color: '#64748b' }}>Vous n'avez pas encore rédigé d'entrée.</p>
        ) : (
          <div className="grille-cartes">
            {entries.map((entry) => (
              <div key={entry.id} className="carte">
                <div className="journal-entree-en-tete">
                  <span className="badge">Date: {new Date(entry.date).toLocaleDateString('fr-FR')}</span>
                </div>

                <div className="journal-entree-stats">
                  <span className="journal-stat journal-stat--humeur">Humeur: {entry.humeur}/5</span>
                  <span className="journal-stat journal-stat--energie">Énergie: {entry.energie}/5</span>
                  <span className="journal-stat journal-stat--sommeil">Sommeil: {entry.sommeil}/5</span>
                  <span className="journal-stat journal-stat--anxiete">Anxiété: {entry.anxiete}/5</span>
                </div>

                {/* Affichage des activités de l'entrée */}
                {entry.activitees && entry.activitees.length > 0 && (
                  <div className="journal-entree-activites">
                    {entry.activitees.map((act) => (
                      <span key={act.id || act.nom} className="journal-tag-activite">
                        <small className="journal-tag-activite-type">[{act.type}]</small>
                        {act.nom}
                      </span>
                    ))}
                  </div>
                )}

                {entry.evenements && <p className="journal-entree-texte"><strong>Événements:</strong> {entry.evenements}</p>}
                {entry.gratitude && <p className="journal-entree-texte"><strong>Gratitude:</strong> {entry.gratitude}</p>}
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="conteneur-pagination">
            <button className="bouton-pagination" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>← Précédent</button>
            <span className="texte-pagination">Page {page} sur {totalPages}</span>
            <button className="bouton-pagination" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Suivant →</button>
          </div>
        )}
      </section>
      
      <AideUrgence />
    </div>
  );
};
