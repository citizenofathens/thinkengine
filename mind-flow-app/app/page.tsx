"use client"

import { useState, useEffect } from "react"
import { Plus, FileText, CheckSquare, X, Loader2, Sparkles, Edit, Trash2, ArrowLeft, Network, Hash } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { analyzeText, refineTextAndGenerateTags } from "@/lib/api"
import { saveToLocalStorage, loadFromLocalStorage } from "@/lib/storage"
import { KnowledgeGraph } from "@/components/knowledge-graph"

// Types
interface Category {
  id: number | string
  name: string
  isNew: boolean
}

interface Document {
  id: string
  title: string
  content: string
  refinedContent?: string
  originalContent?: string
  categoryId: string | number
  categoryName: string
  categories?: Array<{ id: string; title: string; path: string[] }>
  tags: string[]
  taxonomyPaths?: string[][]
  createdAt: string
  updatedAt: string
}

interface Task {
  id: string
  title: string
  completed: boolean
  categoryId: string | number
  categoryName: string
  createdAt: string
}

export default function FreeWritingApp() {
  // State for writing and analysis
  const [text, setText] = useState("")
  const [documentTitle, setDocumentTitle] = useState("")
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isRefining, setIsRefining] = useState(false)

  // State for categories, documents and tasks
  const [categories, setCategories] = useState<Category[]>([])
  const [documents, setDocuments] = useState<Document[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [aiCategories, setAiCategories] = useState([])
  const [refinedText, setRefinedText] = useState("")
  const [generatedTags, setGeneratedTags] = useState<string[]>([])
  const [editableTags, setEditableTags] = useState<string[]>([])

  // State for UI views
  const [activeView, setActiveView] = useState<"write" | "documents" | "tasks" | "graph">("write")
  const [selectedCategory, setSelectedCategory] = useState<string | number | null>(null)
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([])
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([])

  // Dialog states
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false)
  const [isTagDialogOpen, setIsTagDialogOpen] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState("")
  const [newTag, setNewTag] = useState("")
  const [currentTaskCategory, setCurrentTaskCategory] = useState<{ id: string | number; name: string } | null>(null)

  // Document editing state
  const [isEditing, setIsEditing] = useState(false)
  const [currentDocument, setCurrentDocument] = useState<Document | null>(null)

  // Load data from local storage on initial render
  useEffect(() => {
    const savedCategories = loadFromLocalStorage("categories") || []
    const savedDocuments = loadFromLocalStorage("documents") || []
    const savedTasks = loadFromLocalStorage("tasks") || []

    setCategories(savedCategories)
    setDocuments(savedDocuments)
    setTasks(savedTasks)
  }, [])

  // Update filtered documents and tasks when selected category or tag changes
  useEffect(() => {
    if (selectedCategory) {
      // Filter documents that have this category either as main category or in their categories array
      setFilteredDocuments(
        documents.filter(
          (doc) =>
            doc.categoryId === selectedCategory ||
            (doc.categories && doc.categories.some((cat) => cat.id === selectedCategory)),
        ),
      )
      setFilteredTasks(tasks.filter((task) => task.categoryId === selectedCategory))
      setSelectedTag(null)
    } else if (selectedTag) {
      setFilteredDocuments(documents.filter((doc) => doc.tags.includes(selectedTag)))
      setFilteredTasks([]) // Tags don't apply to tasks in this implementation
    } else {
      setFilteredDocuments(documents)
      setFilteredTasks(tasks)
    }
  }, [selectedCategory, selectedTag, documents, tasks])

  // Function to handle organizing with AI
  const handleOrganizeWithAI = async () => {
    if (!text.trim()) {
      alert("Please write something first before organizing.")
      return
    }

    setIsAnalyzing(true)
    setIsPanelOpen(true)

    try {
      // First, refine the text and generate tags
      setIsRefining(true)
      const refinementResult = await refineTextAndGenerateTags(text)
      setRefinedText(refinementResult.refinedText)
      setGeneratedTags(refinementResult.tags)
      setEditableTags([...refinementResult.tags])
      setIsRefining(false)

      // Then call the API to analyze the text for categories
      const results = await analyzeText(text)

      // Update AI categories with the results
      setAiCategories(results)

      // Add new categories to the sidebar
      const newCategories = results.map((result) => ({
        id: result.id,
        name: result.title,
        isNew: true,
      }))

      // Update categories, avoiding duplicates
      setCategories((prevCategories) => {
        const existingIds = prevCategories.map((c) => c.id)
        const filteredNewCategories = newCategories.filter((c) => !existingIds.includes(c.id))
        const updatedCategories = [...filteredNewCategories, ...prevCategories]

        // Save to local storage
        saveToLocalStorage("categories", updatedCategories)

        return updatedCategories
      })
    } catch (error) {
      console.error("Error analyzing text:", error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Function to save the current document
  const saveDocument = (categoryId: string | number, categoryName: string) => {
    if (!text.trim()) return

    const now = new Date().toISOString()
    const title = documentTitle || `Thought from ${new Date().toLocaleDateString()}`

    // If editing an existing document
    if (isEditing && currentDocument) {
      const updatedDocument = {
        ...currentDocument,
        title,
        content: text,
        refinedContent: refinedText || text,
        originalContent: currentDocument.originalContent || text,
        categoryId,
        categoryName,
        categories: aiCategories.map((cat) => ({
          id: cat.id,
          title: cat.title,
          path: cat.path || [],
        })),
        tags: editableTags,
        updatedAt: now,
      }

      setDocuments((prevDocuments) => {
        const updatedDocuments = prevDocuments.map((doc) => (doc.id === currentDocument.id ? updatedDocument : doc))
        saveToLocalStorage("documents", updatedDocuments)
        return updatedDocuments
      })
    }
    // Creating a new document
    else {
      const newDocument: Document = {
        id: `doc_${Date.now()}`,
        title,
        content: text,
        refinedContent: refinedText || text,
        originalContent: text,
        categoryId,
        categoryName,
        categories: aiCategories.map((cat) => ({
          id: cat.id,
          title: cat.title,
          path: cat.path || [],
        })),
        tags: editableTags,
        createdAt: now,
        updatedAt: now,
      }

      setDocuments((prevDocuments) => {
        const updatedDocuments = [newDocument, ...prevDocuments]
        saveToLocalStorage("documents", updatedDocuments)
        return updatedDocuments
      })
    }

    // Reset editing state
    setIsPanelOpen(false)
    setIsEditing(false)
    setCurrentDocument(null)
    setText("")
    setRefinedText("")
    setDocumentTitle("")
    setGeneratedTags([])
    setEditableTags([])
  }

  // Function to create a new task
  const createTask = (categoryId: string | number, categoryName: string, taskTitle: string) => {
    if (!taskTitle.trim()) return

    const newTask: Task = {
      id: `task_${Date.now()}`,
      title: taskTitle,
      completed: false,
      categoryId,
      categoryName,
      createdAt: new Date().toISOString(),
    }

    setTasks((prevTasks) => {
      const updatedTasks = [newTask, ...prevTasks]
      saveToLocalStorage("tasks", updatedTasks)
      return updatedTasks
    })

    setNewTaskTitle("")
    setIsTaskDialogOpen(false)
  }

  // Function to toggle task completion
  const toggleTaskCompletion = (taskId: string) => {
    setTasks((prevTasks) => {
      const updatedTasks = prevTasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task,
      )
      saveToLocalStorage("tasks", updatedTasks)
      return updatedTasks
    })
  }

  // Function to delete a task
  const deleteTask = (taskId: string) => {
    setTasks((prevTasks) => {
      const updatedTasks = prevTasks.filter((task) => task.id !== taskId)
      saveToLocalStorage("tasks", updatedTasks)
      return updatedTasks
    })
  }

  // Function to delete a document
  const deleteDocument = (documentId: string) => {
    setDocuments((prevDocuments) => {
      const updatedDocuments = prevDocuments.filter((doc) => doc.id !== documentId)
      saveToLocalStorage("documents", updatedDocuments)
      return updatedDocuments
    })
  }

  // Function to edit a document
  const editDocument = (document: Document) => {
    setDocumentTitle(document.title)
    setText(document.content)
    setRefinedText(document.refinedContent || document.content)
    setEditableTags(document.tags || [])
    setCurrentDocument(document)
    setIsEditing(true)
    setActiveView("write")
  }

  // Function to start a new document
  const startNewDocument = () => {
    setDocumentTitle("")
    setText("")
    setRefinedText("")
    setGeneratedTags([])
    setEditableTags([])
    setCurrentDocument(null)
    setIsEditing(false)
    setActiveView("write")
  }

  // Function to open task creation dialog
  const openTaskDialog = (categoryId: string | number, categoryName: string) => {
    setCurrentTaskCategory({ id: categoryId, name: categoryName })
    setIsTaskDialogOpen(true)
  }

  // Function to add a new tag
  const addTag = (tag: string) => {
    if (!tag.trim() || editableTags.includes(tag.trim())) return
    setEditableTags([...editableTags, tag.trim()])
    setNewTag("")
    setIsTagDialogOpen(false)
  }

  // Function to remove a tag
  const removeTag = (tag: string) => {
    setEditableTags(editableTags.filter((t) => t !== tag))
  }

  // Function to handle knowledge graph node click
  const handleGraphNodeClick = (nodeId: string, nodeType: "document" | "tag") => {
    if (nodeType === "document") {
      const document = documents.find((doc) => doc.id === nodeId)
      if (document) {
        editDocument(document)
      }
    } else if (nodeType === "tag") {
      const tagName = nodeId.replace("tag-", "").replace(/-/g, " ")
      setSelectedTag(tagName)
      setSelectedCategory(null)
      setActiveView("documents")
    }
  }

  return (
    <div className="flex h-screen bg-neutral-50">
      {/* Sidebar */}
      <div className="w-64 border-r border-neutral-200 bg-white p-4 hidden md:block">
        <div className="mb-6">
          <h2 className="text-lg font-medium text-neutral-800 mb-3">Navigation</h2>
          <div className="flex gap-2 mb-4">
            <Button
              variant={activeView === "write" ? "default" : "outline"}
              size="sm"
              className="flex-1"
              onClick={() => setActiveView("write")}
            >
              Write
            </Button>
            <Button
              variant={activeView === "documents" ? "default" : "outline"}
              size="sm"
              className="flex-1"
              onClick={() => {
                setActiveView("documents")
                setSelectedCategory(null)
                setSelectedTag(null)
              }}
            >
              Docs
            </Button>
            <Button
              variant={activeView === "graph" ? "default" : "outline"}
              size="sm"
              className="flex-1"
              onClick={() => setActiveView("graph")}
            >
              Graph
            </Button>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start text-neutral-600 bg-white border-neutral-200 mb-4"
            onClick={startNewDocument}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Thought
          </Button>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-neutral-500">Categories</h3>
            {selectedCategory && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs text-neutral-500"
                onClick={() => setSelectedCategory(null)}
              >
                Clear
              </Button>
            )}
          </div>
          <ScrollArea className="h-[150px]">
            <div className="space-y-1">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className={`flex items-center justify-between p-2 rounded-lg hover:bg-neutral-100 cursor-pointer group ${
                    selectedCategory === category.id ? "bg-neutral-100" : ""
                  }`}
                  onClick={() => {
                    setSelectedCategory(category.id)
                    setSelectedTag(null)
                    setActiveView("documents")
                  }}
                >
                  <span className="text-neutral-700">{category.name}</span>
                  {category.isNew && (
                    <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-none">New!</Badge>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-neutral-500">Tags</h3>
            {selectedTag && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs text-neutral-500"
                onClick={() => setSelectedTag(null)}
              >
                Clear
              </Button>
            )}
          </div>
          <ScrollArea className="h-[150px]">
            <div className="flex flex-wrap gap-2">
              {Array.from(new Set(documents.flatMap((doc) => doc.tags).filter((tag) => tag))).map((tag) => (
                <Badge
                  key={tag}
                  className={`cursor-pointer ${
                    selectedTag === tag
                      ? "bg-sage-500 text-white hover:bg-sage-600"
                      : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                  }`}
                  onClick={() => {
                    setSelectedTag(tag)
                    setSelectedCategory(null)
                    setActiveView("documents")
                  }}
                >
                  <Hash className="h-3 w-3 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {activeView === "write" && (
          <main className="flex-1 p-6 md:p-10 max-w-4xl mx-auto w-full">
            {isEditing ? (
              <div className="flex items-center mb-6">
                <Button
                  variant="ghost"
                  size="sm"
                  className="mr-2"
                  onClick={() => {
                    setActiveView("documents")
                    setIsEditing(false)
                  }}
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
                <h1 className="text-2xl font-medium text-neutral-800">Editing Thought</h1>
              </div>
            ) : (
              <h1 className="text-2xl font-medium text-neutral-800 mb-6">Free Thought Writing</h1>
            )}

            {isEditing && (
              <div className="mb-4">
                <Input
                  value={documentTitle}
                  onChange={(e) => setDocumentTitle(e.target.value)}
                  placeholder="Title (optional)"
                  className="text-lg font-medium bg-white border-neutral-200 mb-2"
                />
              </div>
            )}

            <p className="text-neutral-600 mb-4">
              {isEditing
                ? "Edit your thought below."
                : "Write freely. Let your thoughts flow naturally without judgment or structure."}
            </p>

            <div className="mb-6">
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Start typing your thoughts here..."
                className="min-h-[200px] p-4 text-lg bg-white border-neutral-200 rounded-xl focus:border-sage-300 focus:ring focus:ring-sage-100 focus:ring-opacity-50 transition-all"
              />
            </div>

            {editableTags.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-neutral-500 mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {editableTags.map((tag) => (
                    <Badge
                      key={tag}
                      className="bg-neutral-100 text-neutral-700 hover:bg-neutral-200 flex items-center gap-1"
                    >
                      {tag}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 rounded-full"
                        onClick={() => removeTag(tag)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={() => setIsTagDialogOpen(true)}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Tag
                  </Button>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                onClick={handleOrganizeWithAI}
                className="bg-sage-500 hover:bg-sage-600 text-white"
                disabled={isAnalyzing || !text.trim()}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Organize with AI
                  </>
                )}
              </Button>

              {isEditing && (
                <Button
                  onClick={() =>
                    saveDocument(currentDocument?.categoryId || "general", currentDocument?.categoryName || "General")
                  }
                  variant="outline"
                  disabled={!text.trim()}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              )}
            </div>
          </main>
        )}

        {activeView === "documents" && (
          <main className="flex-1 p-6 md:p-10 max-w-4xl mx-auto w-full">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-medium text-neutral-800">
                {selectedCategory
                  ? `Thoughts: ${categories.find((c) => c.id === selectedCategory)?.name || "Category"}`
                  : selectedTag
                    ? `Thoughts tagged with "${selectedTag}"`
                    : "All Thoughts"}
              </h1>
              <Button variant="outline" size="sm" onClick={startNewDocument}>
                <Plus className="mr-2 h-4 w-4" />
                New Thought
              </Button>
            </div>

            {filteredDocuments.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-neutral-200">
                <FileText className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-neutral-700 mb-2">No thoughts found</h3>
                <p className="text-neutral-500 mb-4">
                  {selectedCategory
                    ? "There are no thoughts in this category yet."
                    : selectedTag
                      ? `There are no thoughts tagged with "${selectedTag}" yet.`
                      : "You haven't created any thoughts yet."}
                </p>
                <Button onClick={startNewDocument}>Write Your First Thought</Button>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredDocuments.map((document) => (
                  <div
                    key={document.id}
                    className="p-4 bg-white rounded-xl border border-neutral-200 hover:border-neutral-300 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-lg font-medium text-neutral-800">{document.title || "Untitled Thought"}</h3>
                        <div className="flex items-center text-sm text-neutral-500 mb-2">
                          <Badge className="mr-2 bg-neutral-100 text-neutral-700 hover:bg-neutral-200 border-none">
                            {document.categoryName}
                          </Badge>
                          <span>{new Date(document.updatedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-neutral-500"
                          onClick={() => editDocument(document)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-neutral-500"
                          onClick={() => {
                            if (confirm("Are you sure you want to delete this thought?")) {
                              deleteDocument(document.id)
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-neutral-600 line-clamp-2">{document.refinedContent || document.content}</p>

                    {/* Display all categories */}
                    {document.categories && document.categories.length > 0 && (
                      <div className="mt-2 mb-3">
                        <h4 className="text-xs font-medium text-neutral-500 mb-1">Categories:</h4>
                        {document.categories.map((category, index) => (
                          <div
                            key={index}
                            className="text-xs text-neutral-600 mb-1 cursor-pointer hover:text-sage-600"
                            onClick={() => {
                              setSelectedCategory(category.id)
                              setSelectedTag(null)
                            }}
                          >
                            {category.path && category.path.length > 0 ? category.path.join(" > ") : category.title}
                          </div>
                        ))}
                      </div>
                    )}

                    {document.tags && document.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3 mb-2">
                        {document.tags.map((tag) => (
                          <Badge
                            key={tag}
                            className="bg-neutral-100 text-neutral-600 hover:bg-neutral-200 border-none text-xs"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedTag(tag)
                              setSelectedCategory(null)
                            }}
                          >
                            <Hash className="h-3 w-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <Button variant="ghost" size="sm" className="mt-2" onClick={() => editDocument(document)}>
                      View & Edit
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </main>
        )}

        {activeView === "graph" && (
          <main className="flex-1 p-6 md:p-10 max-w-4xl mx-auto w-full">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-medium text-neutral-800">Knowledge Graph</h1>
              <Button variant="outline" size="sm" onClick={startNewDocument}>
                <Plus className="mr-2 h-4 w-4" />
                New Thought
              </Button>
            </div>

            {documents.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-neutral-200">
                <Network className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-neutral-700 mb-2">No thoughts to visualize</h3>
                <p className="text-neutral-500 mb-4">
                  Create some thoughts with tags to see them connected in the knowledge graph.
                </p>
                <Button onClick={startNewDocument}>Write Your First Thought</Button>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-neutral-200 p-4">
                <p className="text-neutral-600 mb-4 text-sm">
                  This graph shows connections between your thoughts based on shared tags. Click on any node to view or
                  edit.
                </p>
                <KnowledgeGraph documents={documents} onNodeClick={handleGraphNodeClick} />
              </div>
            )}
          </main>
        )}
      </div>

      {/* Side Panel */}
      {isPanelOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-20 z-10 flex justify-end">
          <div
            className="w-full max-w-md bg-white h-full shadow-lg animate-slide-in-right"
            style={{ animationDuration: "0.3s" }}
          >
            <div className="p-6 border-b border-neutral-200 flex justify-between items-center">
              <h2 className="text-xl font-medium text-neutral-800">AI Organization</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsPanelOpen(false)}
                className="rounded-full hover:bg-neutral-100"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <ScrollArea className="h-[calc(100vh-80px)] p-6">
              {isAnalyzing ? (
                <div className="flex flex-col items-center justify-center h-64">
                  <Loader2 className="h-8 w-8 text-sage-500 animate-spin mb-4" />
                  <p className="text-neutral-600">
                    {isRefining ? "Refining your writing..." : "Analyzing your writing..."}
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Refined Text Section */}
                  <div className="p-5 rounded-xl bg-neutral-50 border border-neutral-200">
                    <h3 className="text-lg font-medium text-neutral-800 mb-3">Refined Text</h3>
                    <p className="text-neutral-600 mb-4">{refinedText}</p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      <h4 className="text-sm font-medium text-neutral-700 w-full mb-1">Tags:</h4>
                      {editableTags.map((tag) => (
                        <Badge
                          key={tag}
                          className="bg-neutral-100 text-neutral-700 hover:bg-neutral-200 flex items-center gap-1"
                        >
                          {tag}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 rounded-full"
                            onClick={() => removeTag(tag)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={() => setIsTagDialogOpen(true)}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add Tag
                      </Button>
                    </div>

                    <Button
                      onClick={() => {
                        const categoryInfo = aiCategories[0] || { id: "general", title: "General" }
                        saveDocument(categoryInfo.id, categoryInfo.title)
                      }}
                      className="w-full bg-sage-500 hover:bg-sage-600 text-white"
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Save Thought
                    </Button>
                  </div>

                  {/* Categories Section */}
                  {aiCategories.length > 0 && (
                    <>
                      <h3 className="text-lg font-medium text-neutral-800">Detected Categories</h3>

                      {aiCategories.map((category) => (
                        <div key={category.id} className="p-5 rounded-xl bg-neutral-50 border border-neutral-200">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-neutral-200">
                              {category.icon}
                            </div>
                            <h3 className="text-lg font-medium text-neutral-800">{category.title}</h3>
                          </div>

                          <p className="text-neutral-600 mb-4 text-sm">{category.summary}</p>

                          {/* Display hierarchical path */}
                          {category.path && (
                            <div className="mb-4 p-3 bg-neutral-100 rounded-lg border border-neutral-200">
                              <h4 className="text-sm font-medium text-neutral-700 mb-2">Categorization Path:</h4>
                              <p className="text-sm text-neutral-600">{category.path.join(" > ")}</p>
                            </div>
                          )}

                          {category.todos && category.todos.length > 0 && (
                            <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                              <h4 className="text-sm font-medium text-blue-700 mb-2">Suggested Tasks:</h4>
                              <ul className="space-y-1">
                                {category.todos.map((todo, index) => (
                                  <li key={index} className="text-sm text-blue-600 flex items-start gap-2">
                                    <div className="min-w-4 mt-0.5">•</div>
                                    <span>{todo}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-100 flex-1"
                              onClick={() => {
                                saveDocument(category.id, category.title)
                              }}
                            >
                              <FileText className="mr-2 h-4 w-4" />
                              Save in this Category
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-100 flex-1"
                              onClick={() => openTaskDialog(category.id, category.title)}
                            >
                              <CheckSquare className="mr-2 h-4 w-4" />
                              Create Task
                            </Button>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      )}

      {/* Task Creation Dialog */}
      <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <p className="text-sm text-neutral-500">
                Category: <span className="font-medium text-neutral-700">{currentTaskCategory?.name || "General"}</span>
              </p>
              <Input
                placeholder="Task title"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTaskDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (currentTaskCategory) {
                  createTask(currentTaskCategory.id, currentTaskCategory.name, newTaskTitle)
                }
              }}
              disabled={!newTaskTitle.trim()}
            >
              Create Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tag Creation Dialog */}
      <Dialog open={isTagDialogOpen} onOpenChange={setIsTagDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Tag</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Input
                placeholder="Tag name"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTagDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => addTag(newTag)} disabled={!newTag.trim() || editableTags.includes(newTag.trim())}>
              Add Tag
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
