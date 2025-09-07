# AI-Powered Acquisition Advisor

A specialized AI agent that generates personalized acquisition strategies for entrepreneurs looking to buy businesses. The system follows a "Fit-First" principle, prioritizing optimal matches between entrepreneurs and potential business acquisitions.

## Features

### Phase 1: Discovery & Data Intake
- **Module A**: Operator Profile assessment with 5 core competencies
- **Module B**: Industry Profile analysis based on interests and passions  
- **Module C**: Lifestyle & Financial Profile to understand constraints and goals

### Phase 2: AI Synthesis & Strategy
- Persona synthesis to determine operator archetype
- Opportunity mapping based on leverage analysis
- Industry theme analysis using NLP
- Financial parameter calculations

### Phase 3: Report Generation
- Personalized Acquisition Thesis narrative
- Detailed Buybox criteria table
- Downloadable Markdown report

## Technology Stack

- **Backend**: Node.js with Express
- **Frontend**: Vanilla JavaScript with modern CSS
- **AI/NLP**: Natural language processing with `natural` and `compromise` libraries
- **UI/UX**: Modern responsive design with animations

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start the Application**
   ```bash
   npm start
   ```

3. **Open in Browser**
   Navigate to `http://localhost:3000`

## Development

For development with auto-reload:
```bash
npm run dev
```

## How It Works

### 1. Data Collection
The system collects comprehensive user data across three modules:

- **Operator Profile**: Self-assessment ratings (1-5) plus qualitative evidence for:
  - Sales & Marketing
  - Operations & Systems  
  - Finance & Analytics
  - Team & Culture
  - Product & Technology

- **Industry Profile**: 
  - Topics and trends of interest
  - Recent business reading
  - Problems they want to solve
  - Customer preferences

- **Financial Profile**:
  - Liquid capital available
  - Loan potential
  - Income requirements
  - Time commitment
  - Location preferences
  - Risk tolerance

### 2. AI Analysis Engine
The system processes the data through several analytical steps:

- **Persona Synthesis**: Identifies the dominant competency to assign an operator archetype
- **Leverage Mapping**: Maps archetypes to specific business opportunity types
- **Industry Analysis**: Uses NLP to extract recurring themes and industry verticals
- **Financial Modeling**: Calculates purchase price ranges and SDE requirements

### 3. Strategic Output
Generates two key deliverables:

- **Acquisition Thesis**: 2-3 paragraph narrative explaining the strategic fit
- **Personalized Buybox**: Detailed criteria table with 9 key parameters

## Operator Archetypes

The system recognizes five distinct operator archetypes:

1. **The Growth Catalyst** (Sales & Marketing) → Targets businesses with weak marketing but strong products
2. **The Efficiency Expert** (Operations & Systems) → Targets businesses with good revenue but inefficient operations  
3. **The Visionary Builder** (Product & Technology) → Targets businesses with loyal customers but outdated products
4. **The People Leader** (Team & Culture) → Targets businesses with high turnover or cultural issues
5. **The Financial Strategist** (Finance & Analytics) → Targets undervalued businesses or those needing restructuring

## API Endpoints

- `GET /` - Main application interface
- `POST /api/analyze` - Process user data and generate strategy

## File Structure

```
├── server.js              # Express server setup
├── src/
│   └── advisor.js         # Core AI analysis engine
├── public/
│   ├── index.html         # Main application interface
│   ├── styles.css         # Modern UI styling
│   └── script.js          # Frontend JavaScript logic
├── package.json           # Dependencies and scripts
└── README.md              # This file
```

## Validation Rules

- Evidence fields require minimum 200 characters
- All financial inputs must be positive numbers
- Time commitment must be between 10-80 hours/week
- Location regions required if not fully remote

## Future Enhancements

- Integration with business listing APIs
- Machine learning model for improved archetype detection
- Advanced financial modeling with industry-specific multiples
- User account system for saving multiple analyses
- Enhanced NLP with sentiment analysis

## Support

The application includes comprehensive error handling and user-friendly validation messages. All form fields include real-time validation and helpful guidance text.

---

*Built with ❤️ for acquisition entrepreneurs seeking their perfect business match.*
