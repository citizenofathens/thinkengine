"use client"

import { useState } from "react"
import { Brain, Moon, Video, Plus, FileText, CheckSquare, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"

// Mock AI-generated categories
const mockAiCategories = [
  {
    id: "health-sleep",
    title: "Health > Sleep",
    summary: "Your notes mention sleep patterns and their impact on daily energy levels.",
    icon: <Moon className="h-5 w-5 text-blue-400" style={{ strokeWidth: 1.5 }} />,
  },
  {
    id: "self-dev-focus",
    title: "Self-Development > Focus",
    summary: "You wrote about techniques to improve concentration and mental clarity.",
    icon: <Brain className="h-5 w-5 text-sage-400" style={{ strokeWidth: 1.5 }} />,
  },
  {
    id: "creative-video",
    title: "Creative > Video Editing",
    summary: "There are mentions of video projects and editing techniques to try.",
    icon: <Video className="h-5 w-5 text-purple-300" style={{ strokeWidth: 1.5 }} />,
  },
]

export default function CalmWritingApp() {
  const [text, setText] = useState("")
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [categories, setCategories] = useState([
    { id: 1, name: "Health > Sleep", isNew: true },
    { id: 2, name: "Self-Development", isNew: false },
  ])
  const [aiCategories, setAiCategories] = useState(mockAiCategories)

  // Function to handle organizing with AI
  const handleOrganizeWithAI = () => {
    setIsPanelOpen(true)

    // Add a new category to the sidebar (simulating AI generating a new category)
    const newCategory = {
      id: Math.random(),
      name: "Creative > Video",
      isNew: true,
    }
    setCategories((prevCategories) => [newCategory, ...prevCategories])
  }

  return (
    <div className="flex h-screen bg-neutral-50">
      {/* Sidebar */}
      <div className="w-64 border-r border-neutral-200 bg-white p-4 hidden md:block">
        <div className="mb-6">
          <h2 className="text-lg font-medium text-neutral-800 mb-3">My Categories</h2>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start text-neutral-600 bg-white border-neutral-200"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Category
          </Button>
        </div>

        <ScrollArea className="h-[calc(100vh-120px)]">
          <div className="space-y-1">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-neutral-100 cursor-pointer group"
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
        <main className="flex-1 p-6 md:p-10 max-w-4xl mx-auto w-full">
          <h1 className="text-2xl font-medium text-neutral-800 mb-6">Free Thought Writing</h1>
          <p className="text-neutral-600 mb-6">
            Write freely. Let your thoughts flow naturally without judgment or structure.
          </p>

          <div className="mb-6">
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Start typing your thoughts here..."
              className="min-h-[300px] p-4 text-lg bg-white border-neutral-200 rounded-xl focus:border-sage-300 focus:ring focus:ring-sage-100 focus:ring-opacity-50 transition-all"
            />
          </div>

          <Button onClick={handleOrganizeWithAI} className="bg-sage-500 hover:bg-sage-600 text-white">
            Organize with AI
          </Button>
        </main>
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
              <div className="space-y-6">
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

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-100 flex-1"
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        Save as Note
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-100 flex-1"
                      >
                        <CheckSquare className="mr-2 h-4 w-4" />
                        Create Task
                      </Button>
                    </div>
                  </div>
                ))}

                <div className="p-5 rounded-xl border border-dashed border-neutral-300 bg-white flex items-center justify-center">
                  <Button variant="ghost" className="text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100">
                    <Plus className="mr-2 h-4 w-4" />
                    Generate More Categories
                  </Button>
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>
      )}
    </div>
  )
}
