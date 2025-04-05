// frontend/src/utils/helpers.ts
// Theme management
export const setTheme = (theme: 'light' | 'dark') => {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  localStorage.theme = theme;
};

export const getTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'dark';
  
  if (localStorage.theme === 'light') return 'light';
  
  if (
    localStorage.theme === 'dark' || 
    (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
  ) {
    return 'dark';
  }
  
  return 'light';
};

// Format timestamps to readable date
export const formatDate = (date: Date | string) => {
  if (!date) return '';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Format number with percentage
export const formatPercent = (value: number) => {
  return `${Math.round(value)}%`;
};
