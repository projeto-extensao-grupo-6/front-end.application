import React, { useState, useRef, useEffect } from 'react';
import { GoogleMap, Marker, LoadScript, DirectionsRenderer } from '@react-google-maps/api';
import { Reorder, AnimatePresence } from 'framer-motion';
import Logo from "../../assets/logo/logo-sidebar.png";
import {
  ArrowLeft,
  MapPin,
  Trash2,
  Edit2,
  Plus,
  Clock,
  Navigation,
  Flag,
  GripVertical,
  Search,
  Home,
  Map,
  Store // Adicione este ícone
} from 'lucide-react';

const MAPS_KEY = import.meta.env.VITE_MAPS_KEY;

const mapContainerStyle = {
  height: '100%',
  width: '100%',
};

const defaultCenter = {
  lat: -23.64403375840359,
  lng: -46.783811794234204
};

const maskCep = (value) => {
  if (!value) return "";
  let v = value.replace(/\D/g, "");
  if (v.length > 8) v = v.slice(0, 8);
  if (v.length > 5) {
    return v.replace(/^(\d{5})(\d)/, "$1-$2");
  }
  return v;
};

export default function RotasResponsivoCompacto() {
  const [addresses, setAddresses] = useState([
    { id: 'init-0', cep: '', numero: '', formatted: 'Ponto Inicial - Sede Léo Vidros', coords: defaultCenter, isFixed: true }
  ]);

  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [totalTime, setTotalTime] = useState('0 min');
  const [totalDistance, setTotalDistance] = useState('0 km');
  const [finalPoint, setFinalPoint] = useState('N/A');
  const [editingId, setEditingId] = useState(null);

  const cepInputRef = useRef(null);
  const numeroInputRef = useRef(null);

  useEffect(() => {
    const currentMarkers = addresses.map(a => a.coords);

    if (currentMarkers.length >= 2) {
      calculateRoute(currentMarkers);
    } else {
      setDirectionsResponse(null);
      setTotalTime('0 min');
      setTotalDistance('0 km');
    }

    if (addresses.length > 0) {
      const lastAddr = addresses[addresses.length - 1];
      setFinalPoint(lastAddr.formatted.split(',')[0]);
    }
  }, [addresses]);

  const calculateRoute = (currentMarkers) => {
    const waypoints = currentMarkers.slice(1, -1).map((marker) => ({
      location: marker,
      stopover: true,
    }));

    const directionsService = new window.google.maps.DirectionsService();
    directionsService.route(
      {
        origin: currentMarkers[0],
        destination: currentMarkers[currentMarkers.length - 1],
        waypoints,
        travelMode: window.google.maps.TravelMode.DRIVING,
        drivingOptions: {
          departureTime: new Date(Date.now()),
          trafficModel: "bestguess",
        },
      },
      (result, status) => {
        if (status === "OK" && result) {
          setDirectionsResponse(result);
          let totalDistVal = 0;
          let totalDurVal = 0;
          const legs = result.routes[0].legs;
          legs.forEach(leg => {
            totalDistVal += leg.distance.value;
            totalDurVal += leg.duration.value;
          });
          setTotalDistance((totalDistVal / 1000).toFixed(1) + ' km');
          const hours = Math.floor(totalDurVal / 3600);
          const minutes = Math.floor((totalDurVal % 3600) / 60);
          let timeString = hours > 0 ? `${hours}h ${minutes}min` : `${minutes}min`;
          setTotalTime(timeString);
        }
      }
    );
  };

  const geoCodeCepNumero = async (cep, numero) => {
    try {
      const query = `${cep},${numero}`;
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${MAPS_KEY}`
      );
      const data = await response.json();
      if (data.status === "OK" && data.results.length > 0) {
        return {
          location: data.results[0].geometry.location,
          formatted: data.results[0].formatted_address
        };
      }
      return null;
    } catch (err) {
      console.error("Erro ao geocodificar:", err);
      return null;
    }
  };

  const addCep = async (cep, numero) => {
    if (!cep) return;
    const cleanCep = cep.replace(/\D/g, "");
    
    const cepExists = addresses.some(addr => addr.cep === cleanCep);
    if (cepExists) {
      alert("Este CEP já foi adicionado!");
      return;
    }
    
    const result = await geoCodeCepNumero(cleanCep, numero);
    if (result) {
      const newAddress = {
        id: `id-${Date.now()}`,
        cep: cleanCep,
        numero,
        formatted: result.formatted,
        coords: result.location,
        isFixed: false
      };
      setAddresses((prev) => [...prev, newAddress]);
      cepInputRef.current.value = "";
      numeroInputRef.current.value = "";
    }
  };

  const deleteAddress = (id) => {
    setAddresses(addresses.filter(a => a.id !== id));
  };

  const saveEdit = async (id, newCep, newNumero) => {
    const cleanCep = newCep.replace(/\D/g, "");
    const result = await geoCodeCepNumero(cleanCep, newNumero);
    if (result) {
      const index = addresses.findIndex((a) => a.id === id);
      const newAddresses = [...addresses];
      newAddresses[index] = { ...newAddresses[index], cep: cleanCep, numero: newNumero, formatted: result.formatted, coords: result.location };
      setAddresses(newAddresses);
      setEditingId(null);
    }
  };

  const handleReorder = (newOrder) => {
    setAddresses([addresses[0], ...newOrder]);
  };

  const fixedItem = addresses[0];
  const draggableItems = addresses.slice(1);

  return (
    <LoadScript googleMapsApiKey={MAPS_KEY}>
      <div className="min-h-screen bg-[#f8fafc] font-sans pb-6 flex flex-col items-center">

        {/* Header */}
        <div className="w-full bg-white border-b border-gray-200 px-4 sm:px-6 py-4 mb-6 flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-4">
            <button onClick={() => window.history.back()} className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition border border-gray-200 cursor-pointer">
              <ArrowLeft size={18} />
            </button>
            <h1 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
              <Map size={20} className="text-[#002B4E]" />
              <span className="hidden sm:inline">Rotas de Serviços</span>
            </h1>
          </div>
          <div className="flex items-center">
            <img
              src={Logo}
              alt="Logo"
              className="h-10 sm:h-10 w-auto object-contain drop-shadow-sm"
            />
          </div>
        </div>
        <br></br>

        <main className="w-full max-w-[1500px] px-4 flex flex-col gap-5">

          {/* Barra de Controle */}
          <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden flex flex-col lg:flex-row">

            {/* INPUTS */}
            <div className="p-4 lg:w-[40%] bg-gray-50 border-b lg:border-b-0 lg:border-r border-gray-200 flex flex-col justify-center">
              <h3 className="text-xs font-bold text-[#002B4E] uppercase mb-2 flex items-center gap-2">
                <MapPin size={14} /> Adicionar Parada
              </h3>
              <div className="flex gap-2 items-center py-1">
                <input
                  ref={cepInputRef}
                  onInput={(e) => (e.target.value = maskCep(e.target.value))}
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#002B4E]"
                  placeholder="CEP"
                />
                <input
                  ref={numeroInputRef}
                  className="w-10 sm:w-24 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#002B4E]"
                  placeholder="Nº"
                />
                <button
                  onClick={() => addCep(cepInputRef.current.value, numeroInputRef.current.value)}
                  className="bg-[#002B4E] hover:bg-[#004074] text-white p-2 rounded-lg transition shadow-sm cursor-pointer"
                >
                  <Plus size={20} />
                </button>
              </div>
            </div>

            {/* KPIs */}
            <div className="flex-1 p-4 grid grid-cols-3 gap-2 items-center bg-white text-center">
              <div className="flex flex-col items-center gap-1.5">
                <div className="text-[#002B4E] mb-1 flex flex-row items-center gap-2">
                <Clock size={20} />
                <span className="text-sm sm:text-lg font-bold text-gray-800">Tempo Estimado</span>
                </div>
                <span className="text-sm sm:text-lg font-bold text-gray-400">{totalTime}</span>
              </div>

              <div className="flex flex-col items-center border-l border-gray-100 gap-2 ">
                <div className="text-[#002B4E] mb-1 flex flex-row items-center gap-2">
                  <Navigation size={20} />
                  <span className="text-sm sm:text-lg font-bold text-gray-800">Distância Total</span>
                </div>
                <span className="text-sm sm:text-lg font-bold text-gray-400">{totalDistance}</span>
              </div>
              
              <div className="flex flex-col items-center gap-1.5 border-l border-gray-100">
                <div className="text-[#002B4E] mb-1 flex flex-row items-center gap-2"><Flag size={20} />
                <span className="text-sm sm:text-lg font-bold text-gray-800">Destino</span>
                </div>
                <span className="text-sm sm:text-lg font-bold text-gray-400">{finalPoint}</span>
              </div>
            </div> 
          </div>

          {/* Conteúdo Principal */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* MAPA */}
            <div className="lg:col-span-2 bg-white border border-gray-200 rounded-md shadow-sm overflow-hidden flex flex-col h-[300px] lg:h-[420px]">
              <div className="bg-[#002B4E] text-white py-2 px-4 font-bold text-xs flex justify-between items-center">
                <span className="flex items-center gap-2"><Navigation size={14} /> Mapa</span>
              </div>
              <div className="grow relative bg-gray-100">
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  center={addresses.length > 0 ? addresses[Math.floor(addresses.length / 2)].coords : defaultCenter}
                  zoom={12}
                  options={{ disableDefaultUI: false, zoomControl: true, streetViewControl: false, mapTypeControl: false }}
                >
                  {addresses.map((addr, i) => (
                    <Marker
                      key={addr.id}
                      position={addr.coords}
                      label={{ text: `${i + 1}`, color: "white", fontWeight: "bold", fontSize: "12px" }}
                    />
                  ))}
                  {directionsResponse && (
                    <DirectionsRenderer options={{ directions: directionsResponse, suppressMarkers: true }} />
                  )}
                </GoogleMap>
              </div>
            </div>

            {/* LISTA DRAGGABLE */}
            <div className="bg-white border border-gray-200 rounded-md shadow-sm overflow-hidden flex flex-col h-[300px] lg:h-[420px]">
              <div className="bg-[#002B4E] text-white py-2 px-4 font-bold text-md flex justify-between items-center z-10">
                <span className="flex items-center gap-2"><MapPin size={14} />Paradas Cadastradas ({addresses.length})</span>
              </div>

              <div className="flex-1 overflow-y-auto bg-[#f8fafc] p-3 scrollbar-thin">

                {/* Local Fixo (Léo Vidros) */}
                <div className="bg-white rounded border-l-4 border-[#002B4E] shadow-sm p-4 flex gap-3 items-center mb-4">
                  <div className="w-7 h-7 rounded-full bg-[#002B4E] flex items-center justify-center text-white text-xs font-bold shrink-0">
                    <Store size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-800 text-md truncate">{fixedItem.formatted.split(',')[0]}</p>
                  </div>
                </div>
                <br></br>

                {/* LISTA MÓVEL */}
                <Reorder.Group axis="y" values={draggableItems} onReorder={handleReorder} className="space-y-3">
                  <AnimatePresence>
                    {draggableItems.map((addr, index) => {
                      const realIndex = index + 1;
                      return (
                        <Reorder.Item
                          key={addr.id}
                          value={addr}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          whileDrag={{ scale: 1.02, boxShadow: "0px 5px 10px rgba(0,0,0,0.1)" }}
                          className="bg-white rounded border border-gray-200 p-2 flex gap-2 items-center shadow-sm cursor-grab active:cursor-grabbing"
                        >
                          <div className="text-gray-300 cursor-grab"><GripVertical size={16} /></div>

                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[15px] font-bold shrink-0 text-white ${realIndex === addresses.length - 1 ? 'bg-red-500' : 'bg-blue-500'}`}>
                            {realIndex + 1}
                          </div>

                          {editingId === addr.id ? (
                            <div className="flex-1 flex gap-1">
                              <input id={`edit-cep-${addr.id}`} defaultValue={addr.cep} className="w-full border border-blue-400 p-1 rounded text-[13px]" />
                              <input id={`edit-num-${addr.id}`} defaultValue={addr.numero} className="w-12 border border-blue-400 p-1 rounded text-[13px]" />
                              <button onClick={() => saveEdit(addr.id, document.getElementById(`edit-cep-${addr.id}`).value, document.getElementById(`edit-num-${addr.id}`).value)} className="bg-green-600 text-white px-2 rounded text-[15px] cursor-pointer">OK</button>
                            </div>
                          ) : (
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-800 text-md truncate">{addr.formatted.split(',')[0]}</p>
                            </div>
                          )}

                          {editingId !== addr.id && (
                            <div className="flex gap-1">
                              <button onClick={() => setEditingId(addr.id)} className="p-1 text-gray-400 hover:text-blue-600 cursor-pointer"><Edit2 size={16} /></button>
                              <button onClick={() => deleteAddress(addr.id)} className="p-1 text-gray-400 hover:text-red-600 cursor-pointer"><Trash2 size={16} /></button>
                            </div>
                          )}
                        </Reorder.Item>
                      )
                    })}
                  </AnimatePresence>
                </Reorder.Group>
              </div>
            </div>
          </div>
        </main>
      </div>
    </LoadScript>
  );
}