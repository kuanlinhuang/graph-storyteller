# Graph Storyteller 📊

An interactive network visualization tool that brings your data to life through beautiful, customizable graph visualizations. Built with React, TypeScript, D3.js, and React Flow.

![Networks Visualized](https://img.shields.io/badge/Networks%20Visualized-Dynamic%20Counter-blue)
![Build Status](https://img.shields.io/badge/Build-Passing-green)
![License](https://img.shields.io/badge/License-MIT-blue)

## ✨ Features

### 🎨 **Dual Visualization Engines**
- **D3.js Force-Directed Layout**: Physics-based simulations with customizable forces
- **React Flow**: Interactive node-edge diagrams with drag-and-drop functionality

### 📁 **Flexible Data Input**
- **JSON Upload**: Support for structured network data files
- **CSV/Tabular Data**: Parse tabular data into network relationships
- **Sample Datasets**: Pre-loaded examples including 3-layer neural networks
- **Real-time Validation**: Instant feedback on data format and structure

### 🎛️ **Advanced Customization**
- **Node Styling**: Adjustable sizes, colors, and labels
- **Edge Properties**: Weight-based thickness, directional arrows, custom colors
- **Layout Controls**: Force strength, link distance, and collision detection
- **Interactive Elements**: Click, drag, zoom, and pan functionality

### 📊 **Export & Analytics**
- **Multiple Export Formats**: SVG and PDF export capabilities
- **Usage Tracking**: Built-in counter for networks visualized
- **Data Management**: Import, export, and clear functionality

### 🎯 **User Experience**
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Dark/Light Theme**: Adaptive UI with modern design
- **Real-time Feedback**: Toast notifications and status updates
- **Accessibility**: Keyboard navigation and screen reader support

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Modern web browser with ES6+ support

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd graph-storyteller

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:8080`

### First Steps
1. **Load Sample Data**: Click "Load Sample Data" to see the tool in action
2. **Upload Your Data**: Use the JSON or CSV upload tabs to import your network
3. **Customize**: Adjust visualization parameters in the control panel
4. **Export**: Save your visualization as SVG or PDF

## 📋 Data Format

### JSON Format
```json
{
  "nodes": [
    {
      "id": "unique-id",
      "label": "Display Name",
      "type": "server|database|user|service",
      "metadata": {
        "key": "value"
      }
    }
  ],
  "edges": [
    {
      "id": "unique-edge-id",
      "source": "source-node-id",
      "target": "target-node-id",
      "label": "Connection Type",
      "weight": 2,
      "type": "strong|weak|critical"
    }
  ]
}
```

### CSV Format
The tool supports various CSV formats:
- **Edge List**: `source,target,weight`
- **Adjacency List**: `node,connected_nodes`
- **Node Attributes**: `id,label,type,metadata`

## 🛠️ Technology Stack

### Frontend Framework
- **React 18**: Modern React with hooks and concurrent features
- **TypeScript**: Type-safe development with excellent IDE support
- **Vite**: Lightning-fast build tool and development server

### Visualization Libraries
- **D3.js 7**: Powerful data-driven document manipulation
- **React Flow 12**: Interactive node-based editor and graph visualization
- **@xyflow/react**: Modern React Flow implementation

### UI Components
- **shadcn/ui**: Beautiful, accessible component library
- **Radix UI**: Unstyled, accessible UI primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Beautiful, customizable icons

### Additional Libraries
- **html2canvas**: Client-side screenshot functionality
- **jsPDF**: PDF generation and export
- **React Hook Form**: Performant forms with easy validation
- **Sonner**: Beautiful toast notifications

## 🎮 Usage Guide

### Loading Data

#### Method 1: JSON Upload
1. Click the "JSON Network File Upload" tab
2. Either drag & drop a JSON file or click to browse
3. Alternatively, paste JSON directly into the text area
4. Click "Parse JSON" to load the network

#### Method 2: Tabular Data
1. Click the "Tabular Network File Upload" tab
2. Upload a CSV file with your network data
3. Configure parsing options (delimiter, headers, etc.)
4. Map columns to node/edge properties

#### Method 3: Sample Data
- Click "Load Sample Data" for a basic network example
- Click "Load 3-Layer Network Sample" for a neural network visualization

### Visualization Controls

#### D3 Network Tab
- **Force Strength**: Adjust node repulsion (-100 to -1000)
- **Link Distance**: Control edge length (50-200px)
- **Node Size**: Scale node radius (5-50px)
- **Colors**: Customize node and edge colors
- **Labels**: Toggle and resize text labels

#### React Flow Tab
- **Layout**: Auto-arrange nodes in grid or circular patterns
- **Styling**: Adjust visual properties and themes
- **Interaction**: Enable/disable node dragging and selection
- **Export**: Generate high-quality SVG/PDF exports

### Export Options
- **SVG Export**: Vector format for scalable graphics
- **PDF Export**: Document format for reports and presentations
- **Data Export**: Download current network as JSON

## 🏗️ Development

### Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── D3NetworkCanvas.tsx    # D3.js visualization
│   ├── NetworkCanvas.tsx      # React Flow visualization
│   ├── FileUploader.tsx       # File upload handling
│   └── TabularDataParser.tsx  # CSV parsing
├── pages/              # Application pages
│   ├── Index.tsx       # Main application page
│   └── NotFound.tsx    # 404 error page
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
└── main.tsx           # Application entry point
```

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint

# Build variants
npm run build:dev    # Development build with source maps
```

### Environment Setup

1. **Node.js**: Version 18 or higher recommended
2. **Package Manager**: npm, yarn, or pnpm
3. **Browser**: Modern browser with ES2020+ support

### Development Workflow

1. **Start Development Server**
   ```bash
   npm run dev
   ```

2. **Make Changes**: Edit files in `src/` directory

3. **Test Changes**: Use sample data to verify functionality

4. **Build for Production**
   ```bash
   npm run build
   ```

## 🚀 Deployment

### Build Process
```bash
# Install dependencies
npm install

# Create production build
npm run build

# The built files will be in the 'dist' directory
```

### Deployment Options

#### Static Hosting (Recommended)
- **Vercel**: Connect your GitHub repo for automatic deployments
- **Netlify**: Drag & drop the `dist` folder or connect via Git
- **GitHub Pages**: Use GitHub Actions for automated deployment ([Setup Guide](GITHUB_PAGES_SETUP.md))
- **AWS S3**: Upload `dist` contents to S3 bucket with static hosting

#### Docker Deployment
```dockerfile
FROM nginx:alpine
COPY dist/ /usr/share/nginx/html/
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### Environment Variables
No environment variables required for basic functionality. All configuration is handled client-side.

### Performance Optimization

The build process includes:
- **Code Splitting**: Automatic chunking for optimal loading
- **Tree Shaking**: Removes unused code
- **Minification**: Compressed JavaScript and CSS
- **Asset Optimization**: Optimized images and fonts

**Note**: The build may show warnings about large chunks (>500KB). This is expected due to D3.js and visualization libraries. Consider implementing dynamic imports for further optimization if needed.

## 📊 Usage Analytics

The application includes a built-in counter that tracks:
- **Networks Visualized**: Total count of networks loaded
- **Persistent Storage**: Counter persists across browser sessions
- **Privacy-First**: All data stored locally, no external tracking

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork the Repository**
2. **Create a Feature Branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make Your Changes**
4. **Test Thoroughly**
5. **Submit a Pull Request**

### Contribution Guidelines
- Follow TypeScript best practices
- Maintain existing code style
- Add tests for new features
- Update documentation as needed
- Ensure accessibility compliance

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **D3.js Community**: For the incredible visualization library
- **React Flow Team**: For the excellent node-based editor
- **shadcn**: For the beautiful UI component library
- **Vercel**: For the amazing development and deployment platform

## 📞 Support

- **Issues**: Report bugs via GitHub Issues
- **Discussions**: Join community discussions
- **Documentation**: Check the wiki for detailed guides

---

**Made with ❤️ for the data visualization community**
