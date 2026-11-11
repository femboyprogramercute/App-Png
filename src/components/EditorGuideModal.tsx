/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Film, Check, ExternalLink, Lightbulb, PlayCircle } from 'lucide-react';

interface EditorGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EditorGuideModal: React.FC<EditorGuideModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'capcut' | 'premiere' | 'davinci' | 'vegas'>('capcut');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2.5 mb-5">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Film className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Cómo Usar el Modelo en tu Editor de Video
            </h2>
            <p className="text-xs text-zinc-400">
              Guía paso a paso para colocar tu PNGtuber encima de tus videos
            </p>
          </div>
        </div>

        {/* Editor Tabs */}
        <div className="flex items-center gap-1.5 border-b border-zinc-800 pb-3 mb-4 overflow-x-auto">
          {[
            { id: 'capcut', label: 'CapCut (PC / Móvil)' },
            { id: 'premiere', label: 'Adobe Premiere Pro' },
            { id: 'davinci', label: 'DaVinci Resolve' },
            { id: 'vegas', label: 'Sony Vegas / Filmora' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                activeTab === tab.id
                  ? 'bg-violet-600 text-white shadow'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        <div className="space-y-4 text-xs text-zinc-300">
          {activeTab === 'capcut' && (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-violet-950/30 border border-violet-500/30">
                <span className="font-bold text-violet-300 block mb-1">
                  ⭐ Opción 1: Video Transparente (Recomendado en CapCut PC)
                </span>
                <p className="text-zinc-300 leading-relaxed">
                  Exporta como <strong>Video Transparente (Alpha)</strong> y arrástralo a la pista de superposición (Overlay) sobre tu gameplay o video. ¡Aparecerá sin fondo automáticamente sin necesidad de recortar nada!
                </p>
              </div>

              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
                <span className="font-bold text-emerald-400 block mb-1">
                  🟩 Opción 2: Pantalla Verde (CapCut Móvil y PC)
                </span>
                <ol className="list-decimal list-inside space-y-1.5 text-zinc-300">
                  <li>Exporta desde esta app como <strong>Pantalla Verde (Chroma Key)</strong>.</li>
                  <li>En CapCut, importa tu clip principal y luego añade el video del modelo como <strong>Superposición (Overlay)</strong>.</li>
                  <li>Selecciona el clip del modelo y ve a <strong>Recorte (Cutout) → Clave de croma (Chroma Key)</strong>.</li>
                  <li>Usa el gotero para seleccionar el color verde.</li>
                  <li>Ajusta la <strong>Fuerza / Intensidad</strong> entre 10 y 25 hasta que el verde desaparezca por completo.</li>
                </ol>
              </div>
            </div>
          )}

          {activeTab === 'premiere' && (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-violet-950/30 border border-violet-500/30">
                <span className="font-bold text-violet-300 block mb-1">
                  ⭐ Opción 1: Arrastre directo en la pista V2
                </span>
                <p className="text-zinc-300 leading-relaxed">
                  Los archivos exportados en <strong>Video Transparente</strong> soportan canal Alpha. Colócalo en la pista <strong>V2</strong> (por encima de tu video en V1) y podrás moverlo o escalarlo desde el panel de Controles de Efectos.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
                <span className="font-bold text-emerald-400 block mb-1">
                  🟩 Opción 2: Efecto Ultra Key (Pantalla Verde)
                </span>
                <ol className="list-decimal list-inside space-y-1.5 text-zinc-300">
                  <li>Ve a la pestaña de <strong>Efectos</strong> y busca <code className="bg-zinc-800 px-1 py-0.5 rounded text-pink-300">Incrustación por croma (Ultra Key)</code>.</li>
                  <li>Arrastra el efecto sobre el clip de tu modelo.</li>
                  <li>En <strong>Controles de efectos</strong>, haz clic en el gotero de <strong>Color de incrustación (Key Color)</strong> y selecciona el fondo verde.</li>
                  <li>¡Listo! El fondo se vuelve transparente de inmediato.</li>
                </ol>
              </div>
            </div>
          )}

          {activeTab === 'davinci' && (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
                <span className="font-bold text-white block mb-1">
                  Configuración en DaVinci Resolve:
                </span>
                <ol className="list-decimal list-inside space-y-1.5 text-zinc-300">
                  <li>Arrastra el video exportado a la pista superior en la página <strong>Edit</strong>.</li>
                  <li>Si usas Pantalla Verde, ve a la página <strong>Color</strong> o <strong>Fusion</strong>.</li>
                  <li>Agrega el nodo <strong>Delta Keyer</strong> (en Fusion) o el <strong>3D Keyer</strong> (en Color).</li>
                  <li>Muestrea el verde y conéctalo al conector de salida Alpha (nodo azul).</li>
                </ol>
              </div>
            </div>
          )}

          {activeTab === 'vegas' && (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
                <span className="font-bold text-white block mb-1">
                  En Sony Vegas o Filmora:
                </span>
                <ol className="list-decimal list-inside space-y-1.5 text-zinc-300">
                  <li>Coloca el video en la pista superior.</li>
                  <li>Añade el plugin de video <strong>Chroma Keyer</strong> (Vegas) o activa la casilla <strong>Chroma Key</strong> (Filmora).</li>
                  <li>Selecciona el color verde de fondo con el gotero y ajusta la tolerancia.</li>
                </ol>
              </div>
            </div>
          )}

          {/* Golden Tip */}
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 flex items-start gap-2.5">
            <Lightbulb className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Consejo Pro:</span>
              <span>
                El video que descargas ya incluye el audio sincronizado con los labios del avatar. Si ya tenías el audio original en tu línea de tiempo, simplemente puedes silenciar una de las dos pistas de audio para evitar eco.
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 flex justify-end pt-3 border-t border-zinc-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 rounded-lg transition"
          >
            Entendido, ¡gracias!
          </button>
        </div>
      </div>
    </div>
  );
};
