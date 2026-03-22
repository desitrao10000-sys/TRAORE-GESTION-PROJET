import { db } from '../src/lib/db'

async function seedExamples() {
  console.log('🌱 Création des données exemples...')

  // Créer les dossiers
  const infrastructureFolder = await db.folder.create({
    data: {
      name: 'Infrastructure',
      icon: 'Building2',
      color: '#3B82F6',
      order: 1
    }
  })

  const productionFolder = await db.folder.create({
    data: {
      name: 'Production',
      icon: 'Wheat',
      color: '#10B981',
      order: 2
    }
  })

  const financementFolder = await db.folder.create({
    data: {
      name: 'Financement',
      icon: 'Wallet',
      color: '#F59E0B',
      order: 3
    }
  })

  console.log('✅ Dossiers créés')

  // ============================================
  // PROJET 1: Achat de semence certifiée de riz
  // ============================================
  const projet1 = await db.project.create({
    data: {
      name: 'Achat de semence certifiée de riz',
      description: 'Acquisition de semences de riz certifiées pour la campagne agricole 2024-2025. Ce projet vise à assurer la qualité génétique des variétés cultivées et d\'améliorer les rendements.',
      objectives: 'Obtenir 500 tonnes de semences certifiées de variétés improved (Sahel 108, Sahel 328, WITA 9) pour couvrir 2500 hectares de riziculture',
      constraints: 'Budget limité à 75 000 000 CFA. Délai de livraison maximum 30 jours. Certification OCÉANIUM obligatoire.',
      status: 'En cours',
      budgetPlanned: 75000000,
      budgetSpent: 25000000,
      responsibleName: 'Mamadou Diallo',
      folderId: productionFolder.id,
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-03-30')
    }
  })

  // Activités du projet 1
  await db.task.createMany({
    data: [
      {
        title: 'Identification des fournisseurs agréés',
        description: 'Rechercher et contacter les fournisseurs de semences certifiées agréés par le Ministère de l\'Agriculture. Établir une liste de 5 fournisseurs potentiels minimum.',
        objectives: 'Constituer un fichier fournisseur complet avec capacités, tarifs et délais',
        constraints: 'Les fournisseurs doivent avoir une certification valide et des références vérifiables',
        solutionProposed: 'Utiliser le répertoire de la Chambre de Commerce et les recommandations de l\'ANCAR',
        status: 'Validé',
        priority: 'Haute',
        priorityScore: 75,
        estimatedTime: 480,
        actualTime: 520,
        dueDate: new Date('2024-01-25'),
        startedAt: new Date('2024-01-15'),
        completedAt: new Date('2024-01-26'),
        projectId: projet1.id,
        assigneeName: 'Fatou Sow'
      },
      {
        title: 'Demande de cotation et négociation',
        description: 'Envoyer les demandes de cotation aux fournisseurs sélectionnés. Négocier les prix et conditions de livraison.',
        objectives: 'Obtenir au moins 3 cotations comparatives et négocier un rabais de 10%',
        constraints: 'Délai de réponse: 5 jours ouvrables. Prix de référence: 150 000 CFA/tonne',
        solutionProposed: 'Regrouper la commande avec les coopératives voisines pour augmenter le pouvoir de négociation',
        status: 'En cours',
        priority: 'Urgente',
        priorityScore: 100,
        estimatedTime: 240,
        dueDate: new Date('2025-01-20'),
        startedAt: new Date('2025-01-10'),
        projectId: projet1.id,
        assigneeName: 'Mamadou Diallo'
      },
      {
        title: 'Contrôle qualité des semences',
        description: 'Vérifier la certification et la qualité des semences avant réception. Effectuer des tests de germination.',
        objectives: 'Garantir un taux de germination minimum de 85% et une pureté variétale de 98%',
        constraints: 'Tests à réaliser par le laboratoire de l\'ISRA de Saint-Louis',
        solutionProposed: 'Prélever 3 échantillons par lot de 50 tonnes pour analyse',
        status: 'À faire',
        priority: 'Haute',
        priorityScore: 75,
        estimatedTime: 360,
        dueDate: new Date('2025-02-15'),
        projectId: projet1.id,
        assigneeName: 'Dr. Ousmane Bâ'
      },
      {
        title: 'Formation des producteurs sur l\'utilisation',
        description: 'Organiser des sessions de formation pour les producteurs sur les bonnes pratiques d\'utilisation des semences certifiées.',
        objectives: 'Former 200 producteurs sur les techniques de semis, les doses et la conservation',
        constraints: 'Budget formation: 2 000 000 CFA. Durée: 2 jours par session',
        solutionProposed: 'Utiliser les centres d\'encadrement de l\'ANCAR dans les 5 communes',
        status: 'À faire',
        priority: 'Moyenne',
        priorityScore: 50,
        estimatedTime: 960,
        dueDate: new Date('2025-03-01'),
        projectId: projet1.id,
        assigneeName: 'Aminata Ndiaye'
      }
    ]
  })

  // Dépenses du projet 1
  await db.expense.createMany({
    data: [
      { description: 'Acompte fournisseur SODEVA', amount: 15000000, category: 'Matériaux', projectId: projet1.id, date: new Date('2024-01-28') },
      { description: 'Frais de transport', amount: 2500000, category: 'Transport', projectId: projet1.id, date: new Date('2024-02-05') },
      { description: 'Tests laboratoire ISRA', amount: 500000, category: 'Études', projectId: projet1.id, date: new Date('2024-02-10') },
      { description: 'Frais de douane', amount: 7000000, category: 'Autre', projectId: projet1.id, date: new Date('2024-02-15') }
    ]
  })

  // Risques du projet 1
  await db.risk.createMany({
    data: [
      { title: 'Rupture de stock de semences', description: 'Les fournisseurs pourraient ne pas avoir les quantités demandées en stock', severity: 'Haute', probability: 'Moyenne', mitigation: 'Prévoir des commandes anticipées et des fournisseurs de substitution', projectId: projet1.id },
      { title: 'Retard de livraison', description: 'Les conditions météo peuvent affecter le transport', severity: 'Moyenne', probability: 'Haute', mitigation: 'Diversifier les itinéraires de livraison et prévoir un délai tampon', projectId: projet1.id }
    ]
  })

  console.log('✅ Projet 1 créé: Achat de semence certifiée de riz')

  // ============================================
  // PROJET 2: Préfinancement engrais et produits post-levée
  // ============================================
  const projet2 = await db.project.create({
    data: {
      name: 'Préfinancement en engrais et produits post-levée',
      description: 'Mise en place d\'un système de préfinancement pour l\'accès aux intrants (engrais, herbicides, insecticides) pour les producteurs de la zone du Delta.',
      objectives: 'Financer 1000 tonnes d\'engrais (NPK et Urée) et 5000 litres de produits phytosanitaires pour 500 exploitations',
      constraints: 'Taux d\'intérêt: 5%. Remboursement après récolte. Garantie: récolte attendue',
      status: 'En cours',
      budgetPlanned: 150000000,
      budgetSpent: 45000000,
      responsibleName: 'Ibrahima Fall',
      folderId: financementFolder.id,
      startDate: new Date('2024-02-01'),
      endDate: new Date('2024-06-30')
    }
  })

  // Activités du projet 2
  await db.task.createMany({
    data: [
      {
        title: 'Évaluation des besoins des producteurs',
        description: 'Recenser les besoins en intrants de chaque exploitation bénéficiaire. Collecter les informations sur les surfaces cultivées.',
        objectives: 'Établir un cahier de charge précis par exploitation avec les quantités nécessaires',
        constraints: 'Délai: 15 jours. Couvrir 500 exploitations minimum',
        solutionProposed: 'Utiliser les relais villageois et les chefs de zone pour l\'enquête',
        status: 'Validé',
        priority: 'Haute',
        priorityScore: 75,
        estimatedTime: 720,
        actualTime: 680,
        dueDate: new Date('2024-02-20'),
        startedAt: new Date('2024-02-01'),
        completedAt: new Date('2024-02-18'),
        projectId: projet2.id,
        assigneeName: 'Fatoumata Bâ'
      },
      {
        title: 'Signature des contrats de préfinancement',
        description: 'Établir et faire signer les contrats de préfinancement avec chaque producteur bénéficiaire.',
        objectives: '100% des bénéficiaires signent le contrat et comprennent les modalités de remboursement',
        constraints: 'Contrat validé par le conseil juridique. Attestation de garantie foncière requise',
        solutionProposed: 'Organiser des réunions villageoises pour expliquer les termes du contrat',
        status: 'En cours',
        priority: 'Urgente',
        priorityScore: 100,
        estimatedTime: 480,
        dueDate: new Date('2025-01-25'),
        startedAt: new Date('2025-01-08'),
        projectId: projet2.id,
        assigneeName: 'Ibrahima Fall'
      },
      {
        title: 'Approvisionnement en intrants',
        description: 'Commander et réceptionner les engrais et produits phytosanitaires auprès des fournisseurs agréés.',
        objectives: 'Livrer 1000 tonnes d\'engrais et 5000 litres de produits dans les entrepôts de la zone',
        constraints: 'Qualité conforme aux normes. Stockage approprié dans les magasins PASA',
        solutionProposed: 'Passer commande groupée auprès de ICS et Safras pour bénéficier de tarifs préférentiels',
        status: 'À faire',
        priority: 'Haute',
        priorityScore: 75,
        estimatedTime: 600,
        dueDate: new Date('2025-02-28'),
        projectId: projet2.id,
        assigneeName: 'Moussa Seck'
      },
      {
        title: 'Distribution et suivi des intrants',
        description: 'Distribuer les intrants aux producteurs selon les contrats et assurer le suivi de l\'utilisation.',
        objectives: '100% des bénéficiaires reçoivent leurs intrants. Taux d\'utilisation conforme: 90%',
        constraints: 'Traçabilité complète. Formation sur les doses d\'application',
        solutionProposed: 'Mettre en place un système de bons d\'approvisionnement avec contrôle à la distribution',
        status: 'En retard',
        priority: 'Moyenne',
        priorityScore: 50,
        estimatedTime: 960,
        dueDate: new Date('2024-12-15'),
        projectId: projet2.id,
        assigneeName: 'Aissatou Ndiaye'
      }
    ]
  })

  // Dépenses du projet 2
  await db.expense.createMany({
    data: [
      { description: 'Achat engrais NPK 15-15-15', amount: 25000000, category: 'Matériaux', projectId: projet2.id, date: new Date('2024-03-01') },
      { description: 'Achat Urée 46%', amount: 12000000, category: 'Matériaux', projectId: projet2.id, date: new Date('2024-03-01') },
      { description: 'Produits phytosanitaires', amount: 8000000, category: 'Matériaux', projectId: projet2.id, date: new Date('2024-03-10') }
    ]
  })

  // Risques du projet 2
  await db.risk.createMany({
    data: [
      { title: 'Non-remboursement des prêts', description: 'Les producteurs pourraient ne pas honorer leurs engagements de remboursement', severity: 'Critique', probability: 'Moyenne', mitigation: 'Mettre en place un système de caution solidaire au niveau des villages', projectId: projet2.id },
      { title: 'Hausse des prix des intrants', description: 'Augmentation imprévue du coût des engrais sur le marché international', severity: 'Haute', probability: 'Haute', mitigation: 'Prévoir une marge budgétaire de 15% pour fluctuation des prix', projectId: projet2.id }
    ]
  })

  console.log('✅ Projet 2 créé: Préfinancement engrais et produits post-levée')

  // ============================================
  // PROJET 3: Achat de riz paddy
  // ============================================
  const projet3 = await db.project.create({
    data: {
      name: 'Achat de riz paddy auprès des producteurs',
      description: 'Campagne d\'achat de riz paddy produit localement pour constituer un stock de sécurité et soutenir les prix aux producteurs.',
      objectives: 'Acheter 2000 tonnes de riz paddy à un prix minimum garanti de 200 CFA/kg pour soutenir les revenus des producteurs',
      constraints: 'Budget: 500 000 000 CFA. Humidité max: 14%. Impuretés max: 2%',
      status: 'En cours',
      budgetPlanned: 500000000,
      budgetSpent: 180000000,
      responsibleName: 'Cheikh Tidiane Sarr',
      folderId: infrastructureFolder.id,
      startDate: new Date('2024-11-01'),
      endDate: new Date('2025-02-28')
    }
  })

  // Activités du projet 3
  await db.task.createMany({
    data: [
      {
        title: 'Installation des bascules et matériels de pesée',
        description: 'Mettre en place les bascules certifiées et le matériel de mesure dans les 10 points d\'achat.',
        objectives: 'Équiper 10 centres d\'achat avec du matériel de pesée calibré et certifié',
        constraints: 'Certification ONUDI obligatoire. Formation de 2 agents par centre',
        solutionProposed: 'Louer le matériel à la DMC pour réduire les coûts d\'investissement',
        status: 'Validé',
        priority: 'Urgente',
        priorityScore: 100,
        estimatedTime: 240,
        actualTime: 280,
        dueDate: new Date('2024-11-05'),
        startedAt: new Date('2024-10-25'),
        completedAt: new Date('2024-11-06'),
        projectId: projet3.id,
        assigneeName: 'Pape Gueye'
      },
      {
        title: 'Sensibilisation des producteurs sur les critères de qualité',
        description: 'Informer les producteurs sur les normes de qualité requises (humidité, impuretés) et les bonnes pratiques de récolte.',
        objectives: 'Atteindre un taux de conformité de 80% lors des livraisons',
        constraints: 'Utiliser les canaux de communication locaux (radio, réunions villageoises)',
        solutionProposed: 'Produire des émissions radio en langues locales (wolof, pulaar) et des flyers illustrés',
        status: 'En cours',
        priority: 'Haute',
        priorityScore: 75,
        estimatedTime: 360,
        dueDate: new Date('2025-01-30'),
        startedAt: new Date('2025-01-05'),
        projectId: projet3.id,
        assigneeName: 'Mariama Sy'
      },
      {
        title: 'Collecte et achat du paddy',
        description: 'Procéder à l\'achat du riz paddy dans les différents points de collecte selon le prix garanti.',
        objectives: 'Acheter 2000 tonnes de paddy de qualité. Respecter le prix minimum de 200 CFA/kg',
        constraints: 'Paiement comptant sous 48h maximum. Documenter chaque transaction',
        solutionProposed: 'Utiliser le système de paiement mobile (Orange Money, Wave) pour faciliter les transactions',
        status: 'En cours',
        priority: 'Urgente',
        priorityScore: 100,
        estimatedTime: 1440,
        dueDate: new Date('2025-02-15'),
        startedAt: new Date('2024-11-10'),
        projectId: projet3.id,
        assigneeName: 'Cheikh Tidiane Sarr'
      },
      {
        title: 'Stockage et conservation du paddy',
        description: 'Assurer le stockage du paddy acheté dans les magasins équipés et surveiller la qualité pendant la période de stockage.',
        objectives: 'Maintenir les pertes post-récolte en dessous de 5%. Conserver la qualité jusqu\'à la transformation',
        constraints: 'Capacité de stockage: 2500 tonnes. Lutte contre les ravageurs obligatoire',
        solutionProposed: 'Utiliser des sacs hermétiques PICS et traiter préventivement contre les insectes',
        status: 'À faire',
        priority: 'Moyenne',
        priorityScore: 50,
        estimatedTime: 720,
        dueDate: new Date('2025-03-15'),
        projectId: projet3.id,
        assigneeName: 'Modou Mbaye'
      }
    ]
  })

  // Dépenses du projet 3
  await db.expense.createMany({
    data: [
      { description: 'Achat paddy - Lot Diama', amount: 45000000, category: 'Matériaux', projectId: projet3.id, date: new Date('2024-11-15') },
      { description: 'Achat paddy - Lot Richard Toll', amount: 65000000, category: 'Matériaux', projectId: projet3.id, date: new Date('2024-11-20') },
      { description: 'Achat paddy - Lot Ross Béthio', amount: 55000000, category: 'Matériaux', projectId: projet3.id, date: new Date('2024-12-01') },
      { description: 'Location bascules et équipements', amount: 1500000, category: 'Équipement', projectId: projet3.id, date: new Date('2024-11-01') }
    ]
  })

  // Risques du projet 3
  await db.risk.createMany({
    data: [
      { title: 'Insuffisance de la production locale', description: 'La production locale pourrait être insuffisante pour atteindre l\'objectif d\'achat de 2000 tonnes', severity: 'Haute', probability: 'Moyenne', mitigation: 'Élargir la zone de collecte aux zones voisines et revoir les objectifs à la baisse si nécessaire', projectId: projet3.id },
      { title: 'Dégradation de la qualité en stock', description: 'Le paddy stocké pourrait se dégrader à cause de l\'humidité ou des ravageurs', severity: 'Moyenne', probability: 'Moyenne', mitigation: 'Mettre en place un système de surveillance hebdomadaire et des traitements préventifs', projectId: projet3.id }
    ]
  })

  // Commentaires sur les projets
  await db.comment.createMany({
    data: [
      { content: 'Réunion de lancement prévue le 20 janvier avec tous les partenaires. Veuillez confirmer votre présence.', authorName: 'Mamadou Diallo', projectId: projet1.id },
      { content: 'Le fournisseur SODEVA a confirmé la disponibilité des semences. Il faut finaliser le contrat cette semaine.', authorName: 'Fatou Sow', projectId: projet1.id },
      { content: 'Attention: les délais de paiement devront être respectés scrupuleusement pour maintenir la confiance des producteurs.', authorName: 'Ibrahima Fall', projectId: projet2.id },
      { content: 'Le premier lot de paddy a été réceptionné avec un taux d\'humidité de 13.5%. Qualité conforme.', authorName: 'Cheikh Tidiane Sarr', projectId: projet3.id }
    ]
  })

  console.log('✅ Projet 3 créé: Achat de riz paddy')

  // ============================================
  // ACTIVITÉS EN RETARD (tâches avec date passée)
  // ============================================
  
  // Une tâche vraiment en retard (date passée et non démarrée)
  await db.task.create({
    data: {
      title: 'Rapport mensuel d\'activités - Décembre',
      description: 'Rédiger et soumettre le rapport mensuel des activités de tous les projets pour le comité de pilotage.',
      objectives: 'Produire un rapport synthétique de 10 pages maximum avec indicateurs clés',
      constraints: 'Format imposé par le bailleur. Délai strict',
      solutionProposed: 'Utiliser le template standard et consolider les données des 3 projets',
      status: 'À faire',
      priority: 'Urgente',
      priorityScore: 100,
      estimatedTime: 240,
      dueDate: new Date('2024-12-31'), // Date passée = en retard
      projectId: projet1.id,
      assigneeName: 'Aminata Ndiaye'
    }
  })

  // Autre tâche en retard
  await db.task.create({
    data: {
      title: 'Inventaire des stocks de semences',
      description: 'Réaliser l\'inventaire physique des stocks de semences dans les magasins.',
      objectives: 'Établir un état des lieux précis des quantités disponibles',
      constraints: 'Doit être fait avant les nouvelles livraisons',
      solutionProposed: 'Utiliser les fiches de stock et vérifier les conditionnements',
      status: 'À faire',
      priority: 'Haute',
      priorityScore: 75,
      estimatedTime: 180,
      dueDate: new Date('2025-01-05'), // Date passée = en retard
      projectId: projet1.id,
      assigneeName: 'Moussa Seck'
    }
  })

  console.log('✅ Tâches en retard créées')
  console.log('\n🎉 Données exemples créées avec succès!')
  console.log('\nRésumé:')
  console.log('- 3 dossiers: Infrastructure, Production, Financement')
  console.log('- 3 projets avec 4 activités chacun')
  console.log('- Dépenses, risques et commentaires associés')
  console.log('- Activités avec différents statuts: Validé, En cours, À faire, En retard')
}

seedExamples()
  .catch((e) => {
    console.error('Erreur:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
