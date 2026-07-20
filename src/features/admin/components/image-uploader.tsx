"use client"

import { useRouter } from "next/navigation"
import { useRef, useState, useTransition } from "react"

import { Button } from "@/components/ui/button"

import { uploadProductImage } from "../actions/upload-product-image"
import { ACCEPTED_MIME, validateImageFile } from "../lib/validate-image-file"

type ImageUploaderProps = {
  productId: string
}

type FileStatus = "pending" | "done" | "error"

type FileEntry = {
  id: string
  name: string
  status: FileStatus
  message?: string
}

// RF-5 (admin-panel.md; plan "Subida de imágenes"): multi-file input, but
// one uploadProductImage() call per file, sequential — a failure mid-batch
// is scoped to that file's row in the list below, the rest keep uploading
// (admin-panel.md, "Falla de subida a Storage"). Per-file status lives in
// state updated from inside the useTransition callback itself, which runs
// as a consequence of the onChange handler — never from a useEffect — so
// this stays clear of the no-setState-in-effect rule (ESLint react-hooks
// v7 / React Compiler) the rest of the admin panel follows (see
// InlineToggle's doc comment). After the whole batch settles,
// router.refresh() re-fetches the RSC image list (ImageGrid's data),
// picking up whatever the actions' own revalidatePublicCatalog() already
// marked stale.
export function ImageUploader({ productId }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [entries, setEntries] = useState<FileEntry[]>([])

  function updateEntry(id: string, patch: Partial<FileEntry>) {
    setEntries((prev) =>
      prev.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry)),
    )
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? [])
    event.target.value = ""
    if (files.length === 0) {
      return
    }

    const fileById = new Map<string, File>()
    const initialEntries: FileEntry[] = files.map((file) => {
      const id = crypto.randomUUID()
      fileById.set(id, file)
      return { id, name: file.name, status: "pending" }
    })
    setEntries(initialEntries)

    startTransition(async () => {
      for (const entry of initialEntries) {
        const file = fileById.get(entry.id)
        if (!file) {
          continue
        }

        const validation = validateImageFile(file)
        if (!validation.ok) {
          updateEntry(entry.id, {
            status: "error",
            message: validation.message,
          })
          continue
        }

        const formData = new FormData()
        formData.set("file", file)

        const result = await uploadProductImage(productId, formData)
        if (result.status === "success") {
          updateEntry(entry.id, { status: "done" })
        } else {
          updateEntry(entry.id, { status: "error", message: result.message })
        }
      }

      router.refresh()
    })
  }

  return (
    <div className="flex flex-col gap-3">
      <div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={pending}
          onClick={() => inputRef.current?.click()}
        >
          Subir imágenes
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_MIME.join(",")}
          multiple
          className="sr-only"
          onChange={handleFileChange}
        />
      </div>

      {entries.length > 0 ? (
        <ul className="flex flex-col gap-1 text-sm">
          {entries.map((entry) => (
            <li
              key={entry.id}
              className="flex items-center justify-between gap-2"
            >
              <span className="text-muted-foreground truncate">
                {entry.name}
              </span>
              {entry.status === "pending" ? (
                <span className="text-muted-foreground shrink-0">
                  Subiendo…
                </span>
              ) : null}
              {entry.status === "done" ? (
                <span className="shrink-0">Lista</span>
              ) : null}
              {entry.status === "error" ? (
                <span role="alert" className="text-destructive shrink-0">
                  {entry.message}
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
