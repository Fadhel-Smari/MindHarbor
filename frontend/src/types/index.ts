// 
export type VisibiliteGroupe = 'PUBLIC' | 'PRIVE';
export type GroupRole = 'MEMBRE' | 'MODERATEUR';
export type StatutReqGroupe = 'EN_ATTENTE' | 'ACCEPTEE' | 'REFUSEE';

export type Meta = {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
};

export type Paginated<T> = {
    data: T[];
    meta: Meta;
};

export type JournalEntry = {
    id: string;
    userId: string;
    date: string;
    mood: number;
    energy: number;
    sleep: number;
    anxiety: number;
    events?: string;
    gratitude?: string;
    createdAt: string;
    updatedAt: string;
};


export type UserDetail = {
    id: string;
    nom: string | null;
    surnom: string | null;
    avatar: string | null;
    bio?: string | null;
};

export type Group = {
    id: string;
    nom: string;
    thematique: string;
    description: string;
    regles: string;
    visibilite: VisibiliteGroupe;
    createdAt: string;
    updatedAt: string;
    _count?: { membres: number };
    nombreMembres?: number;
    statutMembreVisiteur?: StatutReqGroupe | null;
    roleMembreVisiteur?: GroupRole | null;
    message?: string;
};

export type GroupMember = {
    id: string;
    role: GroupRole;
    statut: StatutReqGroupe;
    createdAt: string;
    updatedAt: string;
    groupId: string;
    userId: string;
    user?: UserDetail;
};

export type Comment = {
    id: string;
    contenu: string;
    createdAt: string;
    updatedAt: string;
    postId: string;
    userId: string;
    user?: UserDetail;
};

export type Post = {
    id: string;
    contenu: string;
    createdAt: string;
    updatedAt: string;
    groupId: string;
    userId: string;
    user?: UserDetail;
    commentaires?: Comment[];
};

export type TypeResource = 'ARTICLE' | 'EXERCICE' | 'FICHE' | 'LIEN';
export type NiveauResource = 'SIMPLE' | 'INTERMIDIAIRE' | 'COMPLEXE';

export type Resource = {
    id: string;
    titre: string;
    categorie: string;
    type: TypeResource;
    duree: number;
    niveau: NiveauResource;
    contenu: string;
    createdAt: string;
    updatedAt: string;
};

export type Favorite = {
    userId: string;
    resourceId: string;
    createdAt: string;
    updatedAt: string;
};

export type ResourceFilters = {
    page?: number;
    limit?: number;
    recherche?: string;
    categorie?: string;
    type?: TypeResource;
    niveau?: NiveauResource;
};

export type RegisterCredentials = {
  email: string;
  password: string;
  pseudo?: string;
};

export type LoginCredentials = {
  email: string;
  password: string;
};