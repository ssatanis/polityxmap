/**
 * PolityxMap Healthcare News & Market Intelligence Manager
 * NewsAPI.org + Polygon.io Integration with Advanced UI and Animations
 * 
 * Features:
 * - NewsAPI.org healthcare news integration
 * - Polygon.io healthcare stocks integration
 * - Featured article with dynamic layout
 * - Advanced search and filtering
 * - Healthcare statistics dashboard
 * - Smooth animations and transitions
 * - Client-side caching
 * - Error handling and fallback strategies
 * - Responsive design
 * - Accessibility compliance
 */

class HealthcareNewsManager {
  constructor() {
    // API Configuration
    this.NEWS_API_KEY = '68205cbad8d2481992d2b394561852d3';
    this.POLYGON_API_KEY = 'cLn7IVIfpKdCYlJod0pB92xMZ5bStUjU';
    this.NEWS_API_BASE_URL = 'https://newsapi.org/v2';
    this.POLYGON_BASE_URL = 'https://api.polygon.io/v2';
    this.CACHE_KEY = 'polityxmap_healthcare_news';
    this.STOCKS_CACHE_KEY = 'polityxmap_healthcare_stocks';
    this.CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
    
    // Pagination and display settings
    this.ITEMS_PER_PAGE = 12;
    this.FEATURED_ARTICLES = 1;
    this.currentPage = 1;
    
    // Data storage
    this.allNews = [];
    this.filteredNews = [];
    this.featuredArticle = null;
    this.currentFilter = 'all';
    this.currentSearch = '';
    this.healthcareStocks = [];
    this.newsStats = {
      total: 0,
      today: 0,
      policy: 0,
      research: 0
    };
    
    // DOM elements
    this.elements = {};
    
    // Loading state
    this.isLoading = false;
    
    // Healthcare-focused search terms and stock symbols
    this.healthcareTerms = {
      policy: ['health policy', 'healthcare policy', 'medicare', 'medicaid', 'FDA', 'healthcare reform', 'health insurance', 'obamacare', 'ACA', 'health legislation'],
      research: ['medical research', 'clinical trial', 'pharmaceutical', 'biotech', 'drug development', 'medical breakthrough', 'treatment', 'therapy', 'vaccine', 'medicine'],
      public: ['public health', 'epidemic', 'pandemic', 'vaccination', 'health crisis', 'outbreak', 'WHO', 'CDC', 'health emergency', 'disease'],
      pharma: ['pharmaceutical', 'pharma', 'drug', 'medicine', 'biotech', 'biopharmaceutical', 'medical device', 'healthcare company']
    };
    
    this.healthcareStockSymbols = [
      'UNH', 'PFE', 'JNJ', 'LLY'
    ];
    
    // Mock data for fallback
    this.mockHealthcareNews = [
      {
        id: 'mock_1',
        title: 'FDA Approves Revolutionary Gene Therapy for Rare Blood Disorder',
        description: 'The Food and Drug Administration has approved a groundbreaking gene therapy treatment that could transform care for patients with rare blood disorders, marking a significant milestone in personalized medicine.',
        content: 'In a landmark decision, federal health officials unveiled a new era of treatment...',
        url: 'https://example.com/fda-gene-therapy-approval',
        urlToImage: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&h=400&fit=crop',
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        source: { name: 'FDA News', id: 'fda-news' },
        author: 'Dr. Sarah Mitchell',
        category: 'research'
      },
      {
        id: 'mock_2',
        title: 'Medicare Announces Major Policy Changes for Mental Health Coverage',
        description: 'Medicare has unveiled comprehensive policy reforms to expand mental health coverage, affecting millions of Americans and addressing critical gaps in healthcare access.',
        content: 'The Centers for Medicare & Medicaid Services announced sweeping changes...',
        url: 'https://example.com/medicare-mental-health-policy',
        urlToImage: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=600&h=400&fit=crop',
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
        source: { name: 'Medicare Today', id: 'medicare-today' },
        author: 'Dr. James Wilson',
        category: 'policy'
      },
      {
        id: 'mock_3',
        title: 'Major Pharmaceutical Companies Partner for Global Vaccine Initiative',
        description: 'Leading pharmaceutical giants have announced a unprecedented collaboration to accelerate vaccine development and distribution in underserved regions worldwide.',
        content: 'Top pharmaceutical companies have joined forces in an ambitious initiative...',
        url: 'https://example.com/pharma-vaccine-partnership',
        urlToImage: 'https://images.unsplash.com/photo-1584515933487-779824d29309?w=600&h=400&fit=crop',
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
        source: { name: 'PharmaTimes', id: 'pharma-times' },
        author: 'Dr. Maria Rodriguez',
        category: 'pharma'
      },
      {
        id: 'mock_4',
        title: 'WHO Declares Global Health Emergency Over New Disease Outbreak',
        description: 'The World Health Organization has declared a public health emergency following reports of a new infectious disease spreading across multiple countries.',
        content: 'Health officials worldwide are mobilizing resources...',
        url: 'https://example.com/who-health-emergency',
        urlToImage: 'https://images.unsplash.com/photo-1576091160401-4312e27c296d?w=600&h=400&fit=crop',
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
        source: { name: 'WHO Press', id: 'who-press' },
        author: 'Dr. Elena Rodriguez',
        category: 'public'
      },
      {
        id: 'mock_5',
        title: 'Clinical Trial Shows Promising Results for Alzheimer Disease Treatment',
        description: 'A major pharmaceutical company has announced positive Phase 3 clinical trial results for a new Alzheimer disease treatment, offering hope to millions of patients.',
        content: 'The groundbreaking clinical trial results show significant improvement...',
        url: 'https://example.com/alzheimer-clinical-trial',
        urlToImage: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=600&h=400&fit=crop',
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        source: { name: 'Medical Journal', id: 'medical-journal' },
        author: 'Dr. Michael Chen',
        category: 'research'
      },
      {
        id: 'mock_6',
        title: 'Healthcare Reform Bill Passes Senate with Bipartisan Support',
        description: 'Congress has passed landmark healthcare legislation aimed at reducing prescription drug costs and expanding access to medical care for underserved communities.',
        content: 'The bipartisan healthcare reform bill includes provisions...',
        url: 'https://example.com/healthcare-reform-bill',
        urlToImage: 'https://images.unsplash.com/photo-1576091160501-bbe57469278f?w=600&h=400&fit=crop',
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
        source: { name: 'Healthcare Policy News', id: 'policy-news' },
        author: 'Senator Jane Williams',
        category: 'policy'
      }
    ];
    
    // Bind methods
    this.init = this.init.bind(this);
    this.loadNews = this.loadNews.bind(this);
    this.loadStocks = this.loadStocks.bind(this);
    this.searchNews = this.searchNews.bind(this);
    this.filterNews = this.filterNews.bind(this);
  }

  /**
   * Initialize the healthcare news manager
   */
  async init() {
    try {
      console.log('Initializing Healthcare News & Market Intelligence Manager...');
      
      // Wait for DOM to be fully loaded
      if (document.readyState === 'loading') {
        await new Promise(resolve => {
          document.addEventListener('DOMContentLoaded', resolve);
        });
      }
      
      this.cacheElements();
      this.setupEventListeners();
      
      // Load both news and stocks concurrently
      await Promise.all([
        this.loadNews(),
        this.loadStocks()
      ]);
      
      // Set initial "last updated" timestamp
      this.updateLastUpdatedTime();
      
      console.log('Healthcare News & Market Intelligence Manager initialized successfully');
    } catch (error) {
      console.error('Failed to initialize healthcare news manager:', error);
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
      featuredContainer: document.getElementById('featuredArticle'),
      pagination: document.getElementById('paginationContainer'),
      paginationInfo: document.getElementById('paginationInfo'),
      prevBtn: document.getElementById('prevBtn'),
      nextBtn: document.getElementById('nextBtn'),
      refreshButton: document.getElementById('refreshNews'),
      lastUpdated: document.getElementById('lastUpdated'),
      stocksGrid: document.getElementById('stocksGrid'),
      totalArticles: document.getElementById('totalArticles'),
      todayArticles: document.getElementById('todayArticles'),
      policyArticles: document.getElementById('policyArticles'),
      researchArticles: document.getElementById('researchArticles')
    };
    
    // Verify all elements exist
    const missingElements = Object.entries(this.elements)
      .filter(([key, element]) => !element)
      .map(([key]) => key);
    
    if (missingElements.length > 0) {
      console.warn('Missing DOM elements:', missingElements);
    }
  }

  /**
   * Setup event listeners for filters and refresh
   */
  setupEventListeners() {
    // Filter buttons
    const filterButtons = document.querySelectorAll('.filter-button');
    filterButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        filterButtons.forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        this.filterNews(e.target.dataset.filter);
      });
    });

    // Stock modal event listeners
    this.setupModalEventListeners();
  }

  /**
   * Setup stock modal event listeners
   */
  setupModalEventListeners() {
    const modal = document.getElementById('stockModal');
    const closeBtn = document.getElementById('stockModalClose');
    
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.closeStockModal();
      });
    }
    
    if (modal) {
      // Close modal when clicking outside content
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.closeStockModal();
        }
      });
      
      // Close modal with Escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
          this.closeStockModal();
        }
      });
    }
  }

  /**
   * Load healthcare stocks from Polygon.io
   */
  async loadStocks() {
    try {
      console.log('Loading healthcare stocks...');
      
      // Check cache first
      const cachedStocks = this.getCachedStocks();
      if (cachedStocks && this.isCacheValid(cachedStocks.timestamp)) {
        console.log('Loading stocks from cache');
        this.healthcareStocks = cachedStocks.data;
        this.renderStocks();
        return;
      }

      // Fetch stock data for healthcare companies (4 stocks)
      const stockPromises = this.healthcareStockSymbols.slice(0, 4).map(symbol => 
        this.fetchStockData(symbol)
      );
      
      const stockResults = await Promise.allSettled(stockPromises);
      this.healthcareStocks = stockResults
        .filter(result => result.status === 'fulfilled' && result.value)
        .map(result => result.value)
        .filter(stock => stock !== null);
      
      // Cache the data
      this.setCachedStocks(this.healthcareStocks);
      this.renderStocks();
      
      console.log(`Loaded ${this.healthcareStocks.length} healthcare stocks`);
    } catch (error) {
      console.error('Error loading healthcare stocks:', error);
      // Use mock stock data as fallback
      this.healthcareStocks = this.getMockStockData();
      this.renderStocks();
    }
  }

  /**
   * Fetch individual stock data from Polygon.io
   */
  async fetchStockData(symbol) {
    try {
      // Get current stock price
      const response = await fetch(
        `${this.POLYGON_BASE_URL}/aggs/ticker/${symbol}/prev?adjusted=true&apikey=${this.POLYGON_API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error(`Polygon API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status === 'OK' && data.results && data.results.length > 0) {
        const result = data.results[0];
        const change = result.c - result.o;
        const changePercent = ((change / result.o) * 100);
        
        return {
          symbol: symbol,
          name: this.getCompanyName(symbol),
          price: result.c.toFixed(2),
          change: change.toFixed(2),
          changePercent: changePercent.toFixed(2),
          volume: result.v
        };
      }
      
      return null;
    } catch (error) {
      console.warn(`Failed to fetch data for ${symbol}:`, error);
      return null;
    }
  }

  /**
   * Get company name for stock symbol
   */
  getCompanyName(symbol) {
    const companies = {
      'UNH': 'UnitedHealth Group',
      'PFE': 'Pfizer Inc.',
      'JNJ': 'Johnson & Johnson',
      'LLY': 'Eli Lilly and Company'
    };
    return companies[symbol] || symbol;
  }

  /**
   * Get mock stock data for fallback
   */
  getMockStockData() {
    return [
      { symbol: 'UNH', name: 'UnitedHealth Group', price: '485.20', change: '8.75', changePercent: '1.84', volume: 3200000 },
      { symbol: 'PFE', name: 'Pfizer Inc.', price: '35.80', change: '-0.85', changePercent: '-2.32', volume: 45000000 },
      { symbol: 'JNJ', name: 'Johnson & Johnson', price: '162.45', change: '2.15', changePercent: '1.34', volume: 12500000 },
      { symbol: 'LLY', name: 'Eli Lilly and Company', price: '798.50', change: '15.25', changePercent: '1.95', volume: 2800000 }
    ];
  }

  /**
   * Render healthcare stocks
   */
  renderStocks() {
    if (!this.elements.stocksGrid || !this.healthcareStocks.length) return;

    const stocksHTML = this.healthcareStocks.map(stock => {
      const isPositive = parseFloat(stock.change) >= 0;
      const changeClass = isPositive ? 'positive' : 'negative';
      const changeIcon = isPositive ? '📈' : '📉';
      
      return `
        <div class="stock-card" data-symbol="${stock.symbol}" data-aos="fade-up" data-aos-delay="100">
          <div class="stock-symbol">${stock.symbol}</div>
          <div class="stock-name">${stock.name}</div>
          <div class="stock-price">$${stock.price}</div>
          <div class="stock-change ${changeClass}">
            ${changeIcon} ${isPositive ? '+' : ''}${stock.change} (${isPositive ? '+' : ''}${stock.changePercent}%)
          </div>
        </div>
      `;
    }).join('');
    
    this.elements.stocksGrid.innerHTML = stocksHTML;
    
    // Add click event listeners for stock cards
    this.setupStockCardListeners();
  }

  /**
   * Setup click listeners for stock cards
   */
  setupStockCardListeners() {
    const stockCards = document.querySelectorAll('.stock-card');
    stockCards.forEach(card => {
      card.addEventListener('click', (e) => {
        this.createRippleEffect(e, card);
        const symbol = card.dataset.symbol;
        this.openStockModal(symbol);
      });
    });
  }

  /**
   * Create ripple effect on click
   */
  createRippleEffect(event, element) {
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    
    element.appendChild(ripple);
    
    setTimeout(() => {
      ripple.remove();
    }, 600);
  }

  /**
   * Open stock detail modal
   */
  openStockModal(symbol) {
    const stock = this.healthcareStocks.find(s => s.symbol === symbol);
    if (!stock) return;

    const modal = document.getElementById('stockModal');
    const isPositive = parseFloat(stock.change) >= 0;
    const changeClass = isPositive ? 'positive' : 'negative';
    const changeIcon = isPositive ? '📈' : '📉';

    // Update modal content
    document.getElementById('modalSymbol').textContent = stock.symbol;
    document.getElementById('modalName').textContent = stock.name;
    document.getElementById('modalPrice').textContent = `$${stock.price}`;
    
    const modalChange = document.getElementById('modalChange');
    modalChange.innerHTML = `<span class="${changeClass}">${changeIcon} ${isPositive ? '+' : ''}${stock.change} (${isPositive ? '+' : ''}${stock.changePercent}%)</span>`;
    
    // Update additional details
    this.updateStockDetails(stock);
    
    // Show modal with animation
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Create and render stock chart
    setTimeout(() => {
      this.renderStockChart(stock.symbol);
    }, 300);
  }

  /**
   * Update stock details in modal
   */
  updateStockDetails(stock) {
    const formatVolume = (volume) => {
      if (volume >= 1000000) {
        return (volume / 1000000).toFixed(1) + 'M';
      } else if (volume >= 1000) {
        return (volume / 1000).toFixed(1) + 'K';
      }
      return volume.toString();
    };

    // Mock additional data for demonstration
    const additionalData = this.getAdditionalStockData(stock.symbol);
    
    document.getElementById('modalVolume').textContent = formatVolume(stock.volume);
    document.getElementById('modalMarketCap').textContent = additionalData.marketCap;
    document.getElementById('modalPE').textContent = additionalData.pe;
    document.getElementById('modal52High').textContent = additionalData.high52w;
    document.getElementById('modal52Low').textContent = additionalData.low52w;
    document.getElementById('modalDividend').textContent = additionalData.dividend;
  }

  /**
   * Get additional stock data (mock data for demo)
   */
  getAdditionalStockData(symbol) {
    const mockData = {
      'UNH': { marketCap: '$269.9B', pe: '25.1', high52w: '$629.12', low52w: '$445.72', dividend: '1.3%' },
      'PFE': { marketCap: '$131.8B', pe: '12.4', high52w: '$45.90', low52w: '$28.50', dividend: '5.9%' },
      'JNJ': { marketCap: '$368.8B', pe: '15.8', high52w: '$175.20', low52w: '$142.80', dividend: '2.8%' },
      'LLY': { marketCap: '$645.0B', pe: '125.8', high52w: '$972.53', low52w: '$527.27', dividend: '1.5%' }
    };
    
    return mockData[symbol] || { marketCap: 'N/A', pe: 'N/A', high52w: 'N/A', low52w: 'N/A', dividend: 'N/A' };
  }

  /**
   * Render stock chart using Chart.js
   */
  renderStockChart(symbol) {
    const canvas = document.getElementById('stockChart');
    const ctx = canvas.getContext('2d');
    
    // Clear any existing chart
    if (window.stockChartInstance) {
      window.stockChartInstance.destroy();
    }
    
    // Generate mock chart data (30 days)
    const chartData = this.generateChartData(symbol);
    
    window.stockChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: chartData.labels,
        datasets: [{
          label: symbol,
          data: chartData.prices,
          borderColor: '#60a5fa',
          backgroundColor: 'rgba(96, 165, 250, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: '#60a5fa',
          pointHoverBorderColor: '#ffffff',
          pointHoverBorderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          x: {
            display: false
          },
          y: {
            display: true,
            grid: {
              color: 'rgba(71, 85, 105, 0.4)',
              borderColor: 'rgba(71, 85, 105, 0.4)'
            },
            ticks: {
              color: '#94a3b8',
              fontSize: 12
            }
          }
        },
        interaction: {
          intersect: false,
          mode: 'index'
        }
      }
    });
  }

  /**
   * Generate mock chart data
   */
  generateChartData(symbol) {
    const labels = [];
    const prices = [];
    const basePrice = parseFloat(this.healthcareStocks.find(s => s.symbol === symbol)?.price || 100);
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      labels.push(date.toLocaleDateString());
      
      // Generate realistic price fluctuation
      const variation = (Math.random() - 0.5) * 0.1; // ±5% variation
      const price = basePrice * (1 + variation * (i / 30));
      prices.push(price.toFixed(2));
    }
    
    return { labels, prices };
  }

  /**
   * Close stock modal
   */
  closeStockModal() {
    const modal = document.getElementById('stockModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
    
    // Destroy chart if it exists
    if (window.stockChartInstance) {
      window.stockChartInstance.destroy();
      window.stockChartInstance = null;
    }
  }

  /**
   * Load healthcare news from NewsAPI.org with enhanced healthcare filtering
   */
  async loadNews() {
    if (this.isLoading) return;
    
    this.isLoading = true;
    this.showLoading();

    try {
      // Check cache first
      const cachedData = this.getCachedData();
      if (cachedData && this.isCacheValid(cachedData.timestamp)) {
        console.log('Loading news from cache');
        this.processNewsData(cachedData.data);
        return;
      }

      // Try to fetch from NewsAPI.org with healthcare focus
      try {
        const articles = await this.fetchHealthcareNews();
        
        if (articles && articles.length > 0) {
          // Cache the data
          this.setCachedData(articles);
          this.processNewsData(articles);
          console.log(`Successfully loaded ${articles.length} healthcare articles from NewsAPI.org`);
        } else {
          throw new Error('No healthcare articles returned from API');
        }
      } catch (apiError) {
        console.warn('NewsAPI.org failed, using mock healthcare data:', apiError.message);
        
        // Fallback to mock healthcare data
        this.processNewsData(this.mockHealthcareNews);
        console.log('Using mock healthcare data as fallback');
      }

    } catch (error) {
      console.error('Error loading healthcare news:', error);
      
      // Last resort - try mock data
      try {
        this.processNewsData(this.mockHealthcareNews);
        console.log('Fallback to mock healthcare data successful');
      } catch (mockError) {
        console.error('Failed to load even mock healthcare data:', mockError);
        this.showError();
      }
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Fetch healthcare news with improved healthcare filtering
   */
  async fetchHealthcareNews() {
    const healthcareQueries = [
      // Healthcare policy and regulation
      'healthcare policy OR "health policy" OR medicare OR medicaid OR FDA OR "healthcare reform"',
      // Medical research and pharmaceuticals
      '"medical research" OR "clinical trial" OR pharmaceutical OR biotech OR "drug development"',
      // Public health and disease
      '"public health" OR pandemic OR vaccine OR CDC OR WHO OR "health crisis"',
      // Healthcare industry and companies
      '"healthcare company" OR "medical device" OR "health insurance" OR pharma'
    ];

    for (const query of healthcareQueries) {
      try {
        console.log(`Trying healthcare query: ${query}`);
        
        const response = await this.makeAPIRequest('everything', {
          q: query,
          language: 'en',
          sortBy: 'publishedAt',
          pageSize: 50,
          domains: 'reuters.com,apnews.com,bloomberg.com,wsj.com,nytimes.com,washingtonpost.com,cnn.com,bbc.com'
        });
        
        if (response.articles && response.articles.length > 0) {
          // Filter for healthcare relevance
          const healthcareArticles = response.articles.filter(article => 
            this.isHealthcareRelevant(article)
          );
          
          if (healthcareArticles.length > 0) {
            return this.processAPIResponse(healthcareArticles);
          }
        }
      } catch (error) {
        console.warn(`Healthcare query failed: ${query}`, error.message);
        continue;
      }
    }

    throw new Error('All healthcare queries failed');
  }

  /**
   * Check if article is healthcare relevant
   */
  isHealthcareRelevant(article) {
    const text = `${article.title} ${article.description}`.toLowerCase();
    
    const healthcareKeywords = [
      'health', 'medical', 'medicine', 'healthcare', 'hospital', 'doctor', 'patient',
      'disease', 'treatment', 'therapy', 'pharmaceutical', 'drug', 'vaccine',
      'clinical', 'medicare', 'medicaid', 'fda', 'cdc', 'who', 'biotech',
      'pharmacy', 'nursing', 'surgery', 'diagnosis', 'symptom', 'cure'
    ];
    
    return healthcareKeywords.some(keyword => text.includes(keyword));
  }

  /**
   * Make API request to NewsAPI.org with proper CORS handling
   */
  async makeAPIRequest(endpoint, params) {
    const url = new URL(`${this.NEWS_API_BASE_URL}/${endpoint}`);
    
    // Add API key and parameters
    url.searchParams.append('apiKey', this.NEWS_API_KEY);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    const requestOptions = {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    };

    const response = await fetch(url, requestOptions);

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Invalid API key. Please check your NewsAPI.org API key.');
      } else if (response.status === 429) {
        throw new Error('API rate limit exceeded. Please try again later.');
      } else if (response.status === 426) {
        throw new Error('HTTPS required. Please upgrade to a paid NewsAPI plan for HTTPS access.');
      } else {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
    }

    const data = await response.json();
    
    if (data.status !== 'ok') {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  }

  /**
   * Process and clean API response
   */
  processAPIResponse(articles) {
    return articles
      .filter(article => this.isValidArticle(article))
      .map(article => this.transformArticle(article))
      .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
  }

  /**
   * Validate if article meets quality criteria
   */
  isValidArticle(article) {
    return (
      article.title &&
      article.title !== '[Removed]' &&
      article.description &&
      article.description !== '[Removed]' &&
      article.url &&
      article.publishedAt &&
      article.source &&
      article.source.name &&
      !article.title.toLowerCase().includes('removed') &&
      this.isHealthcareRelevant(article)
    );
  }

  /**
   * Transform article data to our format
   */
  transformArticle(article) {
    return {
      id: this.generateId(),
      title: this.sanitizeText(article.title),
      description: this.sanitizeText(article.description),
      content: article.content ? this.sanitizeText(article.content) : null,
      url: article.url,
      urlToImage: article.urlToImage || this.getPlaceholderImage(),
      publishedAt: article.publishedAt,
      source: {
        name: article.source.name,
        id: article.source.id
      },
      author: article.author || 'Staff Writer',
      category: this.categorizeHealthcareArticle(article.title, article.description)
    };
  }

  /**
   * Categorize healthcare article based on content
   */
  categorizeHealthcareArticle(title, description) {
    const text = `${title} ${description}`.toLowerCase();
    
    for (const [category, terms] of Object.entries(this.healthcareTerms)) {
      if (terms.some(term => text.includes(term.toLowerCase()))) {
        return category;
      }
    }
    
    return 'general';
  }

  /**
   * Get placeholder image for articles without images
   */
  getPlaceholderImage() {
    const placeholders = [
      'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1584515933487-779824d29309?w=600&h=400&fit=crop'
    ];
    return placeholders[Math.floor(Math.random() * placeholders.length)];
  }

  /**
   * Process loaded news data and update statistics
   */
  processNewsData(articles) {
    this.allNews = articles;
    
    // Set featured article (most recent)
    this.featuredArticle = articles[0];
    
    // Remove featured article from grid articles
    this.filteredNews = articles.slice(1);
    
    // Calculate statistics
    this.calculateNewsStats();
    
    this.applyFilters();
    this.renderFeaturedArticle();
    this.renderNews();
    this.updateStatsDisplay();
    this.showContent();
  }

  /**
   * Calculate news statistics
   */
  calculateNewsStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    this.newsStats = {
      total: this.allNews.length,
      today: this.allNews.filter(article => {
        const articleDate = new Date(article.publishedAt);
        articleDate.setHours(0, 0, 0, 0);
        return articleDate.getTime() === today.getTime();
      }).length,
      policy: this.allNews.filter(article => article.category === 'policy').length,
      research: this.allNews.filter(article => article.category === 'research').length
    };
  }

  /**
   * Update statistics display
   */
  updateStatsDisplay() {
    if (this.elements.totalArticles) {
      this.elements.totalArticles.textContent = this.newsStats.total;
    }
    if (this.elements.todayArticles) {
      this.elements.todayArticles.textContent = this.newsStats.today;
    }
    if (this.elements.policyArticles) {
      this.elements.policyArticles.textContent = this.newsStats.policy;
    }
    if (this.elements.researchArticles) {
      this.elements.researchArticles.textContent = this.newsStats.research;
    }
  }

  /**
   * Apply current search and filter criteria
   */
  applyFilters() {
    let filtered = this.allNews.slice(1); // Exclude featured article

    // Apply search filter
    if (this.currentSearch) {
      const searchTerm = this.currentSearch.toLowerCase();
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(searchTerm) ||
        article.description.toLowerCase().includes(searchTerm) ||
        article.source.name.toLowerCase().includes(searchTerm)
      );
    }

    // Apply category filter
    if (this.currentFilter !== 'all') {
      filtered = filtered.filter(article => article.category === this.currentFilter);
    }

    this.filteredNews = filtered;
    this.currentPage = 1; // Reset to first page
  }

  /**
   * Search news articles
   */
  searchNews(query) {
    this.currentSearch = query.trim();
    this.applyFilters();
    this.renderNews();
    
    // Update URL without reload
    try {
      const url = new URL(window.location);
      if (query) {
        url.searchParams.set('search', query);
      } else {
        url.searchParams.delete('search');
      }
      window.history.replaceState({}, '', url);
    } catch (error) {
      console.warn('Failed to update URL:', error);
    }
  }

  /**
   * Filter news by category
   */
  filterNews(filter) {
    this.currentFilter = filter;
    this.applyFilters();
    this.renderNews();
    
    // Update URL without reload
    try {
      const url = new URL(window.location);
      if (filter !== 'all') {
        url.searchParams.set('filter', filter);
      } else {
        url.searchParams.delete('filter');
      }
      window.history.replaceState({}, '', url);
    } catch (error) {
      console.warn('Failed to update URL:', error);
    }
  }

  /**
   * Render featured article
   */
  renderFeaturedArticle() {
    if (!this.featuredArticle || !this.elements.featuredContainer) return;

    const featured = this.featuredArticle;
    const formattedDate = this.formatDate(featured.publishedAt);
    const safeImageUrl = this.ensureImageUrl(featured.urlToImage);
    
    this.elements.featuredContainer.innerHTML = `
      <div class="featured-card">
        <div class="featured-content">
          <div class="featured-image">
            <img src="${safeImageUrl}" alt="${this.escapeHtml(featured.title)}" loading="lazy" 
                 onerror="this.src='${this.getPlaceholderImage()}'">
          </div>
          <div class="featured-text">
            <div class="featured-meta">
              <span class="featured-category">${this.formatCategory(featured.category)}</span>
              <span class="featured-date">${formattedDate}</span>
            </div>
            <h2 class="featured-title">${this.escapeHtml(featured.title)}</h2>
            <p class="featured-description">${this.escapeHtml(featured.description)}</p>
            <a href="${featured.url}" target="_blank" rel="noopener" class="featured-link">
              Read Full Story
              <span>→</span>
            </a>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render news grid
   */
  renderNews() {
    if (!this.elements.grid) return;

    const startIndex = (this.currentPage - 1) * this.ITEMS_PER_PAGE;
    const endIndex = startIndex + this.ITEMS_PER_PAGE;
    const pageArticles = this.filteredNews.slice(startIndex, endIndex);
    
    if (pageArticles.length === 0) {
      this.showEmpty();
      return;
    }

    const newsHTML = pageArticles.map((article, index) => 
      this.createNewsCard(article, index)
    ).join('');
    
    this.elements.grid.innerHTML = newsHTML;
    
    // Update pagination
    const totalPages = Math.ceil(this.filteredNews.length / this.ITEMS_PER_PAGE);
    this.updatePagination(totalPages);
    
    // Animate cards
    this.animateCards();
    
    this.showContent();
  }

  /**
   * Create individual news card
   */
  createNewsCard(article, index) {
    const formattedDate = this.formatDate(article.publishedAt);
    const category = this.formatCategory(article.category);
    const safeImageUrl = this.ensureImageUrl(article.urlToImage);
    
    return `
      <article class="news-card fade-in-up" style="animation-delay: ${index * 0.1}s" data-aos="fade-up" data-aos-delay="${index * 100}">
        <div class="card-image">
          <img src="${safeImageUrl}" alt="${this.escapeHtml(article.title)}" loading="lazy" 
               onerror="this.src='${this.getPlaceholderImage()}'">
        </div>
        <div class="card-content">
          <div class="card-meta">
            <span class="card-category">${category}</span>
            <span class="card-date">${formattedDate}</span>
          </div>
          <h3 class="card-title">${this.escapeHtml(article.title)}</h3>
          <p class="card-description">${this.escapeHtml(article.description)}</p>
          <div class="card-footer">
            <span class="card-source">${this.escapeHtml(article.source.name)}</span>
            <a href="${article.url}" target="_blank" rel="noopener" class="read-more">Read More</a>
          </div>
        </div>
      </article>
    `;
  }

  /**
   * Ensure image URL is valid and safe
   */
  ensureImageUrl(url) {
    if (!url || typeof url !== 'string') {
      return this.getPlaceholderImage();
    }
    
    try {
      new URL(url);
      return url;
    } catch {
      return this.getPlaceholderImage();
    }
  }

  /**
   * Escape HTML to prevent XSS
   */
  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Format date for display
   */
  formatDate(dateString) {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        return 'Yesterday';
      } else if (diffDays < 7) {
        return `${diffDays} days ago`;
      } else {
        return date.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        });
      }
    } catch (error) {
      console.warn('Error formatting date:', error);
      return 'Recently';
    }
  }

  /**
   * Format category for display
   */
  formatCategory(category) {
    const categoryMap = {
      policy: 'Health Policy',
      research: 'Medical Research',
      public: 'Public Health',
      pharma: 'Pharmaceuticals',
      general: 'Healthcare'
    };
    return categoryMap[category] || 'Healthcare';
  }

  /**
   * Animate news cards with staggered entrance
   */
  animateCards() {
    const cards = this.elements.grid.querySelectorAll('.news-card');
    
    // Reset animation classes
    cards.forEach(card => {
      card.classList.remove('visible');
    });
    
    // Trigger animations with stagger
    setTimeout(() => {
      cards.forEach((card, index) => {
        setTimeout(() => {
          card.classList.add('visible');
        }, index * 100);
      });
    }, 100);
  }

  /**
   * Update pagination controls
   */
  updatePagination(totalPages) {
    if (!this.elements.pagination || !this.elements.paginationInfo) return;

    if (totalPages <= 1) {
      this.elements.pagination.style.display = 'none';
      return;
    }

    this.elements.pagination.style.display = 'flex';
    this.elements.paginationInfo.textContent = `Page ${this.currentPage} of ${totalPages}`;
    
    if (this.elements.prevBtn) {
      this.elements.prevBtn.disabled = this.currentPage === 1;
    }
    if (this.elements.nextBtn) {
      this.elements.nextBtn.disabled = this.currentPage === totalPages;
    }
  }

  /**
   * Navigate to previous page
   */
  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.renderNews();
      this.scrollToTop();
    }
  }

  /**
   * Navigate to next page
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
   * Scroll to top of page smoothly
   */
  scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  /**
   * Show loading state
   */
  showLoading() {
    this.hideAllStates();
    if (this.elements.loading) {
      this.elements.loading.style.display = 'block';
    }
  }

  /**
   * Show error state
   */
  showError() {
    this.hideAllStates();
    if (this.elements.error) {
      this.elements.error.style.display = 'block';
    }
  }

  /**
   * Show empty state
   */
  showEmpty() {
    this.hideAllStates();
    if (this.elements.empty) {
      this.elements.empty.style.display = 'block';
    }
  }

  /**
   * Show content (grid and featured)
   */
  showContent() {
    this.hideAllStates();
    if (this.elements.grid) {
      this.elements.grid.style.display = 'grid';
    }
    if (this.elements.featuredContainer) {
      this.elements.featuredContainer.style.display = 'block';
    }
    // Ensure loading state is hidden
    if (this.elements.loading) {
      this.elements.loading.style.display = 'none';
    }
  }

  /**
   * Hide all state containers
   */
  hideAllStates() {
    if (this.elements.loading) this.elements.loading.style.display = 'none';
    if (this.elements.error) this.elements.error.style.display = 'none';
    if (this.elements.empty) this.elements.empty.style.display = 'none';
    if (this.elements.grid) this.elements.grid.style.display = 'none';
    if (this.elements.featuredContainer) this.elements.featuredContainer.style.display = 'none';
  }

  /**
   * Cache management for news
   */
  getCachedData() {
    try {
      const cached = localStorage.getItem(this.CACHE_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.warn('Error reading cache:', error);
      return null;
    }
  }

  setCachedData(data) {
    try {
      const cacheObject = {
        data: data,
        timestamp: Date.now()
      };
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(cacheObject));
    } catch (error) {
      console.warn('Error setting cache:', error);
    }
  }

  /**
   * Cache management for stocks
   */
  getCachedStocks() {
    try {
      const cached = localStorage.getItem(this.STOCKS_CACHE_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.warn('Error reading stocks cache:', error);
      return null;
    }
  }

  setCachedStocks(data) {
    try {
      const cacheObject = {
        data: data,
        timestamp: Date.now()
      };
      localStorage.setItem(this.STOCKS_CACHE_KEY, JSON.stringify(cacheObject));
    } catch (error) {
      console.warn('Error setting stocks cache:', error);
    }
  }

  isCacheValid(timestamp) {
    return Date.now() - timestamp < this.CACHE_DURATION;
  }

  clearCache() {
    try {
      localStorage.removeItem(this.CACHE_KEY);
      localStorage.removeItem(this.STOCKS_CACHE_KEY);
    } catch (error) {
      console.warn('Error clearing cache:', error);
    }
  }

  /**
   * Utility functions
   */
  sanitizeText(text) {
    if (!text) return '';
    return text.replace(/<[^>]*>/g, '').trim();
  }

  generateId() {
    return 'article_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Public method to refresh news and stocks
   */
  async refresh() {
    this.clearCache();
    await Promise.all([
      this.loadNews(),
      this.loadStocks()
    ]);
  }

  /**
   * Refresh news with visual feedback and timestamp update
   */
  async refreshNews() {
    try {
      // Prevent multiple simultaneous refreshes
      if (this.isLoading) {
        console.log('Refresh already in progress...');
        return;
      }

      // Update refresh button to show loading state
      const refreshButton = this.elements.refreshButton;
      const refreshIcon = refreshButton?.querySelector('.refresh-icon');
      const refreshText = refreshButton?.querySelector('.refresh-text');
      
      if (refreshButton) {
        refreshButton.disabled = true;
        refreshButton.style.opacity = '0.7';
      }
      
      if (refreshIcon) {
        refreshIcon.style.animation = 'spin 1s linear infinite';
      }
      
      if (refreshText) {
        refreshText.textContent = 'Refreshing...';
      }

      // Clear cache and reload data
      this.clearCache();
      this.isLoading = true;
      
      // Show loading state
      this.showLoading();
      
      // Load fresh data
      await Promise.all([
        this.loadNews(),
        this.loadStocks()
      ]);
      
      // Update "last updated" timestamp
      this.updateLastUpdatedTime();
      
      // Success feedback
      this.showRefreshSuccess();
      
    } catch (error) {
      console.error('Failed to refresh news:', error);
      this.showRefreshError();
    } finally {
      // Reset refresh button state
      const refreshButton = this.elements.refreshButton;
      const refreshIcon = refreshButton?.querySelector('.refresh-icon');
      const refreshText = refreshButton?.querySelector('.refresh-text');
      
      if (refreshButton) {
        refreshButton.disabled = false;
        refreshButton.style.opacity = '1';
      }
      
      if (refreshIcon) {
        refreshIcon.style.animation = '';
      }
      
      if (refreshText) {
        refreshText.textContent = 'Refresh Latest News';
      }
      
      this.isLoading = false;
    }
  }

  /**
   * Update the last updated timestamp
   */
  updateLastUpdatedTime() {
    if (this.elements.lastUpdated) {
      const now = new Date();
      const timeString = now.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
      this.elements.lastUpdated.textContent = `Last updated: ${timeString}`;
    }
  }

  /**
   * Show success feedback after refresh
   */
  showRefreshSuccess() {
    const refreshButton = this.elements.refreshButton;
    if (refreshButton) {
      // Temporarily change button appearance to show success
      const originalBorderColor = refreshButton.style.borderColor;
      refreshButton.style.borderColor = '#10b981';
      refreshButton.style.background = 'rgba(16, 185, 129, 0.1)';
      
      setTimeout(() => {
        refreshButton.style.borderColor = originalBorderColor;
        refreshButton.style.background = '';
      }, 2000);
    }
  }

  /**
   * Show error feedback after failed refresh
   */
  showRefreshError() {
    const refreshButton = this.elements.refreshButton;
    if (refreshButton) {
      // Temporarily change button appearance to show error
      const originalBorderColor = refreshButton.style.borderColor;
      refreshButton.style.borderColor = '#ef4444';
      refreshButton.style.background = 'rgba(239, 68, 68, 0.1)';
      
      setTimeout(() => {
        refreshButton.style.borderColor = originalBorderColor;
        refreshButton.style.background = '';
      }, 3000);
    }
  }

  /**
   * Initialize from URL parameters
   */
  initFromURL() {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const search = urlParams.get('search');
      const filter = urlParams.get('filter');
      
      if (search && this.elements.searchInput) {
        this.elements.searchInput.value = search;
        this.currentSearch = search;
      }
      
      if (filter && filter !== 'all') {
        this.currentFilter = filter;
        const filterButton = document.querySelector(`[data-filter="${filter}"]`);
        if (filterButton) {
          document.querySelectorAll('.filter-button').forEach(btn => btn.classList.remove('active'));
          filterButton.classList.add('active');
        }
      }
    } catch (error) {
      console.warn('Error initializing from URL:', error);
    }
  }
}

// Initialize scroll animations observer
document.addEventListener('DOMContentLoaded', function() {
  // Intersection Observer for scroll animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, observerOptions);
  
  // Observe all fade-in-up elements
  const animateElements = document.querySelectorAll('.fade-in-up');
  animateElements.forEach(el => observer.observe(el));
});

// Export for global access
window.HealthcareNewsManager = HealthcareNewsManager; 