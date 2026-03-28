import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

// Initialize ZAI instance
let zaiInstance: Awaited<ReturnType<typeof ZAI.create>> | null = null

async function getZAI() {
  if (!zaiInstance) {
    zaiInstance = await ZAI.create()
  }
  return zaiInstance
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { pdfBase64, pdfName } = body

    if (!pdfBase64) {
      return NextResponse.json(
        { success: false, error: 'Aucun fichier PDF fourni' },
        { status: 400 }
      )
    }

    const zai = await getZAI()

    // Prompt pour extraire les tâches du document
    const systemPrompt = `Tu es un assistant expert en gestion de projet. Ton rôle est d'analyser des documents (cahiers des charges, rapports, plans de projet) et d'en extraire les tâches pertinentes.

Pour chaque tâche identifiée, tu dois retourner un objet JSON avec:
- title: titre court et clair de la tâche
- description: description détaillée (2-3 phrases)
- priority: "Haute", "Moyenne" ou "Basse" selon l'importance
- estimatedDays: nombre de jours estimés (entier)
- category: catégorie suggérée (ex: "Conception", "Développement", "Test", "Documentation", "Réunion", "Autre")

Tu dois retourner UNIQUEMENT un objet JSON valide avec la structure suivante:
{
  "success": true,
  "documentTitle": "Titre du document",
  "summary": "Résumé du document en 2-3 phrases",
  "tasks": [
    {
      "title": "...",
      "description": "...",
      "priority": "Haute|Moyenne|Basse",
      "estimatedDays": nombre,
      "category": "..."
    }
  ]
}

Si tu ne trouves aucune tâche, retourne:
{
  "success": false,
  "error": "Aucune tâche identifiable dans ce document"
}

Ne mets aucun texte avant ou après le JSON. Retourne uniquement le JSON valide.`

    // Appel au VLM avec le PDF
    const response = await zai.chat.completions.createVision({
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: systemPrompt
            },
            {
              type: 'file_url',
              file_url: {
                url: pdfBase64.startsWith('data:') ? pdfBase64 : `data:application/pdf;base64,${pdfBase64}`
              }
            }
          ]
        }
      ],
      thinking: { type: 'disabled' }
    })

    const content = response.choices[0]?.message?.content

    if (!content) {
      return NextResponse.json(
        { success: false, error: 'Aucune réponse de l\'IA' },
        { status: 500 }
      )
    }

    // Parser la réponse JSON
    try {
      // Nettoyer la réponse si elle contient des balises markdown
      let cleanContent = content.trim()
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.slice(7)
      }
      if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.slice(3)
      }
      if (cleanContent.endsWith('```')) {
        cleanContent = cleanContent.slice(0, -3)
      }
      cleanContent = cleanContent.trim()

      const result = JSON.parse(cleanContent)
      
      return NextResponse.json(result)
    } catch (parseError) {
      console.error('Parse error:', parseError)
      console.error('Content:', content)
      
      // Si le parsing échoue, essayer d'extraire les tâches manuellement
      return NextResponse.json({
        success: false,
        error: 'Impossible d\'analyser la réponse de l\'IA',
        rawContent: content
      })
    }

  } catch (error) {
    console.error('PDF analysis error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur lors de l\'analyse du PDF'
      },
      { status: 500 }
    )
  }
}
