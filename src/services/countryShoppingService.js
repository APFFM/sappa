/**
 * Country-Specific Shopping Links Service
 * Provides shopping URLs for different countries and budget tiers
 */

// Country-specific shopping sites
const COUNTRY_STORES = {
  'United States': {
    budget: [
      { name: 'Amazon', url: 'https://www.amazon.com/s?k=' },
      { name: 'Target', url: 'https://www.target.com/s?searchTerm=' },
      { name: 'Walmart', url: 'https://www.walmart.com/search?q=' },
      { name: 'CVS', url: 'https://www.cvs.com/shop?searchTerm=' }
    ],
    middle: [
      { name: 'Ulta', url: 'https://www.ulta.com/search?q=' },
      { name: 'Sephora', url: 'https://www.sephora.com/search?keyword=' },
      { name: 'Amazon', url: 'https://www.amazon.com/s?k=' },
      { name: 'Dermstore', url: 'https://www.dermstore.com/search?search=' }
    ],
    high: [
      { name: 'Sephora', url: 'https://www.sephora.com/search?keyword=' },
      { name: 'Nordstrom', url: 'https://www.nordstrom.com/sr?keyword=' },
      { name: 'Neiman Marcus', url: 'https://www.neimanmarcus.com/search.jsp?q=' },
      { name: 'SpaceNK', url: 'https://www.spacenk.com/us/search?q=' }
    ],
    luxury: [
      { name: 'Nordstrom', url: 'https://www.nordstrom.com/sr?keyword=' },
      { name: 'Neiman Marcus', url: 'https://www.neimanmarcus.com/search.jsp?q=' },
      { name: 'Bergdorf Goodman', url: 'https://www.bergdorfgoodman.com/search.jsp?q=' },
      { name: 'Net-a-Porter', url: 'https://www.net-a-porter.com/en-us/search?q=' }
    ]
  },
  'United Kingdom': {
    budget: [
      { name: 'Amazon UK', url: 'https://www.amazon.co.uk/s?k=' },
      { name: 'Boots', url: 'https://www.boots.com/search?text=' },
      { name: 'Superdrug', url: 'https://www.superdrug.com/search?text=' },
      { name: 'LookFantastic', url: 'https://www.lookfantastic.com/search?search=' }
    ],
    middle: [
      { name: 'LookFantastic', url: 'https://www.lookfantastic.com/search?search=' },
      { name: 'Cult Beauty', url: 'https://www.cultbeauty.co.uk/search?q=' },
      { name: 'Boots', url: 'https://www.boots.com/search?text=' },
      { name: 'SpaceNK', url: 'https://www.spacenk.com/uk/search?q=' }
    ],
    high: [
      { name: 'Harrods', url: 'https://www.harrods.com/en-gb/search?q=' },
      { name: 'Selfridges', url: 'https://www.selfridges.com/GB/en/search/?q=' },
      { name: 'Liberty London', url: 'https://www.libertylondon.com/uk/search?q=' },
      { name: 'Cult Beauty', url: 'https://www.cultbeauty.co.uk/search?q=' }
    ],
    luxury: [
      { name: 'Harrods', url: 'https://www.harrods.com/en-gb/search?q=' },
      { name: 'Selfridges', url: 'https://www.selfridges.com/GB/en/search/?q=' },
      { name: 'Net-a-Porter', url: 'https://www.net-a-porter.com/en-gb/search?q=' },
      { name: 'Harvey Nichols', url: 'https://www.harveynichols.com/search/?q=' }
    ]
  },
  'Canada': {
    budget: [
      { name: 'Amazon CA', url: 'https://www.amazon.ca/s?k=' },
      { name: 'Shoppers Drug Mart', url: 'https://shop.shoppersdrugmart.ca/search?text=' },
      { name: 'Well.ca', url: 'https://well.ca/searchresult.html?keyword=' },
      { name: 'Walmart CA', url: 'https://www.walmart.ca/search?q=' }
    ],
    middle: [
      { name: 'Sephora CA', url: 'https://www.sephora.com/ca/en/search?keyword=' },
      { name: 'Shoppers Drug Mart', url: 'https://shop.shoppersdrugmart.ca/search?text=' },
      { name: 'Amazon CA', url: 'https://www.amazon.ca/s?k=' },
      { name: 'The Bay', url: 'https://www.thebay.com/search?q=' }
    ],
    high: [
      { name: 'Sephora CA', url: 'https://www.sephora.com/ca/en/search?keyword=' },
      { name: 'Holt Renfrew', url: 'https://www.holtrenfrew.com/en/search?q=' },
      { name: 'The Bay', url: 'https://www.thebay.com/search?q=' },
      { name: 'Nordstrom CA', url: 'https://www.nordstrom.ca/sr?keyword=' }
    ],
    luxury: [
      { name: 'Holt Renfrew', url: 'https://www.holtrenfrew.com/en/search?q=' },
      { name: 'Nordstrom CA', url: 'https://www.nordstrom.ca/sr?keyword=' },
      { name: 'Net-a-Porter', url: 'https://www.net-a-porter.com/en-ca/search?q=' },
      { name: 'Saks Fifth Avenue', url: 'https://www.saksfifthavenue.com/search?q=' }
    ]
  },
  'Germany': {
    budget: [
      { name: 'Amazon DE', url: 'https://www.amazon.de/s?k=' },
      { name: 'DM', url: 'https://www.dm.de/search?query=' },
      { name: 'Rossmann', url: 'https://www.rossmann.de/de/search?text=' },
      { name: 'Douglas', url: 'https://www.douglas.de/de/search?query=' }
    ],
    middle: [
      { name: 'Douglas', url: 'https://www.douglas.de/de/search?query=' },
      { name: 'Flaconi', url: 'https://www.flaconi.de/suche/?q=' },
      { name: 'Amazon DE', url: 'https://www.amazon.de/s?k=' },
      { name: 'LookFantastic DE', url: 'https://www.lookfantastic.de/search?search=' }
    ],
    high: [
      { name: 'Douglas', url: 'https://www.douglas.de/de/search?query=' },
      { name: 'Breuninger', url: 'https://www.breuninger.com/de/search/?q=' },
      { name: 'Ludwig Beck', url: 'https://www.ludwigbeck.de/search?q=' },
      { name: 'KaDeWe', url: 'https://www.kadewe.de/search?q=' }
    ],
    luxury: [
      { name: 'KaDeWe', url: 'https://www.kadewe.de/search?q=' },
      { name: 'Breuninger', url: 'https://www.breuninger.com/de/search/?q=' },
      { name: 'Net-a-Porter', url: 'https://www.net-a-porter.com/en-de/search?q=' },
      { name: 'Oberpollinger', url: 'https://www.oberpollinger.de/search?q=' }
    ]
  },
  'France': {
    budget: [
      { name: 'Amazon FR', url: 'https://www.amazon.fr/s?k=' },
      { name: 'Nocibé', url: 'https://www.nocibe.fr/recherche?text=' },
      { name: 'Marionnaud', url: 'https://www.marionnaud.fr/search?text=' },
      { name: 'Monoprix', url: 'https://www.monoprix.fr/recherche?text=' }
    ],
    middle: [
      { name: 'Sephora FR', url: 'https://www.sephora.fr/search?keyword=' },
      { name: 'Nocibé', url: 'https://www.nocibe.fr/recherche?text=' },
      { name: 'Marionnaud', url: 'https://www.marionnaud.fr/search?text=' },
      { name: 'LookFantastic FR', url: 'https://www.lookfantastic.fr/search?search=' }
    ],
    high: [
      { name: 'Sephora FR', url: 'https://www.sephora.fr/search?keyword=' },
      { name: 'Galeries Lafayette', url: 'https://www.galerieslafayette.com/search/?text=' },
      { name: 'Le Bon Marché', url: 'https://www.24sevres.com/en-fr/search?q=' },
      { name: 'Printemps', url: 'https://www.printemps.com/fr/fr/search?q=' }
    ],
    luxury: [
      { name: 'Galeries Lafayette', url: 'https://www.galerieslafayette.com/search/?text=' },
      { name: 'Le Bon Marché', url: 'https://www.24sevres.com/en-fr/search?q=' },
      { name: 'Net-a-Porter', url: 'https://www.net-a-porter.com/en-fr/search?q=' },
      { name: 'Printemps', url: 'https://www.printemps.com/fr/fr/search?q=' }
    ]
  },
  'Australia': {
    budget: [
      { name: 'Chemist Warehouse', url: 'https://www.chemistwarehouse.com.au/search?searchtext=' },
      { name: 'Priceline', url: 'https://www.priceline.com.au/search?q=' },
      { name: 'Amazon AU', url: 'https://www.amazon.com.au/s?k=' },
      { name: 'Woolworths', url: 'https://www.woolworths.com.au/shop/search/products?searchTerm=' }
    ],
    middle: [
      { name: 'Mecca', url: 'https://www.mecca.com.au/search/?q=' },
      { name: 'Adore Beauty', url: 'https://www.adorebeauty.com.au/search?q=' },
      { name: 'Sephora AU', url: 'https://www.sephora.com.au/search?keyword=' },
      { name: 'Priceline', url: 'https://www.priceline.com.au/search?q=' }
    ],
    high: [
      { name: 'Mecca', url: 'https://www.mecca.com.au/search/?q=' },
      { name: 'David Jones', url: 'https://www.davidjones.com/search?q=' },
      { name: 'Sephora AU', url: 'https://www.sephora.com.au/search?keyword=' },
      { name: 'Adore Beauty', url: 'https://www.adorebeauty.com.au/search?q=' }
    ],
    luxury: [
      { name: 'David Jones', url: 'https://www.davidjones.com/search?q=' },
      { name: 'Myer', url: 'https://www.myer.com.au/search?query=' },
      { name: 'Net-a-Porter', url: 'https://www.net-a-porter.com/en-au/search?q=' },
      { name: 'Mecca', url: 'https://www.mecca.com.au/search/?q=' }
    ]
  },
  'Spain': {
    budget: [
      { name: 'Amazon ES', url: 'https://www.amazon.es/s?k=' },
      { name: 'Primor', url: 'https://www.primor.eu/search?q=' },
      { name: 'Carrefour', url: 'https://www.carrefour.es/search?q=' },
      { name: 'Mercadona', url: 'https://www.mercadona.es/search?q=' }
    ],
    middle: [
      { name: 'Sephora ES', url: 'https://www.sephora.es/search?keyword=' },
      { name: 'Primor', url: 'https://www.primor.eu/search?q=' },
      { name: 'Douglas ES', url: 'https://www.douglas.es/es/search?query=' },
      { name: 'Notino', url: 'https://www.notino.es/search/?q=' }
    ],
    high: [
      { name: 'El Corte Inglés', url: 'https://www.elcorteingles.es/search/?s=' },
      { name: 'Sephora ES', url: 'https://www.sephora.es/search?keyword=' },
      { name: 'Douglas ES', url: 'https://www.douglas.es/es/search?query=' },
      { name: 'Druni', url: 'https://www.druni.es/search?q=' }
    ],
    luxury: [
      { name: 'El Corte Inglés', url: 'https://www.elcorteingles.es/search/?s=' },
      { name: 'Net-a-Porter', url: 'https://www.net-a-porter.com/en-es/search?q=' },
      { name: 'Sephora ES', url: 'https://www.sephora.es/search?keyword=' },
      { name: 'Druni', url: 'https://www.druni.es/search?q=' }
    ]
  },
  // Default fallback for other countries
  'default': {
    budget: [
      { name: 'Amazon', url: 'https://www.amazon.com/s?k=' },
      { name: 'LookFantastic', url: 'https://www.lookfantastic.com/search?search=' },
      { name: 'iHerb', url: 'https://www.iherb.com/search?kw=' },
      { name: 'eBay', url: 'https://www.ebay.com/sch/i.html?_nkw=' }
    ],
    middle: [
      { name: 'LookFantastic', url: 'https://www.lookfantastic.com/search?search=' },
      { name: 'Cult Beauty', url: 'https://www.cultbeauty.co.uk/search?q=' },
      { name: 'Feelunique', url: 'https://www.feelunique.com/search?search=' },
      { name: 'Amazon', url: 'https://www.amazon.com/s?k=' }
    ],
    high: [
      { name: 'Net-a-Porter', url: 'https://www.net-a-porter.com/en-us/search?q=' },
      { name: 'LookFantastic', url: 'https://www.lookfantastic.com/search?search=' },
      { name: 'Cult Beauty', url: 'https://www.cultbeauty.co.uk/search?q=' },
      { name: 'SpaceNK', url: 'https://www.spacenk.com/us/search?q=' }
    ],
    luxury: [
      { name: 'Net-a-Porter', url: 'https://www.net-a-porter.com/en-us/search?q=' },
      { name: 'Harrods', url: 'https://www.harrods.com/en-gb/search?q=' },
      { name: 'Selfridges', url: 'https://www.selfridges.com/GB/en/search/?q=' },
      { name: 'Bergdorf Goodman', url: 'https://www.bergdorfgoodman.com/search.jsp?q=' }
    ]
  }
};

/**
 * Get shopping links for a specific country and budget
 */
export function getCountryShoppingLinks(country, budget, searchQuery) {
  const normalizedBudget = budget.toLowerCase();
  const stores = COUNTRY_STORES[country] || COUNTRY_STORES['default'];
  const tierStores = stores[normalizedBudget] || stores['middle'];

  const encodedQuery = encodeURIComponent(searchQuery);

  return tierStores.map(store => ({
    name: store.name,
    url: store.url + encodedQuery
  }));
}

/**
 * Get budget tier display info
 */
export function getBudgetTierInfo(budget) {
  const tiers = {
    budget: {
      label: '💰 Budget Friendly',
      range: 'Under $50 per product',
      description: 'Affordable drugstore and accessible brands'
    },
    middle: {
      label: '💎 Mid-Range',
      range: '$50 - $150 per product',
      description: 'Quality products from trusted brands'
    },
    high: {
      label: '✨ Premium',
      range: '$150 - $300 per product',
      description: 'High-end skincare and makeup'
    },
    luxury: {
      label: '👑 Luxury',
      range: '$300+ per product',
      description: 'Exclusive luxury brands and treatments'
    }
  };

  return tiers[budget.toLowerCase()] || tiers.middle;
}

/**
 * Get budget emoji
 */
export function getBudgetEmoji(budget) {
  const emojis = {
    budget: '💰',
    middle: '💎',
    high: '✨',
    luxury: '👑'
  };
  return emojis[budget.toLowerCase()] || '💎';
}

/**
 * Detect country from various formats
 */
export function normalizeCountryName(country) {
  const countryMap = {
    'usa': 'United States',
    'us': 'United States',
    'united states': 'United States',
    'america': 'United States',
    'uk': 'United Kingdom',
    'united kingdom': 'United Kingdom',
    'england': 'United Kingdom',
    'britain': 'United Kingdom',
    'ca': 'Canada',
    'canada': 'Canada',
    'de': 'Germany',
    'germany': 'Germany',
    'deutschland': 'Germany',
    'fr': 'France',
    'france': 'France',
    'au': 'Australia',
    'australia': 'Australia',
    'es': 'Spain',
    'spain': 'Spain',
    'españa': 'Spain'
  };

  const normalized = country.toLowerCase().trim();
  return countryMap[normalized] || country;
}
