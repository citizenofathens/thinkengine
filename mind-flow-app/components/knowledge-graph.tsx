"use client"

import { useEffect, useRef } from "react"
import * as d3 from "d3"
import { useTheme } from "next-themes"

interface Document {
  id: string
  title: string
  tags: string[]
}

interface GraphNode {
  id: string
  group: number
  label: string
  type: "document" | "tag"
}

interface GraphLink {
  source: string
  target: string
  value: number
}

interface KnowledgeGraphProps {
  documents: Document[]
  onNodeClick?: (nodeId: string, nodeType: "document" | "tag") => void
}

export function KnowledgeGraph({ documents, onNodeClick }: KnowledgeGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const { theme } = useTheme()
  const isDark = theme === "dark"

  useEffect(() => {
    if (!svgRef.current || documents.length === 0) return

    // Clear previous graph
    d3.select(svgRef.current).selectAll("*").remove()

    // Create nodes for documents and tags
    const nodes: GraphNode[] = []
    const links: GraphLink[] = []
    const tagMap: Record<string, boolean> = {}

    // Add document nodes
    documents.forEach((doc, index) => {
      nodes.push({
        id: doc.id,
        group: 1,
        label: doc.title || "Untitled",
        type: "document",
      })

      // Add tag nodes and links
      doc.tags.forEach((tag) => {
        const tagId = `tag-${tag.replace(/\s+/g, "-").toLowerCase()}`

        // Add tag node if it doesn't exist
        if (!tagMap[tagId]) {
          nodes.push({
            id: tagId,
            group: 2,
            label: tag,
            type: "tag",
          })
          tagMap[tagId] = true
        }

        // Add link between document and tag
        links.push({
          source: doc.id,
          target: tagId,
          value: 1,
        })
      })
    })

    // Set up the SVG
    const width = svgRef.current.clientWidth
    const height = 500

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])

    // Create the simulation
    const simulation = d3
      .forceSimulation(nodes as any)
      .force(
        "link",
        d3
          .forceLink(links)
          .id((d: any) => d.id)
          .distance(100),
      )
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(30))

    // Create the links
    const link = svg
      .append("g")
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke", isDark ? "#555" : "#ddd")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", (d) => Math.sqrt(d.value))

    // Create the nodes
    const node = svg
      .append("g")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .attr("cursor", "pointer")
      .on("click", (event, d: any) => {
        if (onNodeClick) {
          onNodeClick(d.id, d.type)
        }
      })
      .call(d3.drag<SVGGElement, GraphNode>().on("start", dragstarted).on("drag", dragged).on("end", dragended) as any)

    // Add circles to nodes
    node
      .append("circle")
      .attr("r", (d) => (d.type === "document" ? 15 : 10))
      .attr("fill", (d) => (d.type === "document" ? "#7e9578" : "#6da7f0"))
      .attr("stroke", isDark ? "#333" : "#fff")
      .attr("stroke-width", 1.5)

    // Add labels to nodes
    node
      .append("text")
      .attr("dx", 0)
      .attr("dy", (d) => (d.type === "document" ? -20 : -15))
      .attr("text-anchor", "middle")
      .text((d) => d.label)
      .attr("fill", isDark ? "#eee" : "#333")
      .attr("font-size", (d) => (d.type === "document" ? "12px" : "10px"))
      .attr("pointer-events", "none")
      .each(function (d) {
        const text = d3.select(this)
        const words = d.label.split(/\s+/)
        let line = ""
        let lineNumber = 0
        const lineHeight = 1.1
        const y = text.attr("y")
        const dy = Number.parseFloat(text.attr("dy"))
        let tspan = text
          .text(null)
          .append("tspan")
          .attr("x", 0)
          .attr("y", y)
          .attr("dy", dy + "em")

        for (let i = 0; i < words.length; i++) {
          const word = words[i]
          if (line.length + word.length > 15) {
            tspan = text
              .append("tspan")
              .attr("x", 0)
              .attr("y", y)
              .attr("dy", ++lineNumber * lineHeight + dy + "em")
              .text(word)
            line = word
          } else {
            line = line ? line + " " + word : word
            tspan.text(line)
          }
        }
      })

    // Update positions on simulation tick
    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y)

      node.attr("transform", (d: any) => `translate(${d.x},${d.y})`)
    })

    // Drag functions
    function dragstarted(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart()
      d.fx = d.x
      d.fy = d.y
    }

    function dragged(event: any, d: any) {
      d.fx = event.x
      d.fy = event.y
    }

    function dragended(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0)
      d.fx = null
      d.fy = null
    }

    return () => {
      simulation.stop()
    }
  }, [documents, isDark, onNodeClick])

  return (
    <div className="w-full h-[500px] bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
      <svg ref={svgRef} className="w-full h-full" />
    </div>
  )
}
