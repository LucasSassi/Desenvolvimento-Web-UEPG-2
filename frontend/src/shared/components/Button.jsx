export function Button({ children, type = 'button', className = '', ...props }) {
  const buttonClassName = `rounded border border-gray-400 px-4 py-2 ${className}`.trim();

  return (
    <button {...props} type={type} className={buttonClassName}>
      {children}
    </button>
  );
}
