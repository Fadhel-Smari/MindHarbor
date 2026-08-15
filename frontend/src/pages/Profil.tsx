import React, { useState, useEffect } from 'react';
import { api } from '../api/axios';
import { ChampFormulaire } from '../components/ChampFormulaire';
import { IndicateurChargement } from '../components/IndicateurChargement';
import { AideUrgence } from '../components/AideUrgence';

export const Profil: React.FC = () => {
  const [surnom, setSurnom] = useState('');
  const [bio, setBio] = useState('');
  const [visibilite, setVisibilite] = useState('PUBLIC');
  const [niveauContact, setNiveauContact] = useState('TOUT_LE_MONDE');
  const [chargement, setChargement] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const chargerProfil = async () => {
      try {
        const res = await api.get('/auth/me');
        setSurnom(res.data.surnom || '');
        setBio(res.data.bio || '');
        setVisibilite(res.data.visibilite || 'PUBLIC');
        setNiveauContact(res.data.niveauContact || 'TOUT_LE_MONDE');
      } catch (e) {
        console.error("Erreur de récupération du profil", e);
      } finally {
        setChargement(false);
      }
    };
    chargerProfil();
  }, []);

  const enregistrerProfil = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    try {
      await api.patch('/me', { surnom, bio });
      await api.patch('/me/privacy', { visibilite, niveauContact });
      setMessage("Paramètres sauvegardés avec succès.");
    } catch (e) {
      console.error("Erreur de sauvegarde", e);
    }
  };

  const exporterDonnees = async () => {
    try {
      const res = await api.get('/me/export');
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'mindharbor-export.json';
      a.click();
    } catch (e) {
      console.error("Erreur lors de l'exportation", e);
    }
  };

  if (chargement) return <IndicateurChargement message="Chargement des paramètres du profil..." />;

  return (
    <div className="page-conteneur">
      <h1>Profil et Confidentialité</h1>

      <div className="carte">
        {message && <p className="texte-succes">{message}</p>}
        <form onSubmit={enregistrerProfil}>
          <h2>Informations personnelles</h2>
          <ChampFormulaire etiquette="Pseudonyme" nom="surnom" valeur={surnom} surChangement={(e) => setSurnom(e.target.value)} />
          <ChampFormulaire etiquette="Biographie courte" nom="bio" valeur={bio} surChangement={(e) => setBio(e.target.value)} estZoneTexte />

          <h2>Paramètres de confidentialité</h2>
          <div className="groupe-champ">
            <label className="etiquette-champ">Visibilité du profil</label>
            <select value={visibilite} onChange={(e) => setVisibilite(e.target.value)} className="champ-saisie">
              <option value="PUBLIC">Public</option>
              <option value="GROUPES_SEULEMENT">Membres des groupes seulement</option>
              <option value="PRIVE">Privé</option>
            </select>
          </div>

          <div className="groupe-champ">
            <label className="etiquette-champ">Qui peut me contacter par message ?</label>
            <select value={niveauContact} onChange={(e) => setNiveauContact(e.target.value)} className="champ-saisie">
              <option value="TOUT_LE_MONDE">Tout le monde</option>
              <option value="MEMBRES_DE_MES_GROUPES">Membres de mes groupes</option>
              <option value="PERSONNE">Personne</option>
            </select>
          </div>

          <button type="submit" className="bouton-soumission">Sauvegarder les modifications</button>
        </form>

        <hr className="separateur" />

        <div className="zone-danger">
          <h3>Mes données personnelles</h3>
          <button onClick={exporterDonnees} className="bouton-secondaire">Télécharger mes données (JSON)</button>
        </div>
      </div>

      <AideUrgence />
    </div>
  );
};