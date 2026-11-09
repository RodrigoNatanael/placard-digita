import React, { useState, useEffect } from 'react';
import { 
  Shirt, 
  Sparkles, 
  Plus, 
  Trash2, 
  Tag, 
  Calendar, 
  SunMedium, 
  Layers, 
  Palette, 
  Check, 
  Image as ImageIcon,
  Heart,
  Wand2,
  Filter,
  RefreshCw,
  Sliders,
  X,
  Upload,
  Camera
} from 'lucide-react';

const CATEGORIES = ['Tops', 'Pantalones', 'Abrigos', 'Calzado', 'Accesorios'];
const STYLES = ['Casual', 'Formal', 'Urbano', 'Elegante', 'Deportivo', 'Noche'];
const SEASONS = ['Verano', 'Invierno', 'Otoño', 'Primavera', 'Todo año'];

const INITIAL_CLOSET = [
  {
    id: '1',
    name: 'Remera Oversize Beige',
    category: 'Tops',
    color: 'Beige / Crema',
    style: ['Casual', 'Urbano'],
    season: 'Todo año',
    imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=600',
    tags: ['básico', 'cotton', 'oversize']
  },
  {
    id: '2',
    name: 'Jeans Rectos Azul Oscuro',
    category: 'Pantalones',
    color: 'Azul',
    style: ['Casual', 'Urbano'],
    season: 'Todo año',
    imageUrl: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&q=80&w=600',
    tags: ['denim', 'clasico', 'recto']
  },
  {
    id: '3',
    name: 'Campera de Cuero Negra',
    category: 'Abrigos',
    color: 'Negro',
    style: ['Noche', 'Urbano'],
    season: 'Invierno',
    imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=600',
    tags: ['cuero', 'biker', 'premium']
  },
  {
    id: '4',
    name: 'Zapatillas Blancas Estilo Retro',
    category: 'Calzado',
    color: 'Blanco',
    style: ['Casual', 'Deportivo'],
    season: 'Todo año',
    imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=600',
    tags: ['sneakers', 'leather', 'comfort']
  }
];

export default function App() {
  const [closet, setCloset] = useState(() => {
    const saved = localStorage.getItem('digital_closet_items');
    return saved ? JSON.parse(saved) : INITIAL_CLOSET;
  });

  const [looks, setLooks] = useState(() => {
    const saved = localStorage.getItem('digital_closet_looks');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeTab, setActiveTab] = useState('closet'); // 'closet' | 'stylist' | 'lookbook'
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
  
  // AI Loading States
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState('');
  const [isGeneratingLook, setIsGeneratingLook] = useState(false);

  // Stylist Filters
  const [occasion, setOccasion] = useState('Casual del día a día');
  const [weather, setWeather] = useState('Templado / Primavera');
  const [vibe, setVibe] = useState('Relajado pero arreglado');
  const [aiSuggestions, setAiSuggestions] = useState(null);

  useEffect(() => {
    localStorage.setItem('digital_closet_items', JSON.stringify(closet));
  }, [closet]);

  useEffect(() => {
    localStorage.setItem('digital_closet_looks', JSON.stringify(looks));
  }, [looks]);

  // Manejador para cargar la imagen local en base64
  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Función mejorada con fallback para analizar prenda con Gemini API
  const analyzeImageWithGemini = async () => {
    if (!newImage) {
      setAnalysisError('Por favor sube o pega una imagen primero.');
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

      const promptText = `Analiza esta prenda de vestir y responde ÚNICAMENTE con un objeto JSON válido (sin bloques de código markdown ni texto adicional) con los siguientes campos:
{
  "name": "Nombre descriptivo de la prenda (máximo 4 palabras)",
  "category": "Una de estas exactamente: Tops, Pantalones, Abrigos, Calzado, Accesorios",
  "color": "Color o combinación de colores principales",
  "style": ["Selecciona de 1 a 2 de estos: Casual, Formal, Urbano, Elegante, Deportivo, Noche"],
  "season": "Una de estas: Verano, Invierno, Otoño, Primavera, Todo año",
  "tags": ["3 a 5 palabras clave sobre tela, estilo o características"]
}`;

      let responseText = '';

      if (base64Data && apiKey) {
        // Fallback REST directo a Google AI Studio API
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
        } else {
          throw new Error('Respuesta no válida del servicio de Visión por IA.');
        }
      } else {
        // Simulación si no hay API Key configurada
        await new Promise(r => setTimeout(r, 1500));
        responseText = JSON.stringify({
          name: "Prenda Detectada por IA",
          category: "Tops",
          color: "Azul marino",
          style: ["Casual", "Urbano"],
          season: "Todo año",
          tags: ["algodón", "cómodo", "estilo"]
        });
      }

      // Limpiar markdown si Gemini devuelve ```json ... ```
      const cleanedJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanedJson);

      if (parsed.name) setNewName(parsed.name);
      if (parsed.category && CATEGORIES.includes(parsed.category)) setNewCategory(parsed.category);
      if (parsed.color) setNewColor(parsed.color);
      if (parsed.style && Array.isArray(parsed.style)) setNewStyle(parsed.style);
      if (parsed.season && SEASONS.includes(parsed.season)) setNewSeason(parsed.season);
      if (parsed.tags && Array.isArray(parsed.tags)) setNewTags(parsed.tags.join(', '));

    } catch (err) {
      console.error("Error en visión por IA:", err);
      setAnalysisError('No pudimos auto-detectar los detalles. Puedes completarlos manualmente.');
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
      color: newColor || 'Sin especificar',
      style: newStyle,
      season: newSeason,
      imageUrl: newImage,
      tags: newTags.split(',').map(t => t.trim()).filter(Boolean)
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

  // Función para armar looks con IA
  const generateOutfitWithAI = async () => {
    if (closet.length === 0) return;
    setIsGeneratingLook(true);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
      
      const closetContext = closet.map(item => ({
        id: item.id,
        nombre: item.name,
        categoria: item.category,
        color: item.color,
        estilo: item.style,
        temporada: item.season,
        etiquetas: item.tags
      }));

      const promptText = `Actúa como un Personal Stylist experto. Armaré outfits usando ÚNICAMENTE los elementos presentes en el siguiente placard:

INVENTARIO DEL PLACARD (JSON):
${JSON.stringify(closetContext, null, 2)}

PREFERENCIAS DEL USUARIO:
- Ocasión: ${occasion}
- Clima/Temporada: ${weather}
- Vibe / Estilo buscado: ${vibe}

TARAFA:
Devuelve un objeto JSON estructurado exactamente así (sin markdown ni explicaciones adicionales):
{
  "outfits": [
    {
      "title": "Nombre creativo del outfit",
      "reasoning": "Explicación breve de por qué estas prendas combinan para el evento y la vibra",
      "itemIds": ["id1", "id2", "id3"],
      "tips": "Un consejo de estilismo clave (ej: arremangar mangas, usar accesorios en dorado)"
    }
  ]
}
Intenta armar 2 combinaciones distintas usando prendas del inventario.`;

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
        if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
          responseText = data.candidates[0].content.parts[0].text;
        }
      }

      if (!responseText) {
        // Fallback demo outfit si no hay API key
        await new Promise(r => setTimeout(r, 1500));
        const sampleTops = closet.filter(i => i.category === 'Tops');
        const sampleBottoms = closet.filter(i => i.category === 'Pantalones');
        const sampleShoes = closet.filter(i => i.category === 'Calzado');

        responseText = JSON.stringify({
          outfits: [
            {
              title: "Look Urbano Relajado",
              reasoning: "Combinación ideal equilibrando tonos neutros para la ocasión seleccionada.",
              itemIds: [
                sampleTops[0]?.id || closet[0]?.id,
                sampleBottoms[0]?.id || closet[1]?.id,
                sampleShoes[0]?.id || closet[3]?.id
              ].filter(Boolean),
              tips: "Agrega accesorios neutros para elevar el aspecto final."
            }
          ]
        });
      }

      const cleanedJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanedJson);
      setAiSuggestions(parsed.outfits || []);

    } catch (err) {
      console.error("Error generando outfits:", err);
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
    <div className="min-h-screen bg-[#0B1325] text-slate-100 flex flex-col font-sans">
      {/* Header Bar */}
      <header className="border-b border-slate-800 bg-[#111C33]/90 backdrop-blur sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#C5A059] to-[#D4AF37] flex items-center justify-center shadow-lg shadow-[#D4AF37]/20">
              <Shirt className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-none tracking-tight text-slate-50">PLACARD <span className="text-[#D4AF37]">DIGITAL</span></h1>
              <p className="text-xs text-slate-400">Stylist Personal & IA Vision</p>
            </div>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-slate-950 px-4 py-2 rounded-xl text-sm font-semibold hover:brightness-110 transition shadow-md shadow-[#D4AF37]/10"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar Prenda</span>
          </button>
        </div>
      </header>

      {/* Main Navigation Tabs */}
      <div className="border-b border-slate-800 bg-[#0E172A]">
        <div className="max-w-6xl mx-auto px-4 flex gap-6">
          <button
            onClick={() => setActiveTab('closet')}
            className={`py-4 text-sm font-medium border-b-2 flex items-center gap-2 transition ${
              activeTab === 'closet'
                ? 'border-[#D4AF37] text-[#D4AF37]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shirt className="w-4 h-4" />
            Mi Armario ({closet.length})
          </button>
          
          <button
            onClick={() => setActiveTab('stylist')}
            className={`py-4 text-sm font-medium border-b-2 flex items-center gap-2 transition ${
              activeTab === 'stylist'
                ? 'border-[#D4AF37] text-[#D4AF37]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            AI Stylist
          </button>

          <button
            onClick={() => setActiveTab('lookbook')}
            className={`py-4 text-sm font-medium border-b-2 flex items-center gap-2 transition ${
              activeTab === 'lookbook'
                ? 'border-[#D4AF37] text-[#D4AF37]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Heart className="w-4 h-4" />
            Lookbook Guardado ({looks.length})
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6">
        {/* TAB 1: MI CLOSET */}
        {activeTab === 'closet' && (
          <div className="space-y-6">
            {/* Category Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              <button
                onClick={() => setSelectedCategory('Todos')}
                className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition ${
                  selectedCategory === 'Todos'
                    ? 'bg-[#D4AF37] text-slate-950 font-semibold'
                    : 'bg-[#152238] text-slate-300 hover:bg-[#1C2C47]'
                }`}
              >
                Todos ({closet.length})
              </button>
              {CATEGORIES.map(cat => {
                const count = closet.filter(i => i.category === cat).length;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition ${
                      selectedCategory === cat
                        ? 'bg-[#D4AF37] text-slate-950 font-semibold'
                        : 'bg-[#152238] text-slate-300 hover:bg-[#1C2C47]'
                    }`}
                  >
                    {cat} ({count})
                  </button>
                );
              })}
            </div>

            {/* Closet Grid */}
            {filteredCloset.length === 0 ? (
              <div className="text-center py-16 bg-[#152238]/50 border border-slate-800/80 rounded-2xl">
                <Shirt className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h3 className="text-base font-medium text-slate-300">No hay prendas en esta categoría</h3>
                <p className="text-xs text-slate-500 mt-1 mb-4">Sube fotos de tu ropa para empezar a armar tu guardarropa inteligente.</p>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="inline-flex items-center gap-2 bg-[#D4AF37] text-slate-950 px-4 py-2 rounded-xl text-xs font-semibold"
                >
                  <Plus className="w-4 h-4" /> Agregar Prenda
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {filteredCloset.map(item => (
                  <div 
                    key={item.id}
                    className="group bg-[#152238] border border-slate-800/80 rounded-2xl overflow-hidden hover:border-[#D4AF37]/50 transition flex flex-col"
                  >
                    <div className="relative aspect-square bg-slate-950 overflow-hidden">
                      <img 
                        src={item.imageUrl} 
                        alt={item.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                      <span className="absolute top-2 left-2 bg-slate-950/80 backdrop-blur text-slate-200 text-[10px] px-2 py-0.5 rounded-md border border-white/10 font-medium">
                        {item.category}
                      </span>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-950/70 text-slate-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="p-3 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-semibold text-sm text-slate-100 truncate">{item.name}</h4>
                        <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                          <span className="inline-block w-2.5 h-2.5 rounded-full bg-slate-700 border border-slate-500" style={{ backgroundColor: item.color.toLowerCase() }} />
                          <span className="truncate">{item.color}</span>
                        </div>
                      </div>

                      {item.tags && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {item.tags.slice(0, 3).map((tag, idx) => (
                            <span key={idx} className="text-[10px] bg-slate-900/80 text-slate-400 px-1.5 py-0.5 rounded border border-slate-800">
                              #{tag}
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
            {/* Filter Panel */}
            <div className="bg-[#152238] border border-slate-800 rounded-2xl p-5 h-fit space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
                <Wand2 className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="font-semibold text-slate-100">Configurar Outfit</h3>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-slate-400 mb-1.5 block">Ocasión o Evento</label>
                  <select
                    value={occasion}
                    onChange={(e) => setOccasion(e.target.value)}
                    className="w-full bg-[#0B1325] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-[#D4AF37]"
                  >
                    <option value="Casual del día a día">Casual del día a día</option>
                    <option value="Reunión de trabajo / Oficina">Reunión de trabajo / Oficina</option>
                    <option value="Cita nocturna / Salida casual">Cita nocturna / Salida casual</option>
                    <option value="Fiesta / Evento Elegante">Fiesta / Evento Elegante</option>
                    <option value="Fin de semana / Salida al aire libre">Fin de semana / Salida al aire libre</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-400 mb-1.5 block">Clima / Estación</label>
                  <select
                    value={weather}
                    onChange={(e) => setWeather(e.target.value)}
                    className="w-full bg-[#0B1325] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-[#D4AF37]"
                  >
                    <option value="Cálido / Verano">Cálido / Verano</option>
                    <option value="Templado / Primavera">Templado / Primavera</option>
                    <option value="Fresco / Otoño">Fresco / Otoño</option>
                    <option value="Frío / Invierno">Frío / Invierno</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-400 mb-1.5 block">Vibe / Estilo Deseado</label>
                  <input
                    type="text"
                    value={vibe}
                    onChange={(e) => setVibe(e.target.value)}
                    placeholder="Ej: Minimalista, Cómodo, Elegante..."
                    className="w-full bg-[#0B1325] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <button
                onClick={generateOutfitWithAI}
                disabled={isGeneratingLook || closet.length === 0}
                className="w-full py-3 bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-slate-950 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 hover:brightness-110 disabled:opacity-50 transition shadow-lg shadow-[#D4AF37]/10"
              >
                {isGeneratingLook ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Diseñando Outfits...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generar Combinaciones con IA</span>
                  </>
                )}
              </button>
            </div>

            {/* Outfit Results Panel */}
            <div className="md:col-span-2 space-y-4">
              {!aiSuggestions && !isGeneratingLook && (
                <div className="bg-[#152238]/30 border border-slate-800/80 rounded-2xl p-8 text-center">
                  <Sparkles className="w-10 h-10 text-[#D4AF37]/40 mx-auto mb-3" />
                  <h3 className="font-semibold text-slate-300">Asistente de Imagen listo</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                    Selecciona la ocasión y el clima para que la IA escanee las prendas de tu armario y cree la mejor combinación de estilo para ti.
                  </p>
                </div>
              )}

              {isGeneratingLook && (
                <div className="bg-[#152238] border border-slate-800 rounded-2xl p-12 text-center space-y-3">
                  <RefreshCw className="w-8 h-8 text-[#D4AF37] animate-spin mx-auto" />
                  <h4 className="font-medium text-slate-200 text-sm">Escaneando tu armario con Gemini AI...</h4>
                  <p className="text-xs text-slate-500">Evaluando colores, ocasiones y capas de ropa.</p>
                </div>
              )}

              {aiSuggestions && aiSuggestions.map((outfit, idx) => (
                <div key={idx} className="bg-[#152238] border border-slate-800 rounded-2xl p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-semibold text-[#D4AF37] uppercase tracking-wider">Propuesta #{idx + 1}</span>
                      <h3 className="text-base font-bold text-slate-100">{outfit.title}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">{outfit.reasoning}</p>
                    </div>

                    <button
                      onClick={() => saveLook(outfit)}
                      className="px-3 py-1.5 bg-[#0B1325] border border-slate-700 hover:border-[#D4AF37] text-slate-200 text-xs rounded-xl flex items-center gap-1.5 transition"
                    >
                      <Heart className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>Guardar</span>
                    </button>
                  </div>

                  {/* Item Cards in Outfit */}
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 pt-2">
                    {closet
                      .filter(item => outfit.itemIds.includes(item.id))
                      .map(item => (
                        <div key={item.id} className="bg-[#0B1325] border border-slate-800 rounded-xl overflow-hidden p-2">
                          <img src={item.imageUrl} alt={item.name} className="w-full aspect-square object-cover rounded-lg mb-2" />
                          <p className="text-[11px] font-medium text-slate-200 truncate">{item.name}</p>
                          <p className="text-[10px] text-slate-500">{item.category}</p>
                        </div>
                      ))}
                  </div>

                  {outfit.tips && (
                    <div className="bg-[#0B1325]/60 border border-amber-500/20 rounded-xl p-3 text-xs text-amber-200/80 flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                      <span><strong>Tip de Estilo:</strong> {outfit.tips}</span>
                    </div>
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
              <div className="text-center py-16 bg-[#152238]/50 border border-slate-800/80 rounded-2xl">
                <Heart className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h3 className="text-base font-medium text-slate-300">Aún no tienes outfits guardados</h3>
                <p className="text-xs text-slate-500 mt-1 mb-4">Usa el AI Stylist para generar propuestas y guardarlas aquí.</p>
                <button
                  onClick={() => setActiveTab('stylist')}
                  className="inline-flex items-center gap-2 bg-[#D4AF37] text-slate-950 px-4 py-2 rounded-xl text-xs font-semibold"
                >
                  <Sparkles className="w-4 h-4" /> Ir a AI Stylist
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {looks.map(look => (
                  <div key={look.id} className="bg-[#152238] border border-slate-800 rounded-2xl p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-slate-100 text-sm">{look.title}</h4>
                        <p className="text-[10px] text-slate-500">Guardado el {look.date}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                      {look.items.map(item => (
                        <div key={item.id} className="bg-[#0B1325] border border-slate-800 rounded-lg p-1">
                          <img src={item.imageUrl} alt={item.name} className="w-full aspect-square object-cover rounded" />
                        </div>
                      ))}
                    </div>

                    {look.tips && (
                      <p className="text-xs text-slate-400 italic bg-[#0B1325] p-2 rounded-lg">
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

      {/* MODAL: AGREGAR PRENDA CON VISIÓN IA */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#152238] border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="font-bold text-slate-100 text-base">Agregar Prenda con IA</h3>
              </div>
              <button 
                onClick={() => { setIsAddModalOpen(false); resetForm(); }}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddItem} className="space-y-4">
              {/* Sección Carga de Imagen */}
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-2">1. Carga la foto de la prenda *</label>
                
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <label className="flex-1 bg-[#0B1325] border border-dashed border-slate-700 hover:border-[#D4AF37] rounded-xl p-3 flex items-center justify-center gap-2 cursor-pointer transition text-xs text-slate-300">
                      <Camera className="w-4 h-4 text-[#D4AF37]" />
                      <span>Subir foto / Camara</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageFileChange} 
                        className="hidden" 
                      />
                    </label>
                  </div>

                  <input
                    type="url"
                    value={newImage}
                    onChange={(e) => setNewImage(e.target.value)}
                    placeholder="O pega el link URL de una imagen..."
                    className="w-full bg-[#0B1325] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                {/* Previsualización e invocación del análisis de IA */}
                {newImage && (
                  <div className="mt-3 bg-[#0B1325] border border-slate-800 rounded-xl p-3 flex gap-3 items-center">
                    <img src={newImage} alt="Preview" className="w-16 h-16 object-cover rounded-lg border border-slate-700" />
                    <div className="flex-1">
                      <button
                        type="button"
                        onClick={analyzeImageWithGemini}
                        disabled={isAnalyzing}
                        className="w-full py-2 bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-slate-950 font-bold text-xs rounded-lg flex items-center justify-center gap-2 hover:brightness-110 transition disabled:opacity-50"
                      >
                        {isAnalyzing ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Analizando Prenda...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Auto-Detectar con IA</span>
                          </>
                        )}
                      </button>
                      {analysisError && (
                        <p className="text-[10px] text-amber-400 mt-1">{analysisError}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Formulario editable completado por la IA */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <p className="text-xs font-semibold text-[#D4AF37] uppercase tracking-wider">2. Detalles de la prenda</p>

                <div>
                  <label className="text-xs font-medium text-slate-400 block mb-1">Nombre *</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Ej: Remera Algodón Negra"
                    className="w-full bg-[#0B1325] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-400 block mb-1">Categoría</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full bg-[#0B1325] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-[#D4AF37]"
                    >
                      {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-400 block mb-1">Color Principal</label>
                    <input
                      type="text"
                      value={newColor}
                      onChange={(e) => setNewColor(e.target.value)}
                      placeholder="Ej: Azul Marino"
                      className="w-full bg-[#0B1325] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-400 block mb-1">Etiquetas (separadas por coma)</label>
                  <input
                    type="text"
                    value={newTags}
                    onChange={(e) => setNewTags(e.target.value)}
                    placeholder="básico, verano, algodón"
                    className="w-full bg-[#0B1325] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => { setIsAddModalOpen(false); resetForm(); }}
                  className="flex-1 py-2.5 bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-xl font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!newName || !newImage}
                  className="flex-1 py-2.5 bg-[#D4AF37] text-slate-950 text-xs rounded-xl font-bold disabled:opacity-50 hover:brightness-110 transition"
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