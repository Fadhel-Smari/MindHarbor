import { Router, type Request, type Response } from "express";
import prisma from "../../utils/prisma.js";
import { authentifier } from "../middlewares/auth.js";

const router = Router();

/**
 * DELETE /posts/:id
 * Accès: Auteur, Modérateur ou Admin
 */
router.delete("/:id", authentifier, async (req: Request, res: Response) => {
    try {
        const idUtilisateurConnecte = (req as any).user.sub as string;
        const roleUtilisateurConnecte = (req as any).user.role as string;
        const idPost = req.params.id as string;

        if (!idPost) {
            return res.status(400).json({ erreur: "L'identifiant de la publication est requis" });
        }

        const post = await prisma.post.findUnique({
            where: { id: idPost }
        });

        if (!post) {
            return res.status(404).json({ erreur: "Publication introuvable" });
        }

        const estAuteur = post.userId === idUtilisateurConnecte;

        const estModerateurGroupe = await prisma.groupMember.findFirst({
            where: {
                groupId: post.groupId,
                userId: idUtilisateurConnecte,
                role: "MODERATEUR",
                statut: "ACCEPTEE"
            }
        });

        const estAdmin = roleUtilisateurConnecte === "ADMIN";

        if (!estAuteur && !estModerateurGroupe && !estAdmin) {
            return res.status(403).json({
                erreur: "Vous n'avez pas la permission de supprimer cette publication"
            });
        }

        await prisma.post.delete({
            where: { id: idPost }
        });

        res.json({ message: "Publication supprimée avec succès" });
    } catch (erreur) {
        res.status(500).json({ erreur: "Erreur lors de la suppression de la publication" });
    }
});

/**
 * POST /posts/:id/comments
 * Accès: Membre (ou Admin)
 */
router.post("/:id/comments", authentifier, async (req: Request, res: Response) => {
    try {
        const idUtilisateurConnecte = (req as any).user.sub as string;
        const roleUtilisateurConnecte = (req as any).user.role as string;
        const idPost = req.params.id as string;
        const { contenu } = req.body;

        if (!idPost) {
            return res.status(400).json({ erreur: "L'identifiant de la publication est requis" });
        }

        if (!contenu || typeof contenu !== "string" || contenu.trim() === "") {
            return res.status(400).json({ erreur: "Le contenu du commentaire ne peut pas être vide" });
        }

        const post = await prisma.post.findUnique({
            where: { id: idPost }
        });

        if (!post) {
            return res.status(404).json({ erreur: "Publication introuvable" });
        }

        const estMembre = await prisma.groupMember.findFirst({
            where: {
                groupId: post.groupId,
                userId: idUtilisateurConnecte,
                statut: "ACCEPTEE"
            }
        });

        const estAdmin = roleUtilisateurConnecte === "ADMIN";

        if (!estMembre && !estAdmin) {
            return res.status(403).json({
                erreur: "Vous devez être membre de ce groupe pour pouvoir commenter cette publication"
            });
        }

        const nouveauCommentaire = await prisma.comment.create({
            data: {
                contenu: contenu.trim(),
                postId: idPost,
                userId: idUtilisateurConnecte
            },
            include: {
                user: {
                    select: {
                        id: true,
                        nom: true,
                        surnom: true,
                        avatar: true
                    }
                }
            }
        });

        res.status(201).json(nouveauCommentaire);
    } catch (erreur) {
        res.status(500).json({ erreur: "Erreur lors de la création du commentaire" });
    }
});

export default router;