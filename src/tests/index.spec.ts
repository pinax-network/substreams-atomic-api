import { describe, expect, it, beforeAll } from 'bun:test';
import { ZodError } from 'zod';

import config from '../config';
import { banner } from "../banner";
import { generateApp }  from '../index';
import { salesCountQuery, totalVolumeQuery } from '../queries';
import {SalesCountQueryResponseSchema ,TotalVolumeQueryResponseSchema } from '../schemas';

const app = generateApp();

const dbIsUp = (await fetch(`${config.dbHost}/ping`).catch((error) => {}))?.status == 200;
console.info(`Database is ${dbIsUp ? '' : 'not '}running !`);

describe('Sales count query page (/salescount?collection_name=<string>)', () => {
    let valid_collection_name: string;

    beforeAll(() => {
        valid_collection_name = 'pomelo';
    });

    /*it.each(['', -1])('Should fail on missing or invalid collection name parameter: collection_name=%s', async (collection_name: string) => {
        const res = await app.request(`/salescount?collection_name=${collection_name}`);
        expect(res.status).toBe(400);

        const json = await res.json();
        expect(json.success).toBe(false);
        expect(['invalid_union', 'too_small']).toContain(json.error.issues[0].code);
    });

    /*it(`Should not allow more than the maximum number of elements to be queried (${config.maxElementsQueried})`, async () => {
        const res = await app.request(`/sales_count?collection_name=${Array(config.maxElementsQueried + 1).fill(valid_collection_name).toString()}`);
        expect(res.status).toBe(400);

        const json = await res.json();
        expect(json.success).toBe(false);
        expect(json.error.issues[0].code).toBe('too_big');
    });*/

    it('Should return (200) empty JSON on valid input', async () => {
        const res = await app.request(`/salescount?collection_name=${valid_collection_name}`);
        console.log('collection_name=%s', valid_collection_name);
        console.log(res);
        expect(res.status).toBe(200);

        const json = await res.json();
        expect(json).toHaveLength(0);
    });
});
/*
describe('Total volume query page (/totalvolume?collection_name=<string>)', () => {
    let valid_collection_name: string;

    beforeAll(() => {
        valid_collection_name = 'pomelo';
    });

    it.each(['', -1])('Should fail on missing or invalid collection name parameter: collection_name=', async (collection_name: string) => {
        const res = await app.request(`/totalvolume?collection_name=${collection_name}`);
        expect(res.status).toBe(400);

        const json = await res.json();
        expect(json.success).toBe(false);
        expect(['invalid_union', 'too_small']).toContain(json.error.issues[0].code);
    });

    /*it(`Should not allow more than the maximum number of elements to be queried (${config.maxElementsQueried})`, async () => {
        const res = await app.request(`/totalvolume?collection_name=${Array(config.maxElementsQueried + 1).fill(valid_collection_name).toString()}`);
        expect(res.status).toBe(400);

        const json = await res.json();
        expect(json.success).toBe(false);
        expect(json.error.issues[0].code).toBe('too_big');
    });

    it('Should return (200) empty JSON on valid input', async () => {
        const res = await app.request(`/totalvolume?collection_name=${valid_collection_name}`);
        expect(res.status).toBe(200);

        const json = await res.json();
        expect(json).toHaveLength(0);
    });
});*/