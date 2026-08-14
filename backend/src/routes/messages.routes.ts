import { Router, type Request, type Response } from "express";
import prisma from "../../utils/prisma.js";
import { authentifier } from "../middlewares/auth.js";
import { parsePagination, buildMeta } from "../../utils/paginate.js";

const router = Router();

/**
 * GET /messages
 * Accès: Authentifié
 */
router.get("/", authentifier, async (req: Request, res: Response) => {
    try {
        const idExpediteur = (req as any).user.sub as string;
        const { page, limit, skip, take } = parsePagination(req.query);

        const tousLesMessages = await prisma.message.findMany({
            where: {
                OR: [
                    { expediteurId: idExpediteur },
                    { receveurId: idExpediteur }
                ]
            },
            orderBy: { createdAt: "desc" },
            include: {
                expediteur: {
                    select: { id: true, nom: true, surnom: true, avatar: true }
                },
                receveur: {
                    select: { id: true, nom: true, surnom: true, avatar: true }
                }
            }
        });

        const conversationsMap = new Map<string, any>();

        for (const message of tousLesMessages) {
            const idInterlocuteur =
                message.expediteurId === idExpediteur ? message.receveurId : message.expediteurId;

            if (!conversationsMap.has(idInterlocuteur)) {
                const profilInterlocuteur =
                    message.expediteurId === idExpediteur ? message.receveur : message.expediteur;

                conversationsMap.set(idInterlocuteur, {
                    interlocuteur: profilInterlocuteur,
                    dernierMessage: {
                        id: message.id,
                        contenu: message.contenu,
                        estLus: message.estLus,
                        createdAt: message.createdAt,
                        expediteurId: message.expediteurId
                    }
                });
            }
        }

        const listeConversations = Array.from(conversationsMap.values());
        const total = listeConversations.length;

        const conversationsPaginees = listeConversations.slice(skip, skip + take);
        const meta = buildMeta(page, limit, total);

        res.json({ data: conversationsPaginees, meta });
    } catch (erreur) {
        res.status(500).json({ erreur: "Erreur lors de la récupération des conversations" });
    }
});

/**
 * GET /messages/:userId
 * Accès: Authentifié
 */
router.get("/:userId", authentifier, async (req: Request, res: Response) => {
    try {
        const idUtilisateurConnecte = (req as any).user.sub as string;
        const idInterlocuteur = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;

        if (!idInterlocuteur) {
            return res.status(400).json({ erreur: "Identifiant utilisateur invalide" });
        }

        const { page, limit, skip, take } = parsePagination(req.query);

        const conditionFil = {
            OR: [
                { expediteurId: idUtilisateurConnecte, receveurId: idInterlocuteur },
                { expediteurId: idInterlocuteur, receveurId: idUtilisateurConnecte }
            ]
        };

        const [messages, total] = await Promise.all([
            prisma.message.findMany({
                where: conditionFil,
                skip,
                take,
                orderBy: { createdAt: "desc" }
            }),
            prisma.message.count({ where: conditionFil })
        ]);

        await prisma.message.updateMany({
            where: {
                expediteurId: idInterlocuteur,
                receveurId: idUtilisateurConnecte,
                estLus: false
            },
            data: { estLus: true }
        });

        const meta = buildMeta(page, limit, total);

        res.json({ data: messages, meta });
    } catch (erreur) {
        res.status(500).json({ erreur: "Erreur lors de la récupération du fil de discussion" });
    }
});

/**
 * POST /messages/:userId
 * Accès: Authentifié
 */
router.post("/:userId", authentifier, async (req: Request, res: Response) => {
    try {
        const idExpediteur = (req as any).user.sub as string;
        const roleExpediteur = (req as any).user.role as string;
        const idReceveur = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
        const { contenu } = req.body;

        if (!idReceveur) {
            return res.status(400).json({ erreur: "Identifiant utilisateur invalide" });
        }

        if (!contenu || typeof contenu !== "string" || contenu.trim() === "") {
            return res.status(400).json({ erreur: "Le contenu du message ne peut pas être vide" });
        }

        if (idExpediteur === idReceveur) {
            return res.status(400).json({ erreur: "Vous ne pouvez pas vous envoyer un message à vous-même" });
        }

        const receveur = await prisma.user.findUnique({
            where: { id: idReceveur },
            select: { id: true, niveauContact: true }
        });

        if (!receveur) {
            return res.status(404).json({ erreur: "Destinataire introuvable" });
        }

        const estAdmin = roleExpediteur === "ADMIN";

        if (!estAdmin) {
            if (receveur.niveauContact === "PERSONNE") {
                return res.status(403).json({
                    erreur: "Cet utilisateur n'accepte aucun message privé"
                });
            }

            if (receveur.niveauContact === "MEMBRES_DE_MES_GROUPES") {
                const groupesExpediteur = await prisma.groupMember.findMany({
                    where: { userId: idExpediteur, statut: "ACCEPTEE" },
                    select: { groupId: true }
                });

                const idsGroupesExpediteur = groupesExpediteur.map((g) => g.groupId);

                const groupeEnCommun = await prisma.groupMember.findFirst({
                    where: {
                        userId: idReceveur,
                        groupId: { in: idsGroupesExpediteur },
                        statut: "ACCEPTEE"
                    }
                });

                if (!groupeEnCommun) {
                    return res.status(403).json({
                        erreur: "Vous devez partager un groupe en commun avec cet utilisateur pour lui envoyer un message"
                    });
                }
            }
        }

        const nouveauMessage = await prisma.message.create({
            data: {
                contenu: contenu.trim(),
                expediteurId: idExpediteur,
                receveurId: idReceveur
            }
        });

        res.status(201).json(nouveauMessage);
    } catch (erreur) {
        res.status(500).json({ erreur: "Erreur lors de l'envoi du message" });
    }
});

export default router;