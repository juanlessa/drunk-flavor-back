import { Actor } from '@/shared/accessControl/actor.types';
import { Role, Roles } from '@/shared/accessControl/roles';

/** The creator the factories give to the records they build, when a test does not need a specific one. */
export const FACTORY_CREATOR_ID = '66b0000000000000000000a1';

/** An owner, who may change any record, whose id is the default creator of the factories. */
export const OWNER_ACTOR: Actor = { id: FACTORY_CREATOR_ID, role: Roles.owner };

/** Adds the actor a catalog service needs to the data of a test call. */
export const withActor = <T extends object>(data: T, actor: Actor = OWNER_ACTOR) => ({ ...data, actor });

/** Gives the data of a record a creator, unless it already has one. */
export const withCreator = <T extends object>(data: T, createdBy: string = FACTORY_CREATOR_ID) => ({
	createdBy,
	...data,
});

/** Gives the changes to a record a last editor, unless they already have one. */
export const withEditor = <T extends object>(data: T, updatedBy: string = FACTORY_CREATOR_ID) => ({
	updatedBy,
	...data,
});

/** Another user, who did not create what the factories build. */
export const OTHER_USER_ID = '66b0000000000000000000b2';

export const actorWithRole = (role: Role, id: string = OTHER_USER_ID): Actor => ({ id, role });
