export function Button({ children, type = 'button', className = '', ...props }) {
  const buttonClassName = `inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-5 py-2.5 font-semibold text-white shadow-sm transition-colors hover:bg-sky-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 disabled:cursor-not-allowed disabled:bg-sky-400 ${className}`.trim();

  return (
    <button {...props} type={type} className={buttonClassName}>
      {children}
    </button>
  );
}
