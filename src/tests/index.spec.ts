import { describe, expect, it, beforeAll } from 'bun:test';

import app from '../index';
import config from '../config';
import { banner } from "../banner";

const dbIsUp = (await fetch(`${config.DB_HOST}/ping`).catch((error) => {}))?.status == 200;
console.info(`Database is ${dbIsUp ? '' : 'not '}running !`);

describe('Sales count query page (/salescount?collection_name=<string>)', () => {
    it('Should fail on missing collection name parameter', async () => {
        const res = await app.request('/salescount');
        expect(res.status).toBe(400);

        const json = await res.json();
        expect(json.message).toContain('missing');
    });

    it('Should fail on non-valid collection name parameter', async () => {
        // make an int collection name
        let collection_name = 123;
        const res = await app.request(`/totalvolume?collection_name=${collection_name}`);
        expect(res.status).toBe(500);

        const json = await res.json();
        expect(json.message).toContain('Invalid');
    });

    it.skipIf(dbIsUp)('Should fail on database connection error', async () => {
        const res = await app.request('/salescount?collection_name=pomelo');
        expect(res.status).toBe(500);

        const json = await res.json();
        expect(json.message).toContain('ConnectionRefused');
    });

    it.if(dbIsUp)('Should return 200 Response on valid input', async () => {
        const collection_name = 'pomelo';
        const res = await app.request(`/salescount?collection_name=${collection_name}`);
        expect(res.status).toBe(200);

        const json = await res.json();
        expect(json).toHaveProperty('data');
    });
});

describe('Total volume query page (/totalvolume?collection_name=<string>)', () => {
    it('Should fail on missing collection name parameter', async () => {
        const res = await app.request('/totalvolume');
        expect(res.status).toBe(400);

        const json = await res.json();
        expect(json.message).toContain('missing');
    });

    it('Should fail on non-valid collection name parameter', async () => {
        let collection_name = 123;
        const res = await app.request(`/totalvolume?collection_name=${collection_name}`);
        expect(res.status).toBe(500);

        const json = await res.json();
        expect(json.message).toContain('Invalid');
    });

    it.skipIf(dbIsUp)('Should fail on database connection error', async () => {
        const res = await app.request('/totalvolume?collection_name=pomelo');
        expect(res.status).toBe(500);

        const json = await res.json();
        expect(json.message).toContain('ConnectionRefused');
    });

    it.if(dbIsUp)('Should return 200 Response on valid input', async () => {
        const collection_name = 'pomelo';
        const res = await app.request(`/totalvolume?collection_name=${collection_name}`);
        expect(res.status).toBe(200);

        const json = await res.json();
        expect(json).toHaveProperty('data');
    });
});