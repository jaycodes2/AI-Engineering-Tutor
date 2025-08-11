export function cn(...inputs) {
  // A simple className utility for merging class names.
  // For production apps, a library like `tailwind-merge` is recommended
  // to handle conflicting classes gracefully.
  return inputs.filter(Boolean).join(' ');
}
