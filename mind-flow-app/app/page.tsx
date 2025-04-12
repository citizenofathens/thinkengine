"use client"

import { useState, useEffect } from "react"
import { Plus, FileText, CheckSquare, X, Loader2, Sparkles, Edit, Trash2, ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { analyzeText } from "@/lib/api"
import { saveToLocalStorage, loadFromLocalStorage } from "@/lib/storage"

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
  categoryId: string | number
  categoryName: string
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

export default function CalmWritingApp() {
  // State for writing and analysis
  const [text, setText] = useState("")
  const [documentTitle, setDocumentTitle] = useState("Untitled Document")
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  // State for categories, documents and tasks
  const [categories, setCategories] = useState<Category[]>([])
  const [documents, setDocuments] = useState<Document[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [aiCategories, setAiCategories] = useState([])

  // State for UI views
  const [activeView, setActiveView] = useState<"write" | "documents" | "tasks">("write")
  const [selectedCategory, setSelectedCategory] = useState<string | number | null>(null)
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([])
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([])

  // Dialog states
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState("")
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

  // Update filtered documents and tasks when selected category changes
  useEffect(() => {
    if (selectedCategory) {
      setFilteredDocuments(documents.filter((doc) => doc.categoryId === selectedCategory))
      setFilteredTasks(tasks.filter((task) => task.categoryId === selectedCategory))
    } else {
      setFilteredDocuments(documents)
      setFilteredTasks(tasks)
    }
  }, [selectedCategory, documents, tasks])

  // Function to handle organizing with AI
  const handleOrganizeWithAI = async () => {
    if (!text.trim()) {
      alert("Please write something first before organizing.")
      return
    }

    setIsAnalyzing(true)
    setIsPanelOpen(true)

    try {
      // Call the API to analyze the text
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

      // Automatically save the document
      saveDocument(results[0]?.id || "general", results[0]?.title || "General")
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

    // If editing an existing document
    if (isEditing && currentDocument) {
      const updatedDocument = {
        ...currentDocument,
        title: documentTitle,
        content: text,
        categoryId,
        categoryName,
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
        title: documentTitle,
        content: text,
        categoryId,
        categoryName,
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
    setIsEditing(false)
    setCurrentDocument(null)
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
    setCurrentDocument(document)
    setIsEditing(true)
    setActiveView("write")
  }

  // Function to start a new document
  const startNewDocument = () => {
    setDocumentTitle("Untitled Document")
    setText("")
    setCurrentDocument(null)
    setIsEditing(false)
    setActiveView("write")
  }

  // Function to open task creation dialog
  const openTaskDialog = (categoryId: string | number, categoryName: string) => {
    setCurrentTaskCategory({ id: categoryId, name: categoryName })
    setIsTaskDialogOpen(true)
  }

  return (
    <div className="flex h-screen bg-neutral-50">
      {/* Sidebar */}
      <div className="w-64 border-r border-neutral-200 bg-white p-4 hidden md:block">
        <div className="mb-6">
          <h2 className="text-lg font-medium text-neutral-800 mb-3">My Categories</h2>
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
              }}
            >
              Docs
            </Button>
            <Button
              variant={activeView === "tasks" ? "default" : "outline"}
              size="sm"
              className="flex-1"
              onClick={() => {
                setActiveView("tasks")
                setSelectedCategory(null)
              }}
            >
              Tasks
            </Button>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start text-neutral-600 bg-white border-neutral-200 mb-4"
            onClick={startNewDocument}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Document
          </Button>
        </div>

        <ScrollArea className="h-[calc(100vh-180px)]">
          <div className="space-y-1">
            {categories.map((category) => (
              <div
                key={category.id}
                className={`flex items-center justify-between p-2 rounded-lg hover:bg-neutral-100 cursor-pointer group ${
                  selectedCategory === category.id ? "bg-neutral-100" : ""
                }`}
                onClick={() => setSelectedCategory(category.id)}
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
                <h1 className="text-2xl font-medium text-neutral-800">Editing Document</h1>
              </div>
            ) : (
              <h1 className="text-2xl font-medium text-neutral-800 mb-6">Free Thought Writing</h1>
            )}

            <div className="mb-4">
              <Input
                value={documentTitle}
                onChange={(e) => setDocumentTitle(e.target.value)}
                placeholder="Document Title"
                className="text-lg font-medium bg-white border-neutral-200 mb-2"
              />
              <p className="text-neutral-600 mb-4">
                {isEditing
                  ? "Edit your document below."
                  : "Write freely. Let your thoughts flow naturally without judgment or structure."}
              </p>
            </div>

            <div className="mb-6">
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Start typing your thoughts here..."
                className="min-h-[300px] p-4 text-lg bg-white border-neutral-200 rounded-xl focus:border-sage-300 focus:ring focus:ring-sage-100 focus:ring-opacity-50 transition-all"
              />
            </div>

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
                  ? `Documents: ${categories.find((c) => c.id === selectedCategory)?.name || "Category"}`
                  : "All Documents"}
              </h1>
              <Button variant="outline" size="sm" onClick={startNewDocument}>
                <Plus className="mr-2 h-4 w-4" />
                New Document
              </Button>
            </div>

            {filteredDocuments.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-neutral-200">
                <FileText className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-neutral-700 mb-2">No documents found</h3>
                <p className="text-neutral-500 mb-4">
                  {selectedCategory
                    ? "There are no documents in this category yet."
                    : "You haven't created any documents yet."}
                </p>
                <Button onClick={startNewDocument}>Create Your First Document</Button>
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
                        <h3 className="text-lg font-medium text-neutral-800">{document.title}</h3>
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
                            if (confirm("Are you sure you want to delete this document?")) {
                              deleteDocument(document.id)
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-neutral-600 line-clamp-2">{document.content}</p>
                    <Button variant="ghost" size="sm" className="mt-2" onClick={() => editDocument(document)}>
                      View & Edit
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </main>
        )}

        {activeView === "tasks" && (
          <main className="flex-1 p-6 md:p-10 max-w-4xl mx-auto w-full">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-medium text-neutral-800">
                {selectedCategory
                  ? `Tasks: ${categories.find((c) => c.id === selectedCategory)?.name || "Category"}`
                  : "All Tasks"}
              </h1>
              <Button variant="outline" size="sm" onClick={() => openTaskDialog("general", "General")}>
                <Plus className="mr-2 h-4 w-4" />
                New Task
              </Button>
            </div>

            <Tabs defaultValue="active">
              <TabsList className="mb-4">
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>

              <TabsContent value="active">
                {filteredTasks.filter((task) => !task.completed).length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-xl border border-neutral-200">
                    <CheckSquare className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-neutral-700 mb-2">No active tasks</h3>
                    <p className="text-neutral-500 mb-4">
                      {selectedCategory
                        ? "There are no active tasks in this category."
                        : "You don't have any active tasks."}
                    </p>
                    <Button onClick={() => openTaskDialog("general", "General")}>Create Your First Task</Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredTasks
                      .filter((task) => !task.completed)
                      .map((task) => (
                        <div
                          key={task.id}
                          className="p-3 bg-white rounded-lg border border-neutral-200 flex items-center"
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 mr-2 rounded-md"
                            onClick={() => toggleTaskCompletion(task.id)}
                          >
                            <div className="h-5 w-5 rounded border border-neutral-300"></div>
                          </Button>
                          <div className="flex-1">
                            <p className="text-neutral-800">{task.title}</p>
                            <Badge className="bg-neutral-100 text-neutral-700 hover:bg-neutral-200 border-none">
                              {task.categoryName}
                            </Badge>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-neutral-500"
                            onClick={() => deleteTask(task.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="completed">
                {filteredTasks.filter((task) => task.completed).length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-xl border border-neutral-200">
                    <CheckSquare className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-neutral-700 mb-2">No completed tasks</h3>
                    <p className="text-neutral-500">Tasks you complete will appear here.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredTasks
                      .filter((task) => task.completed)
                      .map((task) => (
                        <div
                          key={task.id}
                          className="p-3 bg-white rounded-lg border border-neutral-200 flex items-center"
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 mr-2 rounded-md"
                            onClick={() => toggleTaskCompletion(task.id)}
                          >
                            <div className="h-5 w-5 rounded bg-sage-500 text-white flex items-center justify-center">
                              <CheckSquare className="h-3 w-3" />
                            </div>
                          </Button>
                          <div className="flex-1">
                            <p className="text-neutral-500 line-through">{task.title}</p>
                            <Badge className="bg-neutral-100 text-neutral-500 hover:bg-neutral-200 border-none">
                              {task.categoryName}
                            </Badge>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-neutral-500"
                            onClick={() => deleteTask(task.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
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
                  <p className="text-neutral-600">Analyzing your writing...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {aiCategories.length > 0 ? (
                    <>
                      <p className="text-neutral-600">Based on your writing, we've identified these categories:</p>

                      {aiCategories.map((category) => (
                        <div key={category.id} className="p-5 rounded-xl bg-neutral-50 border border-neutral-200">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-neutral-200">
                              {category.icon}
                            </div>
                            <h3 className="text-lg font-medium text-neutral-800">{category.title}</h3>
                          </div>

                          <p className="text-neutral-600 mb-4 text-sm">{category.summary}</p>

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
                                setIsPanelOpen(false)
                              }}
                            >
                              <FileText className="mr-2 h-4 w-4" />
                              Save as Note
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

                      <div className="p-5 rounded-xl border border-dashed border-neutral-300 bg-white flex items-center justify-center">
                        <Button
                          variant="ghost"
                          className="text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Generate More Categories
                        </Button>
                      </div>
                    </>
                  ) : (
                    <p className="text-neutral-600">
                      No categories found. Try writing more detailed content for better analysis.
                    </p>
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
    </div>
  )
}
