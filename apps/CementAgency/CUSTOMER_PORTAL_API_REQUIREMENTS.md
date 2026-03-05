# Customer Portal API Requirements

## Database Tables Needed

### 1. Customer Orders Table
```sql
CREATE TABLE customer_orders (
    OrderID INT PRIMARY KEY AUTO_INCREMENT,
    CustomerID INT NOT NULL,
    OrderDate DATETIME NOT NULL,
    DeliveryDate DATE NOT NULL,
    DeliveryAddress TEXT NOT NULL,
    Notes TEXT,
    Status VARCHAR(20) DEFAULT 'Pending',
    TotalAmount DECIMAL(10,2) NOT NULL,
    TotalItems INT NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (CustomerID) REFERENCES account(CustomerID)
);
```

### 2. Customer Order Details Table
```sql
CREATE TABLE customer_order_details (
    DetailID INT PRIMARY KEY AUTO_INCREMENT,
    OrderID INT NOT NULL,
    ProductID INT NOT NULL,
    ProductName VARCHAR(255) NOT NULL,
    Quantity INT NOT NULL,
    Rate DECIMAL(10,2) NOT NULL,
    Total DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (OrderID) REFERENCES customer_orders(OrderID),
    FOREIGN KEY (ProductID) REFERENCES products(ProductID)
);
```

### 3. Update Account Table (Add PIN)
```sql
ALTER TABLE account ADD COLUMN PinCode VARCHAR(6);
```

## API Endpoints to Add

### 1. Customer Orders
**GET** `/customer-orders?filter=CustomerID={id}&orderby=OrderDate desc`
- Returns list of orders for a customer
- Should join with customer_order_details to include items

**POST** `/customer-orders`
- Creates a new customer order
- Request body:
```json
{
  "CustomerID": 123,
  "OrderDate": "2025-01-01T10:00:00Z",
  "DeliveryDate": "2025-01-02",
  "DeliveryAddress": "Customer address",
  "Notes": "Special instructions",
  "Status": "Pending",
  "Items": [
    {
      "ProductID": 1,
      "ProductName": "Cement",
      "Quantity": 10,
      "Rate": 500.00,
      "Total": 5000.00
    }
  ],
  "TotalAmount": 5000.00,
  "TotalItems": 10
}
```

### 2. Customer Order Details
**GET** `/customer-order-details?filter=OrderID={id}`
- Returns order line items for a specific order

### 3. Products
**GET** `/products?active=1`
- Returns list of active products with pricing
- Should include: ProductID, ProductName, SalePrice

### 4. Enhanced Account Authentication
**GET** `/account?bid=1&filter=PhoneNo1='{phone}' and PinCode={pin}`
- Existing endpoint - ensure it works with PIN validation

## WhatsApp Integration

### PIN Generation and Sending
Create a service method in your backend to:

1. Generate 4-6 digit random PIN
2. Save PIN to customer account
3. Send PIN via WhatsApp API

### Sample WhatsApp Message
```
Hello {CustomerName}!

Your login PIN for Cement Agency Customer Portal is: {PIN}

Use this PIN with your registered mobile number to access:
- Account statements
- Place new orders  
- View order history

PIN expires in 24 hours.

Visit: {YourAppURL}

Thank you!
```

### Implementation Steps:

#### Step 1: Add PIN Generation Endpoint
```php
// In your APIs/controllers/Auth.php
public function generatePin() {
    $phone = $this->input->post('phone');
    $pin = str_pad(rand(1000, 9999), 4, '0', STR_PAD_LEFT);
    
    // Update customer record with PIN
    $this->db->where('PhoneNo1', $phone);
    $this->db->update('account', [
        'PinCode' => $pin,
        'PinExpiry' => date('Y-m-d H:i:s', strtotime('+24 hours'))
    ]);
    
    // Send WhatsApp message
    $this->sendWhatsAppPIN($phone, $pin);
    
    return $this->response(['success' => true]);
}
```

#### Step 2: WhatsApp Service
```php
// In your APIs/libraries/ or helpers/
private function sendWhatsAppPIN($phone, $pin) {
    $message = "Your Cement Agency login PIN is: $pin. Valid for 24 hours.";
    
    // Use your preferred WhatsApp API service
    // Examples: Twilio, WhatsApp Business API, etc.
    
    $curl = curl_init();
    curl_setopt_array($curl, array(
        CURLOPT_URL => 'YOUR_WHATSAPP_API_ENDPOINT',
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode([
            'phone' => $phone,
            'message' => $message
        ]),
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/json',
            'Authorization: Bearer YOUR_API_KEY'
        ],
    ));
    
    $response = curl_exec($curl);
    curl_close($curl);
    
    return $response;
}
```

## Security Considerations

1. **PIN Expiry**: Implement PIN expiration (24 hours)
2. **Rate Limiting**: Limit PIN generation requests per phone number
3. **Session Management**: Use secure session storage
4. **Input Validation**: Validate all form inputs
5. **SQL Injection Protection**: Use parameterized queries
6. **Authentication**: Verify customer identity before showing data

## Testing Checklist

- [ ] Customer can login with mobile + PIN
- [ ] Account statements load correctly
- [ ] Customer can place orders
- [ ] Order history shows properly
- [ ] PIN expiration works
- [ ] WhatsApp messages are sent
- [ ] Session management works
- [ ] Logout functionality works
- [ ] Mobile responsive design
- [ ] Error handling for API failures

## Deployment Notes

1. Update database schema
2. Deploy new API endpoints
3. Configure WhatsApp API credentials
4. Test PIN generation and sending
5. Set up proper error logging
6. Configure session storage settings
