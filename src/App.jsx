import React, { useState, useMemo, useEffect } from 'react';
import {
  Sparkles,
  Plus,
  Trash2,
  Bookmark,
  Shirt,
  Footprints,
  Search,
  CheckCircle2,
  RefreshCw,
  Tag,
  Zap,
  Grid,
  Heart,
  Sun,
  Info,
  X,
  Camera,
  Wand2,
  Loader2,
  Eye,
  Glasses
} from 'lucide-react';

const INITIAL_CLOSET = [
  {
    id: '1',
    name: 'Blazer Negro Oversize',
    category: 'Outerwear',
    subCategory: 'Jackets',
    color: 'Negro',
    style: ['Formal', 'Casual', 'Night'],
    season: ['Otoño', 'Invierno'],
    imageUrl: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=600',
    tags: ['Elegante', 'Sastrería']
  },
  {
    id: '2',
    name: 'Camiseta Blanca Básica',
    category: 'Tops',
    subCategory: 'T-Shirts',
    color: 'Blanco',
    style: ['Casual', 'Sport'],
    season: ['Primavera', 'Verano', 'Otoño', 'Invierno'],
    imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=600',
    tags: ['Básico', 'Algodón']
  },
  {
    id: '3',
    name: 'Jeans Rectos Azul Claro',
    category: 'Bottoms',
    subCategory: 'Jeans',
    color: 'Azul',
    style: ['Casual', 'Night'],
    season: ['Primavera', 'Otoño', 'Invierno'],
    imageUrl: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&q=80&w=600',
    tags: ['Denim', 'Versátil']
  },
  {
    id: '4',
    name: 'Sneakers Blancos Minimalistas',
    category: 'Shoes',
    subCategory: 'Sneakers',
    color: 'Blanco',
    style: ['Casual', 'Sport'],
    season: ['Primavera', 'Verano', 'Otoño', 'Invierno'],
    imageUrl: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=600',
    tags: ['Cómodo', 'Urbano']
  },
  {
    id: '5',
    name: 'Vestido de Seda Satén',
    category: 'Tops',
    subCategory: 'Dresses',
    color: 'Champagne',
    style: ['Formal', 'Night'],
    season: ['Verano', 'Primavera'],
    imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=600',
    tags: ['Noche', 'Fiesta']
  },
  {
    id: '6',
    name: 'Mocasines de Cuero',
    category: 'Shoes',
    subCategory: 'Loafers',
    color: 'Marrón',
    style: ['Formal', 'Casual'],
    season: ['Otoño', 'Primavera'],
    imageUrl: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&q=80&w=600',
    tags: ['Clásico', 'Cuero']
  },
  {
    id: '7',
    name: 'Tapado de Lana Beige',
    category: 'Outerwear',
    subCategory: 'Coats',
    color: 'Beige',
    style: ['Formal', 'Casual'],
    season: ['Invierno', 'Otoño'],
    imageUrl: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?auto=format&fit=crop&q=80&w=600',
    tags: ['Cálido', 'Lujo']
  },
  {
    id: '8',
    name: 'Bolso Estructurado Negro',
    category: 'Accessories',
    subCategory: 'Bags',
    color: 'Negro',
    style: ['Formal', 'Casual', 'Night'],
    season: ['Primavera', 'Verano', 'Otoño', 'Invierno'],
    imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=600',
    tags: ['Accesorización', 'Cuero']
  }
];

const CATEGORIES = [
  { id: 'All', label: 'Todo', icon: Grid },
  { id: 'Tops', label: 'Tops & Vestidos', icon: Shirt },
  { id: 'Bottoms', label: 'Pantalones & Faldas', icon: Tag },
  { id: 'Outerwear', label: 'Abrigos & Chaquetas', icon: ShieldIcon },
  { id: 'Shoes', label: 'Calzado', icon: Footprints },
  { id: 'Accessories', label: 'Accesorios', icon: Glasses }
];

function ShieldIcon(props) {
  return (
    <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.47a16 16 0 0013.2 13.2l3.47.58a2 2 0 002.23-1.34l1.24-7.44a2 2 0 00-.62-1.92z" />
    </svg>
  );
}

const STYLES = ['Casual', 'Formal', 'Sport', 'Night'];

export default function App() {
  const [activeTab, setActiveTab] = useState('closet');
  const [closet, setCloset] = useState(() => {
    const saved = localStorage.getItem('digital_closet_items');
    return saved ? JSON.parse(saved) : INITIAL_CLOSET;
  });

  const [savedOutfits, setSavedOutfits] = useState(() => {
    const saved = localStorage.getItem('digital_closet_outfits');
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStyleFilter, setSelectedStyleFilter] = useState('');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);

  const [newGarment, setNewGarment] = useState({
    name: '',
    category: 'Tops',
    subCategory: '',
    color: '',
    style: ['Casual'],
    season: ['Primavera'],
    imageUrl: '',
    tags: ''
  });

  const [occasion, setOccasion] = useState('Cena casual de noche');
  const [weather, setWeather] = useState('Fresco / Templado');
  const [vibe, setVibe] = useState('Sofisticado pero relajado');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState(null);
  const [aiError, setAiError] = useState(null);

  useEffect(() => {
    localStorage.setItem('digital_closet_items', JSON.stringify(closet));
  }, [closet]);

  useEffect(() => {
    localStorage.setItem('digital_closet_outfits', JSON.stringify(savedOutfits));
  }, [savedOutfits]);

  const filteredCloset = useMemo(() => {
    return closet.filter((item) => {
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.color.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesStyle = !selectedStyleFilter || item.style.includes(selectedStyleFilter);
      return matchesCategory && matchesSearch && matchesStyle;
    });
  }, [closet, selectedCategory, searchQuery, selectedStyleFilter]);

  const imageToBase64 = async (imageUrl) => {
    if (imageUrl.startsWith('data:image')) {
      return imageUrl.split(',')[1];
    }
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result.split(',')[1];
          resolve(base64String);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (err) {
      console.error('Error convirtiendo imagen a base64:', err);
      return null;
    }
  };

  const analyzeGarmentImageWithAI = async (imageDataUrl) => {
    setIsAnalyzingImage(true);
    setAnalysisError(null);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
      if (!apiKey) {
        throw new Error('Falta VITE_GEMINI_API_KEY en tu entorno. Añádela al archivo .env');
      }

      let base64Data = '';
      let mimeType = 'image/jpeg';

      if (imageDataUrl.startsWith('data:')) {
        const matches = imageDataUrl.match(/^data:(.*);base64,(.*)$/);
        if (matches) {
          mimeType = matches[1];
          base64Data = matches[2];
        }
      } else {
        base64Data = await imageToBase64(imageDataUrl);
      }

      if (!base64Data) {
        throw new Error('No se pudo procesar la imagen para su análisis.');
      }

      const prompt = `Analiza detenidamente esta prenda de ropa y devuelve la información técnica de moda en formato JSON estricto.
Debes categorizarla correctamente entre estas categorías disponibles: ["Tops", "Bottoms", "Outerwear", "Shoes", "Accessories"].
Estilos posibles a elegir: ["Casual", "Formal", "Sport", "Night"].
Temporadas posibles a elegir: ["Primavera", "Verano", "Otoño", "Invierno"].

Devuelve un JSON con exactamente este esquema:
{
  "name": "Nombre conciso y elegante de la prenda (Ej: Blazer Oversize Negro de Lino)",
  "category": "Una de las categorías disponibles",
  "color": "Color principal en español (Ej: Negro, Azul Denim, Beige, Verde Oliva)",
  "style": ["Lista de 1 a 2 estilos adecuados de los posibles"],
  "season": ["Lista de 1 a 3 temporadas ideales"],
  "tags": ["3 a 5 palabras clave breves para etiquetado y búsqueda"]
}`;

      const payload = {
        contents: [{
          role: 'user',
          parts: [
            { text: prompt },
            { inlineData: { mimeType, data: base64Data } }
          ]
        }],
        generationConfig: {
          responseMimeType: 'application/json'
        }
      };

      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Error API (${response.status})`);
      }

      const data = await response.json();
      const textResult = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (textResult) {
        const parsed = JSON.parse(textResult);
        setNewGarment((prev) => ({
          ...prev,
          name: parsed.name || prev.name,
          category: parsed.category && CATEGORIES.some((c) => c.id === parsed.category) ? parsed.category : prev.category,
          color: parsed.color || prev.color,
          style: Array.isArray(parsed.style) ? parsed.style : [parsed.style],
          season: Array.isArray(parsed.season) ? parsed.season : [parsed.season],
          tags: Array.isArray(parsed.tags) ? parsed.tags.join(', ') : (parsed.tags || '')
        }));
      }
    } catch (err) {
      console.error('Error al analizar prenda:', err);
      setAnalysisError('No pudimos auto-detectar los detalles. Puedes completarlos manualmente.');
    } finally {
      setIsAnalyzingImage(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result;
        setNewGarment((prev) => ({ ...prev, imageUrl }));
        analyzeGarmentImageWithAI(imageUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlImageChange = (url) => {
    setNewGarment((prev) => ({ ...prev, imageUrl: url }));
  };

  const handleTriggerUrlAnalysis = () => {
    if (newGarment.imageUrl) {
      analyzeGarmentImageWithAI(newGarment.imageUrl);
    }
  };

  const handleAddGarment = (e) => {
    e.preventDefault();
    if (!newGarment.name || !newGarment.imageUrl) return;

    const garmentToAdd = {
      ...newGarment,
      id: Date.now().toString(),
      tags: typeof newGarment.tags === 'string'
        ? newGarment.tags.split(',').map((t) => t.trim()).filter(Boolean)
        : newGarment.tags
    };

    setCloset((prev) => [garmentToAdd, ...prev]);
    setNewGarment({
      name: '',
      category: 'Tops',
      subCategory: '',
      color: '',
      style: ['Casual'],
      season: ['Primavera'],
      imageUrl: '',
      tags: ''
    });
    setIsAddModalOpen(false);
  };

  const handleDeleteGarment = (id) => {
    setCloset((prev) => prev.filter((item) => item.id !== id));
  };

  const handleGenerateOutfits = async () => {
    setIsAiLoading(true);
    setAiError(null);
    setAiRecommendations(null);

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
    if (!apiKey) {
      setAiError('Configura tu VITE_GEMINI_API_KEY para activar el personal stylist.');
      setIsAiLoading(false);
      return;
    }

    const simplifiedCloset = closet.map((item) => ({
      id: item.id,
      name: item.name,
      category: item.category,
      color: item.color,
      style: item.style.join(', '),
      season: item.season.join(', ')
    }));

    const systemPrompt = `Eres un personal stylist de moda internacional de alto nivel.
Tu tarea es armar outfits perfectos combinando ÚNICAMENTE las prendas disponibles en el armario del usuario.
Debes responder en formato JSON estricto siguiendo el esquema requerido.`;

    const userQuery = `Analiza mi armario y genera 2 a 3 propuestas de outfits excepcionales para la siguiente ocasión:
- Ocasión: "${occasion}"
- Clima / Temperatura: "${weather}"
- Estilo / Vibe deseado: "${vibe}"

Prendas disponibles en mi Placard:
${JSON.stringify(simplifiedCloset, null, 2)}

Requisitos importantes:
1. Cada outfit DEBE consistir en combinaciones coherentes de IDs existentes en el armario (por ejemplo, un top/vestido, una parte inferior si aplica, calzado y opcionalmente abrigo o accesorio).
2. Proporciona un título creativo para el outfit.
3. Explica detalladamente POR QUÉ combinan estas prendas (armonía de color, proporciones, adecuación a la ocasión).
4. Da un tip estilístico profesional (ej. "lleva la remera medio metida", "remanga el blazer").`;

    const payload = {
      contents: [{ parts: [{ text: userQuery }] }],
      systemInstruction: { parts: [{ text: systemPrompt }] },
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT',
          properties: {
            outfits: {
              type: 'ARRAY',
              items: {
                type: 'OBJECT',
                properties: {
                  title: { type: 'STRING' },
                  itemIds: {
                    type: 'ARRAY',
                    items: { type: 'STRING' },
                    description: 'Lista de IDs de las prendas elegidas del placard'
                  },
                  whyItWorks: { type: 'STRING', description: 'Explicación de la combinación' },
                  stylingTip: { type: 'STRING', description: 'Consejo práctico de estilismo' }
                },
                required: ['title', 'itemIds', 'whyItWorks', 'stylingTip']
              }
            }
          },
          required: ['outfits']
        }
      }
    };

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    let retries = 0;
    const maxRetries = 3;

    const makeCall = async () => {
      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          throw new Error(`Error API HTTP: ${response.status}`);
        }

        const data = await response.json();
        const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (candidateText) {
          const parsed = JSON.parse(candidateText);
          setAiRecommendations(parsed.outfits || []);
        } else {
          throw new Error('No se pudo obtener una respuesta válida del Asistente.');
        }
      } catch (err) {
        if (retries < maxRetries) {
          retries += 1;
          const delay = 2 ** retries * 1000;
          await new Promise((res) => setTimeout(res, delay));
          return makeCall();
        }
        console.error('Gemini API Error:', err);
        setAiError('Hubo un contratiempo al consultar al Stylist IA. Por favor, intenta de nuevo.');
      } finally {
        setIsAiLoading(false);
      }
    };

    await makeCall();
  };

  const handleSaveOutfit = (outfit) => {
    const isSaved = savedOutfits.some((o) => o.id === outfit.id || o.title === outfit.title);
    if (isSaved) return;

    const newSaved = {
      ...outfit,
      id: Date.now().toString(),
      savedAt: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
    };
    setSavedOutfits((prev) => [newSaved, ...prev]);
  };

  const handleRemoveSavedOutfit = (id) => {
    setSavedOutfits((prev) => prev.filter((o) => o.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950">
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('closet')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-200 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-amber-500/20">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-serif font-bold tracking-tight bg-gradient-to-r from-slate-100 via-amber-200 to-amber-500 bg-clip-text text-transparent">
                AURA STYLIST
              </span>
              <span className="block text-[10px] tracking-widest text-slate-400 uppercase font-sans">Digital Wardrobe & AI Studio</span>
            </div>
          </div>

          <nav className="flex items-center space-x-1 sm:space-x-2 bg-slate-950/60 p-1.5 rounded-2xl border border-slate-800/80">
            <button
              onClick={() => setActiveTab('closet')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'closet'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Grid className="w-4 h-4" />
              <span className="hidden sm:inline">Mi Placard</span>
              <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                {closet.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('stylist')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'stylist'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-semibold shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Wand2 className="w-4 h-4" />
              <span>AI Stylist</span>
            </button>

            <button
              onClick={() => setActiveTab('lookbook')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'lookbook'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              <span className="hidden sm:inline">Lookbook</span>
              {savedOutfits.length > 0 && (
                <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-bold">
                  {savedOutfits.length}
                </span>
              )}
            </button>
          </nav>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="hidden md:flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-100 text-sm px-4 py-2.5 rounded-xl border border-slate-700 transition"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>Subir Prenda</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'closet' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isActive = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition ${
                        isActive
                          ? 'bg-slate-100 text-slate-950 font-semibold shadow'
                          : 'bg-slate-950/40 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800/80'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2">
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Buscar prendas..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:border-amber-500/50"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <select
                  value={selectedStyleFilter}
                  onChange={(e) => setSelectedStyleFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-500/50"
                >
                  <option value="">Todos los estilos</option>
                  {STYLES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>

                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="md:hidden p-2.5 bg-amber-500 text-slate-950 rounded-xl"
                  title="Agregar prenda"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            {filteredCloset.length === 0 ? (
              <div className="text-center py-20 bg-slate-900/30 rounded-3xl border border-dashed border-slate-800">
                <Shirt className="w-12 h-12 mx-auto text-slate-600 mb-4" />
                <h3 className="text-lg font-medium text-slate-300">No encontramos prendas en esta categoría</h3>
                <p className="text-slate-500 text-sm mt-1">Prueba quitando los filtros o añade nuevas prendas a tu placard.</p>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="mt-6 inline-flex items-center space-x-2 bg-amber-500 text-slate-950 font-semibold px-4 py-2.5 rounded-xl text-sm hover:bg-amber-400 transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Añadir Primera Prenda</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                {filteredCloset.map((item) => (
                  <div
                    key={item.id}
                    className="group relative bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden hover:border-slate-700 transition duration-300 flex flex-col"
                  >
                    <div className="aspect-[4/5] w-full bg-slate-950 relative overflow-hidden">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
                      <span className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md text-amber-300 text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-md border border-slate-800">
                        {item.category}
                      </span>
                      <button
                        onClick={() => handleDeleteGarment(item.id)}
                        className="absolute top-3 right-3 p-1.5 bg-slate-950/80 text-slate-400 hover:text-red-400 rounded-lg backdrop-blur-md opacity-0 group-hover:opacity-100 transition duration-200 border border-slate-800"
                        title="Eliminar prenda"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="p-3.5 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-medium text-slate-200 text-sm line-clamp-1 group-hover:text-amber-400 transition">
                          {item.name}
                        </h4>
                        <div className="flex items-center space-x-2 mt-1 text-xs text-slate-400">
                          <span className="w-2 h-2 rounded-full bg-amber-500/80 inline-block" />
                          <span>{item.color}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1 mt-3">
                        {item.style.map((s) => (
                          <span key={s} className="bg-slate-800 text-slate-400 text-[10px] px-2 py-0.5 rounded-md">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'stylist' && (
          <div className="grid lg:grid-cols-12 gap-8 items-start animate-fadeIn">
            <div className="lg:col-span-4 bg-slate-900/80 p-6 rounded-3xl border border-slate-800 space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <div className="flex items-center space-x-2 text-amber-400 mb-1">
                  <Sparkles className="w-5 h-5" />
                  <span className="text-xs font-bold tracking-widest uppercase">Estudio de IA</span>
                </div>
                <h2 className="text-xl font-serif font-bold text-slate-100">Diseña tu Outfit Ideal</h2>
                <p className="text-slate-400 text-xs mt-1">
                  El Asistente IA analiza tus {closet.length} prendas guardadas para armar looks perfectos y armónicos.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-2">
                    ¿Cuál es la ocasión o evento?
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      'Cena casual de noche',
                      'Reunión de trabajo',
                      'Salida de fin de semana',
                      'Fiesta o Evento',
                      'Día relajado en casa',
                      'Viaje / Aeropuerto'
                    ].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setOccasion(preset)}
                        className={`text-left text-xs p-2.5 rounded-xl border transition ${
                          occasion === preset
                            ? 'bg-amber-500/10 border-amber-500/50 text-amber-300 font-medium'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-2 flex items-center justify-between">
                    <span>Clima / Estación</span>
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                  </label>
                  <select
                    value={weather}
                    onChange={(e) => setWeather(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl p-3 focus:outline-none focus:border-amber-500/50"
                  >
                    <option value="Cálido / Veraniego">Cálido / Sol (25°C+)</option>
                    <option value="Fresco / Templado">Fresco / Primavera (18°C - 24°C)</option>
                    <option value="Frío / Otoño e Invierno">Frío intenso (Menos de 15°C)</option>
                    <option value="Lluvioso / Nublado">Lluvioso / Viento</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-2">
                    Vibe / Estilo particular
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Minimalista, Sofisticado, Rocker, Coquette..."
                    value={vibe}
                    onChange={(e) => setVibe(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl p-3 focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>

              <button
                onClick={handleGenerateOutfits}
                disabled={isAiLoading || closet.length === 0}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold rounded-xl text-sm shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-2 transition disabled:opacity-50"
              >
                {isAiLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Creando combinaciones...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    <span>Generar Looks con IA</span>
                  </>
                )}
              </button>

              {closet.length < 3 && (
                <p className="text-[11px] text-amber-400/80 text-center">
                  ⚠️ Te recomendamos subir más prendas para obtener mejores recomendaciones.
                </p>
              )}
            </div>

            <div className="lg:col-span-8 space-y-6">
              {!isAiLoading && !aiRecommendations && !aiError && (
                <div className="bg-slate-900/40 rounded-3xl border border-dashed border-slate-800 p-12 text-center flex flex-col items-center justify-center min-h-[420px]">
                  <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400 mb-4 border border-amber-500/20">
                    <Sparkles className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-serif font-semibold text-slate-200">
                    Tu Asistente de Moda Personal está listo
                  </h3>
                  <p className="text-slate-400 text-xs max-w-md mt-2 leading-relaxed">
                    Selecciona tu ocasión y presiona "Generar Looks con IA". Analizaremos las telas, colores y tipos de prendas en tu placard para armar combinaciones únicas.
                  </p>
                </div>
              )}

              {isAiLoading && (
                <div className="space-y-6">
                  {[1, 2].map((n) => (
                    <div key={n} className="bg-slate-900/60 p-6 rounded-3xl border border-slate-800 animate-pulse space-y-4">
                      <div className="h-6 bg-slate-800 rounded w-1/3" />
                      <div className="grid grid-cols-3 gap-4">
                        <div className="aspect-[3/4] bg-slate-800 rounded-xl" />
                        <div className="aspect-[3/4] bg-slate-800 rounded-xl" />
                        <div className="aspect-[3/4] bg-slate-800 rounded-xl" />
                      </div>
                      <div className="h-4 bg-slate-800 rounded w-3/4" />
                    </div>
                  ))}
                </div>
              )}

              {aiError && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-300 text-sm flex items-center space-x-3">
                  <Info className="w-5 h-5 flex-shrink-0" />
                  <span>{aiError}</span>
                </div>
              )}

              {aiRecommendations && (
                <div className="space-y-8 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-serif font-bold text-slate-200 flex items-center space-x-2">
                      <span>Looks Sugeridos para</span>
                      <span className="text-amber-400">"{occasion}"</span>
                    </h3>
                    <span className="text-xs text-slate-500">{aiRecommendations.length} Opciones encontradas</span>
                  </div>

                  {aiRecommendations.map((outfit, index) => {
                    const items = outfit.itemIds
                      .map((id) => closet.find((c) => c.id === id))
                      .filter(Boolean);

                    const isSaved = savedOutfits.some((s) => s.title === outfit.title);

                    return (
                      <div
                        key={index}
                        className="bg-slate-900/80 rounded-3xl border border-slate-800 overflow-hidden hover:border-slate-700 transition"
                      >
                        <div className="p-6 border-b border-slate-800/80 flex items-center justify-between bg-slate-950/40">
                          <div>
                            <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20">
                              Opción #{index + 1}
                            </span>
                            <h4 className="text-xl font-serif font-bold text-slate-100 mt-2">
                              {outfit.title}
                            </h4>
                          </div>

                          <button
                            onClick={() => handleSaveOutfit({ ...outfit, items })}
                            disabled={isSaved}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
                              isSaved
                                ? 'bg-slate-800 text-amber-400 cursor-default'
                                : 'bg-slate-100 hover:bg-white text-slate-950 shadow'
                            }`}
                          >
                            <Heart className={`w-4 h-4 ${isSaved ? 'fill-amber-400' : ''}`} />
                            <span>{isSaved ? 'Guardado' : 'Guardar Look'}</span>
                          </button>
                        </div>

                        <div className="p-6 bg-slate-950/20">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                            Prenda por prenda:
                          </p>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {items.map((item) => (
                              <div key={item.id} className="bg-slate-900 p-2.5 rounded-2xl border border-slate-800 flex flex-col">
                                <div className="aspect-square rounded-xl bg-slate-950 overflow-hidden mb-2">
                                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                </div>
                                <span className="text-xs font-medium text-slate-200 line-clamp-1">{item.name}</span>
                                <span className="text-[10px] text-slate-500">{item.category} • {item.color}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="p-6 space-y-4 bg-slate-900/60 border-t border-slate-800/60">
                          <div>
                            <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1 flex items-center space-x-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                              <span>Por qué funciona este look</span>
                            </h5>
                            <p className="text-xs text-slate-400 leading-relaxed">
                              {outfit.whyItWorks}
                            </p>
                          </div>

                          <div className="bg-amber-500/5 border border-amber-500/20 p-3.5 rounded-2xl">
                            <h5 className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-1 flex items-center space-x-1.5">
                              <Zap className="w-3.5 h-3.5 text-amber-400" />
                              <span>Tip Pro de Estilismo</span>
                            </h5>
                            <p className="text-xs text-amber-200/90 leading-relaxed">
                              {outfit.stylingTip}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'lookbook' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-2xl font-serif font-bold text-slate-100">Mi Lookbook Guardado</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Colección de combinaciones recomendadas por tu Asistente IA.
                </p>
              </div>
              <span className="text-xs bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 text-slate-400">
                {savedOutfits.length} Outfits Guardados
              </span>
            </div>

            {savedOutfits.length === 0 ? (
              <div className="text-center py-20 bg-slate-900/30 rounded-3xl border border-dashed border-slate-800">
                <Bookmark className="w-12 h-12 mx-auto text-slate-600 mb-4" />
                <h3 className="text-lg font-medium text-slate-300">Aún no has guardado ningún outfit</h3>
                <p className="text-slate-500 text-sm mt-1">Genera looks en la pestaña de AI Stylist y guárdalos para tenerlos a mano.</p>
                <button
                  onClick={() => setActiveTab('stylist')}
                  className="mt-6 inline-flex items-center space-x-2 bg-amber-500 text-slate-950 font-semibold px-4 py-2.5 rounded-xl text-sm hover:bg-amber-400 transition"
                >
                  <Wand2 className="w-4 h-4" />
                  <span>Ir al Studio IA</span>
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {savedOutfits.map((outfit) => (
                  <div key={outfit.id} className="bg-slate-900/80 rounded-3xl border border-slate-800 overflow-hidden flex flex-col justify-between">
                    <div>
                      <div className="p-5 bg-slate-950/40 border-b border-slate-800 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-500 font-mono">Guardado el {outfit.savedAt}</span>
                          <h4 className="text-lg font-serif font-bold text-slate-100 mt-0.5">{outfit.title}</h4>
                        </div>
                        <button
                          onClick={() => handleRemoveSavedOutfit(outfit.id)}
                          className="p-2 text-slate-500 hover:text-red-400 transition rounded-lg hover:bg-slate-800"
                          title="Eliminar del lookbook"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="p-5 grid grid-cols-3 gap-3">
                        {outfit.items?.map((item) => (
                          <div key={item.id} className="group relative aspect-[3/4] bg-slate-950 rounded-xl overflow-hidden border border-slate-800">
                            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition p-2 flex flex-col justify-end">
                              <span className="text-[10px] text-amber-300 font-bold leading-tight">{item.name}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="px-5 pb-5 text-xs text-slate-400 space-y-2">
                        <p><strong className="text-slate-300">Styling:</strong> {outfit.whyItWorks}</p>
                        <p className="text-amber-300/80">⚡ {outfit.stylingTip}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-fadeIn max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-lg font-serif font-bold text-slate-100">Agregar Prenda con Reconocimiento IA</h3>
                  <p className="text-[11px] text-slate-400">La IA etiquetará y clasificará tu prenda automáticamente</p>
                </div>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-200 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddGarment} className="p-6 space-y-5 overflow-y-auto flex-1">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">1. Carga la foto de la prenda *</label>
                <div className="space-y-3">
                  <div className="relative border border-dashed border-amber-500/30 hover:border-amber-500/60 bg-amber-500/5 p-4 rounded-2xl text-center transition cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex flex-col items-center justify-center space-y-1 text-slate-300">
                      <Camera className="w-6 h-6 text-amber-400 mb-1" />
                      <span className="text-xs font-semibold">Subir foto desde tu dispositivo</span>
                      <span className="text-[10px] text-slate-500">Soporta JPG, PNG, WEBP</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="O pega el link URL directo de la imagen..."
                      value={newGarment.imageUrl}
                      onChange={(e) => handleUrlImageChange(e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl p-3 focus:outline-none focus:border-amber-500/50"
                    />
                    <button
                      type="button"
                      onClick={handleTriggerUrlAnalysis}
                      disabled={!newGarment.imageUrl || isAnalyzingImage}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-medium rounded-xl border border-slate-700 flex items-center space-x-1.5 disabled:opacity-50"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Analizar</span>
                    </button>
                  </div>
                </div>

                {isAnalyzingImage && (
                  <div className="mt-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center space-x-3 text-amber-300 text-xs animate-pulse">
                    <Loader2 className="w-5 h-5 animate-spin flex-shrink-0 text-amber-400" />
                    <div>
                      <p className="font-semibold">Gemini Vision está analizando la prenda...</p>
                      <p className="text-[10px] text-amber-400/80">Identificando telas, colores, cortes y recomendaciones de outfit</p>
                    </div>
                  </div>
                )}

                {analysisError && (
                  <p className="mt-2 text-[11px] text-red-400 flex items-center space-x-1">
                    <Info className="w-3.5 h-3.5" />
                    <span>{analysisError}</span>
                  </p>
                )}

                {newGarment.imageUrl && !isAnalyzingImage && (
                  <div className="mt-3 relative aspect-video rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden">
                    <img src={newGarment.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    <span className="absolute bottom-2 right-2 bg-slate-950/80 backdrop-blur-md text-amber-400 text-[10px] px-2 py-1 rounded-md border border-slate-800 font-mono">
                      Vista previa
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-4 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    2. Detalles detectados (Editables)
                  </span>
                  {newGarment.name && (
                    <span className="text-[10px] text-amber-400 flex items-center space-x-1 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Sugerido por IA</span>
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Nombre o Título *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Blazer Oversize Negro de Lino"
                    value={newGarment.name}
                    onChange={(e) => setNewGarment({ ...newGarment, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl p-3 focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Categoría</label>
                    <select
                      value={newGarment.category}
                      onChange={(e) => setNewGarment({ ...newGarment, category: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl p-3 focus:outline-none focus:border-amber-500/50"
                    >
                      {CATEGORIES.filter((c) => c.id !== 'All').map((c) => (
                        <option key={c.id} value={c.id}>{c.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Color Principal</label>
                    <input
                      type="text"
                      placeholder="Ej. Negro, Azul Denim"
                      value={newGarment.color}
                      onChange={(e) => setNewGarment({ ...newGarment, color: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl p-3 focus:outline-none focus:border-amber-500/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Etiquetas automáticas</label>
                  <input
                    type="text"
                    placeholder="Ej. Elegante, Sastrería, Urbano"
                    value={newGarment.tags}
                    onChange={(e) => setNewGarment({ ...newGarment, tags: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl p-3 focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isAnalyzingImage || !newGarment.imageUrl}
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow-md transition disabled:opacity-50"
                >
                  Guardar en Placard
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
