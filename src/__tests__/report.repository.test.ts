import sqlite from 'better-sqlite3';
import BetterSqlite3 from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import dbService from '../services/db.service';
import reportRepository from '../repositories/report.repository';

jest.mock('uuid', () => ({
	v4: jest.fn(),
}));

let db: BetterSqlite3.Database;

beforeAll(() => {
	db = new sqlite(':memory:');
	db.exec(`
    CREATE TABLE reports (
      id TEXT PRIMARY KEY,
      text TEXT,
      projectid TEXT
    );
    CREATE TABLE projects (
      id TEXT PRIMARY KEY,
      name TEXT,
      description TEXT
    );
  `);

	jest.spyOn(dbService, 'query').mockImplementation(
		(
			sql: string,
			params?: { [key: string]: string | number | undefined },
		) => {
			const stmt = db.prepare(sql);
			return params ? stmt.all(params) : stmt.all();
		},
	);

	jest.spyOn(dbService, 'run').mockImplementation(
		(
			sql: string,
			params?: { [key: string]: string | number | undefined },
		) => {
			const stmt = db.prepare(sql);
			return params ? stmt.run(params) : stmt.run();
		},
	);
});

afterAll(() => {
	db.close();
});

describe('Report Repository', () => {
	beforeEach(() => {
		db.exec('DELETE FROM reports');
		db.exec('DELETE FROM projects');
	});

	test('should create a report', () => {
		const id = 'unique-id';
		(uuidv4 as jest.Mock).mockReturnValue(id);

		reportRepository.create('Text 1', 'ProjectId 1');

		const reports = db.prepare('SELECT * FROM reports').all();
		expect(reports.length).toBe(1);
		expect(reports[0]).toEqual({
			id,
			text: 'Text 1',
			projectid: 'ProjectId 1',
		});
	});

	test('should get all reports', () => {
		const projectId = 'ProjectId-1';
		db.prepare(
			'INSERT INTO projects (id, name, description) VALUES (?, ?, ?)',
		).run(projectId, 'Name', 'DESC');
		db.prepare(
			'INSERT INTO reports (id, text, projectid) VALUES (?, ?, ?)',
		).run('1', 'Text 1', projectId);
		db.prepare(
			'INSERT INTO reports (id, text, projectid) VALUES (?, ?, ?)',
		).run('2', 'Text 2', projectId);

		const reports = reportRepository.getAll();
		expect(reports.length).toBe(2);
		expect(reports[0]).toEqual({
			id: '1',
			text: 'Text 1',
			projectid: projectId,
			project_name: 'Name',
		});
		expect(reports[1]).toEqual({
			id: '2',
			text: 'Text 2',
			projectid: projectId,
			project_name: 'Name',
		});
	});

	test('should find a report by id', () => {
		const id = '1';
		db.prepare(
			'INSERT INTO reports (id, text, projectid) VALUES (?, ?, ?)',
		).run(id, 'Text 1', 'ProjectId 1');

		const report = reportRepository.findById(id);
		expect(report).toEqual({
			id,
			text: 'Text 1',
			projectid: 'ProjectId 1',
		});
	});

	test('should return null if could not find report by id', () => {
		const id = '1';
		db.prepare(
			'INSERT INTO reports (id, text, projectid) VALUES (?, ?, ?)',
		).run(id, 'Text 1', 'ProjectId 1');

		const report = reportRepository.findById('2');
		expect(report).toBeNull();
	});

	test('should remove a report by id', () => {
		const id = '1';
		db.prepare(
			'INSERT INTO reports (id, text, projectid) VALUES (?, ?, ?)',
		).run(id, 'Text 1', 'ProjectId 1');

		reportRepository.remove(id);
		const report = reportRepository.findById(id);
		expect(report).toBeNull();
	});

	test('should update a report', () => {
		const id = '1';
		db.prepare(
			'INSERT INTO reports (id, text, projectid) VALUES (?, ?, ?)',
		).run(id, 'Text 1', 'ProjectId 1');

		reportRepository.update('ProjectId Updated', 'Text Updated', id);

		const report = reportRepository.findById(id);
		expect(report).toEqual({
			id,
			text: 'Text Updated',
			projectid: 'ProjectId Updated',
		});
	});
});
