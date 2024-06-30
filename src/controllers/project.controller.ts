import { Request, Response } from 'express';
import projectRepository from '../repositories/project.repository';

function getAll(req: Request, res: Response) {
	const result = projectRepository.getAll();
	res.json({ status: 'success', data: result });
}

function create(req: Request, res: Response) {
	projectRepository.create(req.body.name, req.body.description);
	res.json({ status: 'success', message: 'Insert successfully!' });
}

function findById(req: Request, res: Response) {
	const result = projectRepository.findById(req.params.id);
	res.json({ status: 'success', data: result });
}

function remove(req: Request, res: Response) {
	projectRepository.remove(req.params.id);
	res.json({ status: 'success', message: 'Delete successfully!' });
}

function update(req: Request, res: Response) {
	projectRepository.update(
		req.body.name,
		req.body.description,
		req.params.id,
	);
	res.json({ status: 'success', message: 'Updated successfully!' });
}

export default { getAll, create, findById, remove, update };
