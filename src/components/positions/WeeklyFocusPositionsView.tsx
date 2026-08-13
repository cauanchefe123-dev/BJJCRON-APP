import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { WeeklyPosition, BJJClass } from '../../types';
import {
  Target,
  Video,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Star,
  Sparkles,
  BookOpen,
  Edit3,
  Trash2,
  Flame,
  Calendar,
  User,
  X,
  ExternalLink,
  UploadCloud,
  Layers,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { TechniqueVideoModal } from '../common/TechniqueVideoModal';
import { uploadVideoFile } from '../../lib/videoUpload';

const CATEGORY_LABELS: Record<string, { label: string; bg: string; text: string; border: string }> = {
  GUARDA: { label: 'Guarda', bg: 'bg-purple-500/20', text: 'text-purple-300', border: 'border-purple-500/30' },
  PASSAGEM: { label: 'Passagem de Guarda', bg: 'bg-emerald-500/20', text: 'text-emerald-300', border: 'border-emerald-500/30' },
  FINALIZAÇÃO: { label: 'Finalização', bg: 'bg-rose-500/20', text: 'text-rose-300', border: 'border-rose-500/30' },
  RASPAGEM: { label: 'Raspagem', bg: 'bg-amber-500/20', text: 'text-amber-300', border: 'border-amber-500/30' },
  QUEDA: { label: 'Queda / Takedown', bg: 'bg-blue-500/20', text: 'text-blue-300', border: 'border-blue-500/30' },
  DEFESA_ESCAPE: { label: 'Defesa & Escape', bg: 'bg-cyan-500/20', text: 'text-cyan-300', border: 'border-cyan-500/30' },
  CONTROLE_POSIÇÃO: { label: 'Controle de Posição', bg: 'bg-indigo-500/20', text: 'text-indigo-300', border: 'border-indigo-500/30' },
  NO_GI: { label: 'No-Gi / Submission', bg: 'bg-fuchsia-500/20', text: 'text-fuchsia-300', border: 'border-fuchsia-500/30' },
  GERAL: { label: 'Geral', bg: 'bg-slate-500/20', text: 'text-slate-300', border: 'border-slate-500/30' },
};

export const WeeklyFocusPositionsView: React.FC = () => {
  const { currentUser } = useAuth();
  const {
    weeklyPositions,
    classes,
    addWeeklyPosition,
    updateWeeklyPosition,
    deleteWeeklyPosition,
    updateClass,
  } = useData();

  const isStaff = currentUser?.role === 'ADMIN' || currentUser?.role === 'PROFESSOR';

  // Filters & Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('TODAS');
  const [selectedClassId, setSelectedClassId] = useState<string>('TODAS');

  // Practiced & Favorite Local Student States
  const [practicedIds, setPracticedIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('bjjcron_practiced_positions');
    return saved ? JSON.parse(saved) : [];
  });

  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('bjjcron_fav_positions');
    return saved ? JSON.parse(saved) : [];
  });

  // Video Modal State
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [activeVideo, setActiveVideo] = useState<{ title: string; focusText?: string; videoUrl?: string } | null>(null);

  // Form Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPosition, setEditingPosition] = useState<WeeklyPosition | null>(null);

  // Form Fields
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<WeeklyPosition['category']>('GUARDA');
  const [formClassId, setFormClassId] = useState('');
  const [formClassName, setFormClassName] = useState('');
  const [formProfessorName, setFormProfessorName] = useState(currentUser?.name || '');
  const [formWeekLabel, setFormWeekLabel] = useState('Foco da Semana Atual');
  const [formDescription, setFormDescription] = useState('');
  const [formKeyDetails, setFormKeyDetails] = useState<string[]>(['', '', '']);
  const [formVideoUrl, setFormVideoUrl] = useState('');
  const [formIsCurrentFocus, setFormIsCurrentFocus] = useState(true);

  // Video Upload State
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const togglePracticed = (id: string) => {
    setPracticedIds(prev => {
      const updated = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      localStorage.setItem('bjjcron_practiced_positions', JSON.stringify(updated));
      return updated;
    });
  };

  const toggleFavorite = (id: string) => {
    setFavoriteIds(prev => {
      const updated = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      localStorage.setItem('bjjcron_fav_positions', JSON.stringify(updated));
      return updated;
    });
  };

  const handleOpenVideoModal = (title: string, focusText?: string, videoUrl?: string) => {
    setActiveVideo({ title, focusText, videoUrl });
    setVideoModalOpen(true);
  };

  const handleOpenAddModal = () => {
    setEditingPosition(null);
    setFormTitle('');
    setFormCategory('GUARDA');
    const firstClass = classes[0];
    setFormClassId(firstClass?.id || '');
    setFormClassName(firstClass?.title || 'Jiu-Jitsu Fundamental');
    setFormProfessorName(currentUser?.name || 'Prof. Gabriel Santos');
    setFormWeekLabel('Foco da Semana Atual');
    setFormDescription('');
    setFormKeyDetails(['', '', '']);
    setFormVideoUrl('');
    setFormIsCurrentFocus(true);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (pos: WeeklyPosition) => {
    setEditingPosition(pos);
    setFormTitle(pos.title);
    setFormCategory(pos.category);
    setFormClassId(pos.classId || '');
    setFormClassName(pos.className || '');
    setFormProfessorName(pos.professorName);
    setFormWeekLabel(pos.weekLabel || 'Foco da Semana');
    setFormDescription(pos.description || '');
    setFormKeyDetails(pos.keyDetails && pos.keyDetails.length > 0 ? [...pos.keyDetails] : ['', '', '']);
    setFormVideoUrl(pos.videoUrl || '');
    setFormIsCurrentFocus(pos.isCurrentFocus ?? true);
    setIsModalOpen(true);
  };

  const handleKeyDetailChange = (index: number, val: string) => {
    const next = [...formKeyDetails];
    next[index] = val;
    setFormKeyDetails(next);
  };

  const handleAddKeyDetailRow = () => {
    setFormKeyDetails(prev => [...prev, '']);
  };

  const handleRemoveKeyDetailRow = (index: number) => {
    setFormKeyDetails(prev => prev.filter((_, i) => i !== index));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingVideo(true);
      setUploadProgress(0);
      const url = await uploadVideoFile(file, p => setUploadProgress(p));
      setFormVideoUrl(url);
    } catch (err: any) {
      alert(`Erro no upload do vídeo: ${err.message || 'Falha no envio'}`);
    } finally {
      setIsUploadingVideo(false);
    }
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formTitle.trim()) {
      alert('Por favor, informe o nome/título da posição.');
      return;
    }

    const cleanDetails = formKeyDetails.map(d => d.trim()).filter(d => d !== '');

    const selectedClass = classes.find(c => c.id === formClassId);
    const finalClassName = selectedClass ? selectedClass.title : formClassName || 'Todas as Turmas';

    if (editingPosition) {
      updateWeeklyPosition(editingPosition.id, {
        title: formTitle,
        category: formCategory,
        classId: formClassId,
        className: finalClassName,
        professorName: formProfessorName,
        weekLabel: formWeekLabel,
        description: formDescription,
        keyDetails: cleanDetails,
        videoUrl: formVideoUrl,
        isCurrentFocus: formIsCurrentFocus,
      });

      if (formIsCurrentFocus && formClassId) {
        updateClass(formClassId, {
          weeklyFocus: formTitle,
          weeklyFocusVideoUrl: formVideoUrl,
        });
      }
    } else {
      addWeeklyPosition({
        title: formTitle,
        category: formCategory,
        classId: formClassId,
        className: finalClassName,
        professorName: formProfessorName,
        date: new Date().toISOString().split('T')[0],
        weekLabel: formWeekLabel,
        description: formDescription,
        keyDetails: cleanDetails,
        videoUrl: formVideoUrl,
        isCurrentFocus: formIsCurrentFocus,
      });

      if (formIsCurrentFocus && formClassId) {
        updateClass(formClassId, {
          weeklyFocus: formTitle,
          weeklyFocusVideoUrl: formVideoUrl,
        });
      }
    }

    setIsModalOpen(false);
  };

  // Filter logic
  const filteredPositions = weeklyPositions.filter(pos => {
    const matchesSearch =
      pos.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pos.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pos.professorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pos.className?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (pos.keyDetails && pos.keyDetails.some(k => k.toLowerCase().includes(searchTerm.toLowerCase())));

    const matchesCategory = selectedCategory === 'TODAS' || pos.category === selectedCategory;
    const matchesClass = selectedClassId === 'TODAS' || pos.classId === selectedClassId;

    return matchesSearch && matchesCategory && matchesClass;
  });

  const activeFocusPositions = weeklyPositions.filter(p => p.isCurrentFocus);

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Top Header Card */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
              <Target className="w-5 h-5" />
            </span>
            <span className="text-xs font-black uppercase tracking-wider text-amber-400">
              Acervo & Currículo Técnico
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            Posições & Foco da Semana
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            Acompanhe o foco da semana definido pelos professores para cada turma, assista aos vídeos demonstrativos e revise o histórico de técnicas ministradas nos treinos.
          </p>
        </div>

        {isStaff && (
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/10 transition-all active:scale-95 shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Cadastrar Posição / Foco</span>
          </button>
        )}
      </div>

      {/* Metrics Summary Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Total no Acervo</span>
            <span className="text-lg font-black text-slate-100">{weeklyPositions.length} técnicas</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Foco Desta Semana</span>
            <span className="text-lg font-black text-emerald-400">{activeFocusPositions.length} ativas</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3 col-span-2 sm:col-span-1">
          <div className="p-2.5 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Minhas Praticadas</span>
            <span className="text-lg font-black text-purple-300">{practicedIds.length} concluídas</span>
          </div>
        </div>
      </div>

      {/* Highlighted Current Weekly Focus Section */}
      {activeFocusPositions.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Foco da Semana Atual nas Turmas
            </h2>
            <span className="text-[11px] text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
              Em Destaque
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeFocusPositions.map(pos => {
              const categoryInfo = CATEGORY_LABELS[pos.category] || CATEGORY_LABELS.GERAL;
              const isPracticed = practicedIds.includes(pos.id);

              return (
                <div
                  key={pos.id}
                  className="bg-slate-900/90 border border-amber-500/40 hover:border-amber-400 rounded-2xl p-4 space-y-3 shadow-xl relative overflow-hidden flex flex-col justify-between transition-all group"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />

                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${categoryInfo.bg} ${categoryInfo.text} ${categoryInfo.border}`}>
                        {categoryInfo.label}
                      </span>
                      {pos.className && (
                        <span className="text-[10px] font-bold text-slate-300 bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700">
                          {pos.className}
                        </span>
                      )}
                    </div>

                    <h3 className="font-black text-base text-slate-100 group-hover:text-amber-400 transition-colors leading-snug">
                      {pos.title}
                    </h3>

                    {pos.description && (
                      <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                        {pos.description}
                      </p>
                    )}

                    {pos.keyDetails && pos.keyDetails.length > 0 && (
                      <div className="bg-slate-950/60 rounded-xl p-2.5 border border-slate-800/80 space-y-1">
                        <span className="text-[10px] font-bold text-amber-400 uppercase block">
                          Passos de Execução:
                        </span>
                        <ul className="space-y-0.5 text-[11px] text-slate-300">
                          {pos.keyDetails.slice(0, 2).map((detail, idx) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <span className="text-amber-400 font-bold shrink-0">•</span>
                              <span className="truncate">{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 truncate">
                      <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="truncate">{pos.professorName}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => togglePracticed(pos.id)}
                        className={`p-1.5 rounded-lg text-xs font-bold transition-all border ${
                          isPracticed
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                        }`}
                        title={isPracticed ? 'Marcar como Não Estudado' : 'Marcar como Praticado'}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>

                      {pos.videoUrl ? (
                        <button
                          onClick={() => handleOpenVideoModal(pos.title, pos.description, pos.videoUrl)}
                          className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>Vídeo</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleOpenVideoModal(pos.title, pos.description, '')}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center gap-1 transition-all"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Detalhes</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search Field */}
          <div className="relative w-full sm:flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar por posição, raspagem, armlock, professor..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-amber-500 transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                ✕
              </button>
            )}
          </div>

          {/* Class Filter */}
          <div className="w-full sm:w-auto shrink-0">
            <select
              value={selectedClassId}
              onChange={e => setSelectedClassId(e.target.value)}
              className="w-full sm:w-auto px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-medium focus:outline-none focus:border-amber-500"
            >
              <option value="TODAS">Todas as Turmas</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar">
          <button
            onClick={() => setSelectedCategory('TODAS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
              selectedCategory === 'TODAS'
                ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            Todas ({weeklyPositions.length})
          </button>

          {Object.entries(CATEGORY_LABELS).map(([key, val]) => {
            const count = weeklyPositions.filter(p => p.category === key).length;
            const isSelected = selectedCategory === key;

            return (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                  isSelected
                    ? `${val.bg} ${val.text} ${val.border} ring-1 ring-amber-500/50 shadow-md`
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                {val.label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid List of Positions */}
      {filteredPositions.length === 0 ? (
        <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
          <BookOpen className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-extrabold text-slate-300">Nenhuma posição encontrada</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Não encontramos técnicas com os filtros selecionados. Tente buscar por outros termos ou cadastre uma nova posição.
          </p>
          {isStaff && (
            <button
              onClick={handleOpenAddModal}
              className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
            >
              <Plus className="w-4 h-4" />
              Cadastrar Posição
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPositions.map(pos => {
            const categoryInfo = CATEGORY_LABELS[pos.category] || CATEGORY_LABELS.GERAL;
            const isPracticed = practicedIds.includes(pos.id);
            const isFav = favoriteIds.includes(pos.id);

            return (
              <div
                key={pos.id}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-4 flex flex-col justify-between shadow-lg relative group"
              >
                <div className="space-y-3">
                  {/* Top Bar Badges */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border ${categoryInfo.bg} ${categoryInfo.text} ${categoryInfo.border}`}>
                        {categoryInfo.label}
                      </span>

                      {pos.isCurrentFocus && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          Foco Atual
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleFavorite(pos.id)}
                        className={`p-1.5 rounded-lg text-xs transition-all ${
                          isFav ? 'text-amber-400 bg-amber-500/10' : 'text-slate-500 hover:text-slate-300'
                        }`}
                        title={isFav ? 'Remover dos Favoritos' : 'Salvar nos Favoritos'}
                      >
                        <Star className={`w-4 h-4 ${isFav ? 'fill-amber-400' : ''}`} />
                      </button>

                      {isStaff && (
                        <>
                          <button
                            onClick={() => handleOpenEditModal(pos)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-all"
                            title="Editar Posição"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Deseja remover a posição "${pos.title}" do acervo?`)) {
                                deleteWeeklyPosition(pos.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-all"
                            title="Excluir Posição"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="font-extrabold text-base sm:text-lg text-slate-100 group-hover:text-amber-400 transition-colors leading-snug">
                    {pos.title}
                  </h3>

                  {/* Meta info */}
                  <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                    {pos.className && (
                      <span className="flex items-center gap-1 text-slate-300 font-medium bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                        <Layers className="w-3.5 h-3.5 text-amber-400" />
                        {pos.className}
                      </span>
                    )}

                    <span className="flex items-center gap-1 text-slate-400">
                      <User className="w-3.5 h-3.5 text-slate-500" />
                      {pos.professorName}
                    </span>

                    {pos.weekLabel && (
                      <span className="flex items-center gap-1 text-slate-500 text-[11px]">
                        <Calendar className="w-3.5 h-3.5" />
                        {pos.weekLabel}
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  {pos.description && (
                    <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-3 rounded-xl border border-slate-800/60">
                      {pos.description}
                    </p>
                  )}

                  {/* Technical Steps List */}
                  {pos.keyDetails && pos.keyDetails.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                        Detalhes & Passos Técnicos:
                      </span>
                      <div className="space-y-1">
                        {pos.keyDetails.map((detail, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-xs text-slate-200">
                            <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5 border border-amber-500/30">
                              {idx + 1}
                            </span>
                            <span className="leading-tight">{detail}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Buttons */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2 mt-2">
                  <button
                    onClick={() => togglePracticed(pos.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                      isPracticed
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <CheckCircle2 className={`w-4 h-4 ${isPracticed ? 'text-emerald-400' : 'text-slate-500'}`} />
                    <span>{isPracticed ? 'Treino Praticado' : 'Marcar Praticado'}</span>
                  </button>

                  <button
                    onClick={() => handleOpenVideoModal(pos.title, pos.description, pos.videoUrl)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-extrabold text-xs transition-all active:scale-95 cursor-pointer ${
                      pos.videoUrl
                        ? 'bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 shadow-md shadow-amber-500/10'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                    }`}
                  >
                    {pos.videoUrl ? <Video className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
                    <span>{pos.videoUrl ? 'Assistir Vídeo Aula' : 'Ver Posição'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Position Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full text-slate-100 shadow-2xl overflow-hidden my-8">
            <div className="p-4 sm:p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
                  <Target className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-extrabold text-base text-white">
                    {editingPosition ? 'Editar Posição / Foco' : 'Cadastrar Posição do Foco'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Defina detalhes da técnica para os alunos estudarem.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-4 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Title */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 block">
                  Nome da Posição / Técnica *
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  placeholder="Ex: Raspagem de De La Riva com Tomada de Costas"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              {/* Class and Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 block">
                    Turma Relacionada *
                  </label>
                  <select
                    value={formClassId}
                    onChange={e => {
                      const id = e.target.value;
                      setFormClassId(id);
                      const cl = classes.find(c => c.id === id);
                      if (cl) setFormClassName(cl.title);
                    }}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-amber-500"
                  >
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 block">
                    Categoria Técnica *
                  </label>
                  <select
                    value={formCategory}
                    onChange={e => setFormCategory(e.target.value as WeeklyPosition['category'])}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-amber-500"
                  >
                    {Object.entries(CATEGORY_LABELS).map(([key, val]) => (
                      <option key={key} value={key}>
                        {val.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Professor Name & Week Label */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 block">
                    Professor Responsável
                  </label>
                  <input
                    type="text"
                    value={formProfessorName}
                    onChange={e => setFormProfessorName(e.target.value)}
                    placeholder="Prof. Gabriel Santos"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 block">
                    Identificador de Período / Semana
                  </label>
                  <input
                    type="text"
                    value={formWeekLabel}
                    onChange={e => setFormWeekLabel(e.target.value)}
                    placeholder="Ex: Foco da Semana Atual ou Agosto/2026"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 block">
                  Descrição Geral da Posição
                </label>
                <textarea
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  placeholder="Explicação conceitual, quando aplicar e os principais objetivos da técnica..."
                  rows={2}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Dynamic Technical Steps */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-amber-400 block">
                    Passos Chave / Detalhes de Execução
                  </label>
                  <button
                    type="button"
                    onClick={handleAddKeyDetailRow}
                    className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
                  >
                    + Adicionar Passo
                  </button>
                </div>

                <div className="space-y-2">
                  {formKeyDetails.map((detail, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-500 w-5 text-center">{idx + 1}.</span>
                      <input
                        type="text"
                        value={detail}
                        onChange={e => handleKeyDetailChange(idx, e.target.value)}
                        placeholder={`Passo ${idx + 1}: Ex: Domínio de manga e encaixe do gancho...`}
                        className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-amber-500"
                      />
                      {formKeyDetails.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveKeyDetailRow(idx)}
                          className="p-2 text-slate-500 hover:text-rose-400"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Video URL & Video Upload */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <label className="text-xs font-bold text-slate-300 block flex items-center justify-between">
                  <span>Link de Vídeo Demonstrativo (YouTube, Instagram, Drive)</span>
                  <span className="text-[10px] text-amber-400">Suporta YouTube, Instagram e MP4</span>
                </label>

                <input
                  type="text"
                  value={formVideoUrl}
                  onChange={e => setFormVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=... ou link do Instagram/Drive"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-amber-500"
                />

                <div className="pt-1">
                  <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-bold cursor-pointer transition-all">
                    <UploadCloud className="w-4 h-4 text-amber-400" />
                    <span>{isUploadingVideo ? `Enviando... (${uploadProgress}%)` : 'Anexar Arquivo de Vídeo do Dispositivo'}</span>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleFileUpload}
                      disabled={isUploadingVideo}
                      className="hidden"
                    />
                  </label>

                  {isUploadingVideo && (
                    <div className="w-full bg-slate-950 rounded-full h-1.5 mt-2 overflow-hidden">
                      <div
                        className="bg-amber-500 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Set as Active Class Focus Checkbox */}
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="activeFocusCheck"
                  checked={formIsCurrentFocus}
                  onChange={e => setFormIsCurrentFocus(e.target.checked)}
                  className="mt-0.5 accent-amber-500 w-4 h-4 rounded cursor-pointer"
                />
                <label htmlFor="activeFocusCheck" className="text-xs text-amber-200 cursor-pointer">
                  <strong className="block text-amber-300">Definir como Foco Ativo da Turma</strong>
                  Ao marcar esta opção, essa posição aparecerá em destaque no painel principal dos alunos da turma e enviará uma notificação automática!
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs shadow-lg active:scale-95"
                >
                  {editingPosition ? 'Salvar Alterações' : 'Cadastrar Posição'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Embedded Video Player Modal */}
      {activeVideo && (
        <TechniqueVideoModal
          isOpen={videoModalOpen}
          onClose={() => setVideoModalOpen(false)}
          title={activeVideo.title}
          focusText={activeVideo.focusText}
          videoUrl={activeVideo.videoUrl}
        />
      )}
    </div>
  );
};
