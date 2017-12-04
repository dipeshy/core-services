import { getTokenData } from '../../tools/crypto';
import { clientExecute, methods, services } from '../sdk';
import { Order, PaginatedOrderResult } from '@cxcloud/ct-types/orders';

export namespace Orders {
  export function fetchAll(token: string): Promise<PaginatedOrderResult> {
    const { authToken } = getTokenData(token);
    return clientExecute({
      uri: services.myOrders.perPage(20).build(),
      method: methods.GET,
      token: authToken
    });
  }

  export function findById(orderId: string, token: string): Promise<Order> {
    const { authToken } = getTokenData(token);
    return clientExecute({
      uri: services.myOrders.byId(orderId).build(),
      method: methods.GET,
      token: authToken
    });
  }

  export function create(
    cartId: string,
    cartVersion: number,
    orderNumber: string | null,
    token: string
  ): Promise<Order> {
    const { authToken, isAnonymous } = getTokenData(token);

    if (isAnonymous) {
      return Promise.reject(
        new Error('Refusing to create an order anonymously.')
      );
    }

    return clientExecute({
      uri: services.myOrders.build(),
      method: methods.POST,
      token: authToken,
      body: {
        id: cartId,
        version: cartVersion,
        orderNumber
      }
    });
  }
}