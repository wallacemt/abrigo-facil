import { Router } from 'express';

const router = Router();

// Temporary placeholder route while auth/users module is not implemented.
router.get('/', (_req, res) => {
	res.status(200).json({
		status: 'success',
		data: [],
	});
});

export default router;
