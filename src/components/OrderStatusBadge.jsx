const styles = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
  processing: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  shipped: 'bg-purple-50 text-purple-700 border-purple-200',
  delivered: 'bg-moss-50 text-moss-700 border-moss-100',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
}

export default function OrderStatusBadge({ status }) {
  return (
    <span className={`inline-block rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${styles[status] || styles.pending}`}>
      {status}
    </span>
  )
}
