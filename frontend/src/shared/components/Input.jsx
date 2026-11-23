export function Input({ type = 'text', className = '', ...props }) {
  const inputClassName = `rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-gray-900 shadow-sm transition placeholder:text-gray-400 focus:border-sky-500 focus:outline-none focus:ring-4 focus:ring-sky-500/20 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500 ${className}`.trim();

  return <input {...props} type={type} className={inputClassName} />;
}
