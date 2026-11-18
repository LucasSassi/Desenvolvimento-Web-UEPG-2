export function Input({ type = 'text', className = '', ...props }) {
  const inputClassName = `rounded border border-gray-300 px-3 py-2 ${className}`.trim();

  return <input {...props} type={type} className={inputClassName} />;
}
