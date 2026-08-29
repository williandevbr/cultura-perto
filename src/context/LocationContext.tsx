import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

export interface UserLocation {
  estado: string;
  cidade: string;
}

interface LocationContextValue {
  location: UserLocation | null;
  isLocationDefined: boolean;
  isDetecting: boolean;
  error: string | null;
  detectLocation: () => void;
  setLocation: (estado: string, cidade: string) => void;
  clearLocation: () => void;
}

const STORAGE_KEY = 'cultura_perto_location';

const LocationContext = createContext<LocationContextValue>({
  location: null,
  isLocationDefined: false,
  isDetecting: false,
  error: null,
  detectLocation: () => {},
  setLocation: () => {},
  clearLocation: () => {},
});

function loadSavedLocation(): UserLocation | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const loc = JSON.parse(raw) as UserLocation;
    if (loc.estado && loc.cidade) return loc;
    return null;
  } catch {
    return null;
  }
}

function saveLocation(loc: UserLocation) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(loc));
}

const ESTADO_POR_NOME: Record<string, string> = Object.fromEntries([
  ['acre', 'AC'], ['alagoas', 'AL'], ['amapa', 'AP'], ['amazonas', 'AM'],
  ['bahia', 'BA'], ['ceara', 'CE'], ['distrito federal', 'DF'],
  ['espirito santo', 'ES'], ['goias', 'GO'], ['maranhao', 'MA'],
  ['mato grosso', 'MT'], ['mato grosso do sul', 'MS'], ['minas gerais', 'MG'],
  ['para', 'PA'], ['paraiba', 'PB'], ['parana', 'PR'], ['pernambuco', 'PE'],
  ['piaui', 'PI'], ['rio de janeiro', 'RJ'], ['rio grande do norte', 'RN'],
  ['rio grande do sul', 'RS'], ['rondonia', 'RO'], ['roraima', 'RR'],
  ['santa catarina', 'SC'], ['sao paulo', 'SP'], ['sergipe', 'SE'],
  ['tocantins', 'TO'],
]);

function normalize(str: string): string {
  return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}

async function reverseGeocode(lat: number, lng: number): Promise<{ cidade: string; estado: string } | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=pt-BR&zoom=10`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const data = await res.json();
    const addr = data.address ?? {};
    const cidade = addr.city || addr.town || addr.village || addr.municipality;
    if (!cidade) return null;
    const isoUf = addr['ISO3166-2-lvl4']?.split('-')[1];
    const estado = isoUf || (addr.state ? ESTADO_POR_NOME[normalize(addr.state)] : undefined);
    if (!estado) return null;
    return { cidade, estado };
  } catch {
    return null;
  }
}

export function LocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocationState] = useState<UserLocation | null>(loadSavedLocation);
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [triedDetect, setTriedDetect] = useState(false);

  const detectLocation = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setError('Seu navegador nao suporta localizacao.');
      setTriedDetect(true);
      return;
    }
    setIsDetecting(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const loc = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
        setIsDetecting(false);
        setTriedDetect(true);
        if (loc) {
          saveLocation(loc);
          setLocationState(loc);
        } else {
          setError('Nao identificamos sua cidade. Escolha manualmente.');
        }
      },
      () => {
        setIsDetecting(false);
        setTriedDetect(true);
        setError('Permissao negada. Escolha seu estado e cidade.');
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    );
  }, []);

  const setLocation = useCallback((estado: string, cidade: string) => {
    const loc: UserLocation = { estado, cidade };
    saveLocation(loc);
    setLocationState(loc);
    setError(null);
  }, []);

  const clearLocation = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setLocationState(null);
    setTriedDetect(false);
    setError(null);
  }, []);

  // Auto-detect on first visit
  useEffect(() => {
    if (!location && !triedDetect) {
      detectLocation();
    }
  }, [location, triedDetect, detectLocation]);

  return (
    <LocationContext.Provider
      value={{
        location,
        isLocationDefined: !!location,
        isDetecting,
        error,
        detectLocation,
        setLocation,
        clearLocation,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  return useContext(LocationContext);
}
