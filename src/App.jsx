import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Plus, Home, Grid3X3, Search, Upload, Sparkles, X,
  ChevronDown, Trash2, ChevronRight, MapPin, CloudSun,
  Cloud, Sun, Settings, User, Share2, Heart, StickyNote,
  Check, ArrowRight, MessageSquare
} from 'lucide-react'

// ── Mock AI ──
const MOCK_DESCRIPTIONS = [
  "Black oversized hoodie with silver hardware",
  "Vintage washed denim jacket, relaxed fit",
  "Crisp white oxford button-down, slim cut",
  "Distressed cargo pants in army green",
  "Minimalist leather sneakers, all-white",
  "Cropped knit sweater in dusty rose",
  "Tailored wool trousers, charcoal pinstripe",
  "Canvas high-tops with gum sole",
  "Silk blend tee in midnight navy",
  "Structured blazer with subtle texture",
]

const FIT_LOGIC = [
  "Minimalist tech-wear for a rainy Tuesday",
  "Street-ready comfort meets understated flex",
  "Old money energy with a modern edge",
  "Effortless layering for unpredictable weather",
  "Clean lines, zero noise — let the fit speak",
  "Cozy grunge for a low-key weekend",
  "Power-casual: boardroom to bar in one fit",
  "Earth tones stacked right — nature core",
  "Monochrome discipline — less is more",
  "Retro sport meets contemporary minimalism",
]

function mockAI() {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(MOCK_DESCRIPTIONS[Math.floor(Math.random() * MOCK_DESCRIPTIONS.length)])
    }, 1000)
  })
}

// ── Storage ──
function loadWardrobe() {
  try { return JSON.parse(localStorage.getItem('pixiefit-wardrobe')) || [] }
  catch { return [] }
}
function saveWardrobe(items) {
  localStorage.setItem('pixiefit-wardrobe', JSON.stringify(items))
}
function loadSavedOutfits() {
  try { return JSON.parse(localStorage.getItem('pixiefit-outfits')) || [] }
  catch { return [] }
}
function saveSavedOutfitsLS(outfits) {
  localStorage.setItem('pixiefit-outfits', JSON.stringify(outfits))
}

// ── Weather Hook ──
const WEATHER_API_KEY = '365165c09dfc415db8d232442260304'

function useWeather() {
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function fetchWeather() {
      try {
        const res = await fetch(
          `https://api.weatherapi.com/v1/forecast.json?key=${WEATHER_API_KEY}&q=auto:ip&days=1`
        )
        if (!res.ok) throw new Error('fail')
        const data = await res.json()
        if (cancelled) return
        const d = data.forecast?.forecastday?.[0]
        if (d) {
          setWeather({
            tempHigh: Math.round(d.day.maxtemp_f),
            tempLow: Math.round(d.day.mintemp_f),
            condition: d.day.condition?.text || 'Clear',
            icon: d.day.condition?.icon || '',
            location: data.location?.name || '',
          })
        }
      } catch {
        if (!cancelled) {
          setWeather({
            tempHigh: 68, tempLow: 52,
            condition: 'Partly Cloudy', icon: '',
            location: 'Your City',
          })
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchWeather()
    return () => { cancelled = true }
  }, [])

  return { weather, loading }
}

// ── Rotating Subtitle ──
const ROTATING_WORDS = ['pixelated', 'AI-powered', 'curated', 'effortless', 'playful']

function RotatingSlogan() {
  const [index, setIndex] = useState(0)
  const [key, setKey] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex(prev => (prev + 1) % ROTATING_WORDS.length)
      setKey(prev => prev + 1)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <p className="text-sm text-gray-400 text-center">
      the <span key={key} className="rotating-word inline-block text-gray-600 font-medium">{ROTATING_WORDS[index]}</span> outfit app
    </p>
  )
}

// ── Create Fit Form (overlay) ──
function CreateFitForm({ wardrobe, onClose, onSaveOutfit }) {
  const [step, setStep] = useState(0) // 0=mood, 1=occasion, 2=formality, 3=generating, 4=result
  const [mood, setMood] = useState(null)
  const [occasion, setOccasion] = useState(null)
  const [formality, setFormality] = useState(null)
  const [fit, setFit] = useState(null)
  const [fitLogic, setFitLogic] = useState('')

  const moods = ['Confident', 'Relaxed', 'Adventurous', 'Minimal']
  const occasions = ['Work', 'Date night', 'Hanging out', 'Event']
  const formalities = ['Formal', 'Informal']

  const generate = () => {
    setStep(3)
    setTimeout(() => {
      const tops = wardrobe.filter(i => i.category === 'Top')
      const bottoms = wardrobe.filter(i => i.category === 'Bottom')
      const shoes = wardrobe.filter(i => i.category === 'Shoes')
      const pick = arr => arr.length > 0 ? arr[Math.floor(Math.random() * arr.length)] : null
      setFit({ top: pick(tops), bottom: pick(bottoms), shoes: pick(shoes) })
      setFitLogic(FIT_LOGIC[Math.floor(Math.random() * FIT_LOGIC.length)])
      setStep(4)
    }, 1500)
  }

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <button onClick={step > 0 && step < 4 ? () => setStep(s => s - 1) : onClose} className="text-gray-500 hover:text-gray-800">
          <ChevronDown size={22} className="rotate-90" />
        </button>
        <span className="text-sm font-semibold text-gray-900">Create Fit</span>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X size={20} />
        </button>
      </div>

      {/* Progress */}
      <div className="flex gap-1.5 px-5 pt-4">
        {[0,1,2].map(i => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= Math.min(step, 2) ? 'bg-gray-900' : 'bg-gray-200'}`} />
        ))}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {step === 0 && (
          <div className="slide-in flex flex-col items-center gap-6 w-full max-w-xs">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-1">What's your mood?</h2>
              <p className="text-sm text-gray-400">How are you feeling today?</p>
            </div>
            <div className="flex flex-col gap-2 w-full">
              {moods.map(m => (
                <button key={m} onClick={() => { setMood(m); setTimeout(() => setStep(1), 250) }}
                  className={`w-full py-3.5 rounded-xl text-sm font-semibold transition-all ${
                    mood === m ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}>{m}</button>
              ))}
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="slide-in flex flex-col items-center gap-6 w-full max-w-xs">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-1">Where are you headed?</h2>
              <p className="text-sm text-gray-400">Pick the occasion</p>
            </div>
            <div className="flex flex-col gap-2 w-full">
              {occasions.map(o => (
                <button key={o} onClick={() => { setOccasion(o); setTimeout(() => setStep(2), 250) }}
                  className={`w-full py-3.5 rounded-xl text-sm font-semibold transition-all ${
                    occasion === o ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}>{o}</button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="slide-in flex flex-col items-center gap-6 w-full max-w-xs">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-1">Dress code?</h2>
              <p className="text-sm text-gray-400">Keep it clean or keep it casual</p>
            </div>
            <div className="flex gap-3 w-full">
              {formalities.map(f => (
                <button key={f} onClick={() => { setFormality(f); setTimeout(generate, 250) }}
                  className={`flex-1 py-3.5 rounded-xl text-sm font-semibold transition-all ${
                    formality === f ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}>{f}</button>
              ))}
            </div>
            {wardrobe.length === 0 && (
              <p className="text-sm text-gray-400 text-center">Add items to your wardrobe first</p>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-3 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
            <p className="text-sm text-gray-500">Curating your fit...</p>
          </div>
        )}

        {step === 4 && fit && (
          <div className="slide-in flex flex-col items-center gap-5 w-full max-w-sm -mt-8">
            <h2 className="text-lg font-semibold text-gray-900">Your Outfit</h2>
            <div className="flex gap-2 text-xs text-gray-400">
              <span className="px-3 py-1 bg-gray-100 rounded-full">{mood}</span>
              <span className="px-3 py-1 bg-gray-100 rounded-full">{occasion}</span>
              <span className="px-3 py-1 bg-gray-100 rounded-full">{formality}</span>
            </div>

            <div className="w-full bg-gray-50 rounded-2xl p-5 flex flex-col gap-3">
              {[
                { label: 'Top', item: fit.top },
                { label: 'Bottom', item: fit.bottom },
                { label: 'Shoes', item: fit.shoes },
              ].map(({ label, item }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-white border border-gray-200 flex items-center justify-center flex-shrink-0">
                    {item ? <img src={item.image} alt="" className="pixel-img w-full h-full object-cover" /> : <span className="text-xs text-gray-300">—</span>}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] text-gray-400 uppercase tracking-wider">{label}</p>
                    <p className="text-sm text-gray-800 truncate">{item?.description || 'No item'}</p>
                  </div>
                </div>
              ))}
            </div>

            {fitLogic && (
              <p className="text-sm text-gray-500 italic text-center">"{fitLogic}"</p>
            )}

            <div className="flex gap-3 w-full">
              <button onClick={() => { setStep(0); setMood(null); setOccasion(null); setFormality(null); setFit(null) }}
                className="flex-1 py-3 border border-gray-200 text-gray-700 font-medium rounded-2xl hover:bg-gray-50 transition-all text-sm">
                Try Again
              </button>
              <button onClick={() => {
                onSaveOutfit({
                  id: `fit-${Date.now()}`,
                  top: fit.top?.id || null, bottom: fit.bottom?.id || null, shoes: fit.shoes?.id || null,
                  fitLogic, mood, occasion, formality, liked: false, notes: '',
                  createdAt: new Date().toISOString(),
                  _top: fit.top, _bottom: fit.bottom, _shoes: fit.shoes,
                })
                onClose()
              }}
                className="flex-1 py-3 bg-gray-900 text-white font-medium rounded-2xl hover:bg-gray-800 transition-all text-sm">
                Save Fit
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Outfit Card (for home screen) ──
function OutfitCard({ outfit, wardrobe, onToggleLike, onUpdateNotes }) {
  const [showNotes, setShowNotes] = useState(false)
  const findItem = (id) => wardrobe.find(i => i.id === id)
  const top = findItem(outfit.top) || outfit._top
  const bottom = findItem(outfit.bottom) || outfit._bottom
  const shoes = findItem(outfit.shoes) || outfit._shoes
  const items = [top, bottom, shoes].filter(Boolean)

  return (
    <div className="flex flex-col">
      {/* Outfit image stack */}
      <div className="bg-gray-50 rounded-2xl border border-gray-100 p-3 flex flex-col items-center gap-1">
        {items.length > 0 ? items.map((item, i) => (
          <div key={i} className="w-full aspect-[4/3] overflow-hidden rounded-lg bg-white flex items-center justify-center">
            <img src={item.image} alt="" className="pixel-img w-full h-full object-contain" />
          </div>
        )) : (
          <div className="w-full aspect-[3/4] flex items-center justify-center">
            <p className="text-xs text-gray-300">Empty</p>
          </div>
        )}
        {/* Small thumbnails at bottom */}
        <div className="flex gap-1 mt-1 self-start">
          {items.map((item, i) => (
            <div key={i} className="w-6 h-6 rounded overflow-hidden border border-gray-200 bg-white">
              <img src={item.image} alt="" className="pixel-img w-full h-full object-cover" />
            </div>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-between px-1 py-2">
        <button onClick={() => onToggleLike(outfit.id)}
          className="text-gray-400 hover:text-pink-500 transition-colors p-1">
          <Heart size={18} className={outfit.liked ? 'fill-pink-500 text-pink-500' : ''} />
        </button>
        <button onClick={() => setShowNotes(!showNotes)}
          className={`p-1 transition-colors ${showNotes ? 'text-gray-800' : 'text-gray-400 hover:text-gray-700'}`}>
          <MessageSquare size={18} />
        </button>
        <button className="text-gray-400 hover:text-gray-700 transition-colors p-1">
          <Share2 size={18} />
        </button>
      </div>

      {showNotes && (
        <textarea
          value={outfit.notes || ''}
          onChange={e => onUpdateNotes(outfit.id, e.target.value)}
          placeholder="Add notes..."
          rows={2}
          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-700 placeholder-gray-400 resize-none focus:outline-none focus:border-gray-400 transition-colors"
        />
      )}
    </div>
  )
}

// ── Home Screen ──
function HomeScreen({ wardrobe, weather, weatherLoading, savedOutfits, onOpenCreateFit, onSaveOutfit, onDeleteOutfit, onUpdateNotes, onToggleLike, onGoToCloset, onGoToSaved }) {
  const [tab, setTab] = useState('outfit')

  const today = new Date()
  const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

  // Generate display outfits from wardrobe items
  const displayOutfits = savedOutfits.length > 0
    ? savedOutfits.slice(0, 6)
    : generateMockOutfits(wardrobe)

  return (
    <div className="flex flex-col pb-28">
      {/* Header: profile — logo — settings */}
      <div className="flex items-center justify-between px-5 pt-5 pb-2">
        <button className="text-gray-400 hover:text-gray-600 transition-colors">
          <User size={26} />
        </button>
        <h1 className="text-2xl font-bold text-gray-900 italic tracking-tight">PixieFit</h1>
        <button className="text-gray-400 hover:text-gray-600 transition-colors">
          <Settings size={26} />
        </button>
      </div>

      {/* Rotating slogan */}
      <div className="py-3">
        <RotatingSlogan />
      </div>

      {/* Weather + Create Fit buttons */}
      <div className="flex gap-3 px-5 mb-5">
        {/* Weather — 1/3 */}
        <div className="w-1/3 bg-gray-50 border border-gray-200 rounded-2xl p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Today</span>
            {weather?.icon ? (
              <img src={weather.icon.startsWith('//') ? 'https:' + weather.icon : weather.icon} alt="" className="w-6 h-6" />
            ) : (
              <CloudSun size={16} className="text-gray-400" />
            )}
          </div>
          <p className="text-[10px] text-gray-400">
            {dayNames[today.getDay()]} {monthNames[today.getMonth()]} {today.getDate()}
          </p>
          {weatherLoading ? (
            <div className="h-5 loading-shimmer rounded mt-1" />
          ) : weather ? (
            <p className="text-sm font-bold text-gray-900 mt-1">
              {weather.tempHigh}° <span className="font-normal text-gray-400 text-xs">/ {weather.tempLow}°</span>
            </p>
          ) : (
            <p className="text-xs text-gray-400 mt-1">—</p>
          )}
          {weather && <p className="text-[10px] text-gray-400 mt-0.5 truncate">{weather.condition}</p>}
        </div>

        {/* Create Fit — 2/3 */}
        <button
          onClick={onOpenCreateFit}
          className="w-2/3 bg-gray-900 rounded-2xl p-4 flex flex-col justify-between text-left hover:bg-gray-800 transition-colors"
        >
          <div>
            <p className="text-white font-semibold text-base">Create Fit</p>
            <p className="text-gray-400 text-xs mt-1">AI-curated outfit for today</p>
          </div>
          <div className="flex items-center gap-1 mt-3">
            <Sparkles size={14} className="text-gray-400" />
            <span className="text-xs text-gray-400">Tap to start</span>
            <ArrowRight size={12} className="text-gray-400 ml-auto" />
          </div>
        </button>
      </div>

      {/* Tabs: Closet / Outfit / Saved */}
      <div className="flex px-5 mb-4">
        {[
          { id: 'closet', label: 'Closet' },
          { id: 'outfit', label: 'Outfit' },
          { id: 'saved', label: 'Saved' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => {
              if (t.id === 'closet') { onGoToCloset(); return }
              if (t.id === 'saved') { onGoToSaved(); return }
              setTab(t.id)
            }}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${
              tab === t.id ? 'text-gray-900' : 'text-gray-400'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Outfit grid */}
      {tab === 'outfit' && (
        <div className="px-5">
          {displayOutfits.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center">
              <Sparkles size={28} className="text-gray-300 mb-3" />
              <p className="text-sm text-gray-500">No outfits yet</p>
              <p className="text-xs text-gray-400 mt-1">Create a fit to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {displayOutfits.map(outfit => (
                <OutfitCard
                  key={outfit.id}
                  outfit={outfit}
                  wardrobe={wardrobe}
                  onToggleLike={onToggleLike}
                  onUpdateNotes={onUpdateNotes}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Generate mock outfit combos from wardrobe for display
function generateMockOutfits(wardrobe) {
  if (wardrobe.length === 0) return []
  const tops = wardrobe.filter(i => i.category === 'Top')
  const bottoms = wardrobe.filter(i => i.category === 'Bottom')
  const shoes = wardrobe.filter(i => i.category === 'Shoes')
  const combos = []
  const count = Math.min(4, Math.max(tops.length, bottoms.length, 1))
  for (let i = 0; i < count; i++) {
    const top = tops[i % tops.length] || null
    const bottom = bottoms[i % bottoms.length] || null
    const shoe = shoes[i % shoes.length] || null
    combos.push({
      id: `mock-${i}`,
      top: top?.id, bottom: bottom?.id, shoes: shoe?.id,
      _top: top, _bottom: bottom, _shoes: shoe,
      fitLogic: FIT_LOGIC[i % FIT_LOGIC.length],
      liked: false, notes: '',
    })
  }
  return combos
}

// ── Closet Grid ──
function ClosetGrid({ wardrobe }) {
  const [filterCat, setFilterCat] = useState('All')
  const categories = ['All', 'Top', 'Bottom', 'Shoes', 'Outerwear', 'Accessory']
  const filtered = wardrobe.filter(i => filterCat === 'All' || i.category === filterCat)

  return (
    <div className="pt-3">
      <div className="flex gap-2 overflow-x-auto scrollbar-none pb-3 px-5">
        {categories.map(cat => (
          <button key={cat} onClick={() => setFilterCat(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              filterCat === cat ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>{cat === 'All' ? 'All' : cat + 's'}</button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center">
          <Grid3X3 size={32} className="text-gray-300 mb-3" />
          <p className="text-sm text-gray-500">No items yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2 px-5 mt-1">
          {filtered.map(item => (
            <div key={item.id} className="aspect-square rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
              <img src={item.image} alt={item.description} className="pixel-img w-full h-full object-cover" />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Wardrobe / Closet Screen ──
function WardrobeScreen({ wardrobe, onDelete, savedOutfits, onToggleLike, onUpdateNotes, onDeleteOutfit, initialTab }) {
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('All')
  const [tab, setTab] = useState(initialTab || 'closet')
  const categories = ['All', 'Top', 'Bottom', 'Shoes', 'Accessory', 'Outerwear']

  const filtered = wardrobe.filter(item => {
    const matchSearch = search === '' ||
      item.description.toLowerCase().includes(search.toLowerCase()) ||
      item.style.toLowerCase().includes(search.toLowerCase())
    const matchCat = filterCat === 'All' || item.category === filterCat
    return matchSearch && matchCat
  })

  const findItem = (id) => wardrobe.find(i => i.id === id)

  return (
    <div className="flex flex-col gap-4 px-5 pt-5 pb-28">
      <div className="text-center">
        <p className="text-sm font-bold text-gray-900 italic mb-1">PixieFit</p>
        <h2 className="text-2xl font-semibold text-gray-900">Wardrobe</h2>
      </div>

      {/* Tabs */}
      <div className="flex">
        {['closet', 'saved'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2 text-sm font-medium capitalize transition-colors ${
              tab === t ? 'text-gray-900' : 'text-gray-400'
            }`}>{t === 'closet' ? 'Closet' : 'Saved Outfits'}</button>
        ))}
      </div>

      {tab === 'closet' ? (
        <>
          {/* Search */}
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search items..."
              className="w-full bg-gray-50 border border-gray-200 rounded-full pl-10 pr-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-colors" />
          </div>

          {/* Category pills */}
          <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
            {categories.map(cat => (
              <button key={cat} onClick={() => setFilterCat(cat)}
                className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  filterCat === cat ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}>{cat}</button>
            ))}
          </div>

          {/* Grid */}
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center">
              <Grid3X3 size={28} className="text-gray-300 mb-3" />
              <p className="text-sm text-gray-500">{wardrobe.length === 0 ? 'Your wardrobe is empty' : 'No matches'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filtered.map(item => (
                <div key={item.id} className="group relative bg-white border border-gray-200 rounded-2xl overflow-hidden">
                  <div className="aspect-square overflow-hidden bg-gray-50">
                    <img src={item.image} alt={item.description} className="pixel-img w-full h-full object-cover" />
                  </div>
                  <div className="p-3">
                    <p className="text-xs text-gray-600 truncate">{item.description}</p>
                    <div className="flex gap-1.5 mt-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{item.category}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-light text-blue-accent">{item.style}</span>
                    </div>
                  </div>
                  <button onClick={() => onDelete(item.id)}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 border border-gray-200 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        /* Saved Outfits */
        savedOutfits.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <Heart size={28} className="text-gray-300 mb-3" />
            <p className="text-sm text-gray-500">No saved outfits yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {savedOutfits.map(outfit => (
              <OutfitCard
                key={outfit.id}
                outfit={outfit}
                wardrobe={wardrobe}
                onToggleLike={onToggleLike}
                onUpdateNotes={onUpdateNotes}
              />
            ))}
          </div>
        )
      )}
    </div>
  )
}

// ── Add Item Screen ──
function AddItemScreen({ onAdd }) {
  const fileRef = useRef(null)
  const [image, setImage] = useState(null)
  const [description, setDescription] = useState('')
  const [userDesc, setUserDesc] = useState('')
  const [category, setCategory] = useState('Top')
  const [style, setStyle] = useState('Casual')
  const [analyzing, setAnalyzing] = useState(false)
  const [step, setStep] = useState('upload')

  const handleFile = useCallback(async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async (ev) => {
      const img = new Image()
      img.onload = async () => {
        const canvas = document.createElement('canvas')
        const size = 64
        canvas.width = size; canvas.height = size
        const ctx = canvas.getContext('2d')
        ctx.imageSmoothingEnabled = false
        ctx.drawImage(img, 0, 0, size, size)
        setImage(canvas.toDataURL('image/png'))
        setStep('edit')
        setAnalyzing(true)
        const desc = await mockAI()
        setDescription(desc)
        setAnalyzing(false)
      }
      img.src = ev.target.result
    }
    reader.readAsDataURL(file)
  }, [])

  const handleSave = useCallback(() => {
    if (!image) return
    onAdd({
      id: Date.now().toString(),
      image, description: userDesc || description || 'No description', category, style,
      createdAt: new Date().toISOString(),
    })
    setImage(null); setDescription(''); setUserDesc('')
    setCategory('Top'); setStyle('Casual'); setStep('upload')
    if (fileRef.current) fileRef.current.value = ''
  }, [image, description, userDesc, category, style, onAdd])

  const reset = () => {
    setImage(null); setDescription(''); setUserDesc(''); setStep('upload')
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div className="flex flex-col gap-5 px-5 pt-5 pb-28">
      <div className="text-center">
        <p className="text-sm font-bold text-gray-900 italic mb-1">PixieFit</p>
        <h2 className="text-2xl font-semibold text-gray-900">Add Item</h2>
      </div>

      {step === 'upload' ? (
        <div className="flex flex-col items-center gap-4">
          <label className="w-36 h-36 rounded-2xl border-2 border-dashed border-gray-300 hover:border-gray-500 bg-gray-50 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all mx-auto">
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="file-input-hidden" />
            <Upload size={24} className="text-gray-400" />
            <p className="text-xs text-gray-500">Tap to upload</p>
          </label>
          <div className="w-full max-w-sm">
            <label className="text-xs text-gray-500 font-medium mb-1.5 block">Description</label>
            <input type="text" value={userDesc} onChange={e => setUserDesc(e.target.value)}
              placeholder="e.g. Black oversized hoodie"
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-colors" />
          </div>
          <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
            <div>
              <label className="text-xs text-gray-500 font-medium mb-1.5 block">Category</label>
              <div className="relative">
                <select value={category} onChange={e => setCategory(e.target.value)}
                  className="w-full appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-gray-400 transition-colors">
                  {['Top', 'Bottom', 'Shoes', 'Accessory', 'Outerwear'].map(o => <option key={o}>{o}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium mb-1.5 block">Style</label>
              <div className="relative">
                <select value={style} onChange={e => setStyle(e.target.value)}
                  className="w-full appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-gray-400 transition-colors">
                  {['Casual', 'Formal', 'Streetwear', 'Emo', 'Old Money', 'Sporty', 'Vintage'].map(o => <option key={o}>{o}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-sm mx-auto flex flex-col gap-4">
          <div className="relative mx-auto">
            <div className="w-40 h-40 rounded-2xl overflow-hidden bg-gray-50 border border-gray-200">
              <img src={image} alt="Preview" className="pixel-img w-full h-full object-cover" />
            </div>
            <button onClick={reset} className="absolute -top-2 -right-2 p-1.5 rounded-full bg-white border border-gray-200 text-gray-500 hover:text-gray-800 transition-colors">
              <X size={14} />
            </button>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={14} className="text-blue-accent" />
              <span className="text-xs font-medium text-blue-accent">AI Analysis</span>
              {analyzing && <span className="text-[11px] text-gray-400 ml-auto">Analyzing...</span>}
            </div>
            {analyzing ? <div className="h-10 loading-shimmer rounded-xl" /> : <p className="text-sm text-gray-600">{description}</p>}
          </div>
          <div>
            <label className="text-xs text-gray-500 font-medium mb-1.5 block">Description</label>
            <input type="text" value={userDesc} onChange={e => setUserDesc(e.target.value)}
              placeholder="Override or add your own"
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-colors" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 font-medium mb-1.5 block">Category</label>
              <div className="relative">
                <select value={category} onChange={e => setCategory(e.target.value)}
                  className="w-full appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-gray-400 transition-colors">
                  {['Top', 'Bottom', 'Shoes', 'Accessory', 'Outerwear'].map(o => <option key={o}>{o}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium mb-1.5 block">Style</label>
              <div className="relative">
                <select value={style} onChange={e => setStyle(e.target.value)}
                  className="w-full appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-gray-400 transition-colors">
                  {['Casual', 'Formal', 'Streetwear', 'Emo', 'Old Money', 'Sporty', 'Vintage'].map(o => <option key={o}>{o}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
          <button onClick={handleSave} disabled={analyzing}
            className="w-full py-3.5 bg-gray-900 text-white font-semibold rounded-2xl hover:bg-gray-800 transition-all disabled:opacity-40">
            Add to Wardrobe
          </button>
        </div>
      )}
    </div>
  )
}

// ── Main App ──
export default function App() {
  const [screen, setScreen] = useState('home')
  const [wardrobeTab, setWardrobeTab] = useState('closet')
  const [wardrobe, setWardrobe] = useState(loadWardrobe)
  const [savedOutfits, setSavedOutfits] = useState(loadSavedOutfits)
  const [showCreateFit, setShowCreateFit] = useState(false)
  const { weather, loading: weatherLoading } = useWeather()

  useEffect(() => { saveWardrobe(wardrobe) }, [wardrobe])
  useEffect(() => { saveSavedOutfitsLS(savedOutfits) }, [savedOutfits])

  const addItem = useCallback((item) => { setWardrobe(prev => [item, ...prev]) }, [])
  const deleteItem = useCallback((id) => { setWardrobe(prev => prev.filter(i => i.id !== id)) }, [])

  const saveOutfit = useCallback((outfit) => {
    setSavedOutfits(prev => {
      const exists = prev.some(s => s.id === outfit.id)
      if (exists) return prev
      return [outfit, ...prev]
    })
  }, [])

  const deleteOutfit = useCallback((id) => {
    setSavedOutfits(prev => prev.filter(o => o.id !== id))
  }, [])

  const updateOutfitNotes = useCallback((id, notes) => {
    setSavedOutfits(prev => prev.map(o => o.id === id ? { ...o, notes } : o))
  }, [])

  const toggleOutfitLike = useCallback((id) => {
    setSavedOutfits(prev => prev.map(o => o.id === id ? { ...o, liked: !o.liked } : o))
  }, [])

  return (
    <div className="min-h-screen bg-white relative max-w-md mx-auto">
      {screen === 'home' && (
        <HomeScreen
          wardrobe={wardrobe}
          weather={weather}
          weatherLoading={weatherLoading}
          savedOutfits={savedOutfits}
          onOpenCreateFit={() => setShowCreateFit(true)}
          onSaveOutfit={saveOutfit}
          onDeleteOutfit={deleteOutfit}
          onUpdateNotes={updateOutfitNotes}
          onToggleLike={toggleOutfitLike}
          onGoToCloset={() => { setWardrobeTab('closet'); setScreen('wardrobe') }}
          onGoToSaved={() => { setWardrobeTab('saved'); setScreen('wardrobe') }}
        />
      )}
      {screen === 'add' && <AddItemScreen onAdd={(item) => { addItem(item); setScreen('home') }} />}
      {screen === 'wardrobe' && (
        <WardrobeScreen
          wardrobe={wardrobe}
          onDelete={deleteItem}
          savedOutfits={savedOutfits}
          onToggleLike={toggleOutfitLike}
          onUpdateNotes={updateOutfitNotes}
          onDeleteOutfit={deleteOutfit}
          initialTab={wardrobeTab}
        />
      )}

      {/* Create Fit overlay */}
      {showCreateFit && (
        <CreateFitForm
          wardrobe={wardrobe}
          onClose={() => setShowCreateFit(false)}
          onSaveOutfit={saveOutfit}
        />
      )}

      {/* Bottom Nav */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
        <div className="flex items-center gap-5 bg-white/95 backdrop-blur-xl border border-gray-200 rounded-full px-7 py-3 shadow-lg shadow-black/8">
          <button onClick={() => setScreen('home')}
            className={`p-2.5 rounded-full transition-colors ${screen === 'home' ? 'text-gray-900' : 'text-gray-400'}`}>
            <Home size={24} />
          </button>

          <button onClick={() => setScreen('add')}
            className="flex items-center justify-center w-14 h-14 -my-3 mx-2 rounded-full bg-gray-900 text-white shadow-md">
            <Plus size={28} strokeWidth={2.5} />
          </button>

          <button onClick={() => { setWardrobeTab('closet'); setScreen('wardrobe') }}
            className={`p-2.5 rounded-full transition-colors ${screen === 'wardrobe' ? 'text-gray-900' : 'text-gray-400'}`}>
            <Grid3X3 size={24} />
          </button>
        </div>
      </div>
    </div>
  )
}
