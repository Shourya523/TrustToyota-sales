# Dealer Intelligence Platform

A comprehensive analytics dashboard and AI assistant designed to track, simulate, and optimize vehicle delivery metrics, sales officer performance, and showroom operations.

## Key Features

### 1. Main Analytics Dashboard (Platform)
- **High-Level KPIs**: Real-time display of total vehicle deliveries, best-selling models, top-performing locations, and leading sales officers.
- **Interactive Global Filters**: Filter all dashboard charts and metrics dynamically by Month, Location, and Model.
- **Automated Morning Brief**: A smart summary of top insights, percentages of volumes, and key drivers.
- **Data Visualizations**:
  - **Monthly Trend**: Chart showing delivery volumes across months.
  - **Model & Color Distribution**: Interactive charts showing market share by vehicle models and color preferences.
  - **Rankings**: Bar charts for top locations, sales officers, and customer feedback remarks.
  - **Segment Breakdown**: Breakdown of vehicle sales categorized by segment tier (e.g., Entry/Budget, Mid-Range, and Luxury tiers).

### 2. Team Performance
- **Sales Officer Directory**: Searchable overview of all sales officers and advisors.
- **Core Performance Metrics**: Shows total deliveries, rank, and average monthly deliveries.
- **Comparison Indicators**: Highlights whether an officer's deliveries in the latest complete month (May) grew or declined relative to their historical monthly average.
- **Contextual Data**: Displays the top vehicle models sold and primary location of operations for each advisor.

### 3. Showroom Analytics
- **Location-Wise Performance**: Comprehensive directory of showroom and dealership branch outputs.
- **Core Branch Metrics**: Shows total branch deliveries, branch ranking, and average monthly deliveries.
- **Comparison Indicators**: Displays branch delivery growth/decline percentage in the latest complete month (May) vs. the branch's monthly average.
- **Top Assets**: Lists the best-selling models and top sales officer at each showroom branch.

### 4. Interactive Copilot (AI Chat)
- **Natural Language Querying**: Ask questions about sales, models, colors, officers, or branches in plain language (e.g., "Which branch sold the most cars?").
- **Dynamic Chart Generation**: The AI generates charts on-the-fly to answer data questions visually.
- **Custom Workspace Integration**: Pin any AI-generated chart directly to a custom dashboard page.

### 5. My Custom Widgets Workspace
- **Personalized Workspace**: View all pinned visualizations saved from chats with the Copilot.
- **Interactive Controls**: Delete and manage custom-pinned widgets dynamically.

---

## Tech Stack & Setup

- **Framework**: Next.js (App Router with Turbopack)
- **Styling**: Vanilla CSS with custom dark mode theme
- **Database**: PostgreSQL with Drizzle ORM
- **Visuals**: Recharts (charts & graphs), Lucide React (icons)

### Running Locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```
