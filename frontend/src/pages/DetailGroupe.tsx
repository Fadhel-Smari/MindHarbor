import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api/axios';
import { IndicateurChargement } from '../components/IndicateurChargement';
import { ChampFormulaire } from '../components/ChampFormulaire';
import { AideUrgence } from '../components/AideUrgence';

export const DetailGroupe: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [groupe, setGroupe] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [nouveauPost, setNouveauPost] = useState('');
  const [chargement, setChargement] = useState(true);

  const chargerDetails = async () => {
    try {
      const [resG, resP] = await Promise.all([
        api.get(`/groups/${id}`),
        api.get(`/groups/${id}/posts`).catch(() => ({ data: [] }))
      ]);
      setGroupe(resG.data);
      setPosts(resP.data.data || []);
    } catch (e) {
      console.error("Erreur de chargement du groupe", e);
    } finally {
      setChargement(false);
    }
  };

  useEffect(() => {
    chargerDetails();
  }, [id]);

  const publierMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nouveauPost.trim()) return;

    try {
      await api.post(`/groups/${id}/posts`, { contenu: nouveauPost });
      setNouveauPost('');
      chargerDetails();
    } catch (e) {
      console.error("Erreur publication message", e);
    }
  };

  if (chargement) return <IndicateurChargement message="Chargement de la communauté..." />;

  return (
    <div className="page-conteneur">
      {groupe && (
        <>
          <div className="en-tete-groupe carte">
            <h1>{groupe.nom}</h1>
            <p><strong>Thématique :</strong> {groupe.thematique}</p>
            <p>{groupe.description}</p>
            <small>Règles : {groupe.regles}</small>
          </div>

          <section className="section-publications">
            <h2>Fil de discussion</h2>

            <form onSubmit={publierMessage} className="form-post carte">
              <ChampFormulaire
                etiquette="Partager avec le groupe"
                nom="nouveauPost"
                valeur={nouveauPost}
                surChangement={(e) => setNouveauPost(e.target.value)}
                estZoneTexte
                placeholder="Écrivez un message bienveillant..."
              />
              <button type="submit" className="bouton-soumission">Publier</button>
            </form>

            <div className="liste-posts">
              {posts.map(p => (
                <div key={p.id} className="carte carte-post">
                  <div className="auteur-post">
                    <strong>{p.user?.surnom || 'Auteur anonyme'}</strong>
                    <small>{new Date(p.createdAt).toLocaleString('fr-CA')}</small>
                  </div>
                  <p>{p.contenu}</p>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      <AideUrgence />
    </div>
  );
};