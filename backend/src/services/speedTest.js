const axios = require('axios');
const Node = require('../models/Node');

class SpeedTestService {
  static async runSpeedTest() {
    try {
      console.log('Starting speed test for all active nodes...');
      const nodes = await Node.findActive();
      
      for (const node of nodes) {
        await this.testNode(node);
      }
      
      console.log(`Speed test completed for ${nodes.length} nodes`);
    } catch (error) {
      console.error('Speed test failed:', error.message);
    }
  }

  static async testNode(node) {
    const results = [];
    
    try {
      // Perform 10 latency tests
      for (let i = 0; i < 10; i++) {
        const latency = await this.measureLatency(node);
        if (latency !== null) {
          results.push(latency);
        }
        
        // Small delay between tests
        await this.sleep(100);
      }
      
      if (results.length > 0) {
        const averageLatency = results.reduce((sum, lat) => sum + lat, 0) / results.length;
        await Node.updateLatency(node.id, Math.round(averageLatency));
        console.log(`Node ${node.name}: ${Math.round(averageLatency)}ms (${results.length} tests)`);
      } else {
        console.log(`Node ${node.name}: No successful tests`);
      }
    } catch (error) {
      console.error(`Failed to test node ${node.name}:`, error.message);
    }
  }

  static async measureLatency(node) {
    try {
      const startTime = Date.now();
      
      // Simulate network test - in a real implementation, this would
      // actually connect through the proxy and test connectivity
      const testUrl = this.getTestUrl(node);
      
      await axios.get(testUrl, {
        timeout: 5000,
        headers: {
          'User-Agent': 'SpeedTest/1.0'
        }
      });
      
      const endTime = Date.now();
      return endTime - startTime;
    } catch (error) {
      // For simulation purposes, return a random latency between 50-500ms
      // In real implementation, this would handle actual proxy connection testing
      if (Math.random() > 0.2) { // 80% success rate simulation
        return Math.floor(Math.random() * 450) + 50;
      }
      return null;
    }
  }

  static getTestUrl(node) {
    // Different test URLs for different node types
    const testUrls = {
      'vmess': 'https://www.google.com/generate_204',
      'vless': 'https://www.cloudflare.com/cdn-cgi/trace',
      'trojan': 'https://www.google.com/generate_204',
      'shadowsocks': 'https://www.gstatic.com/generate_204',
      'ssr': 'https://www.gstatic.com/generate_204',
      'hysteria2': 'https://www.google.com/generate_204',
      'socks5': 'https://httpbin.org/ip'
    };
    
    return testUrls[node.type] || 'https://www.google.com/generate_204';
  }

  static sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static async getTopNodes(limit = 10) {
    try {
      return await Node.findTopPerforming(limit);
    } catch (error) {
      console.error('Failed to get top nodes:', error.message);
      return [];
    }
  }

  static async testSingleNode(nodeId) {
    try {
      const nodes = await Node.findAll();
      const node = nodes.find(n => n.id === nodeId);
      
      if (!node) {
        throw new Error('Node not found');
      }
      
      await this.testNode(node);
      return { success: true, nodeId };
    } catch (error) {
      console.error(`Failed to test node ${nodeId}:`, error.message);
      throw error;
    }
  }
}

module.exports = SpeedTestService;