import { PrismaClient } from '@prisma/client'
import { randomBytes } from 'crypto'

const prisma = new PrismaClient()

function generateId(): string {
  return randomBytes(16).toString('hex').slice(0, 25)
}

function simpleHash(password: string): string {
  let hash = 0
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(16).padStart(16, '0')
}

async function main() {
  console.log('🗑️ Nettoyage des anciennes données...')
  
  // Supprimer les anciennes données (sauf le gestionnaire)
  await prisma.taskFile.deleteMany()
  await prisma.subTask.deleteMany()
  await prisma.comment.deleteMany()
  await prisma.task.deleteMany()
  await prisma.risk.deleteMany()
  await prisma.expense.deleteMany()
  await prisma.projectDashboard.deleteMany()
  await prisma.project.deleteMany()
  await prisma.folder.deleteMany()
  
  // Supprimer les membres test
  await prisma.user.deleteMany({
    where: { role: 'membre' }
  })
  await prisma.user.deleteMany({
    where: { role: 'Membre' }
  })

  console.log('📁 Création des dossiers...')
  
  // Créer des dossiers
  const folders = await Promise.all([
    prisma.folder.create({
      data: { id: generateId(), name: 'Projets Internes', icon: 'Folder', color: '#3b82f6', order: 1, updatedAt: new Date() }
    }),
    prisma.folder.create({
      data: { id: generateId(), name: 'Clients', icon: 'Users', color: '#10b981', order: 2, updatedAt: new Date() }
    }),
    prisma.folder.create({
      data: { id: generateId(), name: 'R&D', icon: 'Lightbulb', color: '#f59e0b', order: 3, updatedAt: new Date() }
    })
  ])

  console.log('👥 Création des membres test...')
  
  // Créer des membres test
  const members = await Promise.all([
    prisma.user.create({
      data: {
        id: generateId(),
        email: 'maria.kone@example.com',
        name: 'Maria Koné',
        password: simpleHash('password123'),
        role: 'membre',
        position: 'Développeuse',
        department: 'IT',
        phone: '+225 07 00 00 01',
        bio: 'Développeuse Full Stack avec 5 ans d\'expérience',
        skills: JSON.stringify(['JavaScript', 'React', 'Node.js', 'Python']),
        isActive: true,
        updatedAt: new Date()
      }
    }),
    prisma.user.create({
      data: {
        id: generateId(),
        email: 'ibrahima.sylla@example.com',
        name: 'Ibrahim Sylla',
        password: simpleHash('password123'),
        role: 'membre',
        position: 'Designer UI/UX',
        department: 'Design',
        phone: '+225 07 00 00 02',
        bio: 'Designer passionné par l\'expérience utilisateur',
        skills: JSON.stringify(['Figma', 'Adobe XD', 'Photoshop', 'Illustrator']),
        isActive: true,
        updatedAt: new Date()
      }
    }),
    prisma.user.create({
      data: {
        id: generateId(),
        email: 'fatou.diarra@example.com',
        name: 'Fatou Diarra',
        password: simpleHash('password123'),
        role: 'membre',
        position: 'Chef de Projet',
        department: 'Management',
        phone: '+225 07 00 00 03',
        bio: 'Certifiée PMP avec expertise en gestion de projets agiles',
        skills: JSON.stringify(['Scrum', 'Agile', 'Jira', 'Confluence']),
        isActive: true,
        updatedAt: new Date()
      }
    })
  ])

  console.log('📊 Création des projets...')
  
  // Créer des projets
  const projects = await Promise.all([
    prisma.project.create({
      data: {
        id: generateId(),
        name: 'Refonte Site Web Corporate',
        description: 'Refonte complète du site web de l\'entreprise avec nouveau design et CMS',
        status: 'En cours',
        budgetPlanned: 5000000,
        budgetSpent: 2500000,
        folderId: folders[0].id,
        startDate: new Date('2025-01-15'),
        endDate: new Date('2025-06-30'),
        responsibleName: 'Fatou Diarra',
        updatedAt: new Date()
      }
    }),
    prisma.project.create({
      data: {
        id: generateId(),
        name: 'Application Mobile E-commerce',
        description: 'Développement d\'une application mobile pour la vente en ligne',
        status: 'En cours',
        budgetPlanned: 15000000,
        budgetSpent: 8000000,
        folderId: folders[1].id,
        startDate: new Date('2025-02-01'),
        endDate: new Date('2025-09-30'),
        responsibleName: 'Maria Koné',
        updatedAt: new Date()
      }
    }),
    prisma.project.create({
      data: {
        id: generateId(),
        name: 'Système de Gestion Interne',
        description: 'Développement d\'un ERP interne pour la gestion des ressources',
        status: 'Planifié',
        budgetPlanned: 20000000,
        budgetSpent: 0,
        folderId: folders[0].id,
        startDate: new Date('2025-04-01'),
        endDate: new Date('2025-12-31'),
        responsibleName: 'Gestionnaire',
        updatedAt: new Date()
      }
    }),
    prisma.project.create({
      data: {
        id: generateId(),
        name: 'Plateforme E-learning',
        description: 'Création d\'une plateforme de formation en ligne pour les employés',
        status: 'En cours',
        budgetPlanned: 8000000,
        budgetSpent: 3500000,
        folderId: folders[2].id,
        startDate: new Date('2025-03-01'),
        endDate: new Date('2025-08-31'),
        responsibleName: 'Ibrahim Sylla',
        updatedAt: new Date()
      }
    }),
    prisma.project.create({
      data: {
        id: generateId(),
        name: 'Audit Sécurité',
        description: 'Audit complet de la sécurité informatique',
        status: 'Terminé',
        budgetPlanned: 2000000,
        budgetSpent: 1800000,
        folderId: folders[2].id,
        startDate: new Date('2024-10-01'),
        endDate: new Date('2025-01-31'),
        responsibleName: 'Fatou Diarra',
        updatedAt: new Date()
      }
    })
  ])

  console.log('✅ Création des tâches...')
  
  // Créer des tâches pour chaque projet
  const tasksData = [
    // Projet 1 - Refonte Site Web
    { title: 'Analyse des besoins', status: 'Validé', priority: 'Haute', projectId: projects[0].id, assigneeId: members[2].id, assigneeName: 'Fatou Diarra', dueDate: new Date('2025-02-15') },
    { title: 'Maquette homepage', status: 'Validé', priority: 'Haute', projectId: projects[0].id, assigneeId: members[1].id, assigneeName: 'Ibrahim Sylla', dueDate: new Date('2025-03-01') },
    { title: 'Développement frontend', status: 'En cours', priority: 'Haute', projectId: projects[0].id, assigneeId: members[0].id, assigneeName: 'Maria Koné', dueDate: new Date('2025-04-30') },
    { title: 'Intégration CMS', status: 'À faire', priority: 'Moyenne', projectId: projects[0].id, assigneeId: members[0].id, assigneeName: 'Maria Koné', dueDate: new Date('2025-05-15') },
    { title: 'Tests et QA', status: 'À faire', priority: 'Moyenne', projectId: projects[0].id, assigneeId: members[2].id, assigneeName: 'Fatou Diarra', dueDate: new Date('2025-06-15') },
    
    // Projet 2 - App Mobile
    { title: 'Architecture technique', status: 'Validé', priority: 'Haute', projectId: projects[1].id, assigneeId: members[0].id, assigneeName: 'Maria Koné', dueDate: new Date('2025-02-28') },
    { title: 'Design UI/UX', status: 'En cours', priority: 'Haute', projectId: projects[1].id, assigneeId: members[1].id, assigneeName: 'Ibrahim Sylla', dueDate: new Date('2025-04-15') },
    { title: 'Développement iOS', status: 'En cours', priority: 'Haute', projectId: projects[1].id, assigneeId: members[0].id, assigneeName: 'Maria Koné', dueDate: new Date('2025-07-31') },
    { title: 'Développement Android', status: 'À faire', priority: 'Haute', projectId: projects[1].id, assigneeId: members[0].id, assigneeName: 'Maria Koné', dueDate: new Date('2025-08-31') },
    { title: 'Tests beta', status: 'À faire', priority: 'Moyenne', projectId: projects[1].id, assigneeId: members[2].id, assigneeName: 'Fatou Diarra', dueDate: new Date('2025-09-15') },
    
    // Projet 3 - ERP
    { title: 'Cahier des charges', status: 'En cours', priority: 'Haute', projectId: projects[2].id, assigneeId: members[2].id, assigneeName: 'Fatou Diarra', dueDate: new Date('2025-04-30') },
    { title: 'Choix technologie', status: 'À faire', priority: 'Moyenne', projectId: projects[2].id, assigneeId: members[0].id, assigneeName: 'Maria Koné', dueDate: new Date('2025-05-15') },
    
    // Projet 4 - E-learning
    { title: 'Storyboarding', status: 'Validé', priority: 'Moyenne', projectId: projects[3].id, assigneeId: members[1].id, assigneeName: 'Ibrahim Sylla', dueDate: new Date('2025-03-31') },
    { title: 'Développement LMS', status: 'En cours', priority: 'Haute', projectId: projects[3].id, assigneeId: members[0].id, assigneeName: 'Maria Koné', dueDate: new Date('2025-06-30') },
    { title: 'Création contenu', status: 'En retard', priority: 'Haute', projectId: projects[3].id, assigneeId: members[2].id, assigneeName: 'Fatou Diarra', dueDate: new Date('2025-04-15') },
    { title: 'Intégration vidéos', status: 'À faire', priority: 'Moyenne', projectId: projects[3].id, assigneeId: members[1].id, assigneeName: 'Ibrahim Sylla', dueDate: new Date('2025-07-31') },
  ]

  for (const task of tasksData) {
    await prisma.task.create({
      data: {
        id: generateId(),
        ...task,
        priorityScore: task.priority === 'Haute' ? 3 : task.priority === 'Moyenne' ? 2 : 1,
        updatedAt: new Date()
      }
    })
  }

  console.log('⚠️ Création des risques...')
  
  // Créer des risques
  const risksData = [
    { title: 'Retard de livraison', description: 'Risque de retard lié aux dépendances externes', severity: 'Élevé', probability: 'Moyenne', status: 'Actif', projectId: projects[0].id },
    { title: 'Budget dépassé', description: 'Dépassement possible du budget alloué', severity: 'Critique', probability: 'Élevée', status: 'Actif', projectId: projects[1].id },
    { title: 'Perte de ressources', description: 'Départ possible de membres clés', severity: 'Moyen', probability: 'Faible', status: 'Surveillé', projectId: projects[2].id },
    { title: 'Problèmes techniques', description: 'Difficultés techniques imprévues', severity: 'Élevé', probability: 'Moyenne', status: 'Actif', projectId: projects[3].id },
    { title: 'Change requirements', description: 'Changements fréquents des besoins client', severity: 'Moyen', probability: 'Élevée', status: 'Actif', projectId: projects[0].id },
  ]

  for (const risk of risksData) {
    await prisma.risk.create({
      data: {
        id: generateId(),
        ...risk,
        severityScore: risk.severity === 'Critique' ? 4 : risk.severity === 'Élevé' ? 3 : risk.severity === 'Moyen' ? 2 : 1,
        probabilityScore: risk.probability === 'Élevée' ? 3 : risk.probability === 'Moyenne' ? 2 : 1,
        riskScore: (risk.severity === 'Critique' ? 4 : risk.severity === 'Élevé' ? 3 : 2) * (risk.probability === 'Élevée' ? 3 : risk.probability === 'Moyenne' ? 2 : 1),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })
  }

  console.log('\n✅ Données de test créées avec succès!')
  console.log(`📁 ${folders.length} dossiers`)
  console.log(`👥 ${members.length} membres`)
  console.log(`📊 ${projects.length} projets`)
  console.log(`✅ ${tasksData.length} tâches`)
  console.log(`⚠️ ${risksData.length} risques`)
  
  console.log('\n🔐 Comptes de test:')
  console.log('Gestionnaire: admin@traoreprojet.com / admin123')
  console.log('Maria: maria.kone@example.com / password123')
  console.log('Ibrahim: ibrahima.sylla@example.com / password123')
  console.log('Fatou: fatou.diarra@example.com / password123')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
