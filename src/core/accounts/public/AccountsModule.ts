import { AuthenticatedSession } from '@/core/accounts/dtos/session.dtos';
import { User } from '@/core/accounts/entities/user.entity';
import { IAccountsModule } from './IAccountsModule';
import { FindPublicProfilesByIds, PublicProfile } from './findPublicProfilesByIds/findPublicProfilesByIds.dtos';
import { FindPublicProfilesByIdsService } from './findPublicProfilesByIds/FindPublicProfilesByIds.service';
import { FindUserById } from './findUserById/findUserById.dtos';
import { FindUserByIdService } from './findUserById/FindUserById.service';
import { ValidateOngoingSession } from './validateOngoingSession/validateOngoingSession.dtos';
import { ValidateOngoingSessionService } from './validateOngoingSession/ValidateOngoingSession.service';
import { ValidateSessionRenewal } from './validateSessionRenewal/validateSessionRenewal.dtos';
import { ValidateSessionRenewalService } from './validateSessionRenewal/ValidateSessionRenewal.service';

export class AccountsModule implements IAccountsModule {
	constructor(
		private findUserByIdService: FindUserByIdService,
		private findPublicProfilesByIdsService: FindPublicProfilesByIdsService,
		private validateOngoingSessionService: ValidateOngoingSessionService,
		private validateSessionRenewalService: ValidateSessionRenewalService,
	) {}

	findUserById(data: FindUserById): Promise<User | null> {
		return this.findUserByIdService.execute(data);
	}

	findPublicProfilesByIds(data: FindPublicProfilesByIds): Promise<PublicProfile[]> {
		return this.findPublicProfilesByIdsService.execute(data);
	}

	validateOngoingSession(data: ValidateOngoingSession): Promise<AuthenticatedSession> {
		return this.validateOngoingSessionService.execute(data);
	}

	validateSessionRenewal(data: ValidateSessionRenewal): Promise<AuthenticatedSession> {
		return this.validateSessionRenewalService.execute(data);
	}
}
