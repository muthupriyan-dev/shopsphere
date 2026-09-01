export default function Button({ variant = 'primary', size = 'md', className = '', as: As = 'button', ...props }) {
  const base = 'inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss-500 disabled:opacity-50 disabled:cursor-not-allowed'
  const variants = {
    primary: 'bg-moss-600 text-white hover:bg-moss-700 active:bg-moss-700 shadow-sm',
    secondary: 'bg-white text-ink border border-line hover:border-ink/30',
    ghost: 'bg-transparent text-ink hover:bg-ink/5',
    clay: 'bg-clay text-white hover:brightness-95',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  }
  const sizes = {
    sm: 'text-sm px-3 py-1.5',
    md: 'text-sm px-5 py-2.5',
    lg: 'text-base px-6 py-3',
  }
  return <As className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props} />
}
