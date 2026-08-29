import { collection, addDoc, getDocs, query, orderBy, Timestamp, getDoc, doc, deleteDoc, where } from 'firebase/firestore';
import { db } from './firebase';
import { EventData } from '../types';

const EVENTS_COLLECTION = 'events';

export async function checkDuplicateEvent(nomeEvento: string, dataEvento: string, localEvento: string): Promise<boolean> {
  const q = query(
    collection(db, EVENTS_COLLECTION),
    where('nomeEvento', '==', nomeEvento),
    where('dataEvento', '==', dataEvento),
    where('localEvento', '==', localEvento)
  );
  const snapshot = await getDocs(q);
  return !snapshot.empty;
}

export async function createEvent(eventData: Omit<EventData, 'criadoEm' | 'atualizadoEm' | 'status'>) {
  try {
    const now = Date.now();
    const newEvent = {
      ...eventData,
      criadoEm: now,
      atualizadoEm: now,
      status: 'publicado'
    };

    // Remove undefined values since Firestore does not support them
    const cleanEvent = Object.fromEntries(
      Object.entries(newEvent).filter(([_, v]) => v !== undefined)
    );

    console.log("Attempting to save event to Firestore:", cleanEvent);
    console.log("Using database:", db);

    const docRef = await addDoc(collection(db, EVENTS_COLLECTION), cleanEvent);
    console.log("Successfully saved event with ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error creating event in Firestore:", error);
    throw error;
  }
}

export async function getEvents(): Promise<EventData[]> {
  const q = query(collection(db, EVENTS_COLLECTION), orderBy('dataEvento', 'asc'));
  const querySnapshot = await getDocs(q);
  
  const now = new Date();
  const validEvents: EventData[] = [];

  for (const document of querySnapshot.docs) {
    const data = { id: document.id, ...document.data() } as EventData;

    // Verificar expiração para apagar (auto-delete)
    // Se tiver dataFim usa ela, senão usa dataEvento
    const endData = data.dataFim || data.dataEvento;
    // Se tiver horaFim usa ela, senão usa horaEvento, senão '23:59'
    const endHora = data.horaFim || data.horaEvento || '23:59';
    
    if (endData) {
      // Create date object from string
      const eventEndDate = new Date(`${endData}T${endHora}:00`);
      
      if (!isNaN(eventEndDate.getTime()) && eventEndDate < now) {
        // Evento expirou, apagar e não retornar
        await deleteDoc(doc(db, EVENTS_COLLECTION, document.id)).catch(err => {
          console.error("Erro ao apagar evento expirado:", err);
        });
        continue;
      }
    }

    validEvents.push(data);
  }
  
  return validEvents;
}

export async function getEvent(id: string): Promise<EventData | null> {
  const docRef = doc(db, EVENTS_COLLECTION, id);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as EventData;
  }
  
  return null;
}

export async function deleteEvent(id: string): Promise<void> {
  const docRef = doc(db, EVENTS_COLLECTION, id);
  await deleteDoc(docRef);
}
