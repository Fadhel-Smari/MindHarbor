import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import { Accueil } from './pages/Accueil';



export const App: React.FC = () => {
  const { token, seDeconnecter } = useAuth();

  return (
    <BrowserRouter>
      <div className="app-container">
        <header className="en-tete-navigation">
          <nav>
            <Link to="/">Accueil</Link>
            <Link to="/ressources">Ressources</Link>
            {token ? (
              <>
                <Link to="/dashboard">Tableau de bord</Link>
                <Link to="/journal">Journal</Link>
                <Link to="/tendances">Tendances</Link>
                <Link to="/groupes">Groupes</Link>
                <Link to="/messagerie">Messagerie</Link>
                <Link to="/profil">Profil</Link>
                <button onClick={seDeconnecter} className="bouton-lien">
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link to="/connexion">Connexion</Link>
                <Link to="/inscription">Inscription</Link>
              </>
            )}
          </nav>
        </header>

        <main className="contenu-principal">
          <Routes>
            {/* Routes Publiques */}
            <Route path="/" element={<Accueil />} />

            {/* Redirection si la route n'existe pas */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
};

export default App;