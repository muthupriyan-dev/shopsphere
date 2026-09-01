export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4">
      {Icon && (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-moss-50 text-moss-600">
          <Icon className="h-6 w-6" />
        </div>
      )}
      <h3 className="font-display text-lg text-ink mb-1">{title}</h3>
      {description && <p className="text-sm text-ink/60 max-w-sm mb-4">{description}</p>}
      {action}
    </div>
  )
}
