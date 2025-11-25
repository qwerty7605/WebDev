# Complaint Management Portal

## 📋 Project Information

**Course:** AI34 IT-119 IT Elective IV – Web Systems and Technologies  
**Schedule:** 2:30-5:00PM MTh  
**Team Members:**
- Parado, John Vincent L.
- Pagatpat, Joshua L.
- Dela Peña, Julius Rey

## 🎯 Project Overview

The **Complaint Management Portal** is a web-based system designed to streamline the complaint submission and resolution process. This system replaces traditional manual methods (paper forms, messages, complaint boxes) with a digital platform that provides transparency, efficiency, and convenience for both users and administrators.

## 🚀 Key Features

### For Users
- **User Registration & Authentication**: Secure account creation and login system
- **Complaint Submission**: Easy-to-use web forms for filing complaints
- **Category Selection**: Choose from predefined categories (Maintenance, IT, HR, etc.)
- **Real-time Status Tracking**: Monitor complaint progress (Pending, In Progress, Resolved)
- **View Resolution Notes**: Access admin responses and resolution details
- **Complaint History**: Manage and review all submitted complaints

### For Administrators
- **Admin Dashboard**: Centralized view of all system complaints
- **Complaint Management**: Update status and track progress of each complaint
- **Resolution Documentation**: Add comments, notes, and resolution details
- **Category Management**: Organize complaints by type for efficient handling

## 🏗️ Technical Architecture


### Database Schema
The system uses the following main entities:
1. **USERS** - Stores user account information
2. **ADMINS** - Stores administrator accounts
3. **COMPLAINTS** - Main complaint records
4. **COMPLAINT_CATEGORIES** - Predefined complaint types
5. **COMPLAINT_UPDATES** - Tracks status changes and admin actions
6. **USER_SESSIONS** - Manages user login sessions
7. **ADMIN_SESSIONS** - Manages admin login sessions

*See `complaint_portal_erd.mermaid` for detailed database relationships*

## 📁 Project Structure

```
complaint-management-portal/
│
├── /frontend/                 # Frontend application
│   ├── /public/               # Public assets
│   │   ├── /css/             # Stylesheets
│   │   ├── /js/              # JavaScript files
│   │   └── /images/          # Images and icons
│   ├── /views/               # HTML templates/views
│   │   ├── user/             # User interface pages
│   │   └── admin/            # Admin interface pages
│   └── index.html            # Entry point
│
├── /backend/                  # Backend application
│   ├── /config/              # Configuration files
│   │   └── database.js       # Database configuration
│   ├── /controllers/         # Request handlers
│   │   ├── authController.js
│   │   ├── complaintController.js
│   │   └── adminController.js
│   ├── /models/              # Database models
│   │   ├── User.js
│   │   ├── Complaint.js
│   │   └── Admin.js
│   ├── /routes/              # API routes
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   └── adminRoutes.js
│   ├── /middleware/          # Middleware functions
│   │   └── auth.js
│   └── server.js             # Server entry point
│
├── /database/                 # Database files
│   ├── schema.sql            # Database schema
│   └── seed.sql              # Sample data
│
├── /docs/                     # Documentation
│   ├── API.md                # API documentation
│   └── USER_GUIDE.md         # User manual
│
├── .env.example              # Environment variables template
├── package.json              # Node.js dependencies
├── README.md                 # Project documentation
└── complaint_portal_erd.mermaid  # Database ERD diagram
```

## 🔄 System Workflow

### User Complaint Flow
1. User registers/logs into the system
2. User navigates to complaint submission form
3. User selects category and fills complaint details
4. System assigns unique complaint number
5. Complaint saved with "Pending" status
6. User can track status through their dashboard

### Admin Resolution Flow
1. Admin logs into admin dashboard
2. Views list of all complaints (filterable by status/category)
3. Selects a complaint to review
4. Updates status (Pending → In Progress → Resolved)
5. Adds resolution notes/comments
6. System logs all status changes with timestamps

## 🔐 Security Features

- Password hashing (bcrypt/argon2)
- Session management with timeout
- Input validation and sanitization
- JWT
- Role-based access control (User vs Admin)

## 📊 Status Definitions

- **Pending**: Newly submitted, awaiting admin review
- **In Progress**: Admin has acknowledged and is working on resolution
- **Resolved**: Complaint has been addressed and closed



6. **Access the Application**
   - User Portal: `http://localhost:4200`
   - Admin Portal: `http://localhost:4200/admin`

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User/Admin login
- `POST /api/auth/logout` - Logout

### User Endpoints
- `GET /api/complaints` - Get user's complaints
- `POST /api/complaints` - Submit new complaint
- `GET /api/complaints/:id` - Get specific complaint details
- `GET /api/categories` - Get complaint categories

### Admin Endpoints
- `GET /api/admin/complaints` - Get all complaints
- `PUT /api/admin/complaints/:id` - Update complaint status
- `POST /api/admin/complaints/:id/notes` - Add resolution notes
- `GET /api/admin/reports` - Generate reports

## 🚧 Project Limitations

- No automated complaint resolution (manual admin intervention required)
- No email/SMS notifications (status checks via web portal only)
- No AI-based complaint categorization
- No mobile application (web-based only)
- Requires stable internet connection
- Limited to modern web browsers
- No real-time chat support
- No file attachment preview (download only)

## 📈 Future Enhancements

### Planned Features
- Email notification system
- Mobile responsive design improvements
- Advanced search and filtering
- Complaint priority automation
- Dashboard analytics and charts
- Multi-language support
- Bulk complaint operations
- Export functionality (CSV/PDF)

### Potential Integrations
- Email service (SendGrid/Mailgun)
- SMS notifications (Twilio)
- Cloud storage for attachments (AWS S3)
- Real-time updates (WebSocket)

## 🧪 Testing

### Test Accounts
```
User Account:
Username: testuser
Password: Test@123

Admin Account:
Username: admin
Password: Admin@123
```

### Testing Checklist
- [ ] User registration with validation
- [ ] User/Admin login and logout
- [ ] Complaint submission with all fields
- [ ] File attachment upload
- [ ] Status tracking functionality
- [ ] Admin dashboard operations
- [ ] Resolution note addition
- [ ] Report generation
- [ ] Session timeout handling
- [ ] Error message display

## 📝 Development Guidelines

### Code Standards
- Use consistent indentation (2)
- Comment complex logic
- Follow naming conventions (camelCase for JS, snake_case for DB)
- Validate all user inputs
- Handle errors gracefully
- Log important actions

