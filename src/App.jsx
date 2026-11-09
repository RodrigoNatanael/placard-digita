import React, { useState, useEffect } from 'react';
import { 
  Shirt, 
  Sparkles, 
  Plus, 
  Trash2, 
  Tag, 
  Calendar, 
  Heart,
  Wand2,
  RefreshCw,
  X,
  Camera,
  Check
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
      const saved = localStorage.getItem('digital_closet_items_v2');
      return saved ? JSON.parse(saved) : INITIAL_CLOSET;
    } catch (e) {
      return INITIAL_CLOSET;
    }
  });

  const [looks, setLooks] = useState(() => {
    try {
      const saved = localStorage.getItem('digital_closet_looks_v2');
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
  const [vibe, setVibe] = useState('Moderno y estilizado');
  const [aiSuggestions, setAiSuggestions] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem('digital_closet_items_v2', JSON.stringify(closet));
    } catch (e) {
      console.error("Error guardando en localStorage:", e);
    }
  }, [closet]);

  useEffect(() => {
    try {
      localStorage.setItem('digital_closet_looks_v2', JSON.stringify(looks));
    } catch (e) {
      console.error("Error guardando looks:", e);
    }
  }, [looks]);

  // Función segura para comprimir imágenes y evitar pantallas negras por exceso de peso
  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 600;
        const MAX_HEIGHT = 600;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Comprimir a JPEG calidad 0.7 para evitar saturar memoria
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
        setNewImage(compressedDataUrl);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Análisis automático con Gemini API
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

      const promptText = `Analiza esta prenda de vestir y responde ÚNICAMENTE en formato JSON válido (sin markdown, sin explicaciones):
{
  "name": "Nombre comercial breve (máx 3 palabras)",
  "category": "Una de estas exactas: Tops, Pantalones, Abrigos, Calzado, Accesorios",
  "color": "Color principal",
  "style": ["Casual"],
  "season": "Todo año",
  "tags": ["etiqueta1", "etiqueta2"]
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
        if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
          responseText = data.candidates[0].content.parts[0].text;
        }
      }

      if (!responseText) {
        throw new Error('Sin respuesta de IA');
      }

      const cleanedJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanedJson);

      if (parsed.name) setNewName(parsed.name);
      if (parsed.category && CATEGORIES.includes(parsed.category)) setNewCategory(parsed.category);
      if (parsed.color) setNewColor(parsed.color);
      if (parsed.season && SEASONS.includes(parsed.season)) setNewSeason(parsed.season);
      if (parsed.tags && Array.isArray(parsed.tags)) setNewTags(parsed.tags.join(', '));

    } catch (err) {
      console.error("Error en IA:", err);
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

  const generateOutfitWithAI = async () => {
    if (closet.length === 0) return;
    setIsGeneratingLook(true);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
      const closetContext = closet.map(i => ({ id: i.id, nombre: i.name, categoria: i.category, color: i.color }));

      const promptText = `Actúa como un Stylist de moda de alta gama. Con base en este armario:
${JSON.stringify(closetContext)}
Crea un outfit moderno para la ocasión: "${occasion}", clima "${weather}", vibe "${vibe}".
Devuelve ÚNICAMENTE JSON puro:
{
  "outfits": [
    {
      "title": "Nombre del Look",
      "reasoning": "Por qué combina estilísticamente",
      "itemIds": ["id1", "id2"],
      "tips": "Consejo de estilismo moderno"
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
            title: "Look Esencial Moderno",
            reasoning: "Combinación equilibrada de texturas y colores neutros.",
            itemIds: [closet[0]?.id, closet[1]?.id].filter(Boolean),
            tips: "Lleva las prendas bien ajustadas y acompaña con calzado limpio."
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
      items: closet.filter(i => outfit.itemIds.includes(i.id)),
      date: new Date().toLocaleDateString('es-AR')
    };
    setLooks([newLook, ...looks]);
  };

  const filteredCloset = selectedCategory === 'Todos' 
    ? closet 
    : closet.filter(item => item.category === selectedCategory);

  return (
    <div className="min-h-screen bg-[#0B1325] text-slate-100 flex flex-col font-sans pb-12">
      {/* Header */}
      <header className="border-b border-slate-800 bg-[#111C33]/90 backdrop-blur sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#C5A059] to-[#D4AF37] flex items-center justify-center shadow-lg shadow-[#D4AF37]/20">
              <Shirt className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-none tracking-tight text-slate-50">PLACARD <span className="text-[#D4AF37]">DIGITAL</span></h1>
              <p className="text-xs text-slate-400">Stylist IA & Guardarropa</p>
            </div>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-slate-950 px-4 py-2 rounded-xl text-sm font-semibold shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar</span>
          </button>
        </div>
      </header>

      {/* Navigation */}
      <div className="border-b border-slate-800 bg-[#0E172A]">
        <div className="max-w-6xl mx-auto px-4 flex gap-6">
          <button
            onClick={() => setActiveTab('closet')}
            className={`py-4 text-sm font-medium border-b-2 flex items-center gap-2 transition ${
              activeTab === 'closet' ? 'border-[#D4AF37] text-[#D4AF37]' : 'border-transparent text-slate-400'
            }`}
          >
            <Shirt className="w-4 h-4" /> Armario ({closet.length})
          </button>
          <button
            onClick={() => setActiveTab('stylist')}
            className={`py-4 text-sm font-medium border-b-2 flex items-center gap-2 transition ${
              activeTab === 'stylist' ? 'border-[#D4AF37] text-[#D4AF37]' : 'border-transparent text-slate-400'
            }`}
          >
            <Sparkles className="w-4 h-4" /> AI Stylist
          </button>
          <button
            onClick={() => setActiveTab('lookbook')}
            className={`py-4 text-sm font-medium border-b-2 flex items-center gap-2 transition ${
              activeTab === 'lookbook' ? 'border-[#D4AF37] text-[#D4AF37]' : 'border-transparent text-slate-400'
            }`}
          >
            <Heart className="w-4 h-4" /> Looks ({looks.length})
          </button>
        </div>
      </div>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6">
        {activeTab === 'closet' && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              <button
                onClick={() => setSelectedCategory('Todos')}
                className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap ${
                  selectedCategory === 'Todos' ? 'bg-[#D4AF37] text-slate-950 font-bold' : 'bg-[#152238] text-slate-300'
                }`}
              >
                Todos ({closet.length})
              </button>
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap ${
                    selectedCategory === cat ? 'bg-[#D4AF37] text-slate-950 font-bold' : 'bg-[#152238] text-slate-300'
                  }`}
                >
                  {cat} ({closet.filter(i => i.category === cat).length})
                </button>
              ))}
            </div>

            {filteredCloset.length === 0 ? (
              <div className="text-center py-16 bg-[#152238]/50 border border-slate-800 rounded-2xl">
                <Shirt className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h3 className="text-base font-medium text-slate-300">No hay prendas aquí</h3>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="mt-4 inline-flex items-center gap-2 bg-[#D4AF37] text-slate-950 px-4 py-2 rounded-xl text-xs font-semibold"
                >
                  <Plus className="w-4 h-4" /> Agregar Prenda
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {filteredCloset.map(item => (
                  <div key={item.id} className="bg-[#152238] border border-slate-800 rounded-2xl overflow-hidden flex flex-col">
                    <div className="relative aspect-square bg-slate-950 overflow-hidden">
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      <span className="absolute top-2 left-2 bg-slate-950/80 text-slate-200 text-[10px] px-2 py-0.5 rounded border border-white/10">
                        {item.category}
                      </span>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="absolute top-2 right-2 p-1.5 rounded bg-slate-950/70 text-slate-400 hover:text-red-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="p-3">
                      <h4 className="font-semibold text-sm text-slate-100 truncate">{item.name}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">{item.color}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'stylist' && (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-[#152238] border border-slate-800 rounded-2xl p-5 space-y-4 h-fit">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
                <Wand2 className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="font-semibold text-slate-100">Configurar Outfit</h3>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Ocasión</label>
                <select
                  value={occasion}
                  onChange={(e) => setOccasion(e.target.value)}
                  className="w-full bg-[#0B1325] border border-slate-800 rounded-xl p-2 text-xs text-slate-200"
                >
                  <option value="Casual del día a día">Casual del día a día</option>
                  <option value="Reunión de trabajo / Oficina">Oficina / Trabajo</option>
                  <option value="Cita nocturna">Cita nocturna</option>
                  <option value="Salida nocturna / Fiesta">Fiesta / Noche</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Clima</label>
                <select
                  value={weather}
                  onChange={(e) => setWeather(e.target.value)}
                  className="w-full bg-[#0B1325] border border-slate-800 rounded-xl p-2 text-xs text-slate-200"
                >
                  <option value="Cálido / Verano">Verano / Cálido</option>
                  <option value="Templado / Primavera">Primavera / Templado</option>
                  <option value="Frío / Invierno">Invierno / Frío</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Vibe / Estilo Moderno</label>
                <input
                  type="text"
                  value={vibe}
                  onChange={(e) => setVibe(e.target.value)}
                  className="w-full bg-[#0B1325] border border-slate-800 rounded-xl p-2 text-xs text-slate-200"
                />
              </div>
              <button
                onClick={generateOutfitWithAI}
                disabled={isGeneratingLook || closet.length === 0}
                className="w-full py-3 bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-slate-950 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isGeneratingLook ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>Generar Outfit con IA</span>
              </button>
            </div>

            <div className="md:col-span-2 space-y-4">
              {!aiSuggestions && !isGeneratingLook && (
                <div className="bg-[#152238]/30 border border-slate-800 rounded-2xl p-8 text-center">
                  <Sparkles className="w-10 h-10 text-[#D4AF37]/40 mx-auto mb-3" />
                  <h3 className="font-semibold text-slate-300">Generador de Estilo Moderno</h3>
                  <p className="text-xs text-slate-500 mt-1">Combina tu ropa automáticamente siguiendo las tendencias actuales.</p>
                </div>
              )}

              {aiSuggestions && aiSuggestions.map((outfit, idx) => (
                <div key={idx} className="bg-[#152238] border border-slate-800 rounded-2xl p-5 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-base font-bold text-slate-100">{outfit.title}</h3>
                      <p className="text-xs text-slate-400 mt-1">{outfit.reasoning}</p>
                    </div>
                    <button
                      onClick={() => saveLook(outfit)}
                      className="px-3 py-1.5 bg-[#0B1325] border border-slate-700 text-slate-200 text-xs rounded-xl flex items-center gap-1"
                    >
                      <Heart className="w-3.5 h-3.5 text-[#D4AF37]" /> Guardar
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {closet.filter(item => outfit.itemIds.includes(item.id)).map(item => (
                      <div key={item.id} className="bg-[#0B1325] border border-slate-800 rounded-xl p-2">
                        <img src={item.imageUrl} alt={item.name} className="w-full aspect-square object-cover rounded-lg mb-1" />
                        <p className="text-[11px] font-medium text-slate-200 truncate">{item.name}</p>
                      </div>
                    ))}
                  </div>
                  {outfit.tips && (
                    <p className="text-xs text-amber-200/80 bg-[#0B1325] p-3 rounded-xl border border-amber-500/20">
                      <strong>Tip estilista:</strong> {outfit.tips}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'lookbook' && (
          <div>
            {looks.length === 0 ? (
              <div className="text-center py-16 bg-[#152238]/50 border border-slate-800 rounded-2xl">
                <Heart className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h3 className="text-base font-medium text-slate-300">No hay looks guardados</h3>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {looks.map(look => (
                  <div key={look.id} className="bg-[#152238] border border-slate-800 rounded-2xl p-4 space-y-3">
                    <h4 className="font-bold text-slate-100 text-sm">{look.title}</h4>
                    <div className="grid grid-cols-4 gap-2">
                      {look.items.map(item => (
                        <div key={item.id} className="bg-[#0B1325] p-1 rounded">
                          <img src={item.imageUrl} alt={item.name} className="w-full aspect-square object-cover rounded" />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modal Agregar Prenda */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#152238] border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-slate-100 text-base">Agregar Prenda</h3>
              <button onClick={() => { setIsAddModalOpen(false); resetForm(); }} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddItem} className="space-y-4">
              <div>
                <label className="text-xs text-slate-300 block mb-2">Foto de la prenda *</label>
                <label className="bg-[#0B1325] border border-dashed border-slate-700 rounded-xl p-4 flex items-center justify-center gap-2 cursor-pointer text-xs text-slate-300">
                  <Camera className="w-4 h-4 text-[#D4AF37]" />
                  <span>Tomar foto o seleccionar archivo</span>
                  <input type="file" accept="image/*" onChange={handleImageFileChange} className="hidden" />
                </label>

                {newImage && (
                  <div className="mt-3 flex gap-3 items-center bg-[#0B1325] p-2 rounded-xl border border-slate-800">
                    <img src={newImage} alt="Preview" className="w-16 h-16 object-cover rounded-lg" />
                    <button
                      type="button"
                      onClick={analyzeImageWithGemini}
                      disabled={isAnalyzing}
                      className="flex-1 py-2 bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-slate-950 font-bold text-xs rounded-lg flex items-center justify-center gap-2"
                    >
                      {isAnalyzing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                      <span>Auto-Detectar con IA</span>
                    </button>
                  </div>
                )}
                {analysisError && <p className="text-[10px] text-amber-400 mt-1">{analysisError}</p>}
              </div>

              <div className="space-y-3 pt-2 border-t border-slate-800">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Nombre *</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Ej: Remera Negra"
                    className="w-full bg-[#0B1325] border border-slate-800 rounded-xl p-2 text-xs text-slate-200"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Categoría</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full bg-[#0B1325] border border-slate-800 rounded-xl p-2 text-xs text-slate-200"
                    >
                      {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Color Principal</label>
                    <input
                      type="text"
                      value={newColor}
                      onChange={(e) => setNewColor(e.target.value)}
                      placeholder="Ej: Negro"
                      className="w-full bg-[#0B1325] border border-slate-800 rounded-xl p-2 text-xs text-slate-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Etiquetas (separadas por coma)</label>
                  <input
                    type="text"
                    value={newTags}
                    onChange={(e) => setNewTags(e.target.value)}
                    placeholder="básico, algodón"
                    className="w-full bg-[#0B1325] border border-slate-800 rounded-xl p-2 text-xs text-slate-200"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => { setIsAddModalOpen(false); resetForm(); }}
                  className="flex-1 py-2.5 bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!newName || !newImage}
                  className="flex-1 py-2.5 bg-[#D4AF37] text-slate-950 text-xs rounded-xl font-bold disabled:opacity-50"
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