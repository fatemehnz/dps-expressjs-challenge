import { Request, Response } from 'express';
import reportRepository from '../repositories/report.repository';

function getAll(req: Request, res: Response) {
	const result = reportRepository.getAll();
	res.json({ status: 'success', data: result });
}

function create(req: Request, res: Response) {
	reportRepository.create(req.body.text, req.body.project_id);
	res.json({ status: 'success', message: 'Insert successfully!' });
}

function findById(req: Request, res: Response) {
	const result = reportRepository.findById(req.params.id);
	res.json({ status: 'success', data: result });
}

function remove(req: Request, res: Response) {
	reportRepository.remove(req.params.id);
	res.json({ status: 'success', message: 'Delete successfully!' });
}

function update(req: Request, res: Response) {
	reportRepository.update(req.body.project_id, req.body.text, req.params.id);
	res.json({ status: 'success', message: 'Updated successfully!' });
}

function specialReport(req: Request, res: Response) {
	const result = reportRepository.specialReport();
	res.json({ status: 'success', data: result });
}

export default { getAll, create, findById, remove, update, specialReport };
