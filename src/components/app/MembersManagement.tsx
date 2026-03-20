'use client'

import { useState, useEffect } from 'react'
import { UserPlus, Users, Trash2, Mail, Shield, User, Loader2, AlertCircle, Check } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Member {
  id: string
  email: string
  name: string | null
  role: string
  isActive: boolean
  createdAt: string
  lastLoginAt: string | null
}

export function MembersManagement() {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  // Form state
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [showForm, setShowForm] = useState(false)

  // Charger les membres
  const loadMembers = async () => {
    try {
      const res = await fetch('/api/users')
      const data = await res.json()
      if (data.success) {
        setMembers(data.users)
      }
    } catch (err) {
      console.error('Error loading members:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMembers()
  }, [])

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
  const handleDeleteMember = async (memberId: string, memberName: string) => {
    if (!confirm(`Voulez-vous vraiment supprimer le compte de ${memberName}?`)) {
      return
    }

    try {
      const res = await fetch(`/api/users/${memberId}`, {
        method: 'DELETE'
      })

      const data = await res.json()

      if (data.success) {
        setSuccess(`Compte de ${memberName} supprimé`)
        loadMembers()
      } else {
        setError(data.error || 'Erreur lors de la suppression')
      }
    } catch (err) {
      setError('Erreur de connexion au serveur')
    }
  }

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-[#1e3a5f] to-[#1a2744] border-blue-400/30">
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Liste des membres */}
      <Card className="bg-gradient-to-br from-[#1e3a5f] to-[#1a2744] border-blue-400/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-400" />
              Gestion des membres ({members.length})
            </span>
            <Button
              onClick={() => setShowForm(!showForm)}
              className="bg-amber-500 hover:bg-amber-600 text-black font-bold"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Ajouter un membre
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Messages */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 p-3 bg-green-500/20 border border-green-500/30 rounded-lg text-green-300 text-sm">
              <Check className="w-4 h-4" />
              {success}
            </div>
          )}

          {/* Formulaire de création */}
          {showForm && (
            <form onSubmit={handleCreateMember} className="p-4 bg-white/5 rounded-lg border border-blue-400/20 space-y-4">
              <h4 className="text-white font-medium">Créer un nouveau compte membre</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-blue-200 mb-1 block">Nom complet</label>
                  <Input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Jean Dupont"
                    className="bg-white/10 border-blue-400/30 text-white placeholder:text-gray-400"
                  />
                </div>
                <div>
                  <label className="text-sm text-blue-200 mb-1 block">Email</label>
                  <Input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="jean.dupont@email.com"
                    className="bg-white/10 border-blue-400/30 text-white placeholder:text-gray-400"
                  />
                </div>
                <div>
                  <label className="text-sm text-blue-200 mb-1 block">Mot de passe</label>
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
                  className="bg-gray-500 hover:bg-gray-600 text-white"
                >
                  Annuler
                </Button>
              </div>
            </form>
          )}

          {/* Liste des utilisateurs */}
          <div className="space-y-2">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-blue-400/20"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    member.role === 'gestionnaire' 
                      ? 'bg-amber-500' 
                      : 'bg-blue-500'
                  }`}>
                    {member.role === 'gestionnaire' ? (
                      <Shield className="w-5 h-5 text-white" />
                    ) : (
                      <User className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div>
                    <p className="text-white font-medium">{member.name || 'Sans nom'}</p>
                    <p className="text-sm text-blue-200 flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {member.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    member.role === 'gestionnaire' 
                      ? 'bg-amber-500/20 text-amber-300' 
                      : 'bg-blue-500/20 text-blue-300'
                  }`}>
                    {member.role === 'gestionnaire' ? 'Gestionnaire' : 'Membre'}
                  </span>
                  {member.role !== 'gestionnaire' && (
                    <Button
                      onClick={() => handleDeleteMember(member.id, member.name || '')}
                      className="bg-red-500/20 hover:bg-red-500/30 text-red-300 p-2"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {members.length === 0 && (
            <p className="text-center text-blue-200 py-4">Aucun membre pour le moment</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
