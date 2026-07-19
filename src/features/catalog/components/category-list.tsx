import type { Category } from "@/types/database"

type CategoryListProps = {
  categories: Pick<Category, "id" | "slug" | "name" | "description">[]
}

export function CategoryList({ categories }: CategoryListProps) {
  if (categories.length === 0) {
    return (
      <p className="text-muted-foreground">
        Aún no hay categorías para mostrar.
      </p>
    )
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-3">
      {categories.map((category) => (
        <li
          key={category.id}
          className="border-border bg-card rounded-lg border p-6"
        >
          <h3 className="font-heading text-xl font-bold">{category.name}</h3>
          {category.description ? (
            <p className="text-muted-foreground mt-2 text-sm">
              {category.description}
            </p>
          ) : null}
        </li>
      ))}
    </ul>
  )
}
