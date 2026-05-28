const commonErrorResponses = {
  400: { description: 'Invalid request' },
  404: { description: 'Resource not found' },
};

const validationErrorSchema = {
  type: 'object',
  properties: {
    success: { type: 'boolean', example: false },
    message: { type: 'string', example: 'Validation failed' },
    data: { nullable: true, example: null },
    errors: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          field: { type: 'string', example: 'slug' },
          message: { type: 'string', example: 'slug is required' },
        },
      },
    },
  },
};

const apiMessageSchema = {
  type: 'object',
  properties: {
    success: { type: 'boolean', example: true },
    message: { type: 'string', example: 'OK' },
    data: { nullable: true },
    errors: { nullable: true },
  },
};

const productSchema = {
  type: 'object',
  required: ['slug', 'name', 'categoryId', 'brand', 'price'],
  properties: {
    id: { type: 'integer', example: 1, readOnly: true },
    slug: { type: 'string', example: 'iphone-15-pro-max' },
    sku: { type: 'string', nullable: true, example: 'IP15PM-256' },
    name: { type: 'string', example: 'iPhone 15 Pro Max 256GB' },
    categoryId: { type: 'integer', example: 1 },
    brand: { type: 'string', example: 'Apple' },
    price: { type: 'number', example: 29990000 },
    originalPrice: { type: 'number', nullable: true, example: 34990000 },
    discountPercent: { type: 'integer', example: 14 },
    rating: { type: 'number', example: 4.8 },
    reviewsCount: { type: 'integer', example: 128 },
    stock: { type: 'integer', example: 15 },
    description: { type: 'string', nullable: true, example: 'Premium flagship phone' },
    featured: { type: 'boolean', example: true },
    status: { type: 'string', enum: ['active', 'draft', 'out_of_stock', 'hidden'], example: 'active' },
  },
};

const productCreateUpdateSchema = productSchema;

const categorySchema = {
  type: 'object',
  required: ['slug', 'name'],
  properties: {
    id: { type: 'integer', example: 1, readOnly: true },
    slug: { type: 'string', example: 'smartphones' },
    name: { type: 'string', example: 'Điện thoại' },
    icon: { type: 'string', nullable: true, example: '📱' },
  },
};

const categoryCreateUpdateSchema = categorySchema;


const userSchema = {
  type: 'object',
  required: ['fullName', 'email'],
  properties: {
    id: { type: 'integer', example: 1, readOnly: true },
    fullName: { type: 'string', example: 'Tam' },
    email: { type: 'string', example: 'tam@gmail.com' },
    passwordHash: { type: 'string', nullable: true, example: '123456' },
    role: { type: 'string', enum: ['admin', 'user'], example: 'user' },
    status: { type: 'string', enum: ['active', 'blocked'], example: 'active' },
  },
};

const userCreateUpdateSchema = userSchema;

const itemListResponse = (schemaName: string) => ({
  type: 'object',
  properties: {
    success: { type: 'boolean', example: true },
    message: { type: 'string', example: 'Retrieved successfully' },
    data: {
      type: 'object',
      properties: {
        items: {
          type: 'array',
          items: { $ref: `#/components/schemas/${schemaName}` },
        },
      },
    },
    errors: { nullable: true },
  },
});

const itemResponse = (schemaName: string) => ({
  type: 'object',
  properties: {
    success: { type: 'boolean', example: true },
    message: { type: 'string', example: 'Retrieved successfully' },
    data: {
      type: 'object',
      properties: {
        item: { $ref: `#/components/schemas/${schemaName}` },
      },
    },
    errors: { nullable: true },
  },
});

const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Dienthoai API',
    version: '1.0.0',
    description: 'API documentation for the Dienthoai ExpressJS backend',
  },
  servers: [
    {
      url: `http://localhost:${process.env.PORT ?? 5000}`,
      description: 'Local development server',
    },
  ],
  components: {
    schemas: {
      Product: productSchema,
      ProductInput: productCreateUpdateSchema,
      Category: categorySchema,
      CategoryInput: categoryCreateUpdateSchema,

      User: userSchema,
      UserInput: userCreateUpdateSchema,
      ApiMessage: apiMessageSchema,
      ValidationError: validationErrorSchema,
    },
  },
  paths: {
    '/api/auth/login': {
      post: {
        summary: 'Login user',
        tags: ['Auth'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', example: 'admin@gmail.com' },
                  password: { type: 'string', example: '123456' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Login successful',
            content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, message: { type: 'string' }, data: { type: 'object', properties: { user: { $ref: '#/components/schemas/User' } } }, errors: { nullable: true } } } } },
          },
          400: { description: 'Email and password are required' },
          401: { description: 'Invalid credentials' },
        },
      },
    },
    '/api/products': {
      get: {
        summary: 'Get all products',
        tags: ['Products'],
        responses: { 200: { description: 'Products retrieved successfully', content: { 'application/json': { schema: itemListResponse('Product') } } } },
      },
      post: {
        summary: 'Create a product',
        tags: ['Products'],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ProductInput' } } } },
        responses: { 201: { description: 'Product created successfully', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiMessage' } } } }, 400: { description: 'Validation failed', content: { 'application/json': { schema: { $ref: '#/components/schemas/ValidationError' } } } }, 404: { description: 'Resource not found' } },
      },
    },
    '/api/products/{id}': {
      get: {
        summary: 'Get product by id',
        tags: ['Products'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Product found', content: { 'application/json': { schema: itemResponse('Product') } } }, 404: { description: 'Product not found' } },
      },
      put: {
        summary: 'Update a product',
        tags: ['Products'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ProductInput' } } } },
        responses: { 200: { description: 'Product updated successfully', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiMessage' } } } }, 404: { description: 'Product not found' }, 400: { description: 'Validation failed', content: { 'application/json': { schema: { $ref: '#/components/schemas/ValidationError' } } } } },
      },
      delete: {
        summary: 'Delete a product',
        tags: ['Products'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Product deleted successfully', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiMessage' } } } }, 404: { description: 'Product not found' } },
      },
    },
    '/api/categories': {
      get: { summary: 'Get all categories', tags: ['Categories'], responses: { 200: { description: 'Categories retrieved successfully', content: { 'application/json': { schema: itemListResponse('Category') } } } } },
      post: { summary: 'Create a category', tags: ['Categories'], requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CategoryInput' } } } }, responses: { 201: { description: 'Category created successfully', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiMessage' } } } }, 400: { description: 'Validation failed', content: { 'application/json': { schema: { $ref: '#/components/schemas/ValidationError' } } } } } },
    },
    '/api/categories/{id}': {
      get: { summary: 'Get category by id', tags: ['Categories'], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'Category found', content: { 'application/json': { schema: itemResponse('Category') } } }, 404: { description: 'Category not found' } } },
      put: { summary: 'Update a category', tags: ['Categories'], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CategoryInput' } } } }, responses: { 200: { description: 'Category updated successfully', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiMessage' } } } }, 404: { description: 'Category not found' }, 400: { description: 'Validation failed', content: { 'application/json': { schema: { $ref: '#/components/schemas/ValidationError' } } } } } },
      delete: { summary: 'Delete a category', tags: ['Categories'], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'Category deleted successfully', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiMessage' } } } }, 404: { description: 'Category not found' } } },
    },

    '/api/users': {
      get: { summary: 'Get all users', tags: ['Users'], responses: { 200: { description: 'Users retrieved successfully', content: { 'application/json': { schema: itemListResponse('User') } } } } },
      post: { summary: 'Create a user', tags: ['Users'], requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/UserInput' } } } }, responses: { 201: { description: 'User created successfully', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiMessage' } } } }, 400: { description: 'Validation failed', content: { 'application/json': { schema: { $ref: '#/components/schemas/ValidationError' } } } } } },
    },
    '/api/users/{id}': {
      get: { summary: 'Get user by id', tags: ['Users'], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'User found', content: { 'application/json': { schema: itemResponse('User') } } }, 404: { description: 'User not found' } } },
      put: { summary: 'Update a user', tags: ['Users'], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/UserInput' } } } }, responses: { 200: { description: 'User updated successfully', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiMessage' } } } }, 404: { description: 'User not found' }, 400: { description: 'Validation failed', content: { 'application/json': { schema: { $ref: '#/components/schemas/ValidationError' } } } } } },
      delete: { summary: 'Delete a user', tags: ['Users'], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'User deleted successfully', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiMessage' } } } }, 404: { description: 'User not found' } } },
    },
    '/api/customers': {
      get: { summary: 'Get all customers', tags: ['Customers'], responses: { 200: { description: 'Customers retrieved successfully' } } },
    },
    '/api/orders': {
      get: { summary: 'Get all orders', tags: ['Orders'], responses: { 200: { description: 'Orders retrieved successfully' } } },
    },
    '/api/dashboard/overview': {
      get: {
        summary: 'Get dashboard summary',
        tags: ['Dashboard'],
        responses: {
          200: {
            description: 'Dashboard stats retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Dashboard stats retrieved successfully' },
                    data: {
                      type: 'object',
                      properties: {
                        products: { type: 'integer' },
                        categories: { type: 'integer' },

                        customers: { type: 'integer' },
                        orders: { type: 'integer' },
                      },
                    },
                    errors: { nullable: true },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};

export { swaggerSpec };
