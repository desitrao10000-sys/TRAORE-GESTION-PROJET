'use client'

import { useState, useEffect } from 'react'
import { 
  User, 
  Mail, 
  Phone, 
  Briefcase, 
  Building2,
  Calendar,
  FileText,
  CheckCircle2,
  Clock,
  Award,
  Edit2,
  Save,
  X,
  Plus,
  ArrowLeft
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useAppStore } from '@/store/appStore'

interface UserProfile {
  id: string
  email: string
  name: string | null
  role: string
  avatar: string | null
  phone: string | null
  position: string | null
  department: string | null
  bio: string | null
  skills: string[]
  createdAt: string
}

interface UserTask {
  id: string
  title: string
  status: string
  priority: string
  dueDate: string | null
  projectName: string
  assigneeId: string | null
  project?: { name: string }
}

type ProfileTab = 'info' | 'tasks' | 'activity' | 'cv'

export function UserProfile() {
  const { user, viewingUserId, setViewingUserId, setCurrentPage } = useAppStore()
  const [activeTab, setActiveTab] = useState<ProfileTab>('info')
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [tasks, setTasks] = useState<UserTask[]>([])
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    name: '',
    phone: '',
    position: '',
    department: '',
    bio: '',
    skills: ''
  })

  // Déterminer si on regarde son propre profil ou celui d'un autre
  const isViewingOtherUser = !!viewingUserId
  const targetUserId = viewingUserId || user?.id

  // Charger les données du profil
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true)
      try {
        if (viewingUserId) {
          // Récupérer le profil d'un autre utilisateur
          const res = await fetch(`/api/users/${viewingUserId}`)
          const data = await res.json()
          if (data.success) {
            setProfile(data.user)
            setEditData({
              name: data.user.name || '',
              phone: data.user.phone || '',
              position: data.user.position || '',
              department: data.user.department || '',
              bio: data.user.bio || '',
              skills: data.user.skills?.join(', ') || ''
            })
          }
        } else {
          // Récupérer son propre profil
          const res = await fetch('/api/auth/me')
          const data = await res.json()
          if (data.success) {
            setProfile(data.user)
            setEditData({
              name: data.user.name || '',
              phone: data.user.phone || '',
              position: data.user.position || '',
              department: data.user.department || '',
              bio: data.user.bio || '',
              skills: data.user.skills?.join(', ') || ''
            })
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
      } finally {
        setLoading(false)
      }
    }

    const fetchTasks = async () => {
      try {
        const res = await fetch('/api/tasks')
        const data = await res.json()
        if (data.success) {
          setTasks(data.data.map((t: UserTask) => ({
            ...t,
            projectName: t.project?.name || 'Sans projet'
          })))
        }
      } catch (error) {
        console.error('Error fetching tasks:', error)
      }
    }

    fetchProfile()
    fetchTasks()
  }, [viewingUserId])

  // Sauvegarder le profil (seulement pour son propre profil)
  const saveProfile = async () => {
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editData.name,
          phone: editData.phone,
          position: editData.position,
          department: editData.department,
          bio: editData.bio,
          skills: editData.skills.split(',').map(s => s.trim()).filter(Boolean)
        })
      })
      const data = await res.json()
      if (data.success) {
        setProfile(data.user)
        setIsEditing(false)
      }
    } catch (error) {
      console.error('Error saving profile:', error)
    }
  }

  // Retour à la liste des membres
  const handleBack = () => {
    setViewingUserId(null)
    setCurrentPage('settings')
  }

  // Tâches assignées à l'utilisateur affiché
  const userTasks = tasks.filter(t => targetUserId && t.assigneeId === targetUserId)
  
  // Stats des tâches
  const taskStats = {
    total: userTasks.length,
    completed: userTasks.filter(t => t.status === 'Validé').length,
    inProgress: userTasks.filter(t => t.status === 'En cours').length,
    todo: userTasks.filter(t => t.status === 'À faire').length,
    late: userTasks.filter(t => t.status === 'En retard').length
  }

  // Onglets
  const tabs: { key: ProfileTab; label: string; icon: React.ReactNode }[] = [
    { key: 'info', label: 'Informations', icon: <User className="w-4 h-4" /> },
    { key: 'tasks', label: 'Tâches', icon: <CheckCircle2 className="w-4 h-4" /> },
    { key: 'activity', label: 'Activité', icon: <Clock className="w-4 h-4" /> },
    { key: 'cv', label: 'CV', icon: <FileText className="w-4 h-4" /> }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {isViewingOtherUser && (
            <Button
              onClick={handleBack}
              variant="outline"
              className="border-blue-400/30 text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-white drop-shadow-lg flex items-center gap-2">
              <User className="w-7 h-7 text-amber-400" />
              {isViewingOtherUser ? `Profil de ${profile?.name || 'l\'utilisateur'}` : 'Mon Profil'}
            </h1>
            <p className="text-blue-200 mt-1">
              {isViewingOtherUser ? 'Informations du membre' : 'Gérez vos informations personnelles'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar - Carte profil */}
        <Card className="bg-gradient-to-br from-[#1e3a5f] to-[#1a2744] border-blue-400/30">
          <CardContent className="p-6 text-center">
            {/* Avatar */}
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg ${
              profile?.role === 'gestionnaire'
                ? 'bg-gradient-to-br from-amber-400 to-amber-600 shadow-amber-500/30'
                : 'bg-gradient-to-br from-blue-400 to-blue-600 shadow-blue-500/30'
            }`}>
              {profile?.avatar ? (
                <img src={profile.avatar} alt="" className="w-24 h-24 rounded-full object-cover" />
              ) : (
                <User className="w-12 h-12 text-white" />
              )}
            </div>
            
            {/* Nom et rôle */}
            <h2 className="text-xl font-bold text-white">{profile?.name || 'Utilisateur'}</h2>
            <p className="text-blue-200 text-sm">{profile?.email}</p>
            
            <div className="mt-3">
              <Badge className={`${
                profile?.role === 'gestionnaire' 
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' 
                  : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
              } border`}>
                {profile?.role === 'gestionnaire' ? 'Gestionnaire Principal' : 'Membre'}
              </Badge>
            </div>

            {profile?.position && (
              <p className="text-blue-300 text-sm mt-3 flex items-center justify-center gap-1">
                <Briefcase className="w-4 h-4" />
                {profile.position}
              </p>
            )}
            
            {profile?.department && (
              <p className="text-blue-300/70 text-sm flex items-center justify-center gap-1">
                <Building2 className="w-4 h-4" />
                {profile.department}
              </p>
            )}

            {/* Stats */}
            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="bg-blue-500/10 rounded-lg p-3">
                <p className="text-2xl font-bold text-white">{taskStats.completed}</p>
                <p className="text-xs text-blue-300">Tâches terminées</p>
              </div>
              <div className="bg-blue-500/10 rounded-lg p-3">
                <p className="text-2xl font-bold text-white">{taskStats.inProgress}</p>
                <p className="text-xs text-blue-300">En cours</p>
              </div>
            </div>

            {/* Membre depuis */}
            <div className="mt-4 pt-4 border-t border-blue-400/20">
              <p className="text-xs text-blue-300/70 flex items-center justify-center gap-1">
                <Calendar className="w-3 h-3" />
                Membre depuis {profile?.createdAt ? format(new Date(profile.createdAt), 'MMMM yyyy', { locale: fr }) : '-'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Contenu principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Onglets */}
          <Card className="bg-gradient-to-br from-[#1e3a5f] to-[#1a2744] border-blue-400/30 overflow-hidden">
            <div className="flex border-b border-blue-400/20 overflow-x-auto">
              {tabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`
                    flex items-center gap-2 px-5 py-3 font-medium transition-all whitespace-nowrap
                    ${activeTab === tab.key 
                      ? 'text-amber-400 border-b-2 border-amber-400 bg-amber-400/5' 
                      : 'text-blue-200 hover:text-white hover:bg-blue-400/10'
                    }
                  `}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            <div className="p-6">
              {/* Onglet Informations */}
              {activeTab === 'info' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Informations personnelles</h3>
                    {!isViewingOtherUser && (
                      <Button
                        onClick={() => setIsEditing(!isEditing)}
                        variant="outline"
                        className="border-blue-400/30 text-white hover:bg-white/10"
                      >
                        {isEditing ? <X className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                        {isEditing ? 'Annuler' : 'Modifier'}
                      </Button>
                    )}
                  </div>

                  {isEditing && !isViewingOtherUser ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm text-blue-200 mb-1 block">Nom complet</label>
                          <Input
                            value={editData.name}
                            onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                            className="bg-white/10 border-blue-400/30 text-white"
                          />
                        </div>
                        <div>
                          <label className="text-sm text-blue-200 mb-1 block">Téléphone</label>
                          <Input
                            value={editData.phone}
                            onChange={(e) => setEditData(prev => ({ ...prev, phone: e.target.value }))}
                            className="bg-white/10 border-blue-400/30 text-white"
                            placeholder="+225 XX XX XX XX XX"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm text-blue-200 mb-1 block">Poste</label>
                          <Input
                            value={editData.position}
                            onChange={(e) => setEditData(prev => ({ ...prev, position: e.target.value }))}
                            className="bg-white/10 border-blue-400/30 text-white"
                            placeholder="Chef de projet, Développeur, etc."
                          />
                        </div>
                        <div>
                          <label className="text-sm text-blue-200 mb-1 block">Département</label>
                          <Input
                            value={editData.department}
                            onChange={(e) => setEditData(prev => ({ ...prev, department: e.target.value }))}
                            className="bg-white/10 border-blue-400/30 text-white"
                            placeholder="IT, Marketing, RH, etc."
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm text-blue-200 mb-1 block">Bio</label>
                        <Textarea
                          value={editData.bio}
                          onChange={(e) => setEditData(prev => ({ ...prev, bio: e.target.value }))}
                          className="bg-white/10 border-blue-400/30 text-white"
                          placeholder="Décrivez-vous en quelques mots..."
                          rows={3}
                        />
                      </div>
                      <div>
                        <label className="text-sm text-blue-200 mb-1 block">Compétences (séparées par des virgules)</label>
                        <Input
                          value={editData.skills}
                          onChange={(e) => setEditData(prev => ({ ...prev, skills: e.target.value }))}
                          className="bg-white/10 border-blue-400/30 text-white"
                          placeholder="JavaScript, React, Gestion de projet, etc."
                        />
                      </div>
                      <Button onClick={saveProfile} className="bg-amber-500 hover:bg-amber-600 text-black font-bold">
                        <Save className="w-4 h-4 mr-2" />
                        Sauvegarder
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-3 bg-blue-500/10 rounded-lg">
                          <Mail className="w-5 h-5 text-blue-400" />
                          <div>
                            <p className="text-xs text-blue-300">Email</p>
                            <p className="text-white">{profile?.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-blue-500/10 rounded-lg">
                          <Phone className="w-5 h-5 text-blue-400" />
                          <div>
                            <p className="text-xs text-blue-300">Téléphone</p>
                            <p className="text-white">{profile?.phone || 'Non renseigné'}</p>
                          </div>
                        </div>
                      </div>
                      
                      {profile?.bio && (
                        <div className="p-4 bg-blue-500/10 rounded-lg">
                          <p className="text-sm text-blue-300 mb-1">Biographie</p>
                          <p className="text-white">{profile.bio}</p>
                        </div>
                      )}

                      {profile?.skills && profile.skills.length > 0 && (
                        <div>
                          <p className="text-sm text-blue-300 mb-2">Compétences</p>
                          <div className="flex flex-wrap gap-2">
                            {profile.skills.map((skill, index) => (
                              <Badge key={index} className="bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Onglet Tâches */}
              {activeTab === 'tasks' && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">
                    {isViewingOtherUser ? 'Tâches assignées' : 'Mes tâches assignées'}
                  </h3>
                  
                  {userTasks.length === 0 ? (
                    <div className="text-center py-8">
                      <CheckCircle2 className="w-12 h-12 text-green-400/50 mx-auto mb-3" />
                      <p className="text-blue-200">Aucune tâche assignée</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {userTasks.map(task => (
                        <div 
                          key={task.id}
                          className="p-3 bg-blue-500/10 rounded-lg border border-blue-400/20"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-white font-medium">{task.title}</p>
                              <p className="text-sm text-blue-300">{task.projectName}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              {task.dueDate && (
                                <span className="text-xs text-blue-300/70">
                                  {format(new Date(task.dueDate), 'd MMM', { locale: fr })}
                                </span>
                              )}
                              <Badge className={`${
                                task.status === 'Validé' ? 'bg-green-500/20 text-green-300' :
                                task.status === 'En cours' ? 'bg-blue-500/20 text-blue-300' :
                                task.status === 'En retard' ? 'bg-red-500/20 text-red-300' :
                                'bg-gray-500/20 text-gray-300'
                              } border-0 text-xs`}>
                                {task.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Onglet Activité */}
              {activeTab === 'activity' && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">
                    {isViewingOtherUser ? 'Activité récente' : 'Mon activité récente'}
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                      </div>
                      <div>
                        <p className="text-white">{taskStats.completed} tâches terminées</p>
                        <p className="text-xs text-blue-300/70">Ce mois-ci</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                        <Clock className="w-4 h-4 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-white">{taskStats.inProgress} tâches en cours</p>
                        <p className="text-xs text-blue-300/70">En progression</p>
                      </div>
                    </div>
                    {taskStats.late > 0 && (
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                          <Clock className="w-4 h-4 text-red-400" />
                        </div>
                        <div>
                          <p className="text-white">{taskStats.late} tâches en retard</p>
                          <p className="text-xs text-blue-300/70">À traiter en priorité</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Onglet CV */}
              {activeTab === 'cv' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">
                      {isViewingOtherUser ? 'CV' : 'Mon CV'}
                    </h3>
                    {!isViewingOtherUser && (
                      <Button variant="outline" className="border-blue-400/30 text-white hover:bg-white/10">
                        <Plus className="w-4 h-4 mr-2" />
                        Ajouter une section
                      </Button>
                    )}
                  </div>

                  {/* Expérience professionnelle */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Briefcase className="w-5 h-5 text-amber-400" />
                      <h4 className="text-white font-medium">Expérience professionnelle</h4>
                    </div>
                    <div className="space-y-3">
                      {profile?.position && (
                        <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-400/20">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-white font-medium">{profile.position}</p>
                              <p className="text-sm text-blue-300">{profile.department || 'Département'}</p>
                            </div>
                            <Badge className="bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              Actuel
                            </Badge>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Compétences */}
                  {profile?.skills && profile.skills.length > 0 && (
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Award className="w-5 h-5 text-amber-400" />
                        <h4 className="text-white font-medium">Compétences</h4>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {profile.skills.map((skill, index) => (
                          <Badge 
                            key={index} 
                            className="bg-gradient-to-r from-amber-500/20 to-amber-400/10 text-amber-300 border border-amber-500/30 px-3 py-1"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Bio / Résumé */}
                  {profile?.bio && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <FileText className="w-5 h-5 text-amber-400" />
                        <h4 className="text-white font-medium">Résumé</h4>
                      </div>
                      <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-400/20">
                        <p className="text-blue-100">{profile.bio}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
