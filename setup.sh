#!/bin/bash

# Remotion Captioning Platform - Linux/Mac Setup Script

echo "========================================"
echo "Remotion Captioning Platform Setup"
echo "========================================"
echo ""

# Check Node.js installation
echo "Checking Node.js installation..."
if command -v node &> /dev/null
then
    NODE_VERSION=$(node --version)
    echo "✓ Node.js installed: $NODE_VERSION"
    
    # Extract major version
    MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
    if [ "$MAJOR_VERSION" -lt 18 ]; then
        echo "✗ Node.js version must be 18 or higher"
        echo "Please download from: https://nodejs.org"
        exit 1
    fi
else
    echo "✗ Node.js not found"
    echo "Please install Node.js 18 or higher from: https://nodejs.org"
    exit 1
fi

echo ""

# Check npm installation
echo "Checking npm installation..."
if command -v npm &> /dev/null
then
    NPM_VERSION=$(npm --version)
    echo "✓ npm installed: v$NPM_VERSION"
else
    echo "✗ npm not found"
    exit 1
fi

echo ""
echo "========================================"
echo "Installing Dependencies..."
echo "========================================"
echo ""

# Install dependencies
npm install

if [ $? -ne 0 ]; then
    echo "✗ Failed to install dependencies"
    exit 1
fi

echo ""
echo "✓ Dependencies installed successfully"
echo ""

# Setup environment file
echo "========================================"
echo "Environment Setup"
echo "========================================"
echo ""

if [ ! -f ".env.local" ]; then
    cp .env.example .env.local
    echo "✓ Created .env.local file"
    echo ""
    echo "⚠️  IMPORTANT: Edit .env.local and add your OPENAI_API_KEY"
    echo ""
else
    echo "✓ .env.local already exists"
fi

echo ""
echo "========================================"
echo "Setup Complete!"
echo "========================================"
echo ""
echo "Next steps:"
echo "1. Add your OPENAI_API_KEY to .env.local"
echo "2. Run: npm run dev"
echo "3. Open: http://localhost:3000"
echo ""
echo "Documentation:"
echo "- Quick Start: QUICKSTART.md"
echo "- Full Docs: README.md"
echo "- API Docs: API.md"
echo ""
echo "Happy coding! 🎬"
echo ""
