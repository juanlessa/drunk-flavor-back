import { resolveUsersRepository } from '@/core/accounts/infra/mongo/container';
import { resolveSessionVersionMarkerStore } from '@/core/accounts/infra/redis/container';
import { ValidateOngoingSessionService } from './ValidateOngoingSession.service';

const validateOngoingSessionService = new ValidateOngoingSessionService(
	resolveUsersRepository(),
	resolveSessionVersionMarkerStore(),
);
export const resolveValidateOngoingSessionService = () => validateOngoingSessionService;
