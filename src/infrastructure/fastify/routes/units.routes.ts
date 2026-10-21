import { createUnitController } from '@/core/drinks/useCases/units/create/createUnit.controller';
import { createUnitSchema } from '@/core/drinks/useCases/units/create/createUnit.schema';
import { deleteUnitController } from '@/core/drinks/useCases/units/delete/deleteUnit.controller';
import { deleteUnitSchema } from '@/core/drinks/useCases/units/delete/deleteUnit.schema';
import { getUnitController } from '@/core/drinks/useCases/units/get/getUnit.controller';
import { getUnitSchema } from '@/core/drinks/useCases/units/get/getUnit.schema';
import { listUnitsController } from '@/core/drinks/useCases/units/list/listUnits.controller';
import { listUnitsQuerySchema } from '@/core/drinks/useCases/units/list/listUnits.schema';
import { updateUnitController } from '@/core/drinks/useCases/units/update/updateUnit.controller';
import { updateUnitSchema } from '@/core/drinks/useCases/units/update/updateUnit.schema';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { pluginGenerator } from '../helpers/fastify.helpers';
import { verifyAndRenewToken } from '../middlewares/verifyAndRenewToken';
import { verifyPermissions } from '../middlewares/verifyPermissions';
import { Routes } from '../types/fastify.types';

const routes: Routes = (server) => {
	server.withTypeProvider<ZodTypeProvider>().post(
		'/units',
		{
			schema: { tags: ['Units'], body: createUnitSchema },
			preValidation: [verifyAndRenewToken, verifyPermissions('create', 'Unit')],
		},
		createUnitController,
	);
	server
		.withTypeProvider<ZodTypeProvider>()
		.get('/units/:id', { schema: { tags: ['Units'], params: getUnitSchema } }, getUnitController);
	server
		.withTypeProvider<ZodTypeProvider>()
		.get('/units', { schema: { tags: ['Units'], querystring: listUnitsQuerySchema } }, listUnitsController);
	server.withTypeProvider<ZodTypeProvider>().patch(
		'/units',
		{
			schema: { tags: ['Units'], body: updateUnitSchema },
			preValidation: [verifyAndRenewToken, verifyPermissions('update', 'Unit')],
		},
		updateUnitController,
	);
	server.withTypeProvider<ZodTypeProvider>().delete(
		'/units',
		{
			schema: { tags: ['Units'], body: deleteUnitSchema },
			preValidation: [verifyAndRenewToken, verifyPermissions('delete', 'Unit')],
		},
		deleteUnitController,
	);
};

export const unitsRoutes = pluginGenerator(routes);
