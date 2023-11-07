const { graphqlHandler, graphqlError } = require('graphql-serverless')
const { makeExecutableSchema } = require('graphql-tools') 
const { app } = require('webfunc')

const itemMocks = [
  { id: 1, name: 'Knock Bits', quantity: 88, price: 12.67, supplier_id: 1 }, 
  { id: 2, name: 'Widgets', quantity: 10, price: 35.50, supplier_id: 3 },
  { id: 3, name: 'Knock Bits', quantity: 88, price: 12.67, supplier_id: 1 }]

const suppliers = [
	{ id: 1, name: 'PokemonCompany', address: '96 80th Ave NW' },
	{ id: 2, name: 'Microsoft', address: 'United States of America' }
]

const schema = `
  type Item {
    id: ID!
    name: String!
    quantity: Int
    price: Float
    supplier_id: Int
  }

  type Supplier {
	id: ID!
	name: String!
	address: String
  }
 
  type Query {
      itemsById(id: Int): Item
      allItems: [Item]
      itemsByName(name: String): [Item]
      itemsByPrice(price: Float): Item
      itemsBySupplier(supplierId: Int): Item
      supplierById(id: Int): Supplier
  }

  type Mutation {
	addItem(name: String, quantity: Int, price: Float, supplierId: Int): Item
  }
  `
 
const itemResolver = {
  Query: {
      itemsById(root, { id }, context) {
		const results = id ? itemMocks.filter(p => p.id == id) : itemMocks
		      if (results.length > 0)
			return results.pop();
		      else
			throw graphqlError(404, `Item with id ${id} does not exist.`)
      },

      allItems(root, {}, context) {
	      return itemMocks;
      },
      
      itemsByPrice(root, { price }, context) {
	      const results = price ? itemMocks.filter(p => p.price == price) : itemMocks
	      if (results.length > 0)
		      return results.pop();
	      else
		      throw graphqlError(404, `No item at the price ${price}.`);
      },
      
      itemsByName(root, { name }, context) {
	      const results = name ? itemMocks.filter(p => p.name == name) : itemMocks;
	      if (results.length > 0)
		      return results;
	      else
		      throw graphqlError(404, `No item with the name ${name}.`);
      },
      
      supplierById(root, { id }, context) {
		const results = id ? suppliers.filter(s => s.id == id) : suppliers;
	      	if (results.length > 0) {
			return results.pop();
		} else {
			throw graphqlError(404, `No supplier with the id ${id}`);
		}
      }
   },

   Mutation: {
	addItem(root, { name, quantity, price, supplierId }, context) {
		const item = {
			id: itemMocks.length + 1,
                        name: name,
                        quantity: quantity,
                        price: price,
                        supplier_id: supplierId
		};
		itemMocks.push(item);
		return item;
		
	}
   }
}

const executableSchema = makeExecutableSchema({
  typeDefs: schema,
  resolvers: itemResolver
})

const graphqlOptions = {
  schema: executableSchema,
  graphiql: { 
    endpoint: '/graphiql' 
  },
  context: {
  	someVar: 'This variable is passed in the "context" object in each resolver.'
  }
}

app.all(['/','/graphiql'], graphqlHandler(graphqlOptions))

eval(app.listen('app', 4000))
