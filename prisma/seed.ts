import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Début du seed...\n')

  // ============================================
  // 1. NETTOYAGE DES DONNÉES EXISTANTES
  // ============================================
  console.log('🧹 Nettoyage des données existantes...')
  await prisma.questionnaireAnswer.deleteMany()
  await prisma.questionnaireQuestion.deleteMany()
  await prisma.questionnaireTemplate.deleteMany()
  await prisma.timerSession.deleteMany()
  await prisma.taskFile.deleteMany()
  await prisma.subTask.deleteMany()
  await prisma.activityHistory.deleteMany()
  await prisma.comment.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.dailyTodo.deleteMany()
  await prisma.projectDashboard.deleteMany()
  await prisma.delayCause.deleteMany()
  await prisma.risk.deleteMany()
  await prisma.expense.deleteMany()
  await prisma.task.deleteMany()
  await prisma.taskTemplate.deleteMany()
  await prisma.project.deleteMany()
  await prisma.projectTemplate.deleteMany()
  await prisma.folder.deleteMany()
  await prisma.user.deleteMany()
  await prisma.pdfImport.deleteMany()
  await prisma.appSettings.deleteMany()
  console.log('✅ Nettoyage terminé\n')

  // ============================================
  // 2. UTILISATEURS
  // ============================================
  console.log('👥 Création des utilisateurs...')
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'admin@gestionprojet.com',
        name: 'Admin Principal',
        role: 'Admin',
        password: 'admin123' // À hasher en production
      }
    }),
    prisma.user.create({
      data: {
        email: 'amadou.diallo@example.com',
        name: 'Amadou Diallo',
        role: 'Chef de projet'
      }
    }),
    prisma.user.create({
      data: {
        email: 'fatimata.sawadogo@example.com',
        name: 'Fatimata Sawadogo',
        role: 'Chef de projet'
      }
    }),
    prisma.user.create({
      data: {
        email: 'oumar.traore@example.com',
        name: 'Oumar Traoré',
        role: 'Membre'
      }
    })
  ])
  console.log(`✅ ${users.length} utilisateurs créés\n`)

  // ============================================
  // 3. DOSSIERS
  // ============================================
  console.log('📁 Création des dossiers...')
  const folders = await Promise.all([
    prisma.folder.create({
      data: { name: 'Infrastructure', icon: 'Building2', color: '#3B82F6', order: 1 }
    }),
    prisma.folder.create({
      data: { name: 'Marketing', icon: 'Megaphone', color: '#10B981', order: 2 }
    }),
    prisma.folder.create({
      data: { name: 'Environnement', icon: 'Trees', color: '#22C55E', order: 3 }
    }),
    prisma.folder.create({
      data: { name: 'Ressources Humaines', icon: 'Users', color: '#8B5CF6', order: 4 }
    })
  ])
  console.log(`✅ ${folders.length} dossiers créés\n`)

  // ============================================
  // 4. MODÈLES DE PROJETS (Templates)
  // ============================================
  console.log('📋 Création des modèles de projets...')
  
  // Template: Nouveau Client Web
  const templateWeb = await prisma.projectTemplate.create({
    data: {
      name: 'Nouveau Client Web',
      description: 'Modèle standard pour la gestion d\'un nouveau client avec site web',
      icon: 'Globe',
      color: '#3B82F6',
      defaultBudget: 5000000,
      isDefault: true,
      taskTemplates: {
        create: [
          { title: 'Réunion de lancement avec le client', defaultPriority: 'Haute', estimatedDays: 1, order: 1 },
          { title: 'Cahier des charges et validations', defaultPriority: 'Haute', estimatedDays: 3, order: 2 },
          { title: 'Maquettes et design', defaultPriority: 'Haute', estimatedDays: 5, order: 3 },
          { title: 'Développement front-end', defaultPriority: 'Moyenne', estimatedDays: 10, order: 4 },
          { title: 'Développement back-end', defaultPriority: 'Moyenne', estimatedDays: 10, order: 5 },
          { title: 'Tests et corrections', defaultPriority: 'Moyenne', estimatedDays: 3, order: 6 },
          { title: 'Formation client', defaultPriority: 'Basse', estimatedDays: 1, order: 7 },
          { title: 'Mise en production', defaultPriority: 'Haute', estimatedDays: 1, order: 8 }
        ]
      }
    }
  })

  // Template: Projet Infrastructure
  const templateInfra = await prisma.projectTemplate.create({
    data: {
      name: 'Projet Infrastructure',
      description: 'Modèle pour les projets de construction et infrastructure',
      icon: 'Building2',
      color: '#F59E0B',
      defaultBudget: 50000000,
      taskTemplates: {
        create: [
          { title: 'Étude de faisabilité', defaultPriority: 'Haute', estimatedDays: 15, order: 1 },
          { title: 'Obtention des permis', defaultPriority: 'Haute', estimatedDays: 30, order: 2 },
          { title: 'Appel d\'offres fournisseurs', defaultPriority: 'Moyenne', estimatedDays: 10, order: 3 },
          { title: 'Terrassement et fondations', defaultPriority: 'Haute', estimatedDays: 45, order: 4 },
          { title: 'Construction principale', defaultPriority: 'Haute', estimatedDays: 90, order: 5 },
          { title: 'Finitions', defaultPriority: 'Moyenne', estimatedDays: 30, order: 6 },
          { title: 'Réception des travaux', defaultPriority: 'Haute', estimatedDays: 5, order: 7 }
        ]
      }
    }
  })

  // Template: Campagne Marketing
  const templateMarketing = await prisma.projectTemplate.create({
    data: {
      name: 'Campagne Marketing',
      description: 'Modèle pour les campagnes marketing et promotionnelles',
      icon: 'Megaphone',
      color: '#10B981',
      defaultBudget: 2000000,
      taskTemplates: {
        create: [
          { title: 'Définition des objectifs', defaultPriority: 'Haute', estimatedDays: 2, order: 1 },
          { title: 'Création des visuels', defaultPriority: 'Moyenne', estimatedDays: 5, order: 2 },
          { title: 'Rédaction des contenus', defaultPriority: 'Moyenne', estimatedDays: 3, order: 3 },
          { title: 'Validation client', defaultPriority: 'Haute', estimatedDays: 2, order: 4 },
          { title: 'Diffusion médias', defaultPriority: 'Haute', estimatedDays: 1, order: 5 },
          { title: 'Suivi et reporting', defaultPriority: 'Basse', estimatedDays: 7, order: 6 }
        ]
      }
    }
  })

  console.log(`✅ 3 modèles de projets créés avec leurs tâches types\n`)

  // ============================================
  // 5. CAUSES DE RETARD
  // ============================================
  console.log('⏰ Création des causes de retard...')
  const delayCauses = await Promise.all([
    prisma.delayCause.create({
      data: { name: 'Attente client', description: 'En attente de validation ou réponse du client', color: '#F59E0B', isDefault: true }
    }),
    prisma.delayCause.create({
      data: { name: 'Bug technique', description: 'Problème technique imprévu', color: '#EF4444', isDefault: true }
    }),
    prisma.delayCause.create({
      data: { name: 'Ressource manquante', description: 'Manque de personnel ou matériel', color: '#8B5CF6', isDefault: true }
    }),
    prisma.delayCause.create({
      data: { name: 'Condition météo', description: 'Conditions météorologiques défavorables', color: '#06B6D4', isDefault: true }
    }),
    prisma.delayCause.create({
      data: { name: 'Problème fournisseur', description: 'Retard de livraison fournisseur', color: '#EC4899', isDefault: true }
    }),
    prisma.delayCause.create({
      data: { name: 'Changement de scope', description: 'Modification des exigences en cours', color: '#84CC16', isDefault: true }
    })
  ])
  console.log(`✅ ${delayCauses.length} causes de retard créées\n`)

  // ============================================
  // 6. PROJETS
  // ============================================
  console.log('📊 Création des projets...')
  
  // Projet Infrastructure 1
  const project1 = await prisma.project.create({
    data: {
      name: 'Construction Pont Ouaga-Nord',
      description: 'Construction d\'un nouveau pont sur la route reliant Ouagadougou au nord du pays',
      objectives: 'Améliorer la circulation et réduire les temps de trajet vers le nord',
      constraints: 'Délai strict de 18 mois, budget limité à 45M CFA',
      status: 'En cours',
      budgetPlanned: 45000000,
      budgetSpent: 29250000,
      responsibleName: 'Fatimata Sawadogo',
      responsibleId: users[2].id,
      folderId: folders[0].id,
      startDate: new Date('2025-01-15'),
      endDate: new Date('2026-06-30')
    }
  })

  // Projet Infrastructure 2
  const project2 = await prisma.project.create({
    data: {
      name: 'Réhabilitation Route Nationale',
      description: 'Réhabilitation de la route nationale sur 150 km',
      objectives: 'Remettre en état la route nationale pour sécuriser les trajets',
      constraints: 'Travaux à réaliser pendant la saison sèche uniquement',
      status: 'En cours',
      budgetPlanned: 120000000,
      budgetSpent: 34500000,
      responsibleName: 'Amadou Diallo',
      responsibleId: users[1].id,
      folderId: folders[0].id,
      startDate: new Date('2025-03-01'),
      endDate: new Date('2027-01-31')
    }
  })

  // Projet Marketing 1
  const project3 = await prisma.project.create({
    data: {
      name: 'Campagne Promotion Tourisme',
      description: 'Campagne marketing pour promouvoir le tourisme local',
      objectives: 'Augmenter le tourisme intérieur de 30%',
      constraints: 'Budget limité, respect de l\'image du pays',
      status: 'Actif',
      budgetPlanned: 15000000,
      budgetSpent: 5000000,
      responsibleName: 'Oumar Traoré',
      responsibleId: users[3].id,
      folderId: folders[1].id,
      startDate: new Date('2025-06-01'),
      endDate: new Date('2025-12-31')
    }
  })

  // Projet Marketing 2
  const project4 = await prisma.project.create({
    data: {
      name: 'Lancement Produit Agricole',
      description: 'Stratégie de lancement pour les nouveaux produits agricoles locaux',
      objectives: 'Faire connaître les produits locaux et augmenter les ventes',
      constraints: 'Synchronisation avec la récolte',
      status: 'En cours',
      budgetPlanned: 8000000,
      budgetSpent: 2000000,
      responsibleName: 'Amadou Diallo',
      responsibleId: users[1].id,
      folderId: folders[1].id,
      startDate: new Date('2025-07-15'),
      endDate: new Date('2026-03-31')
    }
  })

  // Projet Environnement
  const project5 = await prisma.project.create({
    data: {
      name: 'Parc Bangr-Weogo',
      description: 'Rénovation et extension du parc urbain Bangr-Weogo',
      objectives: 'Créer un espace vert moderne et accessible à tous',
      constraints: 'Préservation de la biodiversité existante',
      status: 'En cours',
      budgetPlanned: 25000000,
      budgetSpent: 8500000,
      responsibleName: 'Fatimata Sawadogo',
      responsibleId: users[2].id,
      folderId: folders[2].id,
      startDate: new Date('2025-04-01'),
      endDate: new Date('2026-04-30')
    }
  })

  console.log(`✅ 5 projets créés\n`)

  // ============================================
  // 7. TÂCHES AVEC SOUS-TÂCHES
  // ============================================
  console.log('✅ Création des tâches avec sous-tâches...')

  // Tâches Projet 1
  await prisma.task.createMany({
    data: [
      {
        title: 'Valider plan d\'exécution phase 2',
        description: 'Validation du plan détaillé pour la seconde phase de construction',
        objectives: 'Obtenir l\'approbation du plan',
        constraints: 'Doit être validé avant le début des travaux',
        status: 'En retard',
        priority: 'Haute',
        priorityScore: 90,
        dueDate: new Date('2026-03-07'),
        projectId: project1.id,
        assigneeName: 'Fatimata Sawadogo',
        estimatedTime: 480
      },
      {
        title: 'Commander matériaux fondation',
        description: 'Commande des matériaux nécessaires pour les fondations',
        objectives: 'Approvisionner le chantier',
        constraints: 'Délai de livraison 2 semaines',
        status: 'À faire',
        priority: 'Moyenne',
        priorityScore: 50,
        dueDate: new Date('2026-03-08'),
        projectId: project1.id,
        assigneeName: 'Amadou Diallo',
        estimatedTime: 120
      },
      {
        title: 'Réunion équipe terrain',
        description: 'Réunion de coordination avec l\'équipe sur le terrain',
        objectives: 'Synchroniser les équipes',
        status: 'En retard',
        priority: 'Haute',
        priorityScore: 85,
        dueDate: new Date('2026-03-06'),
        projectId: project1.id,
        assigneeName: 'Oumar Traoré',
        estimatedTime: 60
      },
      {
        title: 'Rapport d\'avancement mensuel',
        description: 'Préparation du rapport d\'avancement pour le comité',
        status: 'En cours',
        priority: 'Moyenne',
        priorityScore: 40,
        dueDate: new Date('2026-03-15'),
        projectId: project1.id,
        assigneeName: 'Fatimata Sawadogo',
        estimatedTime: 240,
        startedAt: new Date('2026-03-05')
      }
    ]
  })

  // Tâches Projet 2
  await prisma.task.createMany({
    data: [
      {
        title: 'Étude géotechnique tronçon B',
        description: 'Réalisation de l\'étude géotechnique pour le tronçon B',
        objectives: 'Valider la faisabilité technique',
        constraints: 'Conditions météo favorables',
        status: 'En cours',
        priority: 'Haute',
        priorityScore: 80,
        dueDate: new Date('2026-03-20'),
        projectId: project2.id,
        assigneeName: 'Amadou Diallo',
        estimatedTime: 1440
      },
      {
        title: 'Validation expropriations',
        description: 'Validation des dossiers d\'expropriation',
        objectives: 'Libérer les terrains nécessaires',
        constraints: 'Accord des propriétaires',
        status: 'À faire',
        priority: 'Haute',
        priorityScore: 75,
        dueDate: new Date('2026-03-25'),
        projectId: project2.id,
        assigneeName: 'Fatimata Sawadogo',
        estimatedTime: 720
      },
      {
        title: 'Acquisition équipements',
        description: 'Acquisition des équipements de chantier',
        objectives: 'Équiper le chantier',
        status: 'Validé',
        priority: 'Moyenne',
        priorityScore: 30,
        dueDate: new Date('2026-02-28'),
        projectId: project2.id,
        assigneeName: 'Oumar Traoré',
        estimatedTime: 480,
        actualTime: 520,
        completedAt: new Date('2026-02-27')
      }
    ]
  })

  // Tâches Projet Marketing
  await prisma.task.createMany({
    data: [
      {
        title: 'Création supports visuels',
        description: 'Design des supports visuels pour la campagne',
        objectives: 'Produire les visuels marketing',
        constraints: 'Charte graphique à respecter',
        status: 'En cours',
        priority: 'Haute',
        priorityScore: 70,
        dueDate: new Date('2026-03-10'),
        projectId: project3.id,
        assigneeName: 'Oumar Traoré',
        estimatedTime: 960
      },
      {
        title: 'Diffusion radio/TV',
        description: 'Planification de la diffusion sur les médias',
        objectives: 'Assurer la visibilité de la campagne',
        status: 'À faire',
        priority: 'Moyenne',
        priorityScore: 45,
        dueDate: new Date('2026-03-20'),
        projectId: project3.id,
        assigneeName: 'Amadou Diallo',
        estimatedTime: 240
      }
    ]
  })

  // Ajouter des sous-tâches
  const task1 = await prisma.task.findFirst({ where: { title: 'Valider plan d\'exécution phase 2' } })
  if (task1) {
    await prisma.subTask.createMany({
      data: [
        { title: 'Rassembler les documents techniques', isCompleted: true, taskId: task1.id },
        { title: 'Planifier la réunion de validation', isCompleted: true, taskId: task1.id },
        { title: 'Obtenir les signatures', isCompleted: false, taskId: task1.id },
        { title: 'Distribuer le plan validé', isCompleted: false, taskId: task1.id }
      ]
    })
  }

  console.log(`✅ Tâches et sous-tâches créées\n`)

  // ============================================
  // 8. DÉPENSES
  // ============================================
  console.log('💰 Création des dépenses...')
  await prisma.expense.createMany({
    data: [
      { description: 'Achat de ciment', amount: 5000000, category: 'Matériaux', projectId: project1.id, date: new Date('2025-06-15') },
      { description: 'Location engins', amount: 8000000, category: 'Équipement', projectId: project1.id, date: new Date('2025-07-01') },
      { description: 'Main d\'œuvre phase 1', amount: 12000000, category: 'Main d\'œuvre', projectId: project1.id, date: new Date('2025-08-01') },
      { description: 'Études techniques', amount: 4250000, category: 'Études', projectId: project1.id, date: new Date('2025-05-01') },
      { description: 'Travaux terrassement', amount: 15000000, category: 'Travaux', projectId: project2.id, date: new Date('2025-08-15') },
      { description: 'Achat bitume', amount: 8000000, category: 'Matériaux', projectId: project2.id, date: new Date('2025-09-01') },
      { description: 'Main d\'œuvre', amount: 11500000, category: 'Main d\'œuvre', projectId: project2.id, date: new Date('2025-10-01') },
      { description: 'Production vidéo', amount: 2500000, category: 'Production', projectId: project3.id, date: new Date('2025-07-15') },
      { description: 'Achat espace média', amount: 2500000, category: 'Média', projectId: project3.id, date: new Date('2025-08-01') }
    ]
  })
  console.log(`✅ Dépenses créées\n`)

  // ============================================
  // 9. RISQUES AVEC SCORES
  // ============================================
  console.log('⚠️ Création des risques...')
  await prisma.risk.createMany({
    data: [
      {
        title: 'Retard de livraison matériaux',
        description: 'Risque de retard dans la livraison des matériaux de construction',
        severity: 'Haute',
        severityScore: 3,
        probability: 'Moyenne',
        probabilityScore: 2,
        riskScore: 6,
        status: 'Identifié',
        mitigation: 'Prévoir des fournisseurs alternatifs',
        projectId: project1.id
      },
      {
        title: 'Conditions météo défavorables',
        description: 'Intempéries pouvant retarder les travaux',
        severity: 'Moyenne',
        severityScore: 2,
        probability: 'Haute',
        probabilityScore: 3,
        riskScore: 6,
        status: 'En cours de traitement',
        mitigation: 'Planification flexible et protection des zones de travail',
        projectId: project2.id
      },
      {
        title: 'Dépassement budgétaire',
        description: 'Risque de dépassement du budget alloué',
        severity: 'Critique',
        severityScore: 4,
        probability: 'Moyenne',
        probabilityScore: 2,
        riskScore: 8,
        status: 'Identifié',
        mitigation: 'Suivi mensuel des dépenses et révision des prévisions',
        projectId: project1.id
      }
    ]
  })
  console.log(`✅ Risques créés avec scores\n`)

  // ============================================
  // 10. QUESTIONNAIRE
  // ============================================
  console.log('📝 Création du questionnaire de création de tâche...')
  await prisma.questionnaireTemplate.create({
    data: {
      name: 'Création de tâche standard',
      description: 'Questionnaire pour créer une nouvelle tâche avec toutes les informations nécessaires',
      isActive: true,
      questions: {
        create: [
          { question: 'Titre de la tâche', type: 'text', required: true, order: 1 },
          { question: 'Description détaillée', type: 'text', required: false, order: 2 },
          { question: 'Objectifs de la tâche', type: 'text', required: false, order: 3 },
          { question: 'Contraintes à respecter', type: 'text', required: false, order: 4 },
          { question: 'Priorité', type: 'select', options: '["Basse", "Moyenne", "Haute", "Urgente"]', required: true, order: 5 },
          { question: 'Temps estimé (en heures)', type: 'number', required: false, order: 6 },
          { question: 'Date d\'échéance', type: 'date', required: false, order: 7 },
          { question: 'Responsable', type: 'text', required: false, order: 8 },
          { question: 'Proposition de solution', type: 'text', required: false, order: 9 }
        ]
      }
    }
  })
  console.log(`✅ Questionnaire créé\n`)

  // ============================================
  // 11. PARAMÈTRES APPLICATION
  // ============================================
  console.log('⚙️ Création des paramètres...')
  await prisma.appSettings.createMany({
    data: [
      { key: 'app_name', value: 'Gestion Projet', description: 'Nom de l\'application' },
      { key: 'currency', value: 'CFA', description: 'Devise utilisée' },
      { key: 'notification_time', value: '08:00', description: 'Heure d\'envoi des notifications matinales' },
      { key: 'reminder_default_days', value: '1', description: 'Jours avant rappel par défaut' }
    ]
  })
  console.log(`✅ Paramètres créés\n`)

  // ============================================
  // 12. DASHBOARDS PAR PROJET
  // ============================================
  console.log('📊 Création des dashboards par projet...')
  const projects = [project1, project2, project3, project4, project5]
  for (const project of projects) {
    await prisma.projectDashboard.create({
      data: {
        projectId: project.id,
        tasksTotal: 0,
        tasksCompleted: 0,
        tasksInProgress: 0,
        tasksLate: 0,
        tasksToDo: 0,
        risksTotal: 0,
        risksCritical: 0,
        budgetUsedPercent: project.budgetPlanned > 0 ? (project.budgetSpent / project.budgetPlanned) * 100 : 0
      }
    })
  }
  console.log(`✅ Dashboards créés\n`)

  // ============================================
  // RÉSUMÉ FINAL
  // ============================================
  console.log('═══════════════════════════════════════════════')
  console.log('🎉 SEED TERMINÉ AVEC SUCCÈS !')
  console.log('═══════════════════════════════════════════════')
  console.log('\n📈 Résumé:')
  console.log(`   👥 ${users.length} utilisateurs`)
  console.log(`   📁 ${folders.length} dossiers`)
  console.log(`   📋 3 modèles de projets avec tâches types`)
  console.log(`   📊 ${projects.length} projets`)
  console.log(`   ⏰ ${delayCauses.length} causes de retard`)
  console.log(`   📝 1 questionnaire de création`)
  console.log('═══════════════════════════════════════════════\n')
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
