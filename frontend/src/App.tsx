import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Accueil } from './pages/Accueil';
import { Inscription } from './pages/Inscription';
import { Connexion } from './pages/Connexion';
import { Journal } from './pages/Journal';
import { TableauDeBord } from './pages/TableauDeBord';
import { Profil } from './pages/Profil';
import { Groupes } from './pages/Groupes';

const RoutePrivee: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { estConnecte } = useAuth();
  return estConnecte ? <>{children}</> : <Navigate to="/connexion" replace />;
};

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
            <Route path="/inscription" element={<Inscription />} />
            <Route path="/connexion" element={<Connexion />} />

            {/* Routes Privee */}
            <Route
              path="/journal"
              element={
                <RoutePrivee>
                  <Journal />
                </RoutePrivee>
              }
            />
            <Route
              path="/dashboard"
              element={
                <RoutePrivee>
                  <TableauDeBord />
                </RoutePrivee>
              }
            />
            <Route
              path="/profil"
              element={
                <RoutePrivee>
                  <Profil />
                </RoutePrivee>
              }
            />
            <Route
              path="/groupes"
              element={
                <RoutePrivee>
                  <Groupes />
                </RoutePrivee>
              }
            />

            {/* Redirection si la route n'existe pas */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
};

export default App;
