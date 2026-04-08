# Legacy Account Features Analysis & Implementation Plan

Based on analysis of `legacy/Account.js` and `legacy/Orders.js`, here's what can be implemented in the current My Account page.

---

## 📊 **Current Implementation Status**

### ✅ **Already Implemented:**
1. **Saved Designs List** - Displays user's saved designs
2. **Design Cards** - Shows design preview image, title, date
3. **Edit Button** - Loads design into designer
4. **Delete Button** - Removes design from database
5. **More Button** - Opens modal with design details
6. **Save Design** - Saves current design to database
7. **Database Integration** - PostgreSQL with Drizzle ORM

---

## 🎯 **Features to Implement (Priority Order)**

### **1. ACCOUNT DETAILS PANEL (HIGH PRIORITY)**

**From Legacy:**
- Edit first name, last name, email
- Change mobile number
- Change password (with old password verification)
- Input validation
- Update session/storage

**Implementation:**
```typescript
// New panel in AccountNav sidebar
{
  label: 'Account Details',
  href: '/account/details',
  icon: UserCircleIcon,
  description: 'Manage contact & billing info',
}
```

**Database Schema (Already Exists):**
- `profiles` table has: first_name, last_name, phone
- `accounts` table has: email, password_hash

**UI Components Needed:**
- Account details form modal/page
- Password change section with validation
- Phone number validation
- Success/error messages

---

### **2. INVOICE DETAILS PANEL (HIGH PRIORITY)**

**From Legacy:**
- Trading name, business name, ABN/Tax ID
- Phone, website
- Address (street, city, state, postcode, country)
- Input validation
- Separate from account details

**Implementation:**
```typescript
// Extend profiles schema or create new table
invoice_details {
  account_id: uuid
  trading_name: text
  business_name: text
  tax_id: text (ABN/VAT/etc)
  phone: text
  website: text
  address: text
  city: text
  state: text
  postcode: text
  country: text
}
```

---

### **3. YOUR ORDERS PANEL (HIGH PRIORITY)**

**From Legacy:**
- List of placed orders
- Order ID, date, status
- Payment method, price
- Shipping details
- Order comments/notes
- View invoice
- Track order

**Database Schema (Already Exists):**
- `orders` table
- `order_items` table
- `payments` table

**Implementation:**
- New "Your Orders" tab in My Account
- Order list component
- Order details modal
- Payment status display
- Shipping information

---

### **4. SHARE DESIGN (MEDIUM PRIORITY)**

**From Legacy:**
- Share via Email
- Share via URL (shareable link)
- Share to Facebook
- Share to Twitter/X
- Share to LinkedIn

**Implementation:**
Currently has placeholder buttons. Need to add:

```typescript
// Generate shareable URL
const shareUrl = `${baseUrl}/shared/${designId}`;

// Social media share functions
const shareToFacebook = (url, title) => {
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`);
};

const shareToTwitter = (url, title, text) => {
  window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`);
};

const shareToLinkedIn = (url) => {
  window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`);
};

// Email share
const shareViaEmail = (designId, recipientEmail) => {
  // Send email with design link
  fetch('/api/share/email', {
    method: 'POST',
    body: JSON.stringify({ designId, recipientEmail })
  });
};
```

**New Route Needed:**
- `/shared/[designId]` - Public view of shared design
- API: `/api/share/email` - Send email with design

---

### **5. PDF EXPORT (MEDIUM PRIORITY)**

**From Legacy:**
- Download design as PDF
- Include pricing breakdown
- Include design specifications
- Include screenshot

**Implementation:**
Use a library like `jsPDF` or server-side PDF generation:

```typescript
import jsPDF from 'jspdf';

const exportToPDF = async (design) => {
  const pdf = new jsPDF();
  
  // Add design screenshot
  const img = design.screenshot;
  pdf.addImage(img, 'JPEG', 10, 10, 190, 100);
  
  // Add design details
  pdf.text(`Design: ${design.title}`, 10, 120);
  pdf.text(`Date: ${design.createdAt}`, 10, 130);
  
  // Add pricing
  pdf.text('Pricing Breakdown:', 10, 145);
  // ... add pricing details
  
  pdf.save(`${design.title}.pdf`);
};
```

---

### **6. BUY/ORDER DESIGN (MEDIUM PRIORITY)**

**From Legacy:**
- "Buy" button on each design
- Delivery details form
- Payment method selection (PayPal, Stripe, Bank Transfer)
- Order confirmation
- Email notifications

**Implementation:**

**a) Delivery Details Form:**
```typescript
{
  firstName: string
  lastName: string
  mobile: string
  address: string
  city: string
  postcode: string
  state: string
  country: string
  deliveryMethod: 'standard' | 'express'
  comments: text
}
```

**b) Payment Integration:**
- Stripe Checkout (already have API structure)
- PayPal Buttons
- Manual payment (bank transfer)

**c) Order Flow:**
1. Click "Buy" on design
2. Review design & price
3. Enter/confirm delivery details
4. Select payment method
5. Complete payment
6. Create order record
7. Send confirmation email
8. Update order status

---

### **7. QUICK ENQUIRY (LOW PRIORITY)**

**From Legacy:**
- Send enquiry about a design
- Include customer email, phone
- Send to sales team
- Attach design screenshot

**Implementation:**
```typescript
const sendEnquiry = async (designId, customerInfo, message) => {
  await fetch('/api/enquiries', {
    method: 'POST',
    body: JSON.stringify({
      designId,
      email: customerInfo.email,
      phone: customerInfo.phone,
      message
    })
  });
};
```

---

### **8. EMAIL DESIGN TO FRIEND (LOW PRIORITY)**

**From Legacy:**
- Email design to multiple recipients
- Include message
- Attach design screenshot
- Include link to view design

**Implementation:**
Currently has placeholder. Add server-side email:

```typescript
// API route: /api/share/send-to-friend
export async function POST(request) {
  const { designId, recipients, message } = await request.json();
  
  // Get design details
  const design = await getProjectRecord(designId);
  
  // Send email to each recipient
  for (const email of recipients) {
    await sendEmail({
      to: email,
      subject: `Check out this memorial design`,
      html: `
        <p>${message}</p>
        <img src="${design.screenshot}" />
        <a href="${shareUrl}">View Design</a>
      `
    });
  }
}
```

---

## 🗂️ **Database Schema Updates Needed**

### **1. Profiles Table Enhancement:**
```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS trading_name text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS business_name text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tax_id text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS website text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS address text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS city text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS state text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS postcode text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS country text DEFAULT 'Australia';
```

### **2. Shared Designs Table (New):**
```sql
CREATE TABLE IF NOT EXISTS shared_designs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  share_token text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  view_count integer DEFAULT 0
);
```

### **3. Enquiries Table (New):**
```sql
CREATE TABLE IF NOT EXISTS enquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
  account_id uuid REFERENCES accounts(id) ON DELETE SET NULL,
  email text NOT NULL,
  phone text,
  message text NOT NULL,
  status text DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'closed')),
  created_at timestamptz NOT NULL DEFAULT now()
);
```

---

## 📋 **Implementation Roadmap**

### **Phase 1: Account Management (Week 1)**
- [x] Saved Designs List (DONE)
- [x] Delete Design (DONE)
- [ ] Account Details Panel
  - [ ] Edit profile (name, email, phone)
  - [ ] Change password
  - [ ] Validation
- [ ] Invoice Details Panel
  - [ ] Business information form
  - [ ] Address details
  - [ ] Validation

### **Phase 2: Orders & Payment (Week 2)**
- [ ] Your Orders Tab
  - [ ] Orders list view
  - [ ] Order details modal
  - [ ] Order status display
- [ ] Buy/Order Flow
  - [ ] Delivery details form
  - [ ] Payment integration (Stripe)
  - [ ] Order confirmation
  - [ ] Email notifications

### **Phase 3: Sharing & Export (Week 3)**
- [ ] Share Design
  - [ ] Generate shareable URL
  - [ ] Social media sharing
  - [ ] Email to friend
  - [ ] Public view page
- [ ] PDF Export
  - [ ] Design screenshot
  - [ ] Pricing details
  - [ ] Specifications
- [ ] Quick Enquiry
  - [ ] Enquiry form
  - [ ] Email to sales

### **Phase 4: Polish & Testing (Week 4)**
- [ ] UI/UX improvements
- [ ] Mobile responsiveness
- [ ] Error handling
- [ ] Loading states
- [ ] Success messages
- [ ] Integration testing

---

## 🎨 **UI Components to Create**

1. **AccountDetailsPanel.tsx** - Edit profile information
2. **InvoiceDetailsPanel.tsx** - Business & billing info
3. **OrdersList.tsx** - Display orders
4. **OrderDetailsModal.tsx** - Show order details
5. **DeliveryDetailsForm.tsx** - Shipping information
6. **PaymentMethodSelector.tsx** - Choose payment
7. **ShareModal.tsx** - Share design options
8. **EnquiryForm.tsx** - Quick enquiry
9. **PDFExportButton.tsx** - Export to PDF

---

## 🔐 **Security Considerations**

1. **Password Changes:**
   - Require old password
   - Hash new password with bcrypt
   - Validate password strength

2. **Shared Links:**
   - Generate unique tokens
   - Optional expiration
   - Track view counts

3. **Payment Processing:**
   - Never store card details
   - Use Stripe/PayPal APIs
   - Verify payment on server

4. **Email Sharing:**
   - Rate limiting
   - Validate email addresses
   - Prevent spam

---

## 🚀 **Quick Wins (Immediate Implementation)**

### **1. Account Details (2-3 hours)**
Simple form with existing database fields.

### **2. Share to Social Media (1 hour)**
Just need to add URL generation and window.open() calls.

### **3. Email to Friend (2 hours)**
Use existing email infrastructure.

### **4. Basic PDF Export (3 hours)**
Use jsPDF with canvas screenshot.

---

## 💡 **Recommendations**

**Start with Phase 1 (Account Management):**
1. Account Details panel is essential
2. Users expect to manage their profile
3. Relatively simple to implement
4. Uses existing database schema

**Then Phase 3 (Sharing):**
1. Social sharing is high-value, low-effort
2. Increases design visibility
3. Good for marketing

**Save Phase 2 (Orders) for last:**
1. More complex (payment integration)
2. Requires thorough testing
3. Legal/compliance considerations

---

## 📊 **Comparison: Legacy vs Current**

| Feature | Legacy | Current | Priority |
|---------|--------|---------|----------|
| Saved Designs List | ✅ | ✅ | - |
| Edit Design | ✅ | ✅ | - |
| Delete Design | ✅ | ✅ | - |
| Design Screenshot | ✅ | ✅ | - |
| Account Details | ✅ | ❌ | **HIGH** |
| Invoice Details | ✅ | ❌ | **HIGH** |
| Your Orders | ✅ | ❌ | **HIGH** |
| Share to Social | ✅ | 🟡 | **MEDIUM** |
| Share via Email | ✅ | 🟡 | **MEDIUM** |
| PDF Export | ✅ | ❌ | **MEDIUM** |
| Buy/Order | ✅ | ❌ | **MEDIUM** |
| Quick Enquiry | ✅ | ❌ | LOW |
| Payment (PayPal) | ✅ | ❌ | MEDIUM |
| Payment (Stripe) | ✅ | ❌ | MEDIUM |

**Legend:**
- ✅ Implemented
- 🟡 Partially implemented (placeholders exist)
- ❌ Not implemented

---

## 🎯 **Next Steps**

**Would you like me to implement:**
1. **Account Details panel** (edit profile, change password)
2. **Invoice Details panel** (business info, address)
3. **Social sharing functionality** (Facebook, Twitter, LinkedIn)
4. **PDF export** (download design as PDF)
5. **Email to friend** (share via email)

**Or all of the above in sequence?**

Let me know which one(s) you'd like to tackle first! 🚀
