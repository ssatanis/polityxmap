/**
 * Features Navigation Script
 * Handles navigation to the features section from any page
 */

document.addEventListener('DOMContentLoaded', function() {
  // Function to handle features link clicks
  function handleFeaturesLinkClick(e) {
    const currentPath = window.location.pathname;
    
    // If on home page, smooth scroll to features section
    if (currentPath === '/' || currentPath.endsWith('index.html')) {
      e.preventDefault();
      
      const featuresSection = document.getElementById('features');
      if (featuresSection) {
        const headerHeight = document.querySelector('.header') ? document.querySelector('.header').offsetHeight : 80;
        const featuresPosition = featuresSection.getBoundingClientRect().top + window.pageYOffset - headerHeight;
        
        window.scrollTo({
          top: featuresPosition,
          behavior: 'smooth'
        });
        
        // Update URL to maintain the hash
        history.pushState(null, null, '/#features');
      }
    } else {
      // If on another page, let the default link behavior work (href="/#features")
      // No need to prevent default - will navigate to /#features
    }
  }
  
  // Add event listeners to all features links
  function addFeaturesLinkListeners() {
    // Header features links
    document.querySelectorAll('.nav-link.features-link').forEach(link => {
      link.addEventListener('click', handleFeaturesLinkClick);
    });
    
    // Footer features links
    document.querySelectorAll('.footer-nav-link.features-link').forEach(link => {
      link.addEventListener('click', handleFeaturesLinkClick);
    });
  }
  
  // Initial setup
  addFeaturesLinkListeners();
  
  // Handle direct hash navigation (e.g., when someone visits /#features directly)
  if (window.location.hash === '#features') {
    setTimeout(function() {
      const featuresSection = document.getElementById('features');
      if (featuresSection) {
        const headerHeight = document.querySelector('.header') ? document.querySelector('.header').offsetHeight : 80;
        const featuresPosition = featuresSection.getBoundingClientRect().top + window.pageYOffset - headerHeight;
        
        window.scrollTo({
          top: featuresPosition,
          behavior: 'smooth'
        });
      }
    }, 500); // Small delay to ensure the page is fully loaded
  }
  
  // Re-add listeners after dynamic content loads (for header/footer)
  setTimeout(addFeaturesLinkListeners, 1000);
});