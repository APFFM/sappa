import crypto from 'crypto';

const AWS_ACCESS_KEY = import.meta.env.VITE_AWS_ACCESS_KEY;
const AWS_SECRET_KEY = import.meta.env.VITE_AWS_SECRET_KEY;
const AWS_PARTNER_TAG = import.meta.env.VITE_AWS_PARTNER_TAG;

class AmazonService {
  async searchProducts(keyword) {
    const params = {
      'Operation': 'SearchItems',
      'Keywords': keyword,
      'SearchIndex': 'Beauty',
      'ItemCount': 3,
      'Resources': [
        'Images.Primary.Medium',
        'ItemInfo.Title',
        'Offers.Listings.Price'
      ].join(',')
    };

    const url = this.generateSignedUrl(params);
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      return this.formatProducts(data.SearchResult.Items);
    } catch (error) {
      console.error('Amazon API error:', error);
      return [];
    }
  }

  formatProducts(items) {
    return items.map(item => ({
      name: item.ItemInfo.Title.DisplayValue,
      link: item.DetailPageURL,
      price: item.Offers?.Listings[0]?.Price?.DisplayAmount || 'Price unavailable',
      image: item.Images.Primary.Medium.URL
    }));
  }

  generateSignedUrl(params) {
    // Amazon API URL signing implementation
    // ... (AWS signature generation code)
  }
}

export default new AmazonService();
