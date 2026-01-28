"use client"

import Link from "next/link"
import { Phone, MapPin, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { Contact, Tag } from "@/lib/db"

interface ContactCardProps {
  contact: Contact
  tags?: Tag[]
}

export function ContactCard({ contact, tags = [] }: ContactCardProps) {
  const initials = `${contact.first_name[0]}${contact.last_name[0]}`.toUpperCase()

  return (
    <Link href={`/contacts/${contact.id}`}>
      <div className="flex items-center gap-3 p-4 bg-card rounded-2xl border border-border shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-200">
        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-primary font-bold shrink-0">
          {contact.photo_url ? (
            <img
              src={contact.photo_url || "/placeholder.svg"}
              alt={`${contact.first_name} ${contact.last_name}`}
              className="h-12 w-12 rounded-full object-cover"
            />
          ) : (
            initials
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-card-foreground truncate">
            {contact.first_name} {contact.last_name}
          </p>
          {contact.family_name && (
            <p className="text-sm text-primary truncate flex items-center gap-1">
              <Users className="h-3 w-3" />
              {contact.family_name}
            </p>
          )}
          {!contact.family_name && contact.congregation_name && (
            <p className="text-sm text-muted-foreground truncate flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {contact.congregation_name}
            </p>
          )}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {tags.slice(0, 2).map((tag) => (
                <Badge
                  key={tag.id}
                  variant="outline"
                  className="text-xs px-1.5 py-0"
                  style={{
                    borderColor: tag.color,
                    backgroundColor: `${tag.color}10`,
                    color: tag.color,
                  }}
                >
                  {tag.name}
                </Badge>
              ))}
              {tags.length > 2 && (
                <Badge variant="outline" className="text-xs px-1.5 py-0">
                  +{tags.length - 2}
                </Badge>
              )}
            </div>
          )}
        </div>
        {contact.phone && (
          <a
            href={`tel:${contact.phone}`}
            onClick={(e) => e.stopPropagation()}
            className="p-2.5 rounded-full bg-accent/10 text-accent hover:bg-accent/20 transition-colors shrink-0"
            aria-label={`${contact.first_name} anrufen`}
          >
            <Phone className="h-4 w-4" />
          </a>
        )}
      </div>
    </Link>
  )
}
