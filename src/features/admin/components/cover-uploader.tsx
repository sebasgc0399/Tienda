"use client"

import { ImageIcon, Trash2Icon } from "lucide-react"
import Image from "next/image"
import { useRef, useState, useTransition } from "react"

import { Button } from "@/components/ui/button"
import { getPublicImageUrl } from "@/lib/supabase/storage-url"

import { removeCategoryCover } from "../actions/remove-category-cover"
import { uploadCategoryCover } from "../actions/upload-category-cover"
import { ACCEPTED_MIME, validateImageFile } from "../lib/validate-image-file"
import { DeleteDialog } from "./delete-dialog"

type CoverUploaderProps = {
  categoryId: string
  storagePath: string | null
}

// Single-file cover uploader (RF-5, admin-panel.md; plan "Portada de
// categoría"): client-side validateImageFile() pre-check is a UX shortcut
// only — upload-category-cover.ts re-validates server-side, which is the
// authoritative check.
export function CoverUploader({ categoryId, storagePath }: CoverUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [pending, startTransition] = useTransition()
  const [removeOpen, setRemoveOpen] = useState(false)
  const [message, setMessage] = useState<{
    tone: "error" | "success"
    text: string
  } | null>(null)

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) {
      return
    }

    const validation = validateImageFile(file)
    if (!validation.ok) {
      setMessage({ tone: "error", text: validation.message })
      return
    }

    setMessage(null)
    const formData = new FormData()
    formData.set("file", file)

    startTransition(async () => {
      const result = await uploadCategoryCover(categoryId, formData)
      if (result.status === "success") {
        setMessage({
          tone: "success",
          text: result.message ?? "Portada actualizada",
        })
      } else {
        setMessage({ tone: "error", text: result.message })
      }
    })
  }

  function handleRemove() {
    setMessage(null)
    startTransition(async () => {
      const result = await removeCategoryCover(categoryId)
      if (result.status === "success") {
        setRemoveOpen(false)
      } else {
        setMessage({ tone: "error", text: result.message })
      }
    })
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="bg-secondary relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-md">
        {storagePath ? (
          <Image
            src={getPublicImageUrl(storagePath)}
            alt=""
            fill
            sizes="(min-width: 1024px) 380px, 100vw"
            className="object-cover"
          />
        ) : (
          <ImageIcon
            aria-hidden="true"
            className="text-muted-foreground size-8"
          />
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={pending}
          onClick={() => inputRef.current?.click()}
        >
          {storagePath ? "Cambiar portada" : "Subir portada"}
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_MIME.join(",")}
          className="sr-only"
          onChange={handleFileChange}
        />

        {storagePath ? (
          <DeleteDialog
            open={removeOpen}
            onOpenChange={setRemoveOpen}
            trigger={
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={pending}
              />
            }
            triggerLabel={
              <>
                <Trash2Icon aria-hidden="true" className="text-destructive" />
                Quitar portada
              </>
            }
            title="Quitar portada"
            description="La categoría se queda sin imagen de portada. Puedes subir otra cuando quieras."
            actions={
              <Button
                type="button"
                variant="destructive"
                disabled={pending}
                onClick={handleRemove}
              >
                Quitar
              </Button>
            }
          />
        ) : null}
      </div>

      {message ? (
        <p
          role="alert"
          className={
            message.tone === "error"
              ? "text-destructive text-sm"
              : "text-muted-foreground text-sm"
          }
        >
          {message.text}
        </p>
      ) : null}
    </div>
  )
}
