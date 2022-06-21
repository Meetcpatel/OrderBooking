/*
Welcome to the schema! The schema is the heart of Keystone.

Here we define our 'lists', which will then be used both for the GraphQL
API definition, our database tables, and our Admin UI layout.

Some quick definitions to help out:
A list: A definition of a collection of fields with a name. For the starter
  we have `User`, `Post`, and `Tag` lists.
A field: The individual bits of data on your list, each with its own type.
  you can see some of the lists in what we use below.

*/

// Like the `config` function we use in keystone.ts, we use functions
// for putting in our config so we get useful errors. With typescript,
// we get these even before code runs.
import { list } from '@keystone-6/core';

// We're using some common fields in the starter. Check out https://keystonejs.com/docs/apis/fields#fields-api
// for the full list of fields.
import { text, relationship, password, timestamp, select } from '@keystone-6/core/fields';
// The document field is a more complicated field, so it's in its own package
// Keystone aims to have all the base field types, but you can make your own
// custom ones.
import { document } from '@keystone-6/fields-document';

// We are using Typescript, and we want our types experience to be as strict as it can be.
// By providing the Keystone generated `Lists` type to our lists object, we refine
// our types to a stricter subset that is type-aware of other lists in our schema
// that Typescript cannot easily infer.
import { Lists } from '.keystone/types';

// We have a users list, a blogs list, and tags for blog posts, so they can be filtered.
// Each property on the exported object will become the name of a list (a.k.a. the `listKey`),
// with the value being the definition of the list, including the fields.
const validateEmail = (email: string) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};
export const lists: Lists = {
  // Here we define the user list.
  User: list({
    // Here are the fields that `User` will have. We want an email and password so they can log in
    // a name so we can refer to them, and a way to connect users to posts.
    fields: {
      name: text({ validation: { isRequired: true } }),
      email: text({
        validation: { isRequired: true },
        isIndexed: 'unique',
        isFilterable: true
      }),
      // The password field takes care of hiding details and hashing values
      password: password({ validation: { isRequired: true } }),
      // Relationships allow us to reference other lists. In this case,
      // we want a user to have many posts, and we are saying that the user
      // should be referencable by the 'author' field of posts.
      // Make sure you read the docs to understand how they work: https://keystonejs.com/docs/guides/relationships#understanding-relationships
    },
    // Here we can configure the Admin UI. We want to show a user's name and posts in the Admin UI
    ui: {
      listView: {
        initialColumns: ['name']
      }
    }
  }),
  // Our second list is the Posts list. We've got a few more fields here
  // so we have all the info we need for displaying posts.
  Blog: list({
    fields: {
      title: text(),
      content: document({
        formatting: true
      })
    }
  }),
  Booking: list({
    fields: {
      name: text(),
      email: text({
        hooks: {
          validateInput: async ({
            listKey,
            fieldKey,
            operation,
            inputData,
            item,
            resolvedData,
            context,
            addValidationError
          }) => {
            if (operation === 'create' || operation === 'update' ) {
              if (!validateEmail(inputData.email)) {
                addValidationError('Email is not valid! Please enter valid Email');
              }
            }
          }
        }
      }),
      phone: text(),
      timeFrom: timestamp(),
      timeTo: timestamp(),
      payments: relationship({ ref: 'Payment.bookings', many: true })
    },
    ui: {
      listView: {
        initialColumns: ['email', 'phone']
      }
    }
  }),
  Payment: list({
    fields: {
      PaymentIs: text(),
      Amount: text(),
      time: timestamp(),
      bookings: relationship({
        ref: 'Booking.payments',
        ui: {
          displayMode: 'cards',
          cardFields: ['email', 'phone', 'timeFrom', 'timeTo'],
          linkToItem: true,
          inlineConnect: true,
          inlineCreate: { fields: ['email', 'phone', 'timeFrom', 'timeTo'] }
        }
      })
    }
  })
};
