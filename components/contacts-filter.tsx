"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Filter, X } from "lucide-react"
import { ContactCard } from "@/components/contact-card"
import type { ContactWithTags, Congregation, Tag } from "@/lib/db"

interface ContactsFilterProps {
  contacts: ContactWithTags[]
  congregations: Congregation[]
  tags: Tag[]
}

export function ContactsFilter({ contacts, congregations, tags }: ContactsFilterProps) {
  const [selectedCongregations, setSelectedCongregations] = useState<number[]>([])
  const [selectedTags, setSelectedTags] = useState<number[]>([])

  const toggleCongregation = (id: number) => {
    setSelectedCongregations(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    )
  }

  const toggleTag = (id: number) => {
    setSelectedTags(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    )
  }

  const clearFilters = () => {
    setSelectedCongregations([])
    setSelectedTags([])
  }

  const filteredContacts = contacts.filter(contact => {
    // Filter by congregation
    if (selectedCongregations.length > 0) {
      if (!contact.congregation_id || !selectedCongregations.includes(contact.congregation_id)) {
        return false
      }
    }

    // Filter by tags
    if (selectedTags.length > 0) {
      const contactTags = Array.isArray(contact.tags) ? contact.tags : []
      const contactTagIds = contactTags.map((t: Tag) => t.id)
      const hasSelectedTag = selectedTags.some(tagId => contactTagIds.includes(tagId))
      if (!hasSelectedTag) {
        return false
      }
    }

    return true
  })

  const activeFilterCount = selectedCongregations.length + selectedTags.length

  return (
    <>
      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              <Filter className="h-4 w-4 mr-2" />
              Filter
              {activeFilterCount > 0 && (
                <Badge variant="default" className="ml-2 h-5 min-w-5 px-1.5">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-4" align="start">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-sm">Filter</h4>
                {activeFilterCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="h-7 text-xs"
                  >
                    Zurücksetzen
                  </Button>
                )}
              </div>

              {/* Congregations Filter */}
              {congregations.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground">
                    Versammlungen
                  </Label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {congregations.map((cong) => (
                      <div key={cong.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`cong-${cong.id}`}
                          checked={selectedCongregations.includes(cong.id)}
                          onCheckedChange={() => toggleCongregation(cong.id)}
                        />
                        <Label
                          htmlFor={`cong-${cong.id}`}
                          className="text-sm font-normal cursor-pointer flex-1"
                        >
                          {cong.name} {cong.city && `(${cong.city})`}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags Filter */}
              {tags.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground">
                    Tags
                  </Label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {tags.map((tag) => (
                      <div key={tag.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`tag-${tag.id}`}
                          checked={selectedTags.includes(tag.id)}
                          onCheckedChange={() => toggleTag(tag.id)}
                        />
                        <Label
                          htmlFor={`tag-${tag.id}`}
                          className="cursor-pointer flex-1"
                        >
                          <Badge
                            variant="outline"
                            className="text-xs"
                            style={{
                              borderColor: tag.color,
                              backgroundColor: `${tag.color}15`,
                              color: tag.color,
                            }}
                          >
                            {tag.name}
                          </Badge>
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>

        <span className="text-sm text-muted-foreground">
          {filteredContacts.length} {filteredContacts.length === 1 ? 'Kontakt' : 'Kontakte'}
        </span>
      </div>

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedCongregations.map((congId) => {
            const cong = congregations.find(c => c.id === congId)
            if (!cong) return null
            return (
              <Badge
                key={`active-cong-${congId}`}
                variant="secondary"
                className="text-xs pl-2 pr-1 py-0.5"
              >
                {cong.name}
                <button
                  onClick={() => toggleCongregation(congId)}
                  className="ml-1 hover:bg-background rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )
          })}
          {selectedTags.map((tagId) => {
            const tag = tags.find(t => t.id === tagId)
            if (!tag) return null
            return (
              <Badge
                key={`active-tag-${tagId}`}
                variant="outline"
                className="text-xs pl-2 pr-1 py-0.5"
                style={{
                  borderColor: tag.color,
                  backgroundColor: `${tag.color}15`,
                  color: tag.color,
                }}
              >
                {tag.name}
                <button
                  onClick={() => toggleTag(tagId)}
                  className="ml-1 hover:bg-background rounded-full p-0.5"
                >
                  <X className="h-3 w-3" style={{ color: tag.color }} />
                </button>
              </Badge>
            )
          })}
        </div>
      )}

      {/* Contact List */}
      <div className="space-y-3 mt-4">
        {filteredContacts.map((contact) => (
          <ContactCard key={contact.id} contact={contact} tags={contact.tags} />
        ))}
      </div>
    </>
  )
}
