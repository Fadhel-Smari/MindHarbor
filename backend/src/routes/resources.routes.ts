import { Router, type Request, type Response } from "express";
import prisma from "../../utils/prisma.js";
import { authentifier, exigerRoles } from "../middlewares/auth.js";
import { parsePagination, buildMeta } from "../../utils/paginate.js";

const router = Router();

/**
 * GET /resources
 * Accès: Public
 */
router.get("/", async (req: Request, res: Response) => {
    try {
        const { recherche, categorie, type, niveau } = req.query;
        const { page, limit, skip, take } = parsePagination(req.query);

        const where: any = {};

        if (categorie) {
            where.categorie = String(categorie);
        }

        if (type) {
            where.type = String(type);
        }

        if (niveau) {
            where.niveau = String(niveau);
        }

        if (recherche) {
            const rechercheString = String(recherche);
            where.OR = [
                { titre: { contains: rechercheString, mode: "insensitive" } },
                { contenu: { contains: rechercheString, mode: "insensitive" } }
            ];
        }

        const [resources, total] = await Promise.all([
            prisma.resource.findMany({
                where,
                skip,
                take,
                orderBy: { createdAt: "desc" }
            }),
            prisma.resource.count({ where })
        ]);

        const meta = buildMeta(page, limit, total);

        res.json({ data: resources, meta });
    } catch (error) {
        res.status(500).json({ erreur: "Erreur lors de la récupération des ressources" });
    }
});

/**
 * GET /resources/:id
 * Accès: Public
 */
router.get("/:id", async (req: Request, res: Response) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

        if (!id) {
            return res.status(400).json({ erreur: "Identifiant invalide" });
        }

        const resource = await prisma.resource.findUnique({
            where: { id }
        });

        if (!resource) {
            return res.status(404).json({ erreur: "Ressource introuvable" });
        }

        res.json(resource);
    } catch (error) {
        res.status(500).json({ erreur: "Erreur lors de la récupération de la ressource" });
    }
});

/**
 * POST /resources
 * Accès: Administrateur
 */
router.post("/", authentifier, exigerRoles(["ADMIN"]), async (req: Request, res: Response) => {
    try {
        const { titre, categorie, type, duree, niveau, contenu } = req.body;

        if (!titre || !categorie || !type || duree === undefined || !niveau || !contenu) {
            return res.status(400).json({ erreur: "Tous les champs sont requis" });
        }

        const nouvelleRessource = await prisma.resource.create({
            data: {
                titre,
                categorie,
                type,
                duree: Number(duree),
                niveau,
                contenu
            }
        });

        res.status(201).json(nouvelleRessource);
    } catch (error) {
        res.status(400).json({ erreur: "Données invalides pour la création de la ressource" });
    }
});

/**
 * POST /resources/:id/favorite
 * Accès: Authentifié
 */
router.post("/:id/favorite", authentifier, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.sub as string;
        const resourceId = (Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) as string;

        if (!userId) {
            return res.status(401).json({ erreur: "Utilisateur non authentifié" });
        }

        if (!resourceId) {
            return res.status(400).json({ erreur: "Identifiant de la ressource invalide" });
        }

        const resource = await prisma.resource.findUnique({
            where: { id: resourceId }
        });

        if (!resource) {
            return res.status(404).json({ erreur: "Ressource introuvable" });
        }

        const favorisExistant = await prisma.favorite.findUnique({
            where: {
                userId_resourceId: {
                    userId,
                    resourceId
                }
            }
        });

        if (favorisExistant) {
            return res.status(400).json({ erreur: "Ressource déjà ajoutée aux favoris" });
        }

        const favori = await prisma.favorite.create({
            data: {
                userId,
                resourceId
            }
        });

        res.status(201).json({ message: "Ressource ajoutée aux favoris", favori });
    } catch (error) {
        res.status(500).json({ erreur: "Erreur lors de l'ajout aux favoris" });
    }
});

/**
 * DELETE /resources/:id/favorite
 * Accès: Authentifié
 */
router.delete("/:id/favorite", authentifier, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.sub as string;
        const resourceId = (Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) as string;

        if (!userId) {
            return res.status(401).json({ erreur: "Utilisateur non authentifié" });
        }

        if (!resourceId) {
            return res.status(400).json({ erreur: "Identifiant de la ressource invalide" });
        }

        const favorisExistant = await prisma.favorite.findUnique({
            where: {
                userId_resourceId: {
                    userId,
                    resourceId
                }
            }
        });

        if (!favorisExistant) {
            return res.status(404).json({ erreur: "Favori introuvable" });
        }

        await prisma.favorite.delete({
            where: {
                userId_resourceId: {
                    userId,
                    resourceId
                }
            }
        });

        res.json({ message: "Ressource retirée des favoris" });
    } catch (error) {
        res.status(500).json({ erreur: "Erreur lors de la suppression du favori" });
    }
});

export default router;