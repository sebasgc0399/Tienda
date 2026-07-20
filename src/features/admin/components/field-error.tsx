type FieldErrorProps = {
  message?: string
}

// Renders under a form field when state.fieldErrors[name] is set
// (useActionState re-render, no navigation) — shared by every CRUD form in
// the panel (design-system.md, "Panel de administración").
export function FieldError({ message }: FieldErrorProps) {
  if (!message) {
    return null
  }

  return (
    <p role="alert" className="text-destructive text-sm">
      {message}
    </p>
  )
}
