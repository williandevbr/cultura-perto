import { EventData } from '../types';

const EVENTS_STORAGE_KEY = 'cultura_perto_events';

let useLocalStorage = false;

export function setUseLocalStorage(value: boolean) {
  useLocalStorage = value;
}

export function isUsingLocalStorage() {
  return useLocalStorage;
}

function getLocalEvents(): EventData[] {
  try {
    const data = localStorage.getItem(EVENTS_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveLocalEvents(events: EventData[]) {
  localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));
}

export async function checkDuplicateEvent(nomeEvento: string, dataEvento: string, localEvento: string): Promise<boolean> {
  if (useLocalStorage) {
    const events = getLocalEvents();
    return events.some(e =>
      e.nomeEvento.toLowerCase() === nomeEvento.toLowerCase() &&
      e.dataEvento === dataEvento &&
      e.localEvento.toLowerCase() === localEvento.toLowerCase()
    );
  }

  try {
    const { collection, query, where, getDocs } = await import('firebase/firestore');
    const { db } = await import('./firebase');
    const q = query(
      collection(db, 'events'),
      where('nomeEvento', '==', nomeEvento),
      where('dataEvento', '==', dataEvento),
      where('localEvento', '==', localEvento)
    );
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (err) {
    console.warn('Firestore unavailable, checking locally:', err);
    useLocalStorage = true;
    return checkDuplicateEvent(nomeEvento, dataEvento, localEvento);
  }
}

export async function createEvent(eventData: Omit<EventData, 'criadoEm' | 'atualizadoEm' | 'status'>): Promise<string> {
  const now = Date.now();
  const newEvent: EventData = {
    ...eventData,
    criadoEm: now,
    atualizadoEm: now,
    status: 'publicado',
  };

  if (useLocalStorage) {
    const events = getLocalEvents();
    const id = 'local_' + now + '_' + Math.random().toString(36).slice(2, 9);
    newEvent.id = id;
    events.push(newEvent);
    saveLocalEvents(events);
    console.log('Evento salvo localmente com ID:', id);
    return id;
  }

  try {
    const { collection, addDoc } = await import('firebase/firestore');
    const { db } = await import('./firebase');
    const cleanEvent = Object.fromEntries(
      Object.entries(newEvent).filter(([_, v]) => v !== undefined)
    );
    const docRef = await addDoc(collection(db, 'events'), cleanEvent);
    console.log('Evento salvo no Firestore com ID:', docRef.id);
    return docRef.id;
  } catch (err) {
    console.warn('Firestore unavailable, saving locally:', err);
    useLocalStorage = true;
    return createEvent(eventData);
  }
}

export async function getEvents(): Promise<EventData[]> {
  if (useLocalStorage) {
    return getLocalEvents().filter(e => {
      const endData = e.dataFim || e.dataEvento;
      const endHora = e.horaFim || e.horaEvento || '23:59';
      if (endData) {
        const eventEndDate = new Date(`${endData}T${endHora}:00`);
        if (!isNaN(eventEndDate.getTime()) && eventEndDate < new Date()) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      const dataA = a.dataEvento ? new Date(a.dataEvento + 'T00:00:00').getTime() : Infinity;
      const dataB = b.dataEvento ? new Date(b.dataEvento + 'T00:00:00').getTime() : Infinity;
      return dataA - dataB;
    });
  }

  try {
    const { collection, getDocs, query, orderBy, doc, deleteDoc } = await import('firebase/firestore');
    const { db } = await import('./firebase');
    const q = query(collection(db, 'events'), orderBy('dataEvento', 'asc'));
    const querySnapshot = await getDocs(q);
    const now = new Date();
    const validEvents: EventData[] = [];

    for (const document of querySnapshot.docs) {
      const data = { id: document.id, ...document.data() } as EventData;
      const endData = data.dataFim || data.dataEvento;
      const endHora = data.horaFim || data.horaEvento || '23:59';

      if (endData) {
        const eventEndDate = new Date(`${endData}T${endHora}:00`);
        if (!isNaN(eventEndDate.getTime()) && eventEndDate < now) {
          await deleteDoc(doc(db, 'events', document.id)).catch(err => {
            console.error('Erro ao apagar evento expirado:', err);
          });
          continue;
        }
      }
      validEvents.push(data);
    }
    return validEvents;
  } catch (err) {
    console.warn('Firestore unavailable, using local data:', err);
    useLocalStorage = true;
    return getEvents();
  }
}

export async function getEvent(id: string): Promise<EventData | null> {
  if (useLocalStorage) {
    const events = getLocalEvents();
    return events.find(e => e.id === id) || null;
  }

  try {
    const { doc, getDoc } = await import('firebase/firestore');
    const { db } = await import('./firebase');
    const docRef = doc(db, 'events', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as EventData;
    }
    return null;
  } catch (err) {
    console.warn('Firestore unavailable, checking locally:', err);
    useLocalStorage = true;
    return getEvent(id);
  }
}

export async function deleteEvent(id: string): Promise<void> {
  if (useLocalStorage) {
    const events = getLocalEvents();
    saveLocalEvents(events.filter(e => e.id !== id));
    return;
  }

  try {
    const { doc, deleteDoc } = await import('firebase/firestore');
    const { db } = await import('./firebase');
    await deleteDoc(doc(db, 'events', id));
  } catch (err) {
    console.warn('Firestore unavailable, deleting locally:', err);
    useLocalStorage = true;
    return deleteEvent(id);
  }
}
