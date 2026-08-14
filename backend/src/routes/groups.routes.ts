import { Router, type Request, type Response } from "express";
import jwt from "jsonwebtoken";
import prisma from "../../utils/prisma.js";
import { authentifier } from "../middlewares/auth.js";
import { parsePagination, buildMeta } from "../../utils/paginate.js";

const router = Router();

/**
 * GET /groups
 * Accès: Public
 */
router.get("/", async (req: Request, res: Response) => {
    try {
        const { page, limit, skip, take } = parsePagination(req.query);
        const recherche = req.query.q as string | undefined;

        const conditionOu = recherche
            ? {
                  OR: [
                      { nom: { contains: recherche, mode: "insensitive" as const } },
                      { thematique: { contains: recherche, mode: "insensitive" as const } },
                      { description: { contains: recherche, mode: "insensitive" as const } }
                  ]
              }
            : {};

        const [groupes, total] = await Promise.all([
            prisma.group.findMany({
                where: conditionOu,
                skip,
                take,
                orderBy: { createdAt: "desc" },
                select: {
                    id: true,
                    nom: true,
                    thematique: true,
                    description: true,
                    visibilite: true,
                    createdAt: true,
                    _count: {
                        select: { membres: { where: { statut: "ACCEPTEE" } } }
                    }
                }
            }),
            prisma.group.count({ where: conditionOu })
        ]);

        const meta = buildMeta(page, limit, total);
        res.json({ data: groupes, meta });
    } catch (erreur) {
        res.status(500).json({ erreur: "Erreur lors de la récupération des groupes" });
    }
});

/**
 * POST /groups
 * Accès: Authentifié
 */
router.post("/", authentifier, async (req: Request, res: Response) => {
    try {
        const idUtilisateurConnecte = (req as any).user.sub as string;
        const { nom, thematique, description, regles, visibilite } = req.body;

        if (!nom || !thematique || !description || !regles) {
            return res.status(400).json({ erreur: "Tous les champs sont obligatoires" });
        }

        const nouveauGroupe = await prisma.$transaction(async (tx) => {
            const groupe = await tx.group.create({
                data: {
                    nom,
                    thematique,
                    description,
                    regles,
                    visibilite: visibilite === "PRIVE" ? "PRIVE" : "PUBLIC"
                }
            });

            await tx.groupMember.create({
                data: {
                    groupId: groupe.id,
                    userId: idUtilisateurConnecte,
                    role: "MODERATEUR",
                    statut: "ACCEPTEE"
                }
            });

            return groupe;
        });

        res.status(201).json(nouveauGroupe);
    } catch (erreur) {
        res.status(500).json({ erreur: "Erreur lors de la création du groupe" });
    }
});

/**
 * GET /groups/:id
 * Accès: Public (aperçu) ou Membre (contenu complet)
 */
router.get("/:id", async (req: Request, res: Response) => {
    try {
        const idGroupe = req.params.id as string;

        if (!idGroupe) {
            return res.status(400).json({ erreur: "Identifiant du groupe requis" });
        }

        let idVisiteur: string | undefined;
        let roleVisiteur: string | undefined;

        const enTeteAuth = req.headers.authorization;
        if (enTeteAuth?.startsWith("Bearer ")) {
            const jeton = enTeteAuth.split(" ")[1];
            try {
                const payload = jwt.verify(jeton!, process.env.JWT_SECRET!) as { sub: string; role: string };
                idVisiteur = payload.sub;
                roleVisiteur = payload.role;
            } catch {

            }
        }

        const groupe = await prisma.group.findUnique({
            where: { id: idGroupe },
            include: {
                _count: { select: { membres: { where: { statut: "ACCEPTEE" } } } }
            }
        });

        if (!groupe) {
            return res.status(404).json({ erreur: "Groupe introuvable" });
        }

        let adhesion: any = null;
        if (idVisiteur) {
            adhesion = await prisma.groupMember.findUnique({
                where: {
                    groupId_userId: {
                        groupId: idGroupe,
                        userId: idVisiteur
                    }
                }
            });
        }

        const estMembreActif = adhesion?.statut === "ACCEPTEE";
        const estAdmin = roleVisiteur === "ADMIN";

        if (groupe.visibilite === "PUBLIC" || estMembreActif || estAdmin) {
            return res.json({
                ...groupe,
                statutMembreVisiteur: adhesion ? adhesion.statut : null,
                roleMembreVisiteur: adhesion ? adhesion.role : null
            });
        }

        res.json({
            id: groupe.id,
            nom: groupe.nom,
            thematique: groupe.thematique,
            description: groupe.description,
            visibilite: groupe.visibilite,
            createdAt: groupe.createdAt,
            nombreMembres: (groupe as any)._count?.membres ?? 0,
            statutMembreVisiteur: adhesion ? adhesion.statut : null,
            message: "Groupe privé. Rejoignez le groupe pour voir l'intégralité du contenu."
        });
    } catch (erreur) {
        res.status(500).json({ erreur: "Erreur lors de la récupération du groupe" });
    }
});

/**
 * POST /groups/:id/join
 * Accès: Authentifié
 */
router.post("/:id/join", authentifier, async (req: Request, res: Response) => {
    try {
        const idUtilisateurConnecte = (req as any).user.sub as string;
        const idGroupe = req.params.id as string;

        const groupe = await prisma.group.findUnique({ where: { id: idGroupe } });
        if (!groupe) {
            return res.status(404).json({ erreur: "Groupe introuvable" });
        }

        const adhesionExistante = await prisma.groupMember.findUnique({
            where: { groupId_userId: { groupId: idGroupe, userId: idUtilisateurConnecte } }
        });

        if (adhesionExistante) {
            if (adhesionExistante.statut === "ACCEPTEE") {
                return res.status(400).json({ erreur: "Vous êtes déjà membre de ce groupe" });
            }
            if (adhesionExistante.statut === "EN_ATTENTE") {
                return res.status(400).json({ erreur: "Votre demande est déjà en attente d'approbation" });
            }
        }

        const statutInitial = groupe.visibilite === "PUBLIC" ? "ACCEPTEE" : "EN_ATTENTE";

        const membre = await prisma.groupMember.upsert({
            where: { groupId_userId: { groupId: idGroupe, userId: idUtilisateurConnecte } },
            update: { statut: statutInitial },
            create: {
                groupId: idGroupe,
                userId: idUtilisateurConnecte,
                role: "MEMBRE",
                statut: statutInitial
            }
        });

        res.status(201).json({
            message:
                statutInitial === "ACCEPTEE"
                    ? "Vous avez rejoint le groupe avec succès"
                    : "Votre demande d'adhésion a été envoyée au modérateur",
            membre
        });
    } catch (erreur) {
        res.status(500).json({ erreur: "Erreur lors de la demande d'adhésion" });
    }
});

/**
 * GET /groups/:id/requests
 * Accès: Modérateur ou Admin
 */
router.get("/:id/requests", authentifier, async (req: Request, res: Response) => {
    try {
        const idUtilisateurConnecte = (req as any).user.sub as string;
        const roleUtilisateurConnecte = (req as any).user.role as string;
        const idGroupe = req.params.id as string;

        const estModerateur = await prisma.groupMember.findFirst({
            where: {
                groupId: idGroupe,
                userId: idUtilisateurConnecte,
                role: "MODERATEUR",
                statut: "ACCEPTEE"
            }
        });

        if (!estModerateur && roleUtilisateurConnecte !== "ADMIN") {
            return res.status(403).json({ erreur: "Seul un modérateur peut consulter les demandes" });
        }

        const demandes = await prisma.groupMember.findMany({
            where: {
                groupId: idGroupe,
                statut: "EN_ATTENTE"
            },
            include: {
                user: {
                    select: { id: true, nom: true, surnom: true, avatar: true, bio: true }
                }
            },
            orderBy: { createdAt: "asc" }
        });

        res.json(demandes);
    } catch (erreur) {
        res.status(500).json({ erreur: "Erreur lors de la récupération des demandes" });
    }
});

/**
 * PATCH /groups/:id/requests/:requestId
 * Accès: Modérateur ou Admin
 */
router.patch("/:id/requests/:requestId", authentifier, async (req: Request, res: Response) => {
    try {
        const idUtilisateurConnecte = (req as any).user.sub as string;
        const roleUtilisateurConnecte = (req as any).user.role as string;
        const idGroupe = req.params.id as string;
        const idDemande = req.params.requestId as string;
        const { statut } = req.body;

        if (!["ACCEPTEE", "REFUSEE"].includes(statut)) {
            return res.status(400).json({ erreur: "Le statut doit être ACCEPTEE ou REFUSEE" });
        }

        const estModerateur = await prisma.groupMember.findFirst({
            where: {
                groupId: idGroupe,
                userId: idUtilisateurConnecte,
                role: "MODERATEUR",
                statut: "ACCEPTEE"
            }
        });

        if (!estModerateur && roleUtilisateurConnecte !== "ADMIN") {
            return res.status(403).json({ erreur: "Seul un modérateur peut traiter les demandes" });
        }

        const demandeMiseAJour = await prisma.groupMember.update({
            where: { id: idDemande },
            data: { statut }
        });

        res.json(demandeMiseAJour);
    } catch (erreur) {
        res.status(500).json({ erreur: "Erreur lors du traitement de la demande" });
    }
});

/**
 * DELETE /groups/:id/members/:userId
 * Accès: Modérateur ou Admin
 */
router.delete("/:id/members/:userId", authentifier, async (req: Request, res: Response) => {
    try {
        const idUtilisateurConnecte = (req as any).user.sub as string;
        const roleUtilisateurConnecte = (req as any).user.role as string;
        const idGroupe = req.params.id as string;
        const idUtilisateurARetirer = req.params.userId as string;

        const estModerateur = await prisma.groupMember.findFirst({
            where: {
                groupId: idGroupe,
                userId: idUtilisateurConnecte,
                role: "MODERATEUR",
                statut: "ACCEPTEE"
            }
        });

        if (!estModerateur && roleUtilisateurConnecte !== "ADMIN") {
            return res.status(403).json({ erreur: "Seul un modérateur peut retirer un membre" });
        }

        const membreCible = await prisma.groupMember.findUnique({
            where: { groupId_userId: { groupId: idGroupe, userId: idUtilisateurARetirer } }
        });

        if (!membreCible) {
            return res.status(404).json({ erreur: "Membre introuvable dans ce groupe" });
        }

        if (membreCible.role === "MODERATEUR") {
            const nombreModerateurs = await prisma.groupMember.count({
                where: {
                    groupId: idGroupe,
                    role: "MODERATEUR",
                    statut: "ACCEPTEE"
                }
            });

            if (nombreModerateurs <= 1) {
                return res.status(400).json({
                    erreur: "Impossible de supprimer ce membre : le groupe doit conserver au moins un modérateur actif"
                });
            }
        }

        await prisma.groupMember.delete({
            where: { id: membreCible.id }
        });

        res.json({ message: "Membre retiré du groupe avec succès" });
    } catch (erreur) {
        res.status(500).json({ erreur: "Erreur lors du retrait du membre" });
    }
});

/**
 * GET /groups/:id/posts
 * Accès: Membre du groupe (ou Admin)
 */
router.get("/:id/posts", authentifier, async (req: Request, res: Response) => {
    try {
        const idUtilisateurConnecte = (req as any).user.sub as string;
        const roleUtilisateurConnecte = (req as any).user.role as string;
        const idGroupe = req.params.id as string;

        const { page, limit, skip, take } = parsePagination(req.query);

        const estMembre = await prisma.groupMember.findFirst({
            where: {
                groupId: idGroupe,
                userId: idUtilisateurConnecte,
                statut: "ACCEPTEE"
            }
        });

        if (!estMembre && roleUtilisateurConnecte !== "ADMIN") {
            return res.status(403).json({ erreur: "Vous devez être membre de ce groupe pour voir les publications" });
        }

        const [publications, total] = await Promise.all([
            prisma.post.findMany({
                where: { groupId: idGroupe },
                skip,
                take,
                orderBy: { createdAt: "desc" },
                include: {
                    user: {
                        select: { id: true, nom: true, surnom: true, avatar: true }
                    },
                    commentaires: {
                        include: {
                            user: {
                                select: { id: true, nom: true, surnom: true, avatar: true }
                            }
                        },
                        orderBy: { createdAt: "asc" }
                    }
                }
            }),
            prisma.post.count({ where: { groupId: idGroupe } })
        ]);

        const meta = buildMeta(page, limit, total);
        res.json({ data: publications, meta });
    } catch (erreur) {
        res.status(500).json({ erreur: "Erreur lors de la récupération des publications" });
    }
});

/**
 * POST /groups/:id/posts
 * Accès: Membre du groupe (ou Admin)
 */
router.post("/:id/posts", authentifier, async (req: Request, res: Response) => {
    try {
        const idUtilisateurConnecte = (req as any).user.sub as string;
        const roleUtilisateurConnecte = (req as any).user.role as string;
        const idGroupe = req.params.id as string;
        const { contenu } = req.body;

        if (!contenu || typeof contenu !== "string" || contenu.trim() === "") {
            return res.status(400).json({ erreur: "Le contenu de la publication ne peut pas être vide" });
        }

        const estMembre = await prisma.groupMember.findFirst({
            where: {
                groupId: idGroupe,
                userId: idUtilisateurConnecte,
                statut: "ACCEPTEE"
            }
        });

        if (!estMembre && roleUtilisateurConnecte !== "ADMIN") {
            return res.status(403).json({ erreur: "Vous devez être membre du groupe pour y publier du contenu" });
        }

        const nouvellePublication = await prisma.post.create({
            data: {
                contenu: contenu.trim(),
                groupId: idGroupe,
                userId: idUtilisateurConnecte
            },
            include: {
                user: {
                    select: { id: true, nom: true, surnom: true, avatar: true }
                }
            }
        });

        res.status(201).json(nouvellePublication);
    } catch (erreur) {
        res.status(500).json({ erreur: "Erreur lors de la création de la publication" });
    }
});

export default router;