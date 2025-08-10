# Subscriptions

An automatic subscription manager for airport nodes with speed testing and export capabilities.

## Features

### Frontend
- **Dashboard**: UptimeKuma-style monitoring interface showing:
  - Number of active subscriptions
  - Total nodes count
  - Fast nodes (latency < 100ms)
  - Average latency across all nodes
  - Top performing nodes visualization

- **Import Interface**: 
  - Import subscriptions from URLs (supports Clash, V2Ray, SSR, Shadowsocks formats)
  - Add individual nodes manually
  - Auto-detection of subscription formats
  - Expiration checking for subscriptions

- **Export Interface**:
  - Export top performing nodes in various formats
  - Supported formats: Clash, FLClash, V2Ray, XRay, SSR, Shadowsocks, JSON
  - Configurable node count (1-50)
  - Preview functionality

### Backend
- **Subscription Management**: 
  - Parse various subscription formats (XRAY, V2RAY, Shadowsocks, FLClash, Trojan)
  - Handle different node types (Xhttp, Http, Shadowsocks, Vless, Vmess, Hysteria2, Trojan, Socks5, AnyTLS)
  - Automatic expiration checking and cleanup

- **Speed Testing**:
  - Automated speed testing every 5 minutes
  - 10 latency tests per node with averaging
  - Top 10 fastest nodes maintained for export
  - Manual speed testing via API

- **Database**: SQLite database storing subscriptions, nodes, and speed test results

## Quick Start

### Prerequisites
- Node.js 16+ and npm

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm run install:all
   ```

### Development
Run both frontend and backend:
```bash
npm run dev
```

Or run individually:
```bash
# Backend only (runs on port 3001)
npm run backend:dev

# Frontend only (runs on port 3000)
npm run frontend:dev
```

### Production Build
```bash
npm run build
```

## API Endpoints

### Subscriptions
- `GET /api/subscriptions` - List all subscriptions
- `POST /api/subscriptions` - Import new subscription
- `PUT /api/subscriptions/:id` - Update subscription
- `DELETE /api/subscriptions/:id` - Delete subscription
- `POST /api/subscriptions/:id/refresh` - Refresh subscription
- `GET /api/subscriptions/stats/summary` - Get subscription statistics

### Nodes
- `GET /api/nodes` - List all nodes
- `GET /api/nodes/active` - List active nodes with latency data
- `GET /api/nodes/top?limit=10` - Get top performing nodes
- `POST /api/nodes` - Add manual node
- `DELETE /api/nodes/:id` - Delete node
- `POST /api/nodes/:id/test` - Test single node
- `POST /api/nodes/test-all` - Test all nodes
- `GET /api/nodes/stats` - Get node statistics

### Export
- `GET /api/export` - List available export formats and nodes
- `GET /api/export/:format?limit=10` - Export nodes in specified format

### Health
- `GET /api/health` - API health check

## Supported Formats

### Import Formats
- **Clash/FLClash**: YAML configuration files
- **V2Ray/XRay**: Base64 encoded subscription links
- **ShadowsocksR**: SSR:// links
- **Shadowsocks**: SS:// links
- **Auto-detection**: Automatically detect format from content

### Export Formats
- **Clash**: YAML configuration with proxy groups and rules
- **FLClash**: FLClash-compatible YAML
- **V2Ray**: Base64 encoded vmess/vless links
- **XRay**: XRay-compatible format
- **SSR**: ShadowsocksR links
- **Shadowsocks**: Shadowsocks links
- **JSON**: Raw node data in JSON format

### Supported Node Types
- VMess
- VLess  
- Trojan
- Shadowsocks
- ShadowsocksR
- Hysteria2
- Socks5
- HTTP/HTTPS
- AnyTLS

## Architecture

```
Frontend (React + Material-UI)
    ↕ HTTP API
Backend (Node.js + Express)
    ↕ SQLite Database
    ↕ External Subscription URLs
```

## Testing

```bash
# Run all tests
npm test

# Backend tests only
npm run backend:test

# Frontend tests only  
npm run frontend:test
```

## License

MIT License
