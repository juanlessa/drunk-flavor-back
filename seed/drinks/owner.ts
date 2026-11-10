import { resolveUsersRepository } from '@/core/accounts/infra/mongo/container';
import { Actor } from '@/shared/accessControl/actor.types';
import { Roles } from '@/shared/accessControl/roles';

/** The owner the seeded catalog is attributed to; run `seed:owner` first. */
export async function findSeedActor(): Promise<Actor> {
	const owner = await resolveUsersRepository().findByRole(Roles.owner);
	if (!owner) throw new Error('The owner does not exist; run `npm run seed:owner` before seeding the catalog');
	return { id: owner.id, role: owner.role };
}
