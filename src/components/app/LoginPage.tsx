'use client'

import { useState, useEffect } from 'react'
import { Lock, Mail, Eye, EyeOff, LogIn, AlertCircle, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface LoginPageProps {
  onLogin: (user: {
    id: string
    email: string
    name: string | null
    role: 'gestionnaire' | 'membre'
    avatar: string | null
  }) => void
}

// Helper function to safely parse JSON response
const safeJsonParse = async (response: Response) => {
  try {
    const text = await response.text()
    if (!text) return { success: false, data: null }
    if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
      console.error('API returned HTML instead of JSON')
      return { success: false, data: null, error: 'Server error' }
    }
    return JSON.parse(text)
  } catch (error) {
    console.error('JSON parse error:', error)
    return { success: false, data: null, error: 'Parse error' }
  }
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [initializing, setInitializing] = useState(true)

  // Initialiser l'utilisateur par défaut au premier chargement
  useEffect(() => {
    const initAuth = async (retryCount = 0) => {
      try {
        // Vérifier si l'utilisateur est déjà connecté
        const meRes = await fetch('/api/auth/me')
        if (meRes.ok) {
          const meData = await safeJsonParse(meRes)
          if (meData.success && meData.user) {
            onLogin(meData.user)
            return
          }
        }

        // Initialiser le gestionnaire par défaut
        await fetch('/api/auth/init')
      } catch (err) {
        console.error('Init error:', err)
        // Réessayer jusqu'à 3 fois si le serveur n'est pas prêt
        if (retryCount < 3) {
          console.log(`Retrying... (${retryCount + 1}/3)`)
          setTimeout(() => initAuth(retryCount + 1), 1000)
          return
        }
      } finally {
        if (retryCount >= 2 || retryCount === 0) {
          setInitializing(false)
        }
      }
    }

    initAuth()
  }, [onLogin])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await safeJsonParse(res)

      if (data.success) {
        onLogin(data.user)
      } else {
        setError(data.error || 'Erreur de connexion')
      }
    } catch (err) {
      setError('Erreur de connexion au serveur')
    } finally {
      setLoading(false)
    }
  }

  if (initializing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a2744] via-[#1e3a5f] to-[#0f1225] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Initialisation...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a2744] via-[#1e3a5f] to-[#0f1225] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo et titre */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/30">
            <span className="text-3xl font-bold text-white">NGP</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">NEW GESTION PROJET</h1>
          <p className="text-blue-200">Connectez-vous pour accéder à votre espace</p>
        </div>

        {/* Formulaire de connexion */}
        <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-0">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl text-center text-gray-800">Connexion</CardTitle>
            <CardDescription className="text-center text-gray-500">
              Entrez vos identifiants pour vous connecter
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="email"
                    placeholder="votre@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Mot de passe</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold py-2.5 shadow-lg shadow-amber-500/30"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <LogIn className="w-4 h-4 mr-2" />
                )}
                {loading ? 'Connexion...' : 'Se connecter'}
              </Button>
            </form>

            {/* Création de compte membre */}
            <div className="mt-6 p-4 bg-gradient-to-br from-blue-50 to-amber-50 rounded-lg border border-amber-200">
              <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold">2</span>
                Création de compte membre
              </h4>
              <p className="text-xs text-gray-600 mb-3">
                L'administrateur peut créer des comptes membres depuis son panneau de configuration (Paramètres → Gestion des membres).
              </p>
              
              <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs">📋</span>
                Résumé des rôles
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-start gap-2 p-2 bg-amber-100/50 rounded">
                  <span className="font-semibold text-amber-700 min-w-[80px]">Gestionnaire</span>
                  <span className="text-gray-600">TOUT (projets, tâches, paramètres, suppression) • Compte par défaut</span>
                </div>
                <div className="flex items-start gap-2 p-2 bg-blue-100/50 rounded">
                  <span className="font-semibold text-blue-700 min-w-[80px]">Membre</span>
                  <span className="text-gray-600">Tâches assignées, profil seulement • Via le gestionnaire</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-blue-200/50 text-sm mt-6">
          © 2024 New Gestion Projet. Tous droits réservés.
        </p>
      </div>
    </div>
  )
}
