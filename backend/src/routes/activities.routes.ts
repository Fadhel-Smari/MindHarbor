import { Router, type Request, type Response } from "express";
import prisma from "../../utils/prisma.js";
import { parsePagination, buildMeta } from "../../utils/paginate.js";

const router = Router();

// ==========================================
// GET /activities
// ==========================================
router.get("/", async (req: Request, res: Response) => {
    const { page, limit, skip, take } = parsePagination(req.query);
    const order = req.query.order === 'desc' ? 'desc' : 'asc';

    try {
        const total = await prisma.activity.count();
        const data = await prisma.activity.findMany({
            orderBy: { createdAt: order },
            skip,
            take
        });

        const meta = buildMeta(page, limit, total);

        res.json({ data, meta });
    } catch {
        res.status(500).json({ erreur: "Erreur lors de la récupération des activités." });
    }
});

export default router;