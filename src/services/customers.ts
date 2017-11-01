import { stringify } from 'querystring';
import * as Cache from 'node-cache';
import * as uuid from 'uuid/v4';
import omit = require('lodash/omit');
import {
  methods,
  sdkConfig,
  authenticatedFormRequest,
  clientExecute,
  services
} from '../sdk';
import {
  AnonymousSignInResult,
  Customer,
  CustomerSignInResult,
  OAuthToken,
  SignInResult
} from '../sdk/types/customers';
import { encryptTokenResponse, getTokenData } from '../tools/crypto';

const customerCache = new Cache({
  stdTTL: 60 * 15 // 15 mins
});

const userScopes = [
  'manage_my_orders',
  'manage_my_profile',
  'manage_my_shopping_lists',
  'view_products',
  'manage_my_profile',
  'manage_my_payments'
];

export namespace Customers {
  export function login(
    username: string,
    password: string
  ): Promise<SignInResult> {
    return clientExecute<CustomerSignInResult>({
      uri: services.login.build(),
      method: methods.POST,
      body: {
        email: username,
        password
      }
    }).then(loginResult => {
      const scopes = userScopes
        .map(scope => `${scope}:${sdkConfig.projectKey}`)
        .join(' ');
      return authenticatedFormRequest<OAuthToken>(
        {
          uri: `${sdkConfig.authHost}/oauth/${sdkConfig.projectKey}/customers/token`,
          method: methods.POST,
          body: stringify({
            grant_type: 'password',
            username,
            password,
            scope: scopes
          })
        },
        true
      ).then(token => ({
        token: encryptTokenResponse(token, loginResult.customer.id),
        customer: omit(loginResult.customer, ['password']) as Customer,
        cart: loginResult.cart || null
      }));
    });
  }

  export function findById(customerId: string): Promise<Customer> {
    const cached = customerCache.get<Customer>(customerId);
    if (cached) {
      return Promise.resolve(cached);
    }
    return clientExecute<Customer>({
      uri: services.customers.byId(customerId).build(),
      method: methods.GET
    }).then(customer => {
      customerCache.set(customer.id, customer);
      return customer;
    });
  }

  export async function findByAuthToken(token: string): Promise<Customer> {
    const { customerId } = getTokenData(token);
    if (!customerId) {
      throw new Error('Invalid token provided, customer not found.');
    }
    return findById(customerId);
  }

  export function loginAnonymously(): Promise<AnonymousSignInResult> {
    const anonymousId = uuid();
    return authenticatedFormRequest<OAuthToken>({
      uri: `${sdkConfig.authHost}/oauth/${sdkConfig.projectKey}/anonymous/token`,
      method: methods.POST,
      body: stringify({
        grant_type: 'client_credentials',
        anonymous_id: anonymousId
      })
    }).then(token => ({
      token: encryptTokenResponse(token, anonymousId, true),
      anonymousId
    }));
  }
}
