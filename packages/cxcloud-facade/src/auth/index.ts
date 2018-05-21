import { getClient } from './sdk';

export interface RegisterResult {
  username: string;
}

export interface RegisterCodeResentResult {
  CodeDeliveryDetails: {
    Destination: string;
    DeliveryMedium: string;
    AttributeName: string;
  };
}

export namespace Auth {
  export function register(
    username: string,
    password: string
  ): Promise<RegisterResult> {
    return getClient().signup({
      username,
      password
    });
  }

  export function registerConfirmation(
    username: string,
    confirmationCode: string
  ): Promise<string> {
    return getClient().signupConfirm({
      username,
      confirmationCode
    });
  }
  export function registerResendCode(
    username: string
  ): Promise<RegisterCodeResentResult> {
    return getClient().signupResend({
      username
    });
  }

  export function login(email: string, password: string) {
  }

  export function forgotPassword(email: string) {
  }

  export function forgotPasswordSubmit(
    email: string,
    code: string,
    newPassword: string
  ) {
  }
}
