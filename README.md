# QuickInvoice

QuickInvoice is an AI-powered invoice processing web application designed to simplify and automate invoice management for QuickBooks users. This MVP demonstrates the concept to potential customers by leveraging AI for data extraction and providing a clean, professional user interface.

## Demo
- [Live Demo URL](https://studio--invoicepilot-sj5hm.us-central1.hosted.app/)

## Features

### Must-Have Features
- **Invoice Uploads**: Supports PDF and image file uploads.
- **AI-Powered Data Extraction**: Extracts key invoice details, including:
  - Invoice number
  - Vendor name
  - Date
  - Line items (descriptions and amounts)
  - Total amount
  - Tax information (if present)
- **Editable Interface**: Displays extracted data in a user-friendly, editable format.
- **QuickBooks-Ready Export**: Exports data in JSON format compatible with QuickBooks.
- **Dashboard**: Provides a simple dashboard to show processing status and history.
- **Error Handling**: Basic error handling and validation for uploads and processing.

### Nice-to-Have Features (Partially Implemented)
- **Mobile Responsive Design**: Optimized for mobile devices.

## Technical Overview

### Frontend
- Built with **Next.js** and **TypeScript**.
- Styled using **Tailwind CSS** for a clean and professional UI.

### AI Integration
- AI models are used to extract invoice data. The implementation is modular and can be extended for additional use cases.

### File Handling
- Supports PDF and image uploads.

### Deployment
- The application is ready for deployment and can be hosted on platforms like Vercel or Firebase Hosting.

## Setup Instructions

1. **Clone the Repository**:
   ```bash
   git clone <repository-url>
   cd QuickInvoice
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Run the Development Server**:
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:3000`.

4. **Build for Production**:
   ```bash
   npm run build
   ```

5. **Start the Production Server**:
   ```bash
   npm start
   ```

## Future Improvements
- Batch processing for multiple files.
- Confidence scores for AI extractions.
- Export to CSV option.
- Simple authentication for user accounts.
- Enhanced error handling and edge case management.

## Deliverables
- **Working Application**: Fully functional web application.
- **Live Demo**: Deployed version of the application.
- **Source Code**: Available in this repository.
- **Video Demo**: Walkthrough of the application and its features.

## License
This project is licensed under the MIT License.
