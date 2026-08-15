import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../api/auth';
import { AxiosError } from 'axios';

export const Inscription: React.FC = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pseudo, setPseudo] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await registerUser({ email, password, pseudo });
      navigate('/connexion', {
        state: { message: 'Votre compte a été créé avec succès. Vous pouvez maintenant vous connecter.' }
      });
    } catch (err) {
      if (err instanceof AxiosError) {
        if (err.response?.status === 400) {
          setError('Cette adresse courriel est déjà utilisée ou les données sont invalides.');
        } else {
          setError(err.response?.data?.message || 'Une erreur est survenue lors de l\'inscription.');
        }
      } else {
        setError('Impossible de joindre le serveur. Veuillez vérifier votre connexion.');
      }
    }
  };

  return (
    <div className="page-conteneur">
      <div className="auth-container">
        <div className="auth-header">
          <h2>Bienvenue sur MindHarbor</h2>
          <p className="auth-sous-titre">Créez votre espace sécurisé et confidentiel.</p>
        </div>

        {/* Bloc d'affichage de l'erreur */}
        {error && (
          <div className="conteneur-erreur">
            <h4 className="titre-erreur">Erreur</h4>
            <p className="message-erreur">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-formulaire">
          <div className="groupe-champ">
            <label htmlFor="pseudo" className="etiquette-champ">
              Pseudonyme ou Prénom
            </label>
            <input
              id="pseudo"
              type="text"
              className="champ-saisie"
              value={pseudo}
              onChange={(e) => setPseudo(e.target.value)}
              placeholder="Comment souhaitez-vous être appelé ?"
            />
          </div>

          <div className="groupe-champ">
            <label htmlFor="email" className="etiquette-champ">
              Courriel <span className="asterisque-obligatoire">*</span>
            </label>
            <input
              id="email"
              type="email"
              className="champ-saisie"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@courriel.com"
            />
          </div>

          <div className="groupe-champ">
            <label htmlFor="password" className="etiquette-champ">
              Mot de passe <span className="asterisque-obligatoire">*</span>
            </label>
            <input
              id="password"
              type="password"
              className="champ-saisie"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className="bouton-primaire">
            Créer mon compte
          </button>
        </form>

        <div className="auth-pied-page">
          Vous avez déjà un compte ?{' '}
          <Link to="/connexion" className="auth-lien">
            Connectez-vous
          </Link>
        </div>
      </div>
    </div>
  );
};