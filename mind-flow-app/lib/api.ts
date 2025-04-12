import {
  Brain,
  Moon,
  Video,
  Heart,
  Lightbulb,
  FileText,
  BookOpen,
  Dumbbell,
  Clock,
  Zap,
  Briefcase,
  Palette,
  Code,
  Globe,
} from "lucide-react"
import React from "react"

// This would be replaced with an actual API call to OpenAI in a production environment
export async function analyzeText(text: string) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1500))

  // Extract keywords from text to simulate AI analysis
  const keywords = extractKeywords(text.toLowerCase())

  // Generate hierarchical categorization based on actual text content
  const categorization = generateHierarchicalCategorization(text, keywords)

  // Generate results based on categorization
  const results = categorization.map((category) => {
    return {
      id: category.id,
      title: category.path.join(" > "),
      summary: category.summary,
      icon: category.icon,
      todos: category.todos,
      path: category.path, // Add full path for hierarchical display
    }
  })

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

// Generate hierarchical categorization
function generateHierarchicalCategorization(text, keywords) {
  const lowercaseText = text.toLowerCase()
  const categories = []

  // Health and Fitness
  if (containsAny(lowercaseText, ["health", "exercise", "fitness", "workout", "gym", "run", "weight"])) {
    if (containsAny(lowercaseText, ["sleep", "tired", "insomnia", "rest", "bed", "night"])) {
      if (containsAny(lowercaseText, ["schedule", "routine", "cycle", "pattern"])) {
        categories.push({
          id: "health-sleep-routine",
          path: ["Health", "Sleep", "Routine", "Optimization"],
          summary: "Your notes discuss sleep routine optimization for better health.",
          icon: React.createElement(Moon, { className: "h-5 w-5 text-blue-400", style: { strokeWidth: 1.5 } }),
          todos: ["Create a consistent sleep schedule", "Develop a bedtime routine", "Track sleep quality for a week"],
        })
      } else if (containsAny(lowercaseText, ["problem", "issue", "trouble", "can't sleep"])) {
        categories.push({
          id: "health-sleep-disorders",
          path: ["Health", "Sleep", "Disorders", "Management"],
          summary: "Your notes mention sleep problems and potential management approaches.",
          icon: React.createElement(Moon, { className: "h-5 w-5 text-blue-400", style: { strokeWidth: 1.5 } }),
          todos: [
            "Research sleep disorder symptoms",
            "Consider consulting a sleep specialist",
            "Try relaxation techniques before bed",
          ],
        })
      } else {
        categories.push({
          id: "health-sleep-general",
          path: ["Health", "Sleep", "Quality", "Improvement"],
          summary: "Your notes focus on sleep quality and its importance for overall health.",
          icon: React.createElement(Moon, { className: "h-5 w-5 text-blue-400", style: { strokeWidth: 1.5 } }),
          todos: [
            "Limit screen time before bed",
            "Create an optimal sleep environment",
            "Consider sleep-supporting supplements",
          ],
        })
      }
    }

    if (containsAny(lowercaseText, ["workout", "exercise", "gym", "training", "lift"])) {
      if (containsAny(lowercaseText, ["start", "begin", "new", "routine", "plan"])) {
        categories.push({
          id: "health-exercise-starting",
          path: ["Health", "Exercise", "Beginners", "Program Development"],
          summary: "Your notes discuss starting a new exercise program or routine.",
          icon: React.createElement(Dumbbell, { className: "h-5 w-5 text-green-500", style: { strokeWidth: 1.5 } }),
          todos: [
            "Research beginner workout routines",
            "Set realistic fitness goals",
            "Create a weekly exercise schedule",
          ],
        })
      } else if (containsAny(lowercaseText, ["motivation", "lazy", "procrastinate", "putting off", "avoid"])) {
        categories.push({
          id: "health-exercise-motivation",
          path: ["Health", "Exercise", "Motivation", "Consistency"],
          summary: "Your notes mention challenges with exercise motivation and consistency.",
          icon: React.createElement(Dumbbell, { className: "h-5 w-5 text-green-500", style: { strokeWidth: 1.5 } }),
          todos: [
            "Find an accountability partner",
            "Set small, achievable fitness goals",
            "Create rewards for exercise consistency",
          ],
        })
      } else {
        categories.push({
          id: "health-exercise-improvement",
          path: ["Health", "Exercise", "Performance", "Optimization"],
          summary: "Your notes focus on improving exercise performance and results.",
          icon: React.createElement(Dumbbell, { className: "h-5 w-5 text-green-500", style: { strokeWidth: 1.5 } }),
          todos: [
            "Research advanced training techniques",
            "Consider hiring a personal trainer",
            "Track workout progress systematically",
          ],
        })
      }
    }

    if (containsAny(lowercaseText, ["diet", "nutrition", "eat", "food", "meal"])) {
      categories.push({
        id: "health-nutrition",
        path: ["Health", "Nutrition", "Diet", "Planning"],
        summary: "Your notes discuss nutrition and dietary considerations.",
        icon: React.createElement(Heart, { className: "h-5 w-5 text-red-400", style: { strokeWidth: 1.5 } }),
        todos: [
          "Plan balanced weekly meals",
          "Research nutritional requirements",
          "Consider consulting a nutritionist",
        ],
      })
    }

    // Only add general health if no specific health categories were added
    if (categories.length === 0 || !categories.some((cat) => cat.id.startsWith("health-"))) {
      categories.push({
        id: "health-general-wellness",
        path: ["Health", "General Wellness", "Lifestyle", "Improvement"],
        summary: "Your notes focus on overall health and wellness improvement.",
        icon: React.createElement(Heart, { className: "h-5 w-5 text-red-400", style: { strokeWidth: 1.5 } }),
        todos: [
          "Schedule a health check-up",
          "Develop a holistic wellness plan",
          "Research preventative health measures",
        ],
      })
    }
  }

  // Productivity and Personal Development
  if (
    containsAny(lowercaseText, [
      "productivity",
      "focus",
      "work",
      "task",
      "project",
      "deadline",
      "goal",
      "time management",
    ])
  ) {
    if (containsAny(lowercaseText, ["procrastinate", "delay", "putting off", "avoid", "later"])) {
      categories.push({
        id: "productivity-procrastination",
        path: ["Personal Development", "Productivity", "Procrastination", "Overcoming"],
        summary: "Your notes discuss challenges with procrastination and strategies to overcome it.",
        icon: React.createElement(Clock, { className: "h-5 w-5 text-orange-400", style: { strokeWidth: 1.5 } }),
        todos: [
          "Try the Pomodoro technique",
          "Break large tasks into smaller steps",
          "Identify and address procrastination triggers",
        ],
      })
    } else if (containsAny(lowercaseText, ["focus", "concentrate", "distraction", "attention"])) {
      categories.push({
        id: "productivity-focus",
        path: ["Personal Development", "Productivity", "Focus", "Enhancement"],
        summary: "Your notes mention challenges with maintaining focus and concentration.",
        icon: React.createElement(Zap, { className: "h-5 w-5 text-yellow-400", style: { strokeWidth: 1.5 } }),
        todos: [
          "Create a distraction-free workspace",
          "Try focus-enhancing techniques",
          "Consider digital detox periods",
        ],
      })
    } else if (containsAny(lowercaseText, ["organize", "system", "method", "process", "workflow"])) {
      categories.push({
        id: "productivity-systems",
        path: ["Personal Development", "Productivity", "Systems", "Implementation"],
        summary: "Your notes focus on developing productivity systems and workflows.",
        icon: React.createElement(Brain, { className: "h-5 w-5 text-purple-400", style: { strokeWidth: 1.5 } }),
        todos: [
          "Research productivity methodologies",
          "Test different organizational systems",
          "Develop personalized workflow processes",
        ],
      })
    } else {
      categories.push({
        id: "productivity-general",
        path: ["Personal Development", "Productivity", "Efficiency", "Optimization"],
        summary: "Your notes discuss general productivity improvement strategies.",
        icon: React.createElement(Brain, { className: "h-5 w-5 text-purple-400", style: { strokeWidth: 1.5 } }),
        todos: [
          "Audit current productivity levels",
          "Set specific productivity goals",
          "Implement regular productivity reviews",
        ],
      })
    }
  }

  // Creative Skills
  if (
    containsAny(lowercaseText, [
      "creative",
      "create",
      "art",
      "design",
      "write",
      "music",
      "video",
      "edit",
      "film",
      "photo",
    ])
  ) {
    if (containsAny(lowercaseText, ["video", "film", "edit", "footage", "movie"])) {
      if (containsAny(lowercaseText, ["start", "begin", "learn", "new", "how to"])) {
        categories.push({
          id: "creative-video-beginner",
          path: ["Creative Skills", "Digital Media", "Video Editing", "Beginners"],
          summary: "Your notes discuss getting started with video editing as a beginner.",
          icon: React.createElement(Video, { className: "h-5 w-5 text-blue-500", style: { strokeWidth: 1.5 } }),
          todos: [
            "Research beginner-friendly video editing software",
            "Take an introductory video editing course",
            "Practice with simple editing projects",
          ],
        })
      } else if (containsAny(lowercaseText, ["technique", "skill", "effect", "transition", "color"])) {
        categories.push({
          id: "creative-video-techniques",
          path: ["Creative Skills", "Digital Media", "Video Editing", "Advanced Techniques"],
          summary: "Your notes focus on specific video editing techniques and skills.",
          icon: React.createElement(Video, { className: "h-5 w-5 text-blue-500", style: { strokeWidth: 1.5 } }),
          todos: [
            "Study advanced editing transitions",
            "Learn color grading techniques",
            "Practice special effects implementation",
          ],
        })
      } else if (containsAny(lowercaseText, ["workflow", "process", "efficient", "organize"])) {
        categories.push({
          id: "creative-video-workflow",
          path: ["Creative Skills", "Digital Media", "Video Editing", "Workflow Optimization"],
          summary: "Your notes discuss optimizing video editing workflow and processes.",
          icon: React.createElement(Video, { className: "h-5 w-5 text-blue-500", style: { strokeWidth: 1.5 } }),
          todos: [
            "Develop a standardized editing workflow",
            "Create project templates and presets",
            "Research file management best practices",
          ],
        })
      } else {
        categories.push({
          id: "creative-video-general",
          path: ["Creative Skills", "Digital Media", "Video Editing", "General"],
          summary: "Your notes contain general thoughts about video editing.",
          icon: React.createElement(Video, { className: "h-5 w-5 text-blue-500", style: { strokeWidth: 1.5 } }),
          todos: [
            "Define specific video editing goals",
            "Research current video editing trends",
            "Explore different video editing styles",
          ],
        })
      }
    }

    if (containsAny(lowercaseText, ["write", "writing", "blog", "book", "story", "content"])) {
      categories.push({
        id: "creative-writing",
        path: ["Creative Skills", "Writing", "Content Creation", "Development"],
        summary: "Your notes discuss writing and content creation.",
        icon: React.createElement(FileText, { className: "h-5 w-5 text-gray-500", style: { strokeWidth: 1.5 } }),
        todos: ["Establish a regular writing routine", "Research writing techniques", "Create an editorial calendar"],
      })
    }

    if (containsAny(lowercaseText, ["design", "graphic", "visual", "ui", "ux", "interface"])) {
      categories.push({
        id: "creative-design",
        path: ["Creative Skills", "Visual Arts", "Design", "Principles"],
        summary: "Your notes focus on design and visual arts.",
        icon: React.createElement(Palette, { className: "h-5 w-5 text-pink-400", style: { strokeWidth: 1.5 } }),
        todos: ["Study fundamental design principles", "Practice with design software", "Create a design portfolio"],
      })
    }

    // Only add general creative if no specific creative categories were added
    if (!categories.some((cat) => cat.id.startsWith("creative-"))) {
      categories.push({
        id: "creative-general",
        path: ["Creative Skills", "Artistic Expression", "Creativity", "Development"],
        summary: "Your notes discuss general creative development and artistic expression.",
        icon: React.createElement(Lightbulb, { className: "h-5 w-5 text-yellow-400", style: { strokeWidth: 1.5 } }),
        todos: [
          "Explore different creative mediums",
          "Establish a creative practice routine",
          "Find inspiration sources",
        ],
      })
    }
  }

  // Learning and Education
  if (containsAny(lowercaseText, ["learn", "study", "course", "book", "read", "knowledge", "skill", "education"])) {
    if (
      containsAny(lowercaseText, [
        "language",
        "speak",
        "foreign",
        "english",
        "spanish",
        "korean",
        "japanese",
        "chinese",
        "french",
        "german",
      ])
    ) {
      categories.push({
        id: "learning-languages",
        path: ["Education", "Language Learning", "Acquisition", "Methods"],
        summary: "Your notes discuss language learning approaches and methods.",
        icon: React.createElement(Globe, { className: "h-5 w-5 text-blue-400", style: { strokeWidth: 1.5 } }),
        todos: [
          "Establish daily language practice",
          "Find language exchange partners",
          "Use spaced repetition for vocabulary",
        ],
      })
    }

    if (containsAny(lowercaseText, ["programming", "code", "software", "development", "app", "web"])) {
      categories.push({
        id: "learning-programming",
        path: ["Education", "Technology", "Programming", "Skill Development"],
        summary: "Your notes focus on learning programming and software development.",
        icon: React.createElement(Code, { className: "h-5 w-5 text-green-400", style: { strokeWidth: 1.5 } }),
        todos: ["Complete coding tutorials", "Build practice projects", "Join programming communities"],
      })
    }

    if (containsAny(lowercaseText, ["academic", "school", "university", "college", "degree", "class"])) {
      categories.push({
        id: "learning-academic",
        path: ["Education", "Academic", "Formal Learning", "Strategy"],
        summary: "Your notes discuss formal academic learning and education.",
        icon: React.createElement(BookOpen, { className: "h-5 w-5 text-orange-400", style: { strokeWidth: 1.5 } }),
        todos: ["Create a study schedule", "Research effective note-taking methods", "Form or join study groups"],
      })
    }

    // Only add general learning if no specific learning categories were added
    if (!categories.some((cat) => cat.id.startsWith("learning-"))) {
      categories.push({
        id: "learning-general",
        path: ["Education", "Lifelong Learning", "Knowledge", "Acquisition"],
        summary: "Your notes focus on general learning and knowledge acquisition.",
        icon: React.createElement(BookOpen, { className: "h-5 w-5 text-orange-400", style: { strokeWidth: 1.5 } }),
        todos: [
          "Identify key learning objectives",
          "Research learning methodologies",
          "Create a personal learning plan",
        ],
      })
    }
  }

  // Business and Career
  if (
    containsAny(lowercaseText, [
      "business",
      "career",
      "job",
      "work",
      "professional",
      "startup",
      "company",
      "entrepreneur",
    ])
  ) {
    if (containsAny(lowercaseText, ["startup", "business", "company", "launch", "entrepreneur"])) {
      categories.push({
        id: "business-startup",
        path: ["Business", "Entrepreneurship", "Startup", "Development"],
        summary: "Your notes discuss startup development and entrepreneurship.",
        icon: React.createElement(Briefcase, { className: "h-5 w-5 text-blue-500", style: { strokeWidth: 1.5 } }),
        todos: ["Develop a business plan", "Research market opportunities", "Network with other entrepreneurs"],
      })
    }

    if (containsAny(lowercaseText, ["career", "job", "profession", "work", "employment"])) {
      categories.push({
        id: "business-career",
        path: ["Professional", "Career Development", "Growth", "Strategy"],
        summary: "Your notes focus on career development and professional growth.",
        icon: React.createElement(Briefcase, { className: "h-5 w-5 text-blue-500", style: { strokeWidth: 1.5 } }),
        todos: [
          "Update resume and professional profiles",
          "Set specific career goals",
          "Research skill development opportunities",
        ],
      })
    }

    // Only add general business if no specific business categories were added
    if (!categories.some((cat) => cat.id.startsWith("business-"))) {
      categories.push({
        id: "business-general",
        path: ["Business", "Professional Development", "Strategy", "Implementation"],
        summary: "Your notes discuss general business and professional development topics.",
        icon: React.createElement(Briefcase, { className: "h-5 w-5 text-blue-500", style: { strokeWidth: 1.5 } }),
        todos: ["Identify key business objectives", "Research industry trends", "Develop professional skills"],
      })
    }
  }

  // If no categories matched, provide a more specific categorization based on text analysis
  if (categories.length === 0) {
    // Try to extract meaningful topics from the text
    const potentialTopics = extractPotentialTopics(text)

    if (potentialTopics.length > 0) {
      const mainTopic = potentialTopics[0]
      categories.push({
        id: `specific-${mainTopic.replace(/\s+/g, "-").toLowerCase()}`,
        path: ["Specific Topics", capitalizeFirstLetter(mainTopic), "Analysis", "Development"],
        summary: `Your notes focus on ${mainTopic} and related considerations.`,
        icon: React.createElement(FileText, { className: "h-5 w-5 text-gray-500", style: { strokeWidth: 1.5 } }),
        todos: [
          `Research more about ${mainTopic}`,
          "Develop specific goals related to this topic",
          "Find resources for further learning",
        ],
      })
    } else {
      // Last resort - create a thoughtful categorization
      categories.push({
        id: "thoughtful-reflection",
        path: ["Reflective Thinking", "Personal Insights", "Thought Development", "Analysis"],
        summary: "Your notes contain thoughtful reflections and personal insights.",
        icon: React.createElement(Brain, { className: "h-5 w-5 text-purple-400", style: { strokeWidth: 1.5 } }),
        todos: [
          "Expand on these initial thoughts",
          "Consider journaling regularly",
          "Research topics of interest more deeply",
        ],
      })
    }
  }

  return categories
}

// Helper function to check if text contains any of the keywords
function containsAny(text, keywords) {
  return keywords.some((keyword) => text.includes(keyword))
}

// Helper function to extract potential topics from text
function extractPotentialTopics(text) {
  // This is a simplified implementation - in production, this would use NLP
  const lowercaseText = text.toLowerCase()
  const potentialTopics = []

  // Define topic indicators and their associated topics
  const topicIndicators = {
    relationship: ["relationship", "partner", "marriage", "dating", "love", "romantic"],
    travel: ["travel", "trip", "vacation", "journey", "destination", "tourism"],
    finance: ["money", "finance", "budget", "invest", "saving", "expense"],
    technology: ["tech", "technology", "device", "gadget", "digital", "computer"],
    cooking: ["cook", "recipe", "food", "meal", "kitchen", "ingredient"],
    mindfulness: ["mindful", "meditate", "meditation", "calm", "peace", "present"],
    "home improvement": ["home", "house", "renovation", "decor", "furniture", "interior"],
    parenting: ["parent", "child", "kid", "baby", "family", "raising"],
    hobby: ["hobby", "interest", "pastime", "leisure", "collection", "craft"],
    social: ["social", "friend", "community", "network", "gathering", "connection"],
  }

  // Check for each topic
  for (const [topic, indicators] of Object.entries(topicIndicators)) {
    if (containsAny(lowercaseText, indicators)) {
      potentialTopics.push(topic)
    }
  }

  return potentialTopics
}

// Helper function to capitalize first letter
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

// New function to refine text and generate tags
export async function refineTextAndGenerateTags(text: string) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Simulate AI refinement of text
  const refinedText = simulateTextRefinement(text)

  // Generate tags based on the text
  const tags = generateTags(text)

  // Generate hierarchical categorization
  const keywords = extractKeywords(text.toLowerCase())
  const categorization = generateHierarchicalCategorization(text, keywords)

  // Extract paths for taxonomy
  const taxonomyPaths = categorization.map((category) => category.path)

  return {
    originalText: text,
    refinedText,
    tags,
    taxonomyPaths,
  }
}

// Simulate text refinement (would be replaced with OpenAI API call)
function simulateTextRefinement(text: string) {
  // This is a simple simulation - in production, this would be an AI model

  // Add periods to sentences that don't have them
  let refined = text.replace(/([a-z])\s+([A-Z])/g, "$1. $2")

  // Ensure the text ends with a period if it doesn't already
  if (!/[.!?]$/.test(refined)) {
    refined += "."
  }

  // Fix common issues
  refined = refined
    .replace(/\s+/g, " ") // Remove extra spaces
    .replace(/\s+([.,!?])/g, "$1") // Remove spaces before punctuation
    .replace(/([.,!?])([a-zA-Z])/g, "$1 $2") // Add space after punctuation

  return refined
}

// Generate tags from text
function generateTags(text: string) {
  const lowercaseText = text.toLowerCase()

  // Define potential tags and their related keywords
  const tagKeywords = {
    health: ["health", "exercise", "fitness", "diet", "nutrition", "workout", "gym"],
    sleep: ["sleep", "rest", "tired", "insomnia", "nap", "dream", "bed", "night"],
    productivity: ["productivity", "focus", "work", "task", "project", "deadline", "goal"],
    "video editing": ["video", "edit", "editing", "film", "movie", "footage", "camera"],
    learning: ["learn", "study", "book", "read", "course", "skill", "knowledge"],
    startup: ["startup", "business", "company", "entrepreneur", "launch", "product"],
    fatigue: ["fatigue", "tired", "exhausted", "energy", "burnout", "stress"],
    motivation: ["motivation", "inspired", "drive", "passion", "excited", "enthusiasm"],
    technology: ["tech", "technology", "computer", "software", "digital", "online"],
    creativity: ["creative", "idea", "design", "art", "write", "draw", "paint", "music"],
    procrastination: ["procrastinate", "delay", "putting off", "avoid", "later"],
    "time management": ["time", "schedule", "calendar", "organize", "planning", "efficiency"],
    career: ["career", "job", "work", "professional", "employment", "office"],
    mindfulness: ["mindful", "meditate", "present", "awareness", "calm", "peace"],
    relationships: ["relationship", "friend", "partner", "family", "social", "connection"],
    finance: ["money", "finance", "budget", "invest", "saving", "expense"],
    cooking: ["cook", "recipe", "food", "meal", "kitchen", "ingredient"],
    travel: ["travel", "trip", "vacation", "journey", "destination", "tourism"],
    writing: ["write", "writing", "blog", "book", "story", "content"],
    programming: ["code", "programming", "developer", "software", "app", "web"],
  }

  // Score each tag based on keyword matches
  const tagScores = {}

  for (const [tag, keywords] of Object.entries(tagKeywords)) {
    let score = 0
    for (const keyword of keywords) {
      if (lowercaseText.includes(keyword)) {
        score += 1
      }
    }
    if (score > 0) {
      tagScores[tag] = score
    }
  }

  // Get top 3-5 tags
  const sortedTags = Object.entries(tagScores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, Math.min(5, Object.keys(tagScores).length))
    .map(([tag]) => tag)

  // If we have fewer than 3 tags, try to extract more specific ones from the text
  if (sortedTags.length < 3) {
    const potentialTopics = extractPotentialTopics(text)
    for (const topic of potentialTopics) {
      if (!sortedTags.includes(topic) && sortedTags.length < 5) {
        sortedTags.push(topic)
      }
    }
  }

  // If still fewer than 3 tags, add some based on text analysis
  if (sortedTags.length < 3) {
    const textLength = text.length
    if (textLength < 100) {
      if (!sortedTags.includes("notes")) sortedTags.push("notes")
    } else if (textLength < 300) {
      if (!sortedTags.includes("thoughts")) sortedTags.push("thoughts")
    } else {
      if (!sortedTags.includes("reflection")) sortedTags.push("reflection")
    }
  }

  return sortedTags
}
