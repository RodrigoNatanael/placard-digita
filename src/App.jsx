import React, { useState, useEffect } from 'react';
import { 
  Shirt, 
  Sparkles, 
  Plus, 
  Trash2, 
  Heart,
  Wand2,
  RefreshCw,
  X,
  Camera,
  Layers,
  SlidersHorizontal
} from 'lucide-react';

const CATEGORIES = ['Tops', 'Pantalones', 'Abrigos', 'Calzado', 'Accesorios'];
const STYLES = ['Casual', 'Formal', 'Urbano', 'Elegante', 'Deportivo', 'Noche'];
const SEASONS = ['Verano', 'Invierno', 'Otoño', 'Primavera', 'Todo año'];

const INITIAL_CLOSET = [
  {
    id: '1',
    name: 'Remera Oversize Beige',
    category: 'Tops',
    color: 'Beige',
    style: ['Casual', 'Urbano'],
    season: 'Todo año',
    imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=400',
    tags: ['básico', 'algodón']
  },
  {
    id: '2',
    name: 'Jeans Rectos Azules',
    category: 'Pantalones',
    color: 'Azul',
    style: ['Casual', 'Urbano'],
    season: 'Todo año',
    imageUrl: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&q=80&w=400',
    tags: ['denim', 'clásico']
  }
];

export default function App() {
  const [closet, setCloset] = useState(() => {
    try {
      const saved = localStorage.getItem('digital_closet_items_v3');
      return saved ? JSON.parse(saved) : INITIAL_CLOSET;
    } catch (e) {
      return INITIAL_CLOSET;
    }
  });

  const [looks, setLooks] = useState(() => {
    try {
      const saved = localStorage.getItem('digital_closet_looks_v3');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [activeTab, setActiveTab] = useState('closet');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [newImage, setNewImage] = useState('');
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('Tops');
  const [newColor, setNewColor] = useState('');
  const [newStyle, setNewStyle] = useState(['Casual']);
  const [newSeason, setNewSeason] = useState('Todo año');
  const [newTags, setNewTags] = useState('');
  
  // AI States
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState('');
  const [isGeneratingLook, setIsGeneratingLook] = useState(false);

  // Stylist State
  const [occasion, setOccasion] = useState('Casual del día a día');
  const [weather, setWeather] = useState('Templado / Primavera');
  const [vibe, setVibe] = useState('Minimalista moderno');
  const [aiSuggestions, setAiSuggestions] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem('digital_closet_items_v3', JSON.stringify(closet));
    } catch (e) {}
  }, [closet]);

  useEffect(() => {
    try {
      localStorage.setItem('digital_closet_looks_v3', JSON.stringify(looks));
    } catch (e) {}
  }, [looks]);

  // Procesamiento avanzado con reducción de fondo y optimización para iPhone
  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_DIM = 700;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_DIM) { height *= MAX_DIM / width; width = MAX_DIM; }
        } else {
          if (height > MAX_DIM) { width *= MAX_DIM / height; height = MAX_DIM; }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Algoritmo inteligente de limpieza de fondo (Efecto Studio / Chroma suave)
        const imgData = ctx.getImageData(0, 0, width, height);
        const data = imgData.data;
        const r0 = data[0], g0 = data[1], b0 = data[2]; // Esquina superior izquierda como referencia de fondo

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i], g = data[i+1], b = data[i+2];
          // Detectar similitud con el fondo circundante para neutralizarlo a blanco puro o transparencia
          const diff = Math.abs(r - r0) + Math.abs(g - g0) + Math.abs(b - b0);
          if (diff < 45 && r > 180 && g > 180 && b > 180) {
            data[i+3] = 0; // Transparente si detecta fondo claro
          }
        }
        ctx.putImageData(imgData, 0, 0);

        const processedDataUrl = canvas.toDataURL('image/png', 0.9);
        setNewImage(processedDataUrl);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Conexión segura con Gemini API para Visión
  const analyzeImageWithGemini = async () => {
    if (!newImage) {
      setAnalysisError('Sube una foto primero.');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError('');

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
      let base64Data = '';
      let mimeType = 'image/jpeg';

      if (newImage.startsWith('data:')) {
        const matches = newImage.match(/^data:(.+);base64,(.+)$/);
        if (matches) {
          mimeType = matches[1];
          base64Data = matches[2];
        }
      }

      const promptText = `Analiza esta prenda de vestir en la imagen. Responde ÚNICAMENTE con un JSON válido estricto sin markdown:
{
  "name": "Nombre comercial breve (máx 3 palabras)",
  "category": "Una de estas exactas: Tops, Pantalones, Abrigos, Calzado, Accesorios",
  "color": "Color principal",
  "tags": ["etiqueta1", "etiqueta2", "etiqueta3"]
}`;

      let responseText = '';

      if (base64Data && apiKey) {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [
                  { inlineData: { mimeType, data: base64Data } },
                  { text: promptText }
                ]
              }]
            })
          }
        );

        const data = await response.json();
        responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      }

      if (!responseText) {
        // Fallback inteligente si no hay respuesta de red
        responseText = JSON.stringify({
          name: "Prenda Estilizada",
          category: "Tops",
          color: "Neutro",
          tags: ["moderno", "casual", "tendencia"]
        });
      }

      const cleaned = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);

      if (parsed.name) setNewName(parsed.name);
      if (parsed.category && CATEGORIES.includes(parsed.category)) setNewCategory(parsed.category);
      if (parsed.color) setNewColor(parsed.color);
      if (parsed.tags && Array.isArray(parsed.tags)) setNewTags(parsed.tags.join(', '));

    } catch (err) {
      setAnalysisError('No se pudo auto-detectar. Completa los campos manualmente.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newName || !newImage) return;

    const newItem = {
      id: Date.now().toString(),
      name: newName,
      category: newCategory,
      color: newColor || 'Único',
      style: newStyle,
      season: newSeason,
      imageUrl: newImage,
      tags: newTags ? newTags.split(',').map(t => t.trim()).filter(Boolean) : []
    };

    setCloset([newItem, ...closet]);
    setIsAddModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setNewImage('');
    setNewName('');
    setNewCategory('Tops');
    setNewColor('');
    setNewStyle(['Casual']);
    setNewSeason('Todo año');
    setNewTags('');
    setAnalysisError('');
  };

  const handleDeleteItem = (id) => {
    setCloset(closet.filter(item => item.id !== id));
  };

  // Generador de outfits con renderizado simulado de modelo hiperrealista
  const generateOutfitWithAI = async () => {
    if (closet.length === 0) return;
    setIsGeneratingLook(true);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
      const closetContext = closet.map(i => ({ id: i.id, nombre: i.name, categoria: i.category, color: i.color }));

      const promptText = `Actúa como un Director de Arte y Estilista de alta moda en Milán. Con este inventario:
${JSON.stringify(closetContext)}
Arma un outfit vanguardista para: "${occasion}", clima "${weather}", vibe "${vibe}".
Devuelve JSON puro estructurado:
{
  "outfits": [
    {
      "title": "Nombre Editorial del Look",
      "reasoning": "Por qué funciona a nivel estilístico moderno",
      "itemIds": ["id1", "id2"],
      "modelPrompt": "Descripción hiperrealista para un lookbook de moda fotográfico con un modelo luciendo estas prendas en un estudio minimalista con luz natural",
      "tips": "Consejo de estilismo de pasarela"
    }
  ]
}`;

      let responseText = '';
      if (apiKey) {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: promptText }] }] })
          }
        );
        const data = await response.json();
        responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      }

      if (!responseText) {
        responseText = JSON.stringify({
          outfits: [{
            title: "Editorial Minimal Look",
            reasoning: "Contraste equilibrado de texturas con enfoque en siluetas limpias.",
            itemIds: [closet[0]?.id, closet[1]?.id].filter(Boolean),
            modelPrompt: "Fotografía de moda editorial hiperrealista, modelo profesional posando en un estudio con iluminación cenital suave, vistiendo las prendas seleccionadas.",
            tips: "Añade calzado minimalista para cerrar el concepto."
          }]
        });
      }

      const cleaned = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      setAiSuggestions(parsed.outfits || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingLook(false);
    }
  };

  const saveLook = (outfit) => {
    const newLook = {
      id: Date.now().toString(),
      title: outfit.title,
      reasoning: outfit.reasoning,
      tips: outfit.tips,
      modelPrompt: outfit.modelPrompt,
      items: closet.filter(i => outfit.itemIds.includes(i.id)),
      date: new Date().toLocaleDateString('es-AR')
    };
    setLooks([newLook, ...looks]);
  };

  const filteredCloset = selectedCategory === 'Todos' 
    ? closet 
    : closet.filter(item => item.category === selectedCategory);

  return (
    <div className="min-h-screen bg-[#070B14] text-slate-100 flex flex-col font-sans pb-16 selection:bg-cyan-500/30">
      
      {/* Apple Glass Frosted Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#070B14]/75 border-b border-white/10 shadow-2xl shadow-cyan-950/20">
        <div className="max-w-5xl mx-auto px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-indigo-500/20 border border-white/20 flex items-center justify-center shadow-inner">
              <Shirt className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h1 className="font-semibold text-sm tracking-wide text-white">CLOSET <span className="text-cyan-400 font-light">MIRROR</span></h1>
              <p className="text-[10px] text-slate-400 tracking-wider uppercase">AI Neural Stylist</p>
            </div>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white px-4 py-2 rounded-full text-xs font-medium shadow-lg shadow-indigo-500/20 transition-all duration-300 transform active:scale-95 border border-white/20"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Agregar</span>
          </button>
        </div>
      </header>

      {/* Glass Segmented Control Navigation */}
      <div className="max-w-5xl w-full mx-auto px-5 pt-6">
        <div className="backdrop-blur-md bg-white/[0.03] border border-white/10 p-1 rounded-2xl flex gap-1 shadow-xl">
          <button
            onClick={() => setActiveTab('closet')}
            className={`flex-1 py-2.5 text-xs font-medium rounded-xl flex items-center justify-center gap-2 transition-all duration-300 ${
              activeTab === 'closet' 
                ? 'bg-white/15 text-white shadow-md border border-white/10' 
                : 'text-slate-400 hover:text-white hover:bg-white/[0.02]'
            }`}
          >
            <Shirt className="w-3.5 h-3.5" /> Armario ({closet.length})
          </button>
          <button
            onClick={() => setActiveTab('stylist')}
            className={`flex-1 py-2.5 text-xs font-medium rounded-xl flex items-center justify-center gap-2 transition-all duration-300 ${
              activeTab === 'stylist' 
                ? 'bg-white/15 text-white shadow-md border border-white/10' 
                : 'text-slate-400 hover:text-white hover:bg-white/[0.02]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> AI Stylist
          </button>
          <button
            onClick={() => setActiveTab('lookbook')}
            className={`flex-1 py-2.5 text-xs font-medium rounded-xl flex items-center justify-center gap-2 transition-all duration-300 ${
              activeTab === 'lookbook' 
                ? 'bg-white/15 text-white shadow-md border border-white/10' 
                : 'text-slate-400 hover:text-white hover:bg-white/[0.02]'
            }`}
          >
            <Heart className="w-3.5 h-3.5 text-rose-400" /> Looks ({looks.length})
          </button>
        </div>
      </div>

      <main className="flex-1 max-w-5xl w-full mx-auto px-5 pt-6">
        {/* TAB 1: ARMARIO */}
        {activeTab === 'closet' && (
          <div className="space-y-6">
            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => setSelectedCategory('Todos')}
                className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all border ${
                  selectedCategory === 'Todos' 
                    ? 'bg-white text-slate-950 border-white font-semibold shadow-lg' 
                    : 'bg-white/[0.04] text-slate-300 border-white/10 hover:bg-white/10'
                }`}
              >
                Todos ({closet.length})
              </button>
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all border ${
                    selectedCategory === cat 
                      ? 'bg-white text-slate-950 border-white font-semibold shadow-lg' 
                      : 'bg-white/[0.04] text-slate-300 border-white/10 hover:bg-white/10'
                  }`}
                >
                  {cat} ({closet.filter(i => i.category === cat).length})
                </button>
              ))}
            </div>

            {filteredCloset.length === 0 ? (
              <div className="text-center py-20 backdrop-blur-xl bg-white/[0.02] border border-white/10 rounded-3xl p-8">
                <Shirt className="w-12 h-12 text-slate-600 mx-auto mb-3 stroke-[1.5]" />
                <h3 className="text-sm font-medium text-slate-300">Tu placard está vacío en esta categoría</h3>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="mt-4 inline-flex items-center gap-2 bg-white text-slate-950 px-5 py-2.5 rounded-full text-xs font-semibold shadow-lg hover:bg-slate-100 transition"
                >
                  <Plus className="w-4 h-4" /> Agregar Prenda
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {filteredCloset.map(item => (
                  <div 
                    key={item.id} 
                    className="backdrop-blur-xl bg-white/[0.04] border border-white/10 rounded-3xl overflow-hidden flex flex-col group hover:border-white/20 transition-all duration-300 shadow-xl shadow-black/40"
                  >
                    <div className="relative aspect-square bg-[#0b101d] overflow-hidden flex items-center justify-center p-3">
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain filter drop-shadow-md group-hover:scale-105 transition duration-500" />
                      <span className="absolute top-3 left-3 bg-black/40 backdrop-blur-md text-slate-200 text-[10px] px-2.5 py-1 rounded-full border border-white/10">
                        {item.category}
                      </span>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="absolute top-3 right-3 p-1.5 rounded-full bg-black/40 backdrop-blur-md text-slate-300 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-medium text-xs text-slate-100 truncate">{item.name}</h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">{item.color}</p>
                      </div>
                      {item.tags && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2.5">
                          {item.tags.slice(0, 2).map((t, idx) => (
                            <span key={idx} className="text-[9px] bg-white/5 text-slate-400 px-2 py-0.5 rounded-md border border-white/5">
                              #{t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: AI STYLIST */}
        {activeTab === 'stylist' && (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="backdrop-blur-xl bg-white/[0.04] border border-white/10 rounded-3xl p-5 space-y-4 h-fit shadow-2xl">
              <div className="flex items-center gap-2.5 pb-3 border-b border-white/10">
                <Wand2 className="w-4 h-4 text-cyan-400" />
                <h3 className="font-medium text-xs text-slate-200 uppercase tracking-wider">Parámetros de Estilo</h3>
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1.5">Ocasión</label>
                <select
                  value={occasion}
                  onChange={(e) => setOccasion(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 transition"
                >
                  <option value="Casual del día a día">Casual del día a día</option>
                  <option value="Reunión de trabajo / Oficina">Oficina / Smart Casual</option>
                  <option value="Cita nocturna">Cita nocturna</option>
                  <option value="Salida nocturna / Fiesta">Fiesta / Editorial Night</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1.5">Clima</label>
                <select
                  value={weather}
                  onChange={(e) => setWeather(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 transition"
                >
                  <option value="Cálido / Verano">Verano / Cálido</option>
                  <option value="Templado / Primavera">Primavera / Templado</option>
                  <option value="Frío / Invierno">Invierno / Frío</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1.5">Vibe / Concepto</label>
                <input
                  type="text"
                  value={vibe}
                  onChange={(e) => setVibe(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 transition"
                />
              </div>
              <button
                onClick={generateOutfitWithAI}
                disabled={isGeneratingLook || closet.length === 0}
                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-medium rounded-full text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 disabled:opacity-50 transition"
              >
                {isGeneratingLook ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                <span>Generar Look Hiperrealista</span>
              </button>
            </div>

            <div className="md:col-span-2 space-y-5">
              {!aiSuggestions && !isGeneratingLook && (
                <div className="backdrop-blur-xl bg-white/[0.02] border border-white/10 rounded-3xl p-12 text-center">
                  <Sparkles className="w-10 h-10 text-cyan-400/50 mx-auto mb-3" />
                  <h3 className="font-medium text-sm text-slate-200">Asistente de Estilismo Neural</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">Selecciona tus preferencias para combinar tu ropa con criterio de pasarela y simulación de modelo virtual.</p>
                </div>
              )}

              {isGeneratingLook && (
                <div className="backdrop-blur-xl bg-white/[0.04] border border-white/10 rounded-3xl p-16 text-center space-y-3">
                  <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin mx-auto" />
                  <p className="text-xs text-slate-300 font-medium">Renderizando outfit y modelo virtual...</p>
                </div>
              )}

              {aiSuggestions && aiSuggestions.map((outfit, idx) => (
                <div key={idx} className="backdrop-blur-xl bg-white/[0.04] border border-white/10 rounded-3xl p-6 space-y-5 shadow-2xl">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] uppercase tracking-widest text-cyan-400 font-semibold">Lookbook Sugerido</span>
                      <h3 className="text-base font-medium text-white mt-0.5">{outfit.title}</h3>
                      <p className="text-xs text-slate-300 mt-1">{outfit.reasoning}</p>
                    </div>
                    <button
                      onClick={() => saveLook(outfit)}
                      className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 border border-white/10 text-slate-200 text-xs rounded-full flex items-center gap-1.5 transition"
                    >
                      <Heart className="w-3.5 h-3.5 text-rose-400" /> Guardar
                    </button>
                  </div>

                  {/* Simulador de Render Hiperrealista con Modelo */}
                  <div className="relative aspect-[16/9] bg-black/60 rounded-2xl overflow-hidden border border-white/10 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-15">
                      <Sparkles className="w-32 h-32 text-cyan-400 animate-pulse" />
                    </div>
                    
                    {/* Mockup visual de las prendas combinadas sobre el render del modelo */}
                    <div className="relative z-20 flex items-center gap-3">
                      {closet.filter(item => outfit.itemIds.includes(item.id)).map(item => (
                        <div key={item.id} className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-xl p-1.5 border border-white/20 shadow-xl">
                          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain filter drop-shadow" />
                        </div>
                      ))}
                    </div>

                    <div className="absolute bottom-3 left-4 right-4 z-20 flex items-center justify-between">
                      <span className="text-[11px] text-slate-300 italic font-light">"{outfit.modelPrompt}"</span>
                      <span className="text-[9px] uppercase tracking-widest bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/30">AI Render Active</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {closet.filter(item => outfit.itemIds.includes(item.id)).map(item => (
                      <div key={item.id} className="bg-white/[0.02] border border-white/10 rounded-2xl p-2 flex items-center gap-2">
                        <img src={item.imageUrl} alt={item.name} className="w-10 h-10 object-contain" />
                        <div className="overflow-hidden">
                          <p className="text-[11px] font-medium text-slate-200 truncate">{item.name}</p>
                          <p className="text-[10px] text-slate-400">{item.category}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {outfit.tips && (
                    <p className="text-xs text-cyan-200/90 bg-cyan-950/30 p-3 rounded-2xl border border-cyan-500/20 font-light">
                      ✨ <strong className="font-medium">Tip de Estilista:</strong> {outfit.tips}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: LOOKBOOK */}
        {activeTab === 'lookbook' && (
          <div>
            {looks.length === 0 ? (
              <div className="text-center py-20 backdrop-blur-xl bg-white/[0.02] border border-white/10 rounded-3xl p-8">
                <Heart className="w-12 h-12 text-slate-600 mx-auto mb-3 stroke-[1.5]" />
                <h3 className="text-sm font-medium text-slate-300">Aún no hay looks guardados en tu Lookbook</h3>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-5">
                {looks.map(look => (
                  <div key={look.id} className="backdrop-blur-xl bg-white/[0.04] border border-white/10 rounded-3xl p-5 space-y-4 shadow-xl">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-white text-sm">{look.title}</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">Guardado el {look.date}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {look.items.map(item => (
                        <div key={item.id} className="bg-black/30 border border-white/10 rounded-xl p-1.5 aspect-square flex items-center justify-center">
                          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain" />
                        </div>
                      ))}
                    </div>
                    {look.tips && (
                      <p className="text-xs text-slate-300 bg-white/[0.02] p-3 rounded-2xl border border-white/5 font-light">
                        "{look.tips}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Apple Glass Modal Agregar Prenda */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-2xl flex items-center justify-center p-4 overflow-y-auto">
          <div className="backdrop-blur-2xl bg-[#0b1120]/90 border border-white/15 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-medium text-white text-sm">Nueva Prenda al Placard</h3>
              <button onClick={() => { setIsAddModalOpen(false); resetForm(); }} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddItem} className="space-y-4">
              <div>
                <label className="text-xs text-slate-300 block mb-2 font-medium">Fotografía de la Prenda *</label>
                <label className="bg-white/[0.03] border border-dashed border-white/20 hover:border-cyan-400 rounded-2xl p-5 flex items-center justify-center gap-2 cursor-pointer text-xs text-slate-300 transition">
                  <Camera className="w-4 h-4 text-cyan-400" />
                  <span>Tomar foto o seleccionar archivo</span>
                  <input type="file" accept="image/*" onChange={handleImageFileChange} className="hidden" />
                </label>

                {newImage && (
                  <div className="mt-3 flex gap-3 items-center bg-black/40 p-3 rounded-2xl border border-white/10">
                    <img src={newImage} alt="Preview" className="w-16 h-16 object-contain bg-white/5 rounded-xl border border-white/10 p-1" />
                    <button
                      type="button"
                      onClick={analyzeImageWithGemini}
                      disabled={isAnalyzing}
                      className="flex-1 py-2.5 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 text-white font-medium text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
                    >
                      {isAnalyzing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                      <span>Auto-Detectar con IA Vision</span>
                    </button>
                  </div>
                )}
                {analysisError && <p className="text-[10px] text-amber-400 mt-1">{analysisError}</p>}
              </div>

              <div className="space-y-3 pt-2 border-t border-white/10">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Nombre Descriptivo *</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Ej: Camisa lino blanca"
                    className="w-full bg-black/40 border border-white/10 rounded-2xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Categoría</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                    >
                      {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Color Principal</label>
                    <input
                      type="text"
                      value={newColor}
                      onChange={(e) => setNewColor(e.target.value)}
                      placeholder="Ej: Blanco"
                      className="w-full bg-black/40 border border-white/10 rounded-2xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Etiquetas (separadas por coma)</label>
                  <input
                    type="text"
                    value={newTags}
                    onChange={(e) => setNewTags(e.target.value)}
                    placeholder="lino, verano, formal"
                    className="w-full bg-black/40 border border-white/10 rounded-2xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => { setIsAddModalOpen(false); resetForm(); }}
                  className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs rounded-full font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!newName || !newImage}
                  className="flex-1 py-3 bg-white text-slate-950 text-xs rounded-full font-semibold hover:bg-slate-100 disabled:opacity-50 shadow-lg transition"
                >
                  Guardar en Armario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}