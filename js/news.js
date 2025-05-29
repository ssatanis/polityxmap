/**
 * PolityxMap News Manager
 * Handles WHO Health Topics API integration with advanced features
 * 
 * Features:
 * - WHO Health Topics API integration
 * - Client-side caching with expiration
 * - Real-time search and filtering
 * - Pagination with smooth animations
 * - Responsive error handling
 * - Accessibility compliance
 * - Performance optimization
 * - Mock data fallback for reliability
 */

class NewsManager {
  constructor() {
    // WHO Health Topics API Configuration
    this.API_BASE_URL = 'https://www.who.int';
    this.API_ENDPOINT = '/api/news/healthtopics';
    this.CACHE_KEY = 'polityxmap_news_cache';
    this.CACHE_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds
    
    // Pagination settings
    this.ITEMS_PER_PAGE = 9;
    this.currentPage = 1;
    
    // Data storage
    this.allNews = [];
    this.filteredNews = [];
    this.currentFilter = 'all';
    this.currentSearch = '';
    
    // DOM elements
    this.elements = {};
    
    // Loading state
    this.isLoading = false;
    this.usingMockData = false;
    
    // Bind methods to maintain context
    this.init = this.init.bind(this);
    this.loadNews = this.loadNews.bind(this);
    this.renderNews = this.renderNews.bind(this);
    this.searchNews = this.searchNews.bind(this);
    this.filterNews = this.filterNews.bind(this);
  }

  /**
   * Initialize the news manager
   */
  async init() {
    try {
      this.cacheElements();
      await this.loadNews();
    } catch (error) {
      console.error('Failed to initialize news manager:', error);
      this.showError();
    }
  }

  /**
   * Cache DOM elements for performance
   */
  cacheElements() {
    this.elements = {
      loading: document.getElementById('newsLoading'),
      error: document.getElementById('newsError'),
      empty: document.getElementById('newsEmpty'),
      grid: document.getElementById('newsGrid'),
      pagination: document.getElementById('newsPagination'),
      paginationInfo: document.getElementById('paginationInfo'),
      prevBtn: document.getElementById('prevBtn'),
      nextBtn: document.getElementById('nextBtn'),
      searchInput: document.getElementById('newsSearch')
    };
  }

  /**
   * Load news from WHO Health Topics API or cache
   */
  async loadNews() {
    if (this.isLoading) return;
    
    this.isLoading = true;
    this.showLoading();

    try {
      // Check cache first
      const cachedData = this.getCachedData();
      if (cachedData) {
        console.log('Loading news from cache');
        this.processNewsData(cachedData.data, cachedData.isMock);
        return;
      }

      // Try to fetch from WHO API first
      try {
        console.log('Attempting to fetch news from WHO API');
        const response = await this.fetchWithTimeout(this.API_BASE_URL + this.API_ENDPOINT, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }, 8000); // 8 second timeout

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // Cache the real data
        this.setCachedData(data, false);
        
        // Process and display
        this.processNewsData(data, false);
        console.log('Successfully loaded data from WHO API');

      } catch (apiError) {
        console.warn('WHO API failed, falling back to mock data:', apiError.message);
        
        // Fallback to mock data
        await this.loadMockData();
      }

    } catch (error) {
      console.error('Error loading news:', error);
      // Last resort - try mock data
      try {
        await this.loadMockData();
      } catch (mockError) {
        console.error('Failed to load mock data:', mockError);
        this.showError();
      }
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Load mock data as fallback
   */
  async loadMockData() {
    return new Promise((resolve, reject) => {
      try {
        // Check if mock data is available
        if (typeof window.mockHealthcareNews === 'undefined') {
          // Load mock data script if not already loaded
          const script = document.createElement('script');
          script.src = 'js/news-mock-data.js';
          script.onload = () => {
            if (window.mockHealthcareNews) {
              this.usingMockData = true;
              this.setCachedData(window.mockHealthcareNews, true);
              this.processNewsData(window.mockHealthcareNews, true);
              console.log('Successfully loaded mock data');
              resolve();
            } else {
              reject(new Error('Mock data not available'));
            }
          };
          script.onerror = () => reject(new Error('Failed to load mock data script'));
          document.head.appendChild(script);
        } else {
          this.usingMockData = true;
          this.setCachedData(window.mockHealthcareNews, true);
          this.processNewsData(window.mockHealthcareNews, true);
          console.log('Successfully loaded mock data');
          resolve();
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Fetch with timeout support
   */
  fetchWithTimeout(url, options, timeout) {
    return Promise.race([
      fetch(url, options),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), timeout)
      )
    ]);
  }

  /**
   * Process raw API data into usable format
   */
  processNewsData(data, isMock = false) {
    try {
      // Handle different possible response structures
      let newsItems = [];
      
      if (Array.isArray(data)) {
        newsItems = data;
      } else if (data.value && Array.isArray(data.value)) {
        // OData-style response
        newsItems = data.value;
      } else if (data.results && Array.isArray(data.results)) {
        newsItems = data.results;
      } else {
        throw new Error('Unexpected API response structure');
      }

      // Transform and validate news items
      this.allNews = newsItems.map(item => this.transformNewsItem(item)).filter(Boolean);
      
      // Sort by publication date (newest first)
      this.allNews.sort((a, b) => new Date(b.publishedDate) - new Date(a.publishedDate));
      
      if (this.allNews.length === 0) {
        this.showEmpty();
        return;
      }

      // Store whether we're using mock data
      this.usingMockData = isMock;

      // Apply current filters
      this.applyFilters();
      
    } catch (error) {
      console.error('Error processing news data:', error);
      this.showError();
    }
  }

  /**
   * Transform raw news item to standardized format
   */
  transformNewsItem(item) {
    try {
      // Validate required fields
      if (!item.Title && !item.title) return null;
      
      const title = item.Title || item.title || '';
      const summary = item.Summary || item.summary || item.Description || item.description || '';
      const publishedDate = item.PublicationDate || item.publicationDate || item.PublishedDate || item.publishedDate || item.Created || item.created || new Date().toISOString();
      const url = item.ItemDefaultUrl || item.itemDefaultUrl || item.Url || item.url || '#';
      const id = item.Id || item.id || item.GUID || item.guid || this.generateId();

      // Determine category based on content
      const category = this.determineCategory(title, summary);

      return {
        id: id,
        title: this.sanitizeText(title),
        summary: this.sanitizeText(summary),
        publishedDate: this.normalizeDate(publishedDate),
        url: url,
        category: category,
        searchText: `${title} ${summary}`.toLowerCase()
      };
    } catch (error) {
      console.error('Error transforming news item:', error);
      return null;
    }
  }

  /**
   * Determine news category based on content
   */
  determineCategory(title, summary) {
    const content = `${title} ${summary}`.toLowerCase();
    
    if (content.includes('policy') || content.includes('regulation') || content.includes('guideline')) {
      return 'policy';
    }
    if (content.includes('outbreak') || content.includes('emergency') || content.includes('alert')) {
      return 'emergency';
    }
    if (content.includes('research') || content.includes('study') || content.includes('finding')) {
      return 'research';
    }
    if (content.includes('vaccine') || content.includes('immunization')) {
      return 'vaccination';
    }
    
    return 'general';
  }

  /**
   * Sanitize text content
   */
  sanitizeText(text) {
    if (typeof text !== 'string') return '';
    return text.replace(/<[^>]*>/g, '').trim(); // Remove HTML tags
  }

  /**
   * Normalize date to consistent format
   */
  normalizeDate(dateStr) {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        return new Date().toISOString();
      }
      return date.toISOString();
    } catch (error) {
      return new Date().toISOString();
    }
  }

  /**
   * Generate unique ID
   */
  generateId() {
    return 'news_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Apply current search and filter settings
   */
  applyFilters() {
    let filtered = [...this.allNews];

    // Apply search filter
    if (this.currentSearch) {
      const searchLower = this.currentSearch.toLowerCase();
      filtered = filtered.filter(item => 
        item.searchText.includes(searchLower)
      );
    }

    // Apply category filter
    if (this.currentFilter !== 'all') {
      switch (this.currentFilter) {
        case 'recent':
          // Show items from last 30 days
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          filtered = filtered.filter(item => 
            new Date(item.publishedDate) > thirtyDaysAgo
          );
          break;
        case 'policy':
          filtered = filtered.filter(item => item.category === 'policy');
          break;
        default:
          // No additional filtering
          break;
      }
    }

    this.filteredNews = filtered;
    this.currentPage = 1; // Reset to first page
    this.renderNews();
  }

  /**
   * Search news articles
   */
  searchNews(query) {
    this.currentSearch = query.trim();
    this.applyFilters();
  }

  /**
   * Filter news by category
   */
  filterNews(filter) {
    this.currentFilter = filter;
    this.applyFilters();
  }

  /**
   * Render news articles with pagination
   */
  renderNews() {
    if (this.filteredNews.length === 0) {
      this.showEmpty();
      return;
    }

    // Calculate pagination
    const totalPages = Math.ceil(this.filteredNews.length / this.ITEMS_PER_PAGE);
    const startIndex = (this.currentPage - 1) * this.ITEMS_PER_PAGE;
    const endIndex = Math.min(startIndex + this.ITEMS_PER_PAGE, this.filteredNews.length);
    const currentPageItems = this.filteredNews.slice(startIndex, endIndex);

    // Render news cards
    this.elements.grid.innerHTML = currentPageItems.map((item, index) => 
      this.createNewsCard(item, startIndex + index)
    ).join('');

    // Update pagination
    this.updatePagination(totalPages);

    // Show content
    this.showContent();

    // Add staggered animations
    this.animateCards();

    // Add data source indicator if using mock data
    if (this.usingMockData) {
      this.addMockDataIndicator();
    }
  }

  /**
   * Add indicator for mock data usage
   */
  addMockDataIndicator() {
    if (!document.getElementById('mockDataIndicator')) {
      const indicator = document.createElement('div');
      indicator.id = 'mockDataIndicator';
      indicator.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: rgba(255, 193, 7, 0.9);
        color: #333;
        padding: 8px 16px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
        z-index: 1000;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 193, 7, 0.3);
      `;
      indicator.innerHTML = '⚠️ Demo Mode - Sample Data';
      document.body.appendChild(indicator);

      // Auto-hide after 5 seconds
      setTimeout(() => {
        if (indicator && indicator.parentNode) {
          indicator.style.opacity = '0';
          indicator.style.transform = 'translateY(-20px)';
          indicator.style.transition = 'all 0.3s ease';
          setTimeout(() => {
            indicator.remove();
          }, 300);
        }
      }, 5000);
    }
  }

  /**
   * Create HTML for a news card
   */
  createNewsCard(item, index) {
    const publishedDate = this.formatDate(item.publishedDate);
    const categoryDisplay = this.formatCategory(item.category);
    
    return `
      <article class="news-card" data-index="${index}" role="article" tabindex="0">
        <header class="news-card-header">
          <span class="news-card-category">${categoryDisplay}</span>
          <h2 class="news-card-title" onclick="window.open('${this.escapeHtml(item.url)}', '_blank')" role="button" tabindex="0" onkeypress="if(event.key==='Enter') window.open('${this.escapeHtml(item.url)}', '_blank')">
            ${this.escapeHtml(item.title)}
          </h2>
          <time class="news-card-date" datetime="${item.publishedDate}">${publishedDate}</time>
        </header>
        <div class="news-card-content">
          <p class="news-card-summary">${this.escapeHtml(item.summary || 'No summary available.')}</p>
          <footer class="news-card-footer">
            <a href="${this.escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer" class="read-more-btn" aria-label="Read full article: ${this.escapeHtml(item.title)}">
              Read More
            </a>
            <span class="who-attribution">WHO</span>
          </footer>
        </div>
      </article>
    `;
  }

  /**
   * Format date for display
   */
  formatDate(dateStr) {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        return 'Today';
      } else if (diffDays === 1) {
        return 'Yesterday';
      } else if (diffDays < 7) {
        return `${diffDays} days ago`;
      } else if (diffDays < 30) {
        const weeks = Math.floor(diffDays / 7);
        return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
      } else {
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      }
    } catch (error) {
      return 'Date unavailable';
    }
  }

  /**
   * Format category for display
   */
  formatCategory(category) {
    const categoryMap = {
      'policy': 'Policy',
      'emergency': 'Emergency',
      'research': 'Research',
      'vaccination': 'Vaccination',
      'general': 'Health News'
    };
    return categoryMap[category] || 'Health News';
  }

  /**
   * Escape HTML to prevent XSS
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Update pagination controls
   */
  updatePagination(totalPages) {
    if (totalPages <= 1) {
      this.elements.pagination.style.display = 'none';
      return;
    }

    this.elements.pagination.style.display = 'flex';
    this.elements.paginationInfo.textContent = `Page ${this.currentPage} of ${totalPages}`;
    
    this.elements.prevBtn.disabled = this.currentPage <= 1;
    this.elements.nextBtn.disabled = this.currentPage >= totalPages;
  }

  /**
   * Go to previous page
   */
  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.renderNews();
      this.scrollToTop();
    }
  }

  /**
   * Go to next page
   */
  nextPage() {
    const totalPages = Math.ceil(this.filteredNews.length / this.ITEMS_PER_PAGE);
    if (this.currentPage < totalPages) {
      this.currentPage++;
      this.renderNews();
      this.scrollToTop();
    }
  }

  /**
   * Scroll to top of news grid
   */
  scrollToTop() {
    if (this.elements.grid) {
      this.elements.grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  /**
   * Animate news cards with staggered delays
   */
  animateCards() {
    const cards = this.elements.grid.querySelectorAll('.news-card');
    cards.forEach((card, index) => {
      card.style.animationDelay = `${index * 0.1}s`;
      card.style.opacity = '0';
      card.style.transform = 'translateY(30px)';
      
      requestAnimationFrame(() => {
        card.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      });
    });
  }

  /**
   * Show loading state
   */
  showLoading() {
    this.hideAllStates();
    this.elements.loading.style.display = 'flex';
  }

  /**
   * Show error state
   */
  showError() {
    this.hideAllStates();
    this.elements.error.style.display = 'block';
  }

  /**
   * Show empty state
   */
  showEmpty() {
    this.hideAllStates();
    this.elements.empty.style.display = 'block';
  }

  /**
   * Show content (news grid)
   */
  showContent() {
    this.hideAllStates();
    this.elements.grid.style.display = 'grid';
  }

  /**
   * Hide all state containers
   */
  hideAllStates() {
    this.elements.loading.style.display = 'none';
    this.elements.error.style.display = 'none';
    this.elements.empty.style.display = 'none';
    this.elements.grid.style.display = 'none';
  }

  /**
   * Get cached data if valid
   */
  getCachedData() {
    try {
      const cached = localStorage.getItem(this.CACHE_KEY);
      if (!cached) return null;

      const { data, timestamp, isMock } = JSON.parse(cached);
      const now = Date.now();

      if (now - timestamp > this.CACHE_DURATION) {
        localStorage.removeItem(this.CACHE_KEY);
        return null;
      }

      return { data, isMock };
    } catch (error) {
      console.error('Error reading cache:', error);
      localStorage.removeItem(this.CACHE_KEY);
      return null;
    }
  }

  /**
   * Cache data with timestamp
   */
  setCachedData(data, isMock = false) {
    try {
      const cacheObject = {
        data: data,
        timestamp: Date.now(),
        isMock: isMock
      };
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(cacheObject));
    } catch (error) {
      console.error('Error saving to cache:', error);
    }
  }

  /**
   * Clear cache manually
   */
  clearCache() {
    localStorage.removeItem(this.CACHE_KEY);
  }

  /**
   * Refresh news data
   */
  async refresh() {
    this.clearCache();
    this.usingMockData = false;
    await this.loadNews();
  }
}

// Create global instance
window.newsManager = new NewsManager();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = NewsManager;
} 