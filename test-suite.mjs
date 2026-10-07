// Test suite to verify all 10 Success Criteria from the prompt

async function runTests() {
  const baseUrl = 'http://localhost:3000';
  console.log('--- STARTING DIGITALHUB VERIFICATION TESTS ---');

  // Test 1: Fetch Homepage
  console.log('\n[TEST 1] Checking Landing Page...');
  const homeRes = await fetch(`${baseUrl}/`);
  if (!homeRes.ok) throw new Error(`Landing page failed: ${homeRes.status}`);
  console.log('✓ Landing page responded with HTTP 200 OK');

  // Test 2: User Register & Login
  console.log('\n[TEST 2] Testing User Auth (Register & Login)...');
  const regRes = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Rendy Buyer Test',
      email: `rendy.buyer.${Date.now()}@example.com`,
      role: 'buyer'
    })
  });
  const regData = await regRes.json();
  if (!regData.success) throw new Error(`Register failed: ${JSON.stringify(regData)}`);
  const buyerId = regData.user.id;
  const buyerCookie = regRes.headers.get('set-cookie')?.split(';')[0];
  console.log(`✓ Buyer registered successfully: ID ${buyerId}`);

  // Test 3: Seller Product Creation
  console.log('\n[TEST 3] Testing Seller Product Creation...');
  // Login as seller first
  const sellerLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'seller@digitalhub.id' })
  });
  const sellerData = await sellerLoginRes.json();
  const sellerCookie = sellerLoginRes.headers.get('set-cookie')?.split(';')[0];
  console.log(`✓ Seller logged in: ID ${sellerData.user.id}`);

  const createProdRes = await fetch(`${baseUrl}/api/products`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Cookie': sellerCookie || ''
    },
    body: JSON.stringify({
      name: 'Super React 19 Starter Kit Pro',
      description: 'Template Next.js dan Tailwind paling mutakhir dengan clean architecture dan server actions.',
      category: 'source-code',
      price: 250000,
      thumbnail_url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
      file_name: 'super-react-19-starter.zip',
      file_size: '22.4 MB',
      tags: ['react19', 'starter', 'nextjs']
    })
  });
  const newProdData = await createProdRes.json();
  if (!newProdData.success) throw new Error(`Product creation failed: ${JSON.stringify(newProdData)}`);
  const newProductId = newProdData.product.id;
  console.log(`✓ Product created successfully: ID ${newProductId} (${newProdData.product.name})`);

  // Test 4: Product Appears in Marketplace & Catalog Filtering
  console.log('\n[TEST 4] Checking Marketplace Catalog & Search Filter...');
  const searchRes = await fetch(`${baseUrl}/api/products?q=Super+React`);
  const searchData = await searchRes.json();
  const found = searchData.products.some(p => p.id === newProductId);
  if (!found) throw new Error('Created product not found in search results');
  console.log(`✓ Product appears in search results correctly! Found: ${searchData.products.length} products`);

  // Test 5: Buyer Views Product Detail
  console.log('\n[TEST 5] Checking Product Detail endpoint...');
  const detailRes = await fetch(`${baseUrl}/api/products/${newProductId}`);
  const detailData = await detailRes.json();
  if (!detailData.product || detailData.product.name !== 'Super React 19 Starter Kit Pro') {
    throw new Error('Product detail data mismatch');
  }
  console.log(`✓ Product detail verified: ${detailData.product.name} (Price: Rp ${detailData.product.price})`);

  // Test 6 & 7: Buyer Checkout & Order Creation
  console.log('\n[TEST 6 & 7] Testing Checkout & Order Creation (Mock Payment)...');
  const orderRes = await fetch(`${baseUrl}/api/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': buyerCookie || ''
    },
    body: JSON.stringify({
      items: [{ product_id: newProductId }],
      payment_method: 'Instant Sandbox Simulator',
      buyer_name: 'Rendy Buyer Test',
      buyer_email: regData.user.email
    })
  });
  const orderData = await orderRes.json();
  if (!orderData.success || !orderData.order) {
    throw new Error(`Order creation failed: ${JSON.stringify(orderData)}`);
  }
  const orderId = orderData.order.id;
  console.log(`✓ Order created successfully: ID ${orderId}, Total: Rp ${orderData.order.total_amount}`);

  // Test 8: Buyer Views Purchased Products (/purchases API)
  console.log('\n[TEST 8] Checking Buyer Purchases List...');
  const myOrdersRes = await fetch(`${baseUrl}/api/orders?buyerId=${buyerId}`);
  const myOrdersData = await myOrdersRes.json();
  const hasPurchasedItem = myOrdersData.orders.some(o => 
    o.items.some(item => item.product_id === newProductId)
  );
  if (!hasPurchasedItem) throw new Error('Purchased product not found in buyer orders');
  console.log(`✓ Verified buyer can see purchased product in order history!`);

  // Test 9: Protected Digital Download Delivery
  console.log('\n[TEST 9] Testing Protected Download Delivery for Authorized Buyer...');
  const downloadRes = await fetch(`${baseUrl}/api/download/${newProductId}`, {
    headers: { 'Cookie': buyerCookie || '' }
  });
  if (!downloadRes.ok) throw new Error(`Download failed with status ${downloadRes.status}`);
  const downloadText = await downloadRes.text();
  if (!downloadText.includes('DIGITAL PRODUCT DELIVERY & LICENSE VERIFICATION')) {
    throw new Error('Download content missing license delivery header');
  }
  console.log(`✓ Verified: Download succeeded! File received with length ${downloadText.length} bytes`);
  console.log(`✓ Content-Disposition Header: ${downloadRes.headers.get('content-disposition')}`);

  // Test 10: Security Check - Unauthorized User Cannot Download
  console.log('\n[TEST 10] Testing Security Enforcement (Unauthorized Download Blocking)...');
  const unauthDownloadRes = await fetch(`${baseUrl}/api/download/${newProductId}`);
  if (unauthDownloadRes.status !== 401 && unauthDownloadRes.status !== 403) {
    throw new Error(`Expected 401 or 403 for unauthorized download, got ${unauthDownloadRes.status}`);
  }
  console.log(`✓ Security verified: Unauthorized request received HTTP ${unauthDownloadRes.status} (Access Denied)`);

  // Test 11: Seller Views Their Own Products & Analytics
  console.log('\n[TEST 11] Checking Seller Studio Products list...');
  const sellerProductsRes = await fetch(`${baseUrl}/api/products?sellerId=${sellerData.user.id}`);
  const sellerProductsData = await sellerProductsRes.json();
  const sellerOwnsNewProd = sellerProductsData.products.some(p => p.id === newProductId);
  if (!sellerOwnsNewProd) throw new Error('Seller cannot see their newly created product');
  console.log(`✓ Seller successfully views their product catalog (Total: ${sellerProductsData.products.length} products)`);

  console.log('\n======================================================');
  console.log('🎉 ALL 11 SUCCESS CRITERIA AND SECURITY CHECKS PASSED!');
  console.log('======================================================');
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
