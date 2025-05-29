/**
 * PolityxMap Common Includes
 * This script loads the shared header and footer across all pages
 */

document.addEventListener('DOMContentLoaded', async function() {
  // Helper to include HTML fragments
  async function includeHTML(elementId, url) {
    try {
      // Ensure the URL is fully absolute by including origin
      const baseUrl = window.location.origin;
      const fullUrl = url.startsWith('/') ? `${baseUrl}${url}` : `${baseUrl}/${url}`;
      
      const response = await fetch(fullUrl);
      if (!response.ok) {
        console.error(`Failed to load ${fullUrl} - Status: ${response.status}`);
        throw new Error(`Failed to load ${fullUrl}`);
      }
      
      const html = await response.text();
      
      const element = document.getElementById(elementId);
      if (element) {
        element.innerHTML = html;
        
        // Initialize any scripts that might be needed for the header/footer components
        // This helps with ensuring menus work after insertion
        const scripts = element.querySelectorAll('script');
        scripts.forEach(script => {
          const newScript = document.createElement('script');
          if (script.src) {
            newScript.src = script.src;
          } else {
            newScript.textContent = script.textContent;
          }
          document.head.appendChild(newScript);
          script.remove();
        });
        
        // Set active menu item based on current URL
        if (elementId === 'site-header') {
          const currentUrl = window.location.pathname;
          const navLinks = element.querySelectorAll('.nav-link');
          
          navLinks.forEach(link => {
            const href = link.getAttribute('href');
            
            // Add smooth scrolling for Features link
            if (href === '#features' || href.endsWith('#features') || link.classList.contains('features-link')) {
              link.addEventListener('click', function(e) {
                // If on home page, scroll to features section
                if (currentUrl === '/' || currentUrl.includes('index.html')) {
                  e.preventDefault(); // Only prevent default on home page
                  
                  const featuresSection = document.getElementById('features');
                  if (featuresSection) {
                    // Scroll to features section with offset for header
                    const headerHeight = document.querySelector('.header') ? document.querySelector('.header').offsetHeight : 80;
                    const featuresPosition = featuresSection.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                    
                    window.scrollTo({
                      top: featuresPosition,
                      behavior: 'smooth'
                    });
                  }
                }
                // If on another page, let the default link behavior work (href="/#features")
              });
            }
            
            if (currentUrl === href || 
                (href !== '/' && currentUrl.startsWith(href))) {
              link.setAttribute('aria-current', 'page');
              link.classList.add('w--current');
            }
          });
        }
      }
    } catch (error) {
      console.error(`Error including ${url}:`, error);
    }
  }
  
  // Load header and footer from the root directory
  await includeHTML('site-header', '/header.html');
  await includeHTML('site-faq', '/faq.html');
  await includeHTML('site-footer', '/footer.html');
});