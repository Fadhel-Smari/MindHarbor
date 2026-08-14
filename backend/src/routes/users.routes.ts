import { Router, type Request, type Response } from "express";
import jwt from "jsonwebtoken";
import prisma from "../../utils/prisma.js";

const router = Router();

/**
 * GET /users/:id
 * Accès: Public
 */
router.get("/:id", async (req: Request, res: Response) => {
    try {
        const idUtilisateurCible = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

        if (!idUtilisateurCible) {
            return res.status(400).json({ erreur: "Identifiant invalide" });
        }

        let utilisateurVisiteur: any = null;
        const enTeteAutorisation = req.headers.authorization;

        if (enTeteAutorisation?.startsWith("Bearer ")) {
            const token = enTeteAutorisation.split(" ")[1];
            try {
                utilisateurVisiteur = jwt.verify(token!, process.env.JWT_SECRET!);
            } catch {

            }
        }

        const utilisateurDemande = await prisma.user.findUnique({
            where: { id: idUtilisateurCible },
            select: {
                id: true,
                nom: true,
                surnom: true,
                avatar: true,
                bio: true,
                visibilite: true,
                niveauContact: true,
                createdAt: true
            }
        });

        if (!utilisateurDemande) {
            return res.status(404).json({ erreur: "Utilisateur introuvable" });
        }

        const idVisiteur = utilisateurVisiteur?.sub as string | undefined;
        const roleVisiteur = utilisateurVisiteur?.role as string | undefined;

        const estLuiMeme = idVisiteur === utilisateurDemande.id;
        const estAdmin = roleVisiteur === "ADMIN";

        if (estLuiMeme || estAdmin) {
            return res.json(utilisateurDemande);
        }

        if (utilisateurDemande.visibilite === "PRIVE") {
            return res.status(403).json({ erreur: "Ce profil est privé" });
        }

        if (utilisateurDemande.visibilite === "GROUPES_SEULEMENT") {
            if (!idVisiteur) {
                return res.status(403).json({
                    erreur: "Ce profil est visible uniquement par les membres de ses groupes"
                });
            }

            const membresGroupesCible = await prisma.groupMember.findMany({
                where: {
                    userId: idUtilisateurCible,
                    statut: "ACCEPTEE"
                },
                select: { groupId: true }
            });

            const idsGroupesCible = membresGroupesCible.map((membre) => membre.groupId);

            const groupeEnCommun = await prisma.groupMember.findFirst({
                where: {
                    userId: idVisiteur,
                    groupId: { in: idsGroupesCible },
                    statut: "ACCEPTEE"
                }
            });

            if (!groupeEnCommun) {
                return res.status(403).json({
                    erreur: "Vous devez faire partie d'un groupe commun pour voir ce profil"
                });
            }
        }

        res.json(utilisateurDemande);
    } catch (erreur) {
        res.status(500).json({ erreur: "Erreur lors de la récupération du profil" });
    }
});

export default router;