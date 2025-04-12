import { Brain, Moon, Video, Heart, Lightbulb, CheckSquare, FileText } from "lucide-react"
import React from "react"

// This would be replaced with an actual API call to OpenAI in a production environment
export async function analyzeText(text: string) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1500))

  // Extract keywords from text to simulate AI analysis
  const keywords = extractKeywords(text.toLowerCase())

  // Define possible categories and their related keywords
  const categoryKeywords = {
    health: ["health", "exercise", "fitness", "diet", "nutrition", "workout", "gym", "run", "sleep", "rest"],
    sleep: ["sleep", "rest", "tired", "insomnia", "nap", "dream", "bed", "night"],
    productivity: ["productivity", "focus", "work", "task", "project", "deadline", "goal", "achieve"],
    creativity: ["creative", "idea", "design", "art", "write", "draw", "paint", "music", "video", "edit"],
    learning: ["learn", "study", "book", "read", "course", "skill", "knowledge", "education"],
  }

  // Match keywords to categories
  const matchedCategories = {}
  for (const [category, relatedKeywords] of Object.entries(categoryKeywords)) {
    const matches = relatedKeywords.filter((keyword) => keywords.includes(keyword))
    if (matches.length > 0) {
      matchedCategories[category] = matches.length
    }
  }

  // Get top categories (up to 3)
  const topCategories = Object.entries(matchedCategories)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([category]) => category)

  // Generate results based on matched categories
  const results = []

  if (topCategories.includes("health") && topCategories.includes("sleep")) {
    results.push({
      id: "health-sleep",
      title: "Health > Sleep",
      summary: "Your notes mention sleep patterns and their impact on overall health and wellbeing.",
      icon: React.createElement(Moon, { className: "h-5 w-5 text-blue-400", style: { strokeWidth: 1.5 } }),
      todos: [
        "Track sleep for the next week",
        "Research sleep optimization techniques",
        "Set up a consistent sleep schedule",
      ],
    })
  } else if (topCategories.includes("health")) {
    results.push({
      id: "health-general",
      title: "Health > General",
      summary: "You mentioned aspects of physical wellbeing and health maintenance.",
      icon: React.createElement(Heart, { className: "h-5 w-5 text-red-400", style: { strokeWidth: 1.5 } }),
      todos: ["Schedule a health check-up", "Plan a weekly exercise routine", "Research nutrition improvements"],
    })
  } else if (topCategories.includes("sleep")) {
    results.push({
      id: "wellness-sleep",
      title: "Wellness > Sleep",
      summary: "Your writing focuses on sleep quality and rest patterns.",
      icon: React.createElement(Moon, { className: "h-5 w-5 text-blue-400", style: { strokeWidth: 1.5 } }),
      todos: ["Create a bedtime routine", "Limit screen time before bed", "Try meditation for better sleep"],
    })
  }

  if (topCategories.includes("productivity")) {
    results.push({
      id: "self-dev-focus",
      title: "Self-Development > Focus",
      summary: "You wrote about techniques to improve concentration and productivity.",
      icon: React.createElement(Brain, { className: "h-5 w-5 text-sage-400", style: { strokeWidth: 1.5 } }),
      todos: [
        "Try the Pomodoro technique",
        "Create a distraction-free workspace",
        "Set specific goals for each work session",
      ],
    })
  }

  if (topCategories.includes("creativity") && text.toLowerCase().includes("video")) {
    results.push({
      id: "creative-video",
      title: "Creative > Video Editing",
      summary: "There are mentions of video projects and editing techniques to try.",
      icon: React.createElement(Video, { className: "h-5 w-5 text-purple-300", style: { strokeWidth: 1.5 } }),
      todos: [
        "Research video editing software options",
        "Create a content calendar for videos",
        "Learn basic color grading techniques",
      ],
    })
  } else if (topCategories.includes("creativity")) {
    results.push({
      id: "creative-ideas",
      title: "Creative > Ideas",
      summary: "Your notes contain creative concepts and inspiration for projects.",
      icon: React.createElement(Lightbulb, { className: "h-5 w-5 text-yellow-400", style: { strokeWidth: 1.5 } }),
      todos: ["Start an idea journal", "Schedule time for creative exploration", "Research inspiration sources"],
    })
  }

  if (topCategories.includes("learning")) {
    results.push({
      id: "education-learning",
      title: "Education > Learning",
      summary: "You expressed interest in acquiring new knowledge and skills.",
      icon: React.createElement(CheckSquare, { className: "h-5 w-5 text-green-400", style: { strokeWidth: 1.5 } }),
      todos: ["Create a learning plan", "Find courses on topics of interest", "Set aside dedicated study time"],
    })
  }

  // If no categories matched, provide a default response
  if (results.length === 0) {
    results.push({
      id: "general-notes",
      title: "General > Notes",
      summary: "Your writing covers general topics. Add more specific details for better categorization.",
      icon: React.createElement(FileText, { className: "h-5 w-5 text-gray-400", style: { strokeWidth: 1.5 } }),
      todos: [
        "Add more details to your notes",
        "Focus on specific topics or goals",
        "Consider using more descriptive language",
      ],
    })
  }

  return results
}

// Helper function to extract keywords from text
function extractKeywords(text: string) {
  // Remove punctuation and split into words
  const words = text.replace(/[^\w\s]/g, "").split(/\s+/)

  // Filter out common words and short words
  const stopWords = ["the", "and", "a", "an", "in", "on", "at", "to", "for", "of", "with", "is", "are", "was", "were"]
  return words.filter((word) => word.length > 2 && !stopWords.includes(word))
}
