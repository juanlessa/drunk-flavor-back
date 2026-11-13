import { resolveUsersRepository } from '@/core/accounts/infra/mongo/container';
import { resolveSessionVersionMarkerStore } from '@/core/accounts/infra/redis/container';
import { ValidateOngoingSessionService } from './ValidateOngoingSession.service';

const usersRepository = resolveUsersRepository();
const sessionVersionMarkerStore = resolveSessionVersionMarkerStore();

const validateOngoingSessionService = new ValidateOngoingSessionService(usersRepository, sessionVersionMarkerStore);

export const resolveValidateOngoingSessionService = () => validateOngoingSessionService;
