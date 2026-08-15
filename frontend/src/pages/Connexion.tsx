import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { loginUser } from '../api/auth';
import { useAuth } from '../context/AuthContext';

export const Connexion: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { seConnecter } = useAuth();

  const messageSucces = location.state?.message as string | undefined;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await loginUser({ email, password }) as any;
      
      const token = response.token || response.accessToken || response;

      if (token) {
        seConnecter(token);
        navigate('/dashboard');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="page-conteneur">
      <div className="auth-container">
        <div className="auth-header">
          <h2>Connexion à MindHarbor</h2>
          <p className="auth-sous-titre">Retrouvez votre espace personnel de bien-être.</p>
        </div>

        {messageSucces && (
          <div className="message-succes">
            {messageSucces}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-formulaire">
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
              placeholder="example@courriel.com"
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
            Se connecter
          </button>
        </form>

        <div className="auth-pied-page">
          Pas encore de compte ?{' '}
          <Link to="/inscription" className="auth-lien">
            Inscrivez-vous
          </Link>
        </div>
      </div>
    </div>
  );
};