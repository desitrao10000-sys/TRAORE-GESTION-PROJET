'use client'

import { useState, useEffect } from 'react'
import { UserPlus, Users, Trash2, Mail, Shield, User, Loader2, AlertCircle, Check, X, RefreshCw, LogIn } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAppStore } from '@/store/appStore'

interface Member {
  id: string
  email: string
  name: string | null
  role: string
  avatar?: string | null
  phone?: string | null
  position?: string | null
  department?: string | null
  isActive: boolean
  createdAt: string
  lastLoginAt: string | null
}

export function MembersManagement() {
  const { setCurrentPage, setViewingUserId, user: currentUser } = useAppStore()
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [needsAuth, setNeedsAuth] = useState(false)
  
  // Form state
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [showForm, setShowForm] = useState(false)
  
  // Delete confirmation state
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Charger les membres
  const loadMembers = async () => {
    setLoading(true)
    setError(null)
    setNeedsAuth(false)
    
    try {
      const res = await fetch('/api/users')
      const data = await res.json()
      
      if (res.status === 401) {
        setNeedsAuth(true)
        setError('Veuillez vous connecter avec un compte gestionnaire')
        return
      }
      
      if (res.status === 403) {
        setNeedsAuth(true)
        setError('Accès réservé aux gestionnaires. Connectez-vous avec: admin@traoreprojet.com')
        return
      }
      
      if (data.success) {
        setMembers(data.users || [])
      } else {
        setError(data.error || 'Erreur lors du chargement')
      }
    } catch (err) {
      console.error('Error loading members:', err)
      setError('Erreur de connexion au serveur')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMembers()
  }, [])

  // Auto-hide messages after 5 seconds
  useEffect(() => {
    if ((error || success) && !needsAuth) {
      const timer = setTimeout(() => {
        setError(null)
        setSuccess(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [error, success, needsAuth])

  // Créer un membre
  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!newName || !newEmail || !newPassword) {
      setError('Tous les champs sont requis')
      return
    }

    if (newPassword.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères')
      return
    }

    setCreating(true)

    try {
      const res = await fetch('/api/auth/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName,
          email: newEmail,
          password: newPassword
        })
      })

      const data = await res.json()

      if (data.success) {
        setSuccess(`Compte créé pour ${newName}!`)
        setNewName('')
        setNewEmail('')
        setNewPassword('')
        setShowForm(false)
        loadMembers()
      } else {
        setError(data.error || 'Erreur lors de la création')
      }
    } catch (err) {
      setError('Erreur de connexion au serveur')
    } finally {
      setCreating(false)
    }
  }

  // Supprimer un membre
  const handleDeleteMember = async () => {
    if (!memberToDelete) return

    setDeleting(true)

    try {
      const res = await fetch(`/api/users/${memberToDelete.id}`, {
        method: 'DELETE'
      })

      const data = await res.json()

      if (data.success) {
        setSuccess(`Compte de ${memberToDelete.name} supprimé`)
        setMemberToDelete(null)
        loadMembers()
      } else {
        setError(data.error || 'Erreur lors de la suppression')
      }
    } catch (err) {
      setError('Erreur de connexion au serveur')
    } finally {
      setDeleting(false)
    }
  }

  // Voir le profil d'un membre
  const handleViewMember = (member: Member) => {
    setViewingUserId(member.id)
    setCurrentPage('profile')
  }

  // État de chargement
  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-[#1e3a5f] to-[#1a2744] border-blue-400/30">
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-10 h-10 animate-spin text-amber-400" />
            <p className="text-blue-200">Chargement des membres...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // État connexion requise
  if (needsAuth) {
    return (
      <Card className="bg-gradient-to-br from-[#1e3a5f] to-[#1a2744] border-blue-400/30">
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center gap-6 text-center">
            <div className="w-20 h-20 rounded-full bg-amber-500/20 flex items-center justify-center">
              <LogIn className="w-10 h-10 text-amber-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Gestion des membres</h3>
              <p className="text-blue-200 mb-4">{error}</p>
            </div>
            
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-6 max-w-md">
              <h4 className="text-amber-300 font-semibold mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Identifiants Gestionnaire
              </h4>
              <div className="space-y-2 text-left">
                <div className="flex justify-between items-center bg-black/20 rounded-lg px-4 py-2">
                  <span className="text-blue-200">Email:</span>
                  <code className="text-amber-300 font-mono">admin@traoreprojet.com</code>
                </div>
                <div className="flex justify-between items-center bg-black/20 rounded-lg px-4 py-2">
                  <span className="text-blue-200">Mot de passe:</span>
                  <code className="text-amber-300 font-mono">admin123</code>
                </div>
              </div>
              <p className="text-blue-300/70 text-sm mt-4">
                1. Déconnectez-vous (avatar → Déconnexion)<br/>
                2. Connectez-vous avec ces identifiants<br/>
                3. Revenez dans Paramètres
              </p>
            </div>
            
            <p className="text-sm text-blue-300/50">
              Connecté actuellement: {currentUser?.email || 'Non connecté'} 
              {currentUser?.role && <span className="ml-2">({currentUser.role})</span>}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gradient-to-br from-[#1e3a5f] to-[#1a2744] border-blue-400/30">
      <CardHeader className="border-b border-blue-400/20">
        <CardTitle className="text-white flex items-center justify-between flex-wrap gap-3">
          <span className="flex items-center gap-3 text-xl">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <Users className="w-6 h-6 text-amber-400" />
            </div>
            Gestion des membres
            <span className="text-sm font-normal text-blue-300">({members.length} utilisateurs)</span>
          </span>
          <div className="flex items-center gap-2">
            <Button
              onClick={loadMembers}
              disabled={loading}
              variant="outline"
              size="sm"
              className="border-blue-400/30 text-white hover:bg-white/10"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              onClick={() => setShowForm(!showForm)}
              className="bg-amber-500 hover:bg-amber-600 text-black font-bold"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Ajouter un membre
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6 space-y-4">
        {/* Messages */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}
        {success && (
          <div className="flex items-center gap-2 p-3 bg-green-500/20 border border-green-500/30 rounded-lg text-green-300 text-sm">
            <Check className="w-4 h-4 flex-shrink-0" />
            {success}
          </div>
        )}

        {/* Formulaire de création */}
        {showForm && (
          <div className="p-4 bg-white/5 rounded-lg border border-amber-500/30 space-y-4">
            <h4 className="text-white font-semibold text-lg flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-amber-400" />
              Créer un nouveau compte membre
            </h4>
            <form onSubmit={handleCreateMember} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-blue-200 mb-1 block">Nom complet *</label>
                  <Input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Jean Dupont"
                    className="bg-white/10 border-blue-400/30 text-white placeholder:text-gray-400"
                  />
                </div>
                <div>
                  <label className="text-sm text-blue-200 mb-1 block">Email *</label>
                  <Input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="jean.dupont@email.com"
                    className="bg-white/10 border-blue-400/30 text-white placeholder:text-gray-400"
                  />
                </div>
                <div>
                  <label className="text-sm text-blue-200 mb-1 block">Mot de passe *</label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min. 6 caractères"
                    className="bg-white/10 border-blue-400/30 text-white placeholder:text-gray-400"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={creating}
                  className="bg-green-500 hover:bg-green-600 text-white"
                >
                  {creating ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <UserPlus className="w-4 h-4 mr-2" />
                  )}
                  {creating ? 'Création...' : 'Créer le compte'}
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setError(null)
                    setNewName('')
                    setNewEmail('')
                    setNewPassword('')
                  }}
                  variant="outline"
                  className="border-blue-400/30 text-white hover:bg-white/10"
                >
                  <X className="w-4 h-4 mr-2" />
                  Annuler
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Liste des utilisateurs */}
        <div className="space-y-2">
          {members.map((member) => (
            <div
              key={member.id}
              onClick={() => handleViewMember(member)}
              className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-blue-400/20 cursor-pointer hover:bg-white/10 hover:border-amber-500/40 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  member.role?.toLowerCase() === 'gestionnaire' || member.role?.toLowerCase() === 'admin'
                    ? 'bg-gradient-to-br from-amber-400 to-amber-600' 
                    : 'bg-gradient-to-br from-blue-400 to-blue-600'
                }`}>
                  {member.role?.toLowerCase() === 'gestionnaire' || member.role?.toLowerCase() === 'admin' ? (
                    <Shield className="w-6 h-6 text-white" />
                  ) : (
                    <User className="w-6 h-6 text-white" />
                  )}
                </div>
                <div>
                  <p className="text-white font-medium text-lg group-hover:text-amber-300 transition-colors">
                    {member.name || 'Sans nom'}
                  </p>
                  <div className="flex items-center gap-3 text-sm text-blue-200">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {member.email}
                    </span>
                    {member.position && (
                      <span className="text-blue-300/70">• {member.position}</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  member.role?.toLowerCase() === 'gestionnaire' || member.role?.toLowerCase() === 'admin'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                    : member.role?.toLowerCase() === 'chef de projet'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                }`}>
                  {member.role?.toLowerCase() === 'gestionnaire' ? 'Gestionnaire' : 
                   member.role?.toLowerCase() === 'admin' ? 'Admin' :
                   member.role || 'Membre'}
                </span>
                {member.role?.toLowerCase() !== 'gestionnaire' && member.role?.toLowerCase() !== 'admin' && (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation()
                      setMemberToDelete(member)
                    }}
                    className="bg-red-500/20 hover:bg-red-500/40 text-red-300 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {members.length === 0 && !error && (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-blue-400/50 mx-auto mb-3" />
            <p className="text-blue-200">Aucun membre pour le moment</p>
            <p className="text-blue-300/50 text-sm mt-1">Cliquez sur "Ajouter un membre" pour commencer</p>
          </div>
        )}

        {/* Modal de confirmation de suppression */}
        {memberToDelete && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-gradient-to-br from-[#1e3a5f] to-[#1a2744] rounded-xl p-6 max-w-md w-full mx-4 border border-blue-400/30 shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                  <Trash2 className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">Supprimer ce membre?</h3>
                  <p className="text-blue-200 text-sm">Cette action est irréversible</p>
                </div>
              </div>
              
              <div className="bg-white/5 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-medium">{memberToDelete.name || 'Sans nom'}</p>
                    <p className="text-blue-200 text-sm">{memberToDelete.email}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button
                  onClick={() => setMemberToDelete(null)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white"
                >
                  <X className="w-4 h-4 mr-2" />
                  Annuler
                </Button>
                <Button
                  onClick={handleDeleteMember}
                  disabled={deleting}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                >
                  {deleting ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Trash2 className="w-4 h-4 mr-2" />
                  )}
                  {deleting ? 'Suppression...' : 'Supprimer'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
