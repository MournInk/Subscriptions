const axios = require('axios');
const yaml = require('yaml');

class SubscriptionParser {
  static async parseSubscription(url, type = 'auto') {
    try {
      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Subscription-Manager/1.0'
        }
      });

      const content = response.data;
      
      // Auto-detect format if not specified
      if (type === 'auto') {
        type = this.detectFormat(content);
      }

      switch (type) {
        case 'clash':
        case 'flclash':
          return this.parseClash(content);
        case 'v2ray':
        case 'xray':
          return this.parseV2Ray(content);
        case 'ssr':
          return this.parseSSR(content);
        case 'ss':
          return this.parseShadowsocks(content);
        default:
          throw new Error(`Unsupported subscription type: ${type}`);
      }
    } catch (error) {
      throw new Error(`Failed to parse subscription: ${error.message}`);
    }
  }

  static detectFormat(content) {
    if (typeof content === 'string') {
      if (content.includes('proxies:') || content.includes('proxy-groups:')) {
        return 'clash';
      }
      if (content.startsWith('ssr://')) {
        return 'ssr';
      }
      if (content.startsWith('ss://')) {
        return 'ss';
      }
      // Try to decode as base64 for v2ray
      try {
        const decoded = Buffer.from(content, 'base64').toString();
        if (decoded.includes('vmess://') || decoded.includes('vless://')) {
          return 'v2ray';
        }
      } catch (e) {
        // Not base64
      }
    }
    return 'clash'; // Default to clash
  }

  static parseClash(content) {
    try {
      const config = yaml.parse(content);
      const nodes = [];

      if (config.proxies) {
        config.proxies.forEach((proxy, index) => {
          const node = this.parseClashProxy(proxy, index);
          if (node) {
            nodes.push(node);
          }
        });
      }

      return {
        nodes,
        expires_at: this.extractExpiryFromClash(config)
      };
    } catch (error) {
      throw new Error(`Failed to parse Clash config: ${error.message}`);
    }
  }

  static parseClashProxy(proxy, index) {
    if (!proxy.type || !proxy.server) {
      return null;
    }

    return {
      name: proxy.name || `Node-${index + 1}`,
      type: proxy.type.toLowerCase(),
      config: JSON.stringify(proxy),
      source: 'clash'
    };
  }

  static parseV2Ray(content) {
    try {
      const decoded = Buffer.from(content, 'base64').toString();
      const lines = decoded.split('\n').filter(line => line.trim());
      const nodes = [];

      lines.forEach((line, index) => {
        const node = this.parseV2RayLine(line, index);
        if (node) {
          nodes.push(node);
        }
      });

      return { nodes, expires_at: null };
    } catch (error) {
      throw new Error(`Failed to parse V2Ray config: ${error.message}`);
    }
  }

  static parseV2RayLine(line, index) {
    try {
      if (line.startsWith('vmess://')) {
        const decoded = Buffer.from(line.replace('vmess://', ''), 'base64').toString();
        const config = JSON.parse(decoded);
        return {
          name: config.ps || `VMess-${index + 1}`,
          type: 'vmess',
          config: JSON.stringify(config),
          source: 'v2ray'
        };
      }
      
      if (line.startsWith('vless://')) {
        return {
          name: `VLess-${index + 1}`,
          type: 'vless',
          config: line,
          source: 'v2ray'
        };
      }

      if (line.startsWith('trojan://')) {
        return {
          name: `Trojan-${index + 1}`,
          type: 'trojan',
          config: line,
          source: 'v2ray'
        };
      }

      return null;
    } catch (error) {
      console.error(`Failed to parse V2Ray line: ${error.message}`);
      return null;
    }
  }

  static parseSSR(content) {
    try {
      const lines = content.split('\n').filter(line => line.trim() && line.startsWith('ssr://'));
      const nodes = lines.map((line, index) => ({
        name: `SSR-${index + 1}`,
        type: 'ssr',
        config: line,
        source: 'ssr'
      }));

      return { nodes, expires_at: null };
    } catch (error) {
      throw new Error(`Failed to parse SSR config: ${error.message}`);
    }
  }

  static parseShadowsocks(content) {
    try {
      const lines = content.split('\n').filter(line => line.trim() && line.startsWith('ss://'));
      const nodes = lines.map((line, index) => ({
        name: `SS-${index + 1}`,
        type: 'shadowsocks',
        config: line,
        source: 'shadowsocks'
      }));

      return { nodes, expires_at: null };
    } catch (error) {
      throw new Error(`Failed to parse Shadowsocks config: ${error.message}`);
    }
  }

  static extractExpiryFromClash(config) {
    // Look for expiry information in clash config
    if (config['subscription-userinfo']) {
      const userInfo = config['subscription-userinfo'];
      if (userInfo.expire) {
        return new Date(userInfo.expire * 1000);
      }
    }
    return null;
  }

  static validateNodes(nodes) {
    return nodes.filter(node => {
      return node.name && node.type && node.config;
    });
  }
}

module.exports = SubscriptionParser;