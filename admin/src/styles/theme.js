export const theme = {
  colors: {
    // Primary colors inspired by Mauritanian desert and traditional textiles
    primary: '#8B4513',      // Rich brown like desert sand
    secondary: '#C19A6B',    // Warm sand color
    accent: '#3498db',       // Desert sage green
    
    // Background colors
    background: {
      dark: '#1a1a1a',       // Deep charcoal
      medium: '#242424',     // Rich dark brown
      light: '#2a2a2a'       // Warm brown gray
    },
    
    // Text colors
    text: {
      primary: '#ffffff',    // Warm off-white
      secondary: '#b3b3b3',  // Soft beige
      muted: '#666666'       // Muted sand
    },
    
    // Accent colors
    gold: '#DAA520',         // Traditional gold
    copper: '#B87333',       // Desert copper
    sage: '#79916F',         // Desert plant
    
    // Status colors
    success: '#2ecc71',      // Desert moss
    error: '#e74c3c',        // Desert clay
    warning: '#f1c40f',      // Desert amber
    info: '#5B7B7A',         // Desert slate
    
    // Border colors
    border: {
      light: 'rgba(255, 255, 255, 0.1)',
      medium: 'rgba(255, 255, 255, 0.15)',
      dark: 'rgba(255, 255, 255, 0.2)'
    }
  },
  
  shadows: {
    small: '0 2px 4px rgba(0, 0, 0, 0.1)',
    medium: '0 4px 8px rgba(0, 0, 0, 0.1)',
    large: '0 8px 16px rgba(0, 0, 0, 0.1)'
  },
  
  gradients: {
    primary: `linear-gradient(135deg, #8B4513 0%, #C19A6B 100%)`,
    accent: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
    dark: 'linear-gradient(135deg, #1a1a1a 0%, #2c3e50 100%)'
  },

  breakpoints: {
    mobile: '576px',
    tablet: '768px',
    desktop: '1024px'
  }
}; 