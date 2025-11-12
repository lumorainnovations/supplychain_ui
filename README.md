# SupplyChain Pro - Complete ERP & Supply Chain Management System

A comprehensive Enterprise Resource Planning (ERP) and Supply Chain Management system built with React, Node.js, Express, and MySQL.

## 🚀 Features

### Core Modules
- **📊 Dashboard** - Real-time analytics and KPIs
- **📈 Demand Forecasting** - AI-powered demand prediction
- **📦 Inventory Management** - Complete stock control with alerts
- **🚛 Distribution Planning** - Route optimization and logistics
- **🏭 Production Planning** - Manufacturing order management
- **📋 Order Management** - Production order lifecycle
- **⚡ Capacity Modeling** - Resource utilization optimization
- **📄 Bill of Materials** - Product structure management
- **🏢 Supplier Management** - Vendor relationship management
- **🔗 System Integration** - API and third-party integrations
- **👥 User Management** - Role-based access control

### Technical Features
- **🔐 JWT Authentication** - Secure user authentication
- **🎯 Role-Based Permissions** - Granular access control
- **📱 Responsive Design** - Mobile-first approach
- **⚡ Real-time Updates** - Live data synchronization
- **🔍 Advanced Search & Filtering** - Powerful data discovery
- **📊 Interactive Charts** - Rich data visualization
- **🗄️ MySQL Database** - Robust, scalable database
- **🛡️ Security** - Rate limiting, CORS, helmet protection

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern UI library
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Beautiful icons
- **Recharts** - Data visualization
- **Axios** - HTTP client

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MySQL** - Relational database
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Joi** - Data validation
- **Helmet** - Security middleware

## 📋 Prerequisites

- Node.js 18+ 
- MySQL 8.0+
- npm or yarn
- Git

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd erp-supply-chain-management
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Database Setup

#### Install MySQL
Make sure MySQL is installed and running on your system.

#### Create Database
```sql
CREATE DATABASE erp_supply_chain CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### Create MySQL User (Optional)
```sql
CREATE USER 'erp_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON erp_supply_chain.* TO 'erp_user'@'localhost';
FLUSH PRIVILEGES;
```

### 4. Environment Setup
```bash
# Update .env file with your MySQL configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=erp_supply_chain

VITE_API_BASE_URL=http://localhost:3001/api
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-change-in-production-2024
PORT=3001
```

### 5. Start the Backend Server
```bash
npm run server:dev
```

The server will automatically:
- Connect to MySQL
- Create the database if it doesn't exist
- Create all required tables
- Insert sample data

### 6. Start the Frontend (in another terminal)
```bash
npm run dev
```

### 7. Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001/api

## 🔑 Default Login Credentials

```
Email: sarah.johnson@company.com
Password: password123
Role: Admin
```

## 📁 Project Structure

```
├── src/                          # Frontend source code
│   ├── components/              # React components
│   │   ├── auth/               # Authentication components
│   │   ├── forms/              # Form components
│   │   ├── tables/             # Table components
│   │   └── ...                 # Feature components
│   ├── context/                # React context providers
│   ├── hooks/                  # Custom React hooks
│   ├── services/               # API services
│   ├── types/                  # TypeScript type definitions
│   └── data/                   # Mock data and constants
├── server/                      # Backend source code
│   ├── database/               # Database setup and migrations
│   ├── middleware/             # Express middleware
│   ├── routes/                 # API route handlers
│   └── index.js               # Server entry point
├── public/                     # Static assets
└── package.json               # Dependencies and scripts
```

## 🗄️ Database Schema

The system uses MySQL with the following main tables:

- **users** - User accounts and permissions
- **inventory** - Inventory items and stock levels
- **production_orders** - Manufacturing orders
- **bill_of_materials** - Product structures
- **bom_components** - BOM component details
- **suppliers** - Vendor information
- **distribution_routes** - Delivery routes
- **capacity_resources** - Production resources
- **demand_forecasts** - Demand predictions
- **audit_log** - System audit trail

### Key MySQL Features Used
- **JSON Data Type** - For storing permissions and destinations
- **ENUM Types** - For status and role fields
- **Foreign Key Constraints** - Data integrity
- **Auto-increment IDs** - For audit log
- **Timestamps** - Automatic created_at/updated_at

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/refresh` - Token refresh

### Core Resources
- `GET|POST|PUT|DELETE /api/users` - User management
- `GET|POST|PUT|DELETE /api/inventory` - Inventory management
- `GET|POST|PUT|DELETE /api/production` - Production orders
- `GET|POST|PUT|DELETE /api/bom` - Bill of Materials
- `GET|POST|PUT|DELETE /api/suppliers` - Supplier management
- `GET|POST|PUT|DELETE /api/distribution` - Distribution routes
- `GET|POST|PUT|DELETE /api/capacity` - Capacity resources
- `GET|POST|PUT|DELETE /api/demand` - Demand forecasts

### Dashboard & Analytics
- `GET /api/dashboard/summary` - Dashboard metrics
- `GET /api/dashboard/charts/:type` - Chart data

## 🔐 Security Features

- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - Bcrypt encryption
- **Rate Limiting** - API abuse prevention
- **CORS Protection** - Cross-origin security
- **Helmet Security** - HTTP header protection
- **Input Validation** - Joi schema validation
- **SQL Injection Prevention** - Parameterized queries
- **Connection Pooling** - Secure database connections

## 👥 User Roles & Permissions

### Admin
- Full system access
- User management
- System configuration
- All module permissions

### Manager
- Department oversight
- Reports and analytics
- Order approval
- Team management

### Operator
- Data entry and updates
- Order processing
- Inventory management
- Basic reporting

### Viewer
- Read-only access
- Dashboard viewing
- Report generation
- No modifications

## 📊 Key Features

### Dashboard Analytics
- Real-time KPIs and metrics
- Interactive charts and graphs
- Low stock alerts
- Production status overview
- Capacity utilization tracking

### Inventory Management
- Multi-location stock tracking
- Automated reorder points
- Supplier integration
- Cost tracking and valuation
- Category-based organization

### Production Planning
- Order scheduling and tracking
- Resource allocation
- Progress monitoring
- Quality control integration
- Capacity planning

### Supply Chain Optimization
- Demand forecasting with ML
- Route optimization
- Supplier performance tracking
- Distribution planning
- Cost optimization

## 🚀 Deployment

### Production Build
```bash
# Build frontend
npm run build

# Start production server
NODE_ENV=production npm run server
```

### Environment Variables for Production
```bash
NODE_ENV=production
DB_HOST=your-mysql-host
DB_PORT=3306
DB_USER=your-mysql-user
DB_PASSWORD=your-mysql-password
DB_NAME=erp_supply_chain
JWT_SECRET=your-secure-production-secret
PORT=3001
VITE_API_BASE_URL=https://your-domain.com/api
```

### MySQL Production Setup
```sql
-- Create production database
CREATE DATABASE erp_supply_chain_prod CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create production user
CREATE USER 'erp_prod'@'%' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON erp_supply_chain_prod.* TO 'erp_prod'@'%';
FLUSH PRIVILEGES;

-- Configure MySQL for production
SET GLOBAL max_connections = 200;
SET GLOBAL innodb_buffer_pool_size = 1073741824; -- 1GB
```

## 🔧 Troubleshooting

### Common MySQL Issues

#### Connection Refused
```bash
# Check if MySQL is running
sudo systemctl status mysql

# Start MySQL
sudo systemctl start mysql
```

#### Authentication Plugin Error
```sql
-- If you get authentication plugin error
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'your_password';
FLUSH PRIVILEGES;
```

#### Permission Denied
```sql
-- Grant necessary permissions
GRANT ALL PRIVILEGES ON erp_supply_chain.* TO 'your_user'@'localhost';
FLUSH PRIVILEGES;
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the API endpoints

## 🔄 Updates & Roadmap

### Current Version: 1.0.0
- ✅ Complete ERP system with all core modules
- ✅ Full authentication and authorization
- ✅ Real-time dashboard and analytics
- ✅ Comprehensive API with full CRUD operations
- ✅ Responsive design for all devices
- ✅ MySQL database with full ACID compliance

### Future Enhancements
- 🔄 Real-time notifications with WebSockets
- 📱 Mobile app development
- 🤖 Advanced AI/ML forecasting
- 📊 Advanced reporting and BI
- 🔗 Third-party integrations (SAP, Oracle, etc.)
- ☁️ Cloud deployment options
- 🔄 Database replication and clustering

---

**SupplyChain Pro** - Empowering businesses with intelligent supply chain management.