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
  ArrowLeft,
  Loader2,
  Plus,
  Trash2,
  GraduationCap,
  ShieldCheck
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useAppStore } from '@/store/appStore'

interface UserProfileData {
  id: string
  email: string
  name: string | null
  role: string
  avatar: string | null
  phone: string | null
  position: string | null
  department: string | null
  bio: string | null
  skills: string | null
  experience: string | null
  education: string | null
  certifications: string | null
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
  Project?: { name: string }
}

interface ExperienceItem {
  title: string
  company: string
  startDate: string
  endDate: string
  description: string
}

interface EducationItem {
  degree: string
  school: string
  year: string
  field: string
}

interface CertificationItem {
  name: string
  issuer: string
  year: string
  url: string
}

type ProfileTab = 'info' | 'tasks' | 'activity' | 'cv'

// Fonction utilitaire pour parser les skills
function parseSkills(skills: string | string[] | null | undefined): string[] {
  if (!skills) return []
  if (Array.isArray(skills)) return skills
  try {
    const parsed = JSON.parse(skills)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

// Fonction utilitaire pour parser les données JSON
function parseJSONData<T>(data: string | T[] | null | undefined): T[] {
  if (!data) return []
  if (Array.isArray(data)) return data
  try {
    const parsed = JSON.parse(data)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function UserProfile() {
  const { user, viewingUserId, setViewingUserId, setCurrentPage } = useAppStore()
  const [activeTab, setActiveTab] = useState<ProfileTab>('info')
  const [profile, setProfile] = useState<UserProfileData | null>(null)
  const [tasks, setTasks] = useState<UserTask[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isEditingCV, setIsEditingCV] = useState(false)
  const [editData, setEditData] = useState({
    name: '',
    phone: '',
    position: '',
    department: '',
    bio: '',
    skills: ''
  })
  
  // États pour le CV
  const [cvData, setCvData] = useState({
    experience: [] as ExperienceItem[],
    education: [] as EducationItem[],
    certifications: [] as CertificationItem[]
  })

  // Déterminer si on regarde son propre profil ou celui d'un autre
  const isViewingOtherUser = !!viewingUserId
  const targetUserId = viewingUserId || user?.id
  
  // Vérifier si l'utilisateur actuel est gestionnaire
  const isManager = user?.role?.toLowerCase() === 'gestionnaire' || 
                    user?.role?.toLowerCase() === 'admin' ||
                    user?.role?.toLowerCase() === 'administrateur'
  
  // Permettre l'édition si: c'est son propre profil OU si on est gestionnaire
  const canEdit = !isViewingOtherUser || isManager

  // Charger les données du profil
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true)
      try {
        if (viewingUserId) {
          // Récupérer le profil d'un autre utilisateur
          const res = await fetch(`/api/users/${viewingUserId}`)
          const data = await res.json()
          if (data.success && data.user) {
            setProfile(data.user)
            setEditData({
              name: data.user.name || '',
              phone: data.user.phone || '',
              position: data.user.position || '',
              department: data.user.department || '',
              bio: data.user.bio || '',
              skills: parseSkills(data.user.skills).join(', ')
            })
            setCvData({
              experience: parseJSONData<ExperienceItem>(data.user.experience),
              education: parseJSONData<EducationItem>(data.user.education),
              certifications: parseJSONData<CertificationItem>(data.user.certifications)
            })
          } else {
            // Utilisateur non trouvé - retour aux paramètres
            setViewingUserId(null)
            setCurrentPage('settings')
            return
          }
        } else {
          // Récupérer son propre profil
          const res = await fetch('/api/auth/me')
          const data = await res.json()
          if (data.success && data.user) {
            setProfile(data.user)
            setEditData({
              name: data.user.name || '',
              phone: data.user.phone || '',
              position: data.user.position || '',
              department: data.user.department || '',
              bio: data.user.bio || '',
              skills: parseSkills(data.user.skills).join(', ')
            })
            setCvData({
              experience: parseJSONData<ExperienceItem>(data.user.experience),
              education: parseJSONData<EducationItem>(data.user.education),
              certifications: parseJSONData<CertificationItem>(data.user.certifications)
            })
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
        if (viewingUserId) {
          setViewingUserId(null)
          setCurrentPage('settings')
        }
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
            projectName: t.Project?.name || 'Sans projet'
          })))
        }
      } catch (error) {
        console.error('Error fetching tasks:', error)
      }
    }

    fetchProfile()
    fetchTasks()
  }, [viewingUserId, setViewingUserId, setCurrentPage])

  // Sauvegarder le profil
  const saveProfile = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUserId: viewingUserId || undefined,
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
      } else {
        alert(data.error || 'Erreur lors de la sauvegarde')
      }
    } catch (error) {
      console.error('Error saving profile:', error)
      alert('Erreur de connexion au serveur')
    } finally {
      setSaving(false)
    }
  }

  // Sauvegarder le CV
  const saveCV = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUserId: viewingUserId || undefined,
          experience: cvData.experience,
          education: cvData.education,
          certifications: cvData.certifications
        })
      })
      const data = await res.json()
      if (data.success) {
        setProfile(prev => prev ? { ...prev, ...data.user } : null)
        setIsEditingCV(false)
      } else {
        alert(data.error || 'Erreur lors de la sauvegarde')
      }
    } catch (error) {
      console.error('Error saving CV:', error)
      alert('Erreur de connexion au serveur')
    } finally {
      setSaving(false)
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

  // Fonctions pour gérer les expériences
  const addExperience = () => {
    setCvData(prev => ({
      ...prev,
      experience: [...prev.experience, { title: '', company: '', startDate: '', endDate: '', description: '' }]
    }))
  }

  const updateExperience = (index: number, field: keyof ExperienceItem, value: string) => {
    setCvData(prev => ({
      ...prev,
      experience: prev.experience.map((exp, i) => i === index ? { ...exp, [field]: value } : exp)
    }))
  }

  const removeExperience = (index: number) => {
    setCvData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }))
  }

  // Fonctions pour gérer les formations
  const addEducation = () => {
    setCvData(prev => ({
      ...prev,
      education: [...prev.education, { degree: '', school: '', year: '', field: '' }]
    }))
  }

  const updateEducation = (index: number, field: keyof EducationItem, value: string) => {
    setCvData(prev => ({
      ...prev,
      education: prev.education.map((edu, i) => i === index ? { ...edu, [field]: value } : edu)
    }))
  }

  const removeEducation = (index: number) => {
    setCvData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }))
  }

  // Fonctions pour gérer les certifications
  const addCertification = () => {
    setCvData(prev => ({
      ...prev,
      certifications: [...prev.certifications, { name: '', issuer: '', year: '', url: '' }]
    }))
  }

  const updateCertification = (index: number, field: keyof CertificationItem, value: string) => {
    setCvData(prev => ({
      ...prev,
      certifications: prev.certifications.map((cert, i) => i === index ? { ...cert, [field]: value } : cert)
    }))
  }

  const removeCertification = (index: number) => {
    setCvData(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    }))
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
                {profile?.role === 'gestionnaire' ? 'Gestionnaire' : 'Membre'}
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
                    {canEdit && (
                      <Button
                        onClick={() => setIsEditing(!isEditing)}
                        variant="outline"
                        className="border-blue-400/30 text-white hover:bg-white/10"
                      >
                        {isEditing ? <X className="w-4 h-4 mr-2" /> : <Edit2 className="w-4 h-4 mr-2" />}
                        {isEditing ? 'Annuler' : 'Modifier'}
                      </Button>
                    )}
                  </div>

                  {isEditing && canEdit ? (
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
                      <Button 
                        onClick={saveProfile} 
                        disabled={saving}
                        className="bg-amber-500 hover:bg-amber-600 text-black font-bold"
                      >
                        {saving ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4 mr-2" />
                        )}
                        {saving ? 'Sauvegarde...' : 'Sauvegarder'}
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

                      {profile?.skills && parseSkills(profile.skills).length > 0 && (
                        <div>
                          <p className="text-sm text-blue-300 mb-2">Compétences</p>
                          <div className="flex flex-wrap gap-2">
                            {parseSkills(profile.skills).map((skill, index) => (
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
                    {canEdit && !isEditingCV && (
                      <Button
                        onClick={() => setIsEditingCV(true)}
                        variant="outline"
                        className="border-blue-400/30 text-white hover:bg-white/10"
                      >
                        <Edit2 className="w-4 h-4 mr-2" />
                        Modifier le CV
                      </Button>
                    )}
                  </div>

                  {isEditingCV && canEdit ? (
                    <div className="space-y-6">
                      {/* Expérience professionnelle */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Briefcase className="w-5 h-5 text-amber-400" />
                            <h4 className="text-white font-medium">Expérience professionnelle</h4>
                          </div>
                          <Button
                            onClick={addExperience}
                            variant="outline"
                            size="sm"
                            className="border-blue-400/30 text-white hover:bg-white/10"
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Ajouter
                          </Button>
                        </div>
                        
                        {cvData.experience.length === 0 ? (
                          <p className="text-blue-300/50 text-sm">Aucune expérience ajoutée</p>
                        ) : (
                          <div className="space-y-3">
                            {cvData.experience.map((exp, index) => (
                              <div key={index} className="p-4 bg-blue-500/10 rounded-lg border border-blue-400/20 space-y-3">
                                <div className="flex justify-end">
                                  <Button
                                    onClick={() => removeExperience(index)}
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="text-xs text-blue-300 mb-1 block">Poste</label>
                                    <Input
                                      value={exp.title}
                                      onChange={(e) => updateExperience(index, 'title', e.target.value)}
                                      className="bg-white/10 border-blue-400/30 text-white text-sm"
                                      placeholder="Titre du poste"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-xs text-blue-300 mb-1 block">Entreprise</label>
                                    <Input
                                      value={exp.company}
                                      onChange={(e) => updateExperience(index, 'company', e.target.value)}
                                      className="bg-white/10 border-blue-400/30 text-white text-sm"
                                      placeholder="Nom de l'entreprise"
                                    />
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="text-xs text-blue-300 mb-1 block">Date de début</label>
                                    <Input
                                      value={exp.startDate}
                                      onChange={(e) => updateExperience(index, 'startDate', e.target.value)}
                                      className="bg-white/10 border-blue-400/30 text-white text-sm"
                                      placeholder="Jan 2020"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-xs text-blue-300 mb-1 block">Date de fin</label>
                                    <Input
                                      value={exp.endDate}
                                      onChange={(e) => updateExperience(index, 'endDate', e.target.value)}
                                      className="bg-white/10 border-blue-400/30 text-white text-sm"
                                      placeholder="Présent"
                                    />
                                  </div>
                                </div>
                                <div>
                                  <label className="text-xs text-blue-300 mb-1 block">Description</label>
                                  <Textarea
                                    value={exp.description}
                                    onChange={(e) => updateExperience(index, 'description', e.target.value)}
                                    className="bg-white/10 border-blue-400/30 text-white text-sm"
                                    placeholder="Décrivez vos responsabilités..."
                                    rows={2}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Formation */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <GraduationCap className="w-5 h-5 text-amber-400" />
                            <h4 className="text-white font-medium">Formation</h4>
                          </div>
                          <Button
                            onClick={addEducation}
                            variant="outline"
                            size="sm"
                            className="border-blue-400/30 text-white hover:bg-white/10"
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Ajouter
                          </Button>
                        </div>
                        
                        {cvData.education.length === 0 ? (
                          <p className="text-blue-300/50 text-sm">Aucune formation ajoutée</p>
                        ) : (
                          <div className="space-y-3">
                            {cvData.education.map((edu, index) => (
                              <div key={index} className="p-4 bg-blue-500/10 rounded-lg border border-blue-400/20 space-y-3">
                                <div className="flex justify-end">
                                  <Button
                                    onClick={() => removeEducation(index)}
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="text-xs text-blue-300 mb-1 block">Diplôme</label>
                                    <Input
                                      value={edu.degree}
                                      onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                                      className="bg-white/10 border-blue-400/30 text-white text-sm"
                                      placeholder="Licence, Master, etc."
                                    />
                                  </div>
                                  <div>
                                    <label className="text-xs text-blue-300 mb-1 block">École</label>
                                    <Input
                                      value={edu.school}
                                      onChange={(e) => updateEducation(index, 'school', e.target.value)}
                                      className="bg-white/10 border-blue-400/30 text-white text-sm"
                                      placeholder="Nom de l'établissement"
                                    />
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="text-xs text-blue-300 mb-1 block">Année</label>
                                    <Input
                                      value={edu.year}
                                      onChange={(e) => updateEducation(index, 'year', e.target.value)}
                                      className="bg-white/10 border-blue-400/30 text-white text-sm"
                                      placeholder="2020"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-xs text-blue-300 mb-1 block">Domaine</label>
                                    <Input
                                      value={edu.field}
                                      onChange={(e) => updateEducation(index, 'field', e.target.value)}
                                      className="bg-white/10 border-blue-400/30 text-white text-sm"
                                      placeholder="Informatique, Marketing, etc."
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Certifications */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-amber-400" />
                            <h4 className="text-white font-medium">Certifications</h4>
                          </div>
                          <Button
                            onClick={addCertification}
                            variant="outline"
                            size="sm"
                            className="border-blue-400/30 text-white hover:bg-white/10"
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Ajouter
                          </Button>
                        </div>
                        
                        {cvData.certifications.length === 0 ? (
                          <p className="text-blue-300/50 text-sm">Aucune certification ajoutée</p>
                        ) : (
                          <div className="space-y-3">
                            {cvData.certifications.map((cert, index) => (
                              <div key={index} className="p-4 bg-blue-500/10 rounded-lg border border-blue-400/20 space-y-3">
                                <div className="flex justify-end">
                                  <Button
                                    onClick={() => removeCertification(index)}
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="text-xs text-blue-300 mb-1 block">Nom</label>
                                    <Input
                                      value={cert.name}
                                      onChange={(e) => updateCertification(index, 'name', e.target.value)}
                                      className="bg-white/10 border-blue-400/30 text-white text-sm"
                                      placeholder="Nom de la certification"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-xs text-blue-300 mb-1 block">Organisme</label>
                                    <Input
                                      value={cert.issuer}
                                      onChange={(e) => updateCertification(index, 'issuer', e.target.value)}
                                      className="bg-white/10 border-blue-400/30 text-white text-sm"
                                      placeholder="Organisme émetteur"
                                    />
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="text-xs text-blue-300 mb-1 block">Année</label>
                                    <Input
                                      value={cert.year}
                                      onChange={(e) => updateCertification(index, 'year', e.target.value)}
                                      className="bg-white/10 border-blue-400/30 text-white text-sm"
                                      placeholder="2023"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-xs text-blue-300 mb-1 block">URL (optionnel)</label>
                                    <Input
                                      value={cert.url}
                                      onChange={(e) => updateCertification(index, 'url', e.target.value)}
                                      className="bg-white/10 border-blue-400/30 text-white text-sm"
                                      placeholder="https://..."
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Boutons d'action */}
                      <div className="flex gap-3 pt-4 border-t border-blue-400/20">
                        <Button 
                          onClick={saveCV} 
                          disabled={saving}
                          className="bg-amber-500 hover:bg-amber-600 text-black font-bold"
                        >
                          {saving ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Save className="w-4 h-4 mr-2" />
                          )}
                          {saving ? 'Sauvegarde...' : 'Sauvegarder le CV'}
                        </Button>
                        <Button 
                          onClick={() => setIsEditingCV(false)} 
                          variant="outline"
                          className="border-blue-400/30 text-white hover:bg-white/10"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Annuler
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Expérience professionnelle - Affichage */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Briefcase className="w-5 h-5 text-amber-400" />
                          <h4 className="text-white font-medium">Expérience professionnelle</h4>
                        </div>
                        
                        {profile?.position && (
                          <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-400/20 mb-3">
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
                        
                        {cvData.experience.length > 0 && (
                          <div className="space-y-3">
                            {cvData.experience.map((exp, index) => (
                              <div key={index} className="p-4 bg-blue-500/10 rounded-lg border border-blue-400/20">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <p className="text-white font-medium">{exp.title}</p>
                                    <p className="text-sm text-blue-300">{exp.company}</p>
                                    <p className="text-xs text-blue-300/70 mt-1">{exp.startDate} - {exp.endDate}</p>
                                  </div>
                                </div>
                                {exp.description && (
                                  <p className="text-sm text-blue-200 mt-2">{exp.description}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {!profile?.position && cvData.experience.length === 0 && (
                          <p className="text-blue-300/50 text-sm">Aucune expérience renseignée</p>
                        )}
                      </div>

                      {/* Formation - Affichage */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <GraduationCap className="w-5 h-5 text-amber-400" />
                          <h4 className="text-white font-medium">Formation</h4>
                        </div>
                        
                        {cvData.education.length > 0 ? (
                          <div className="space-y-3">
                            {cvData.education.map((edu, index) => (
                              <div key={index} className="p-4 bg-blue-500/10 rounded-lg border border-blue-400/20">
                                <p className="text-white font-medium">{edu.degree}</p>
                                <p className="text-sm text-blue-300">{edu.school}</p>
                                <p className="text-xs text-blue-300/70 mt-1">{edu.field} • {edu.year}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-blue-300/50 text-sm">Aucune formation renseignée</p>
                        )}
                      </div>

                      {/* Certifications - Affichage */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <ShieldCheck className="w-5 h-5 text-amber-400" />
                          <h4 className="text-white font-medium">Certifications</h4>
                        </div>
                        
                        {cvData.certifications.length > 0 ? (
                          <div className="space-y-3">
                            {cvData.certifications.map((cert, index) => (
                              <div key={index} className="p-4 bg-blue-500/10 rounded-lg border border-blue-400/20">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <p className="text-white font-medium">{cert.name}</p>
                                    <p className="text-sm text-blue-300">{cert.issuer} • {cert.year}</p>
                                  </div>
                                  {cert.url && (
                                    <a 
                                      href={cert.url} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-amber-400 hover:text-amber-300 text-sm"
                                    >
                                      Voir
                                    </a>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-blue-300/50 text-sm">Aucune certification renseignée</p>
                        )}
                      </div>

                      {/* Compétences */}
                      {profile?.skills && parseSkills(profile.skills).length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <Award className="w-5 h-5 text-amber-400" />
                            <h4 className="text-white font-medium">Compétences</h4>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {parseSkills(profile.skills).map((skill, index) => (
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
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
