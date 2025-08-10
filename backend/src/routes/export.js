const express = require('express');
const router = express.Router();
const Node = require('../models/Node');
const yaml = require('yaml');

// Export top nodes in various formats
router.get('/:format', async (req, res) => {
  try {
    const { format } = req.params;
    const limit = parseInt(req.query.limit) || 10;
    
    const topNodes = await Node.findTopPerforming(limit);
    
    if (topNodes.length === 0) {
      return res.status(404).json({ error: 'No nodes available for export' });
    }

    let exportData;
    let contentType = 'text/plain';
    let filename = `subscription.${format}`;

    switch (format.toLowerCase()) {
      case 'clash':
      case 'flclash':
        exportData = generateClashConfig(topNodes);
        contentType = 'application/x-yaml';
        filename = 'clash.yaml';
        break;
      
      case 'v2ray':
      case 'xray':
        exportData = generateV2RayConfig(topNodes);
        contentType = 'text/plain';
        filename = 'v2ray.txt';
        break;
      
      case 'ssr':
        exportData = generateSSRConfig(topNodes);
        contentType = 'text/plain';
        filename = 'ssr.txt';
        break;
      
      case 'ss':
      case 'shadowsocks':
        exportData = generateShadowsocksConfig(topNodes);
        contentType = 'text/plain';
        filename = 'shadowsocks.txt';
        break;
      
      case 'json':
        exportData = JSON.stringify(topNodes, null, 2);
        contentType = 'application/json';
        filename = 'nodes.json';
        break;
      
      default:
        return res.status(400).json({ error: `Unsupported export format: ${format}` });
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(exportData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get available export formats
router.get('/', async (req, res) => {
  try {
    const topNodes = await Node.findTopPerforming(10);
    
    res.json({
      available_formats: [
        'clash',
        'flclash', 
        'v2ray',
        'xray',
        'ssr',
        'shadowsocks',
        'json'
      ],
      total_nodes: topNodes.length,
      nodes: topNodes.map(node => ({
        id: node.id,
        name: node.name,
        type: node.type,
        latency: node.latency,
        last_tested: node.last_tested
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

function generateClashConfig(nodes) {
  const proxies = nodes.map(node => {
    try {
      return JSON.parse(node.config);
    } catch (e) {
      // If config is not valid JSON, create a basic proxy object
      return {
        name: node.name,
        type: node.type,
        server: 'unknown',
        port: 443
      };
    }
  });

  const config = {
    port: 7890,
    'socks-port': 7891,
    'allow-lan': false,
    mode: 'rule',
    'log-level': 'info',
    'external-controller': '127.0.0.1:9090',
    proxies: proxies,
    'proxy-groups': [
      {
        name: 'Proxy',
        type: 'select',
        proxies: ['Auto', ...proxies.map(p => p.name)]
      },
      {
        name: 'Auto',
        type: 'url-test',
        proxies: proxies.map(p => p.name),
        url: 'http://www.gstatic.com/generate_204',
        interval: 300
      }
    ],
    rules: [
      'DOMAIN-SUFFIX,google.com,Proxy',
      'DOMAIN-KEYWORD,youtube,Proxy',
      'DOMAIN-SUFFIX,facebook.com,Proxy',
      'DOMAIN-SUFFIX,twitter.com,Proxy',
      'GEOIP,CN,DIRECT',
      'MATCH,Proxy'
    ]
  };

  return yaml.stringify(config);
}

function generateV2RayConfig(nodes) {
  const configs = nodes.map(node => {
    if (node.config.startsWith('{')) {
      try {
        const config = JSON.parse(node.config);
        const vmessData = Buffer.from(JSON.stringify(config)).toString('base64');
        return `vmess://${vmessData}`;
      } catch (e) {
        return null;
      }
    }
    return node.config;
  }).filter(config => config !== null);

  return Buffer.from(configs.join('\n')).toString('base64');
}

function generateSSRConfig(nodes) {
  return nodes
    .filter(node => node.type === 'ssr')
    .map(node => node.config)
    .join('\n');
}

function generateShadowsocksConfig(nodes) {
  return nodes
    .filter(node => node.type === 'shadowsocks' || node.type === 'ss')
    .map(node => node.config)
    .join('\n');
}

module.exports = router;