// Project row click handling (non-locked rows are anchor tags, locked rows are divs)
// Smooth scroll for anchor links is handled via CSS scroll-behavior

// Add keyboard accessibility to project rows that are anchor tags
document.querySelectorAll('.project-row[href]').forEach(row => {
  row.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      window.location.href = row.getAttribute('href');
    }
  });
  row.setAttribute('role', 'link');
  row.setAttribute('tabindex', '0');
});

// Subtle entrance animation for project rows — staggered fade-up on load
const rows = document.querySelectorAll('.project-row');
rows.forEach((row, i) => {
  row.style.opacity = '0';
  row.style.transform = 'translateY(10px)';
  row.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
  setTimeout(() => {
    row.style.opacity = '';
    row.style.transform = '';
  }, 80 + i * 60);
});
