import {Router,  type Request, type Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"
import { authentifier } from "../middlewares/auth.js";
import prisma from "../../utils/prisma.js"


const router = Router()

router.post("/register", async(req: Request, res: Response)=>{
    const { email, password, nom, surnom } = req.body
    if(!email || !password){
        return res.status(400).json({erreur:"email et mot de passe requis!"})
    }
    try{
        const hash = await bcrypt.hash(password,10)
        const user = await prisma.user.create({ data: { email, password: hash, nom, surnom }})
        res.status(201).json({id: user.id, email: user.email, nom: user.nom, role: user.role, createdAt: user.createdAt})
    }catch{
        res.status(400).json({ erreur: "Les informations soumises ne sont pas valides" })
    }
});

router.post("/login", async(req:Request, res:Response)=>{
    const { email, password } = req.body

    if (!email || !password) {
        return res.status(400).json({ erreur: "Email et mot de passe requis" });
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if(!user) return res.status(401).json({erreur : "Identifiant Invalide!"})

    const ok = await bcrypt.compare(password, user.password)
    if(!ok) return res.status(401).json({ erreur: "Mot de passe invalide!" })

    const token = jwt.sign(
        { sub: user.id, role: user.role },
        process.env.JWT_SECRET!,
        { expiresIn: "2h" }
    );
    res.json({ token })
});

router.get("/me", authentifier, async (req: Request, res: Response) => {
    const id = (req as any).user.sub

    const user = await prisma.user.findUnique({
        where: { id },
        select: { id: true, email: true, nom: true, surnom: true, role: true, createdAt: true },
    });

    if (!user) return res.status(404).json({ erreur: "Utilisateur introuvable" })
    res.json(user)
});

export default router;