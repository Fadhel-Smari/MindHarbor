import { Router, type Request, type Response } from "express";
import prisma from "../../utils/prisma.js";
import { authentifier } from "../middlewares/auth.js";
import { parsePagination, buildMeta } from "../../utils/paginate.js";

const router = Router();

/**
 * GET /me/favorites
 * Accès: Authentifié
 */
router.get("/favorites", authentifier, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.sub as string;
        const { page, limit, skip, take } = parsePagination(req.query);

        const [favoris, total] = await Promise.all([
            prisma.favorite.findMany({
                where: { userId },
                skip,
                take,
                orderBy: { createdAt: "desc" },
                include: { resource: true }
            }),
            prisma.favorite.count({ where: { userId } })
        ]);

        const resources = favoris.map((f) => f.resource);
        const meta = buildMeta(page, limit, total);

        res.json({ data: resources, meta });
    } catch (e) {
        res.status(500).json({ erreur: "Erreur lors de la récupération des favoris" });
    }
});

/**
 * GET /me/suggestions
 * Accès: Authentifié
 */
router.get("/suggestions", authentifier, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.sub as string;
        const { page, limit, skip, take } = parsePagination(req.query);

        const derniereEntree = await prisma.journalEntry.findFirst({
            where: { userId },
            orderBy: { date: "desc" }
        });

        const whereResource: any = {};

        if (derniereEntree) {
            if (derniereEntree.anxiete >= 3) {
                whereResource.categorie = { categorie: { contains: "anxiété", mode: "insensitive" } }
            } else if (derniereEntree.sommeil <= 2) {
                whereResource.categorie = { contains: "sommeil", mode: "insensitive" };
            } else if (derniereEntree.humeur <= 2) {
                whereResource.categorie = { contains: "humeur", mode: "insensitive" };
            }
        }

        const [resources, total] = await Promise.all([
            prisma.resource.findMany({
                where: whereResource,
                skip,
                take,
                orderBy: { createdAt: "desc" }
            }),
            prisma.resource.count({ where: whereResource })
        ]);

        const meta = buildMeta(page, limit, total);

        res.json({ data: resources, meta });
    } catch (e) {
        res.status(500).json({ erreur: "Erreur lors de la génération des suggestions" });
    }
});

/**
 * PATCH /me
 * Accès: Authentifié
 */
router.patch("/", authentifier, async (req: Request, res: Response) => {
    const id = (req as any).user.sub as string;
    const { nom, surnom, avatar, bio } = req.body;

    try {
        const user = await prisma.user.update({
            where: { id },
            data: { nom, surnom, avatar, bio },
            select: {
                id: true,
                email: true,
                nom: true,
                surnom: true,
                avatar: true,
                bio: true,
                role: true,
                visibilite: true,
                niveauContact: true,
                updatedAt: true
            }
        });
        res.json(user);
    } catch (e) {
        res.status(404).json({ erreur: "Utilisateur non trouvé ou données invalides" });
    }
});

/**
 * PATCH /me/privacy
 * Accès: Authentifié
 */
router.patch("/privacy", authentifier, async (req: Request, res: Response) => {
    const id = (req as any).user.sub as string;
    const { visibilite, niveauContact } = req.body;

    try {
        const user = await prisma.user.update({
            where: { id },
            data: { visibilite, niveauContact },
            select: {
                id: true,
                visibilite: true,
                niveauContact: true,
                updatedAt: true
            }
        });
        res.json(user);
    } catch (e) {
        res.status(400).json({ erreur: "Impossible de modifier la confidentialité" });
    }
});

/**
 * GET /me/export
 * Accès: Authentifié
 */
router.get("/export", authentifier, async (req: Request, res: Response) => {
    const id = (req as any).user.sub as string;

    try {
        const userData = await prisma.user.findUnique({
            where: { id },
            include: {
                journalEntrees: {
                    include: {
                        activitees: {
                            include: { activity: true }
                        }
                    }
                },
                favoris: {
                    include: { resource: true }
                },
                membreGroupe: {
                    include: { group: true }
                },
                posts: true,
                commentaires: true,
                messagesEnvoyees: true,
                messagesRecues: true
            }
        });

        if (!userData) {
            return res.status(404).json({ erreur: "Utilisateur introuvable" });
        }

        const { password, ...donneesExportees } = userData;

        res.json({
            dateExport: new Date(),
            donneesUtilisateur: donneesExportees
        });
    } catch (e) {
        res.status(500).json({ erreur: "Erreur lors de l'exportation des données" });
    }
});

/**
 * DELETE /me
 * Accès: Authentifié
 */
router.delete("/", authentifier, async (req: Request, res: Response) => {
    const id = (req as any).user.sub as string;

    try {
        await prisma.user.delete({
            where: { id }
        });
        res.json({ message: "Votre compte a été supprimé avec succès" });
    } catch (e) {
        res.status(404).json({ erreur: "Impossible de supprimer le compte" });
    }
});

export default router;