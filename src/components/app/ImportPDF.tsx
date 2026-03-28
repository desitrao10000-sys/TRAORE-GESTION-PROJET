'use client'

import { useState, useCallback } from 'react'
import { FileUp, Brain, Upload, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'

export function ImportPDF() {
  const [isDragging, setIsDragging] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisComplete, setAnalysisComplete] = useState(false)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0 && files[0].type === 'application/pdf') {
      setUploadedFile(files[0])
      setAnalysisComplete(false)
    }
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      setUploadedFile(files[0])
      setAnalysisComplete(false)
    }
  }

  const handleAnalyze = async () => {
    if (!uploadedFile) return
    
    setIsAnalyzing(true)
    // Simuler l'analyse
    await new Promise(resolve => setTimeout(resolve, 3000))
    setIsAnalyzing(false)
    setAnalysisComplete(true)
  }

  return (
    <div className="space-y-6">
      {/* Titre */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-white drop-shadow-lg">Import PDF (IA)</h1>
        <p className="text-blue-200 mt-1">Génération automatique de tâches depuis vos documents</p>
      </div>

      {/* Zone de dépôt */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer
          ${isDragging 
            ? 'border-amber-400 bg-amber-400/10' 
            : 'border-blue-400/30 bg-gradient-to-br from-[#1e3a5f] to-[#1a2744] hover:border-amber-400/50'
          }
          shadow-lg shadow-blue-500/10
        `}
      >
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        {uploadedFile ? (
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 bg-gradient-to-br from-green-400 to-green-500 rounded-full shadow-lg">
              <FileText className="w-12 h-12 text-white" />
            </div>
            <div>
              <p className="text-lg font-medium text-white">{uploadedFile.name}</p>
              <p className="text-sm text-blue-200 mt-1">
                {(uploadedFile.size / 1024 / 1024).toFixed(2)} Mo
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setUploadedFile(null)
                setAnalysisComplete(false)
              }}
              className="text-sm text-blue-200 hover:text-white transition-colors"
            >
              Changer de fichier
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 bg-gradient-to-br from-[#2d4a6f] to-[#1e3a5f] rounded-full border border-blue-400/30">
              <Upload className="w-12 h-12 text-blue-300" />
            </div>
            <div>
              <p className="text-lg font-medium text-white">Déposez votre fichier PDF ici</p>
              <p className="text-sm text-blue-200 mt-1">ou cliquez pour parcourir vos fichiers</p>
            </div>
          </div>
        )}
      </div>

      {/* Comment ça marche */}
      <div className="bg-gradient-to-br from-[#1e3a5f] to-[#1a2744] rounded-xl border-l-4 border-amber-400 p-6 shadow-lg shadow-blue-500/10">
        <h2 className="text-lg font-semibold text-amber-400 mb-4">Comment ça marche ?</h2>
        <ol className="space-y-3">
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-amber-400 to-amber-500 text-black rounded-full flex items-center justify-center text-sm font-bold shadow-lg">1</span>
            <p className="text-blue-100">Déposez un PDF (cahier des charges, rapport, plan de projet...)</p>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-amber-400 to-amber-500 text-black rounded-full flex items-center justify-center text-sm font-bold shadow-lg">2</span>
            <p className="text-blue-100">L'IA analyse le document et extrait les tâches potentielles</p>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-amber-400 to-amber-500 text-black rounded-full flex items-center justify-center text-sm font-bold shadow-lg">3</span>
            <p className="text-blue-100">Vous validez les tâches à ajouter avec le statut « Brouillon à valider »</p>
          </li>
        </ol>
      </div>

      {/* Bouton d'analyse */}
      {uploadedFile && !analysisComplete && (
        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 disabled:from-amber-400/50 disabled:to-amber-500/50 text-black font-bold py-4 rounded-xl transition-all shadow-lg shadow-amber-500/30"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Analyse en cours...
            </>
          ) : (
            <>
              <Brain className="w-5 h-5" />
              Analyser avec l'IA
            </>
          )}
        </button>
      )}

      {/* Résultat de l'analyse */}
      {analysisComplete && (
        <div className="bg-gradient-to-br from-[#1e3a5f] to-[#1a2744] rounded-xl border border-green-400/50 p-6 shadow-lg shadow-blue-500/10">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle2 className="w-6 h-6 text-green-400" />
            <h2 className="text-lg font-semibold text-white">Analyse terminée !</h2>
          </div>
          <p className="text-blue-200 mb-4">
            L'IA a identifié <span className="text-amber-400 font-semibold">5 tâches potentielles</span> dans votre document.
          </p>
          <div className="space-y-3">
            <div className="bg-gradient-to-br from-[#2d4a6f] to-[#1e3a5f] rounded-xl p-4 border border-blue-400/20">
              <p className="text-white font-medium">Définir le périmètre du projet</p>
              <p className="text-sm text-blue-200 mt-1">Priorité suggérée: Haute</p>
            </div>
            <div className="bg-gradient-to-br from-[#2d4a6f] to-[#1e3a5f] rounded-xl p-4 border border-blue-400/20">
              <p className="text-white font-medium">Réaliser l'étude de faisabilité</p>
              <p className="text-sm text-blue-200 mt-1">Priorité suggérée: Haute</p>
            </div>
            <div className="bg-gradient-to-br from-[#2d4a6f] to-[#1e3a5f] rounded-xl p-4 border border-blue-400/20">
              <p className="text-white font-medium">Constituer l'équipe projet</p>
              <p className="text-sm text-blue-200 mt-1">Priorité suggérée: Moyenne</p>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button className="flex-1 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-black font-bold py-3 rounded-xl transition-all shadow-lg shadow-amber-500/30">
              Valider toutes les tâches
            </button>
            <button 
              onClick={() => {
                setUploadedFile(null)
                setAnalysisComplete(false)
              }}
              className="flex-1 bg-gradient-to-br from-[#2d4a6f] to-[#1e3a5f] hover:from-[#3d5a7f] hover:to-[#2d4a6f] text-white font-bold py-3 rounded-xl transition-all border border-blue-400/20"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
