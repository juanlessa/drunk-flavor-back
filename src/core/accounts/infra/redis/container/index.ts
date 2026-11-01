import { ISessionVersionMarkerStore } from '@/core/accounts/stores/ISessionVersionMarker.store';
import { SessionVersionMarkerStore } from '../stores/SessionVersionMarker.store';

const sessionVersionMarkerStore: ISessionVersionMarkerStore = new SessionVersionMarkerStore();
export const resolveSessionVersionMarkerStore = () => sessionVersionMarkerStore;
