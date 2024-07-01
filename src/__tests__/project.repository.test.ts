import sqlite from 'better-sqlite3';
import BetterSqlite3 from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import dbService from '../services/db.service';
import projectRepository from '../repositories/project.repository';

jest.mock('uuid', () => ({
	v4: jest.fn(),
}));

let db: BetterSqlite3.Database;

beforeAll(() => {
	db = new sqlite(':memory:');
	db.exec(`
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

describe('Project Repository', () => {
	beforeEach(() => {
		db.exec('DELETE FROM projects');
	});

	test('should create a project', () => {
		const id = 'unique-id';
		(uuidv4 as jest.Mock).mockReturnValue(id);

		projectRepository.create('Project 1', 'Description 1');

		const projects = projectRepository.getAll();
		expect(projects.length).toBe(1);
		expect(projects[0]).toEqual({
			id,
			name: 'Project 1',
			description: 'Description 1',
		});
	});

	test('should get all projects', () => {
		db.prepare(
			'INSERT INTO projects (id, name, description) VALUES (?, ?, ?)',
		).run('1', 'Project 1', 'Description 1');
		db.prepare(
			'INSERT INTO projects (id, name, description) VALUES (?, ?, ?)',
		).run('2', 'Project 2', 'Description 2');

		const projects = projectRepository.getAll();
		expect(projects.length).toBe(2);
		expect(projects[0]).toEqual({
			description: 'Description 1',
			id: '1',
			name: 'Project 1',
		});
		expect(projects[1]).toEqual({
			description: 'Description 2',
			id: '2',
			name: 'Project 2',
		});
	});

	test('should find a project by id', () => {
		const id = '1';
		db.prepare(
			'INSERT INTO projects (id, name, description) VALUES (?, ?, ?)',
		).run(id, 'Project 1', 'Description 1');

		const project = projectRepository.findById(id);
		expect(project).toEqual({
			id,
			name: 'Project 1',
			description: 'Description 1',
		});
	});

	test('should return null if could not find project by id', () => {
		const id = '1';
		db.prepare(
			'INSERT INTO projects (id, name, description) VALUES (?, ?, ?)',
		).run(id, 'Project 1', 'Description 1');

		const project = projectRepository.findById('2');
		expect(project).toBeNull();
	});

	test('should remove a project by id', () => {
		const id = '1';
		db.prepare(
			'INSERT INTO projects (id, name, description) VALUES (?, ?, ?)',
		).run(id, 'Project 1', 'Description 1');

		projectRepository.remove(id);
		const project = projectRepository.findById(id);
		expect(project).toBeNull();
	});

	test('should update a project', () => {
		const id = '1';
		db.prepare(
			'INSERT INTO projects (id, name, description) VALUES (?, ?, ?)',
		).run(id, 'Project 1', 'Description 1');

		projectRepository.update('Updated Project', 'Updated Description', id);

		const project = projectRepository.findById(id);
		expect(project).toEqual({
			id,
			name: 'Updated Project',
			description: 'Updated Description',
		});
	});
});
