import { Router, type Request, type Response } from "express";
import { authentifier } from "../middlewares/auth.js"; 
import prisma from "../../utils/prisma.js"; 
import { parsePagination, buildMeta } from "../../utils/paginate.js"; 

const router = Router();

router.use(authentifier);

// ==========================================
// 1. LIRE (PAGINÉ) : GET /journal
// ==========================================
router.get("/", async (req: Request, res: Response) => {
    const userId = String((req as any).user.sub);
    const { page, limit, skip, take } = parsePagination(req.query);

    try {
        const total = await prisma.journalEntry.count({ where: { userId } });
        const data = await prisma.journalEntry.findMany({
                where: { userId },
                orderBy: { date: 'desc' },
                skip,
                take
            });

        const meta = buildMeta(page, limit, total);

        res.json({ data, meta });
    } catch {
        res.status(500).json({ erreur: "Erreur lors de la récupération du journal." });
    }
});

// ==========================================
// 2. CRÉER : POST /journal (entrée du jour)
// ==========================================
router.post("/", async (req: Request, res: Response) => {
    const userId = String((req as any).user.sub);
    const { date, humeur, energie, sommeil, anxiete, evenements, gratitude } = req.body; 

    const notes = [humeur, energie, sommeil, anxiete];

    if (notes.some(note => !note || note < 1 || note > 5)) {
        return res.status(400).json({ erreur: "Humeur, énergie, sommeil et anxiété sont requis (entre 1 et 5)." });
    }

    const dateEntree = date ? new Date(date) : new Date();
    dateEntree.setUTCHours(0, 0, 0, 0);

    try {
        if (await prisma.journalEntry.findUnique({ where: { userId_date: { userId, date: dateEntree }}} )) {
            return res.status(409).json({ erreur: "Une entrée existe déjà pour cette date." });
        }

        const nouvelleEntree = await prisma.journalEntry.create({
            data: { 
                date: dateEntree,
                humeur,
                energie,
                sommeil,
                anxiete,
                evenements,
                gratitude,
                userId 
            }
        });
        
        res.status(201).json(nouvelleEntree);
        
    } catch (error) {
        res.status(500).json({ erreur: "Erreur lors de la création de l'entrée." });
    }
});

// ==========================================
// 3. STATS : GET /journal/stats?range=30d
// ==========================================
router.get("/stats", async (req: Request, res: Response) => {
    const userId = String((req as any).user.sub);
    const range = String(req.query.range || '30d');

    const jours = range === '7d' ? 7 : range === '90d' ? 90 : 30;
    const dateDebut = new Date();
    dateDebut.setUTCHours(0, 0, 0, 0);
    dateDebut.setUTCDate(dateDebut.getUTCDate() - jours);

    try {
        const stats = await prisma.journalEntry.aggregate({
            where: { userId, date: { gte: dateDebut } },
            _avg: { humeur: true, energie: true, sommeil: true, anxiete: true },
            _count: { id: true }
        });

        res.json({ range, totalEntrees: stats._count.id, moyennes: stats._avg });
    } catch (error) {
        res.status(500).json({ erreur: "Erreur lors du calcul des statistiques." });
    }
});


// ==========================================
// 4. LIRE UNE DATE : GET /journal/:date
// ==========================================
router.get("/:date", async (req: Request, res: Response) => {
    const userId = String((req as any).user.sub);

    try {
        const dateRecherche = new Date(String(req.params.date));
        dateRecherche.setUTCHours(0, 0, 0, 0);

        const entree = await prisma.journalEntry.findUnique({
            where: { userId_date: { userId, date: dateRecherche }}
        });

        if (!entree) return res.status(404).json({ erreur: "Aucune entrée pour cette date." });

        res.json(entree);
    } catch {
        res.status(500).json({ erreur: "Erreur lors de la récupération de l'entrée." });
    }
});

// ==========================================
// 5. MODIFIER : PATCH /journal/:date (jusqu’à minuit)
// ==========================================
router.patch("/:date", async (req: Request, res: Response) => {
    const userId = String((req as any).user.sub);
    const { humeur, energie, sommeil, anxiete, evenements, gratitude } = req.body;

    const notes = [humeur, energie, sommeil, anxiete];

    if (notes.some(note => !note || note < 1 || note > 5))  {
        return res.status(400).json({ erreur: "Les notes doivent être comprises entre 1 et 5." });
    }

    try {
        const dateRecherche = new Date(String(req.params.date));
        dateRecherche.setUTCHours(0, 0, 0, 0);
        
        const dateAujourdhui = new Date();
        dateAujourdhui.setUTCHours(0, 0, 0, 0);

        if (dateRecherche.getTime() !== dateAujourdhui.getTime()) {
            return res.status(403).json({ erreur: "Vous ne pouvez modifier que l'entrée d'aujourd'hui." });
        }

        const journal = await prisma.journalEntry.findUnique({
            where: { userId_date: { userId, date: dateRecherche }}
        });

        if (!journal) {
            return res.status(404).json({ erreur: "Entrée introuvable pour aujourd'hui." });
        }

        const entree = await prisma.journalEntry.update({
            where: { id: journal.id },
            data: { 
                humeur, 
                energie, 
                sommeil, 
                anxiete, 
                evenements, 
                gratitude 
            }
        });

        res.json(entree);

    } catch (error) {
        res.status(500).json({ erreur: "Erreur lors de la mise à jour." });
    }
});

export default router;