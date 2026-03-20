'use client'

import { useState, useEffect } from 'react'
import { Lock, Mail, Eye, EyeOff, LogIn, AlertCircle, Loader2, UserPlus, User } from 'lucide-react'
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

export function LoginPage({ onLogin }: LoginPageProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [initializing, setInitializing] = useState(true)

  // Initialiser l'utilisateur par défaut au premier chargement
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Vérifier si l'utilisateur est déjà connecté
        const meRes = await fetch('/api/auth/me')
        if (meRes.ok) {
          const meData = await meRes.json()
          if (meData.success && meData.user) {
            onLogin(meData.user)
            return
          }
        }

        // Initialiser le gestionnaire par défaut
        await fetch('/api/auth/init')
      } catch (err) {
        console.error('Init error:', err)
      } finally {
        setInitializing(false)
      }
    }

    initAuth()
  }, [onLogin])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await res.json()

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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    // Validation
    if (!name.trim()) {
      setError('Le nom est requis')
      return
    }
    if (!email.trim()) {
      setError('L\'email est requis')
      return
    }
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères')
      return
    }
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: email.toLowerCase(), 
          name, 
          password 
        })
      })

      const data = await res.json()

      if (data.success) {
        setSuccess('Compte créé avec succès! Vous pouvez maintenant vous connecter.')
        setMode('login')
        setPassword('')
        setConfirmPassword('')
      } else {
        setError(data.error || 'Erreur lors de la création du compte')
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

        {/* Formulaire de connexion ou inscription */}
        <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-0">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl text-center text-gray-800">
              {mode === 'login' ? 'Connexion' : 'Créer un compte'}
            </CardTitle>
            <CardDescription className="text-center text-gray-500">
              {mode === 'login' 
                ? 'Entrez vos identifiants pour vous connecter'
                : 'Remplissez le formulaire pour créer votre compte'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {mode === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-4">
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

                {/* Lien pour créer un compte */}
                <div className="text-center pt-4 border-t">
                  <p className="text-sm text-gray-600">
                    Pas encore de compte?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setMode('register')
                        setError(null)
                      }}
                      className="text-amber-600 hover:text-amber-700 font-medium"
                    >
                      Créer un compte
                    </button>
                  </p>
                </div>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {success && (
                  <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm">
                    <UserPlus className="w-4 h-4 flex-shrink-0" />
                    <span>{success}</span>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Nom complet</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Votre nom"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

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
                      placeholder="Minimum 6 caractères"
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

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Confirmer le mot de passe</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type="password"
                      placeholder="Répétez le mot de passe"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
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
                    <UserPlus className="w-4 h-4 mr-2" />
                  )}
                  {loading ? 'Création...' : 'Créer mon compte'}
                </Button>

                {/* Lien pour se connecter */}
                <div className="text-center pt-4 border-t">
                  <p className="text-sm text-gray-600">
                    Déjà un compte?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setMode('login')
                        setError(null)
                        setSuccess(null)
                      }}
                      className="text-amber-600 hover:text-amber-700 font-medium"
                    >
                      Se connecter
                    </button>
                  </p>
                </div>
              </form>
            )}
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
