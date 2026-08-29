let app: any = null;
let db: any = null;
let firebaseAvailable = false;

async function initFirebase() {
  try {
    const { initializeApp } = await import('firebase/app');
    const { getFirestore } = await import('firebase/firestore');
    const firebaseConfig = await import('../../firebase-applet-config.json');

    app = initializeApp(firebaseConfig.default || firebaseConfig);
    db = getFirestore(app, (firebaseConfig.default || firebaseConfig).firestoreDatabaseId || '(default)');
    firebaseAvailable = true;
    console.log('Firebase conectado com sucesso.');
  } catch (err) {
    console.warn('Firebase indisponivel. Usando armazenamento local.', err);
    firebaseAvailable = false;
  }
}

const firebasePromise = initFirebase();

export function isFirebaseAvailable() {
  return firebaseAvailable;
}

export function getFirebaseReady() {
  return firebasePromise;
}

export { app, db };
