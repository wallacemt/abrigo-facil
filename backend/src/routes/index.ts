import { Router } from 'express';
import { StatusController } from '@/controllers/status.controller';
import authRoutes from '@/routes/auth.routes';
import abrigoRoutes from '@/routes/abrigo.routes';
import pessoaRoutes from '@/routes/pessoa.routes';
import checkinRoutes from '@/routes/checkin.routes';

const router = Router();



// Health check
router.use('/health', (_req, res) =>
	res.status(200).json({
		status: 'success',
		data: {
			timestamp: new Date().toISOString(),
		},
	}),
);

// All other route groups
router.use('/status', new StatusController().router);
router.use('/auth', authRoutes);
router.use('/abrigos', abrigoRoutes);
router.use('/pessoas', pessoaRoutes);
router.use('/checkin', checkinRoutes);

export default router;
