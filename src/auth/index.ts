import { getClient } from './sdk';

export type Status = 'SUCCESS';

export interface RegisterAttributes {
  [key: string]: string;
}

export interface RegisterResult {
  username: string;
}

export interface CodeDeliveryResult {
  CodeDeliveryDetails: {
    Destination: string;
    DeliveryMedium: string;
    AttributeName: string;
  };
}

export interface LoginSuccessResult {
  refreshToken: string;
  accessToken: string;
  accessTokenExpiresAt: string;
  idToken: string;
  idTokenExpiresAt: string;
}

export interface LoginNextStepResult {
  nextStep: 'MFA_AUTH' | 'NEW_PASSWORD_REQUIRED';
  loginSession: string;
}

export namespace Auth {
  export function register(
    username: string,
    password: string,
    attributes: RegisterAttributes = {}
  ): Promise<RegisterResult> {
    return getClient().signup({
      username,
      password,
      attributes: Object.keys(attributes).map(key => ({
        Name: key,
        Value: attributes[key]
      }))
    });
  }

  export function registerConfirmation(
    username: string,
    confirmationCode: string
  ): Promise<Status> {
    return getClient().signupConfirm({
      username,
      confirmationCode
    });
  }
  export function registerResendCode(
    username: string
  ): Promise<CodeDeliveryResult> {
    return getClient().signupResend({
      username
    });
  }

  export function login(
    username: string,
    password: string
  ): Promise<LoginSuccessResult | LoginNextStepResult> {
    return getClient().login({
      username,
      password
    });
  }

  export function loginMfa(
    username: string,
    mfaCode: string,
    loginSession: string
  ): Promise<LoginSuccessResult> {
    return getClient().loginSession({
      username,
      mfaCode,
      loginSession
    });
  }

  export function loginNewPasswordRequired(
    username: string,
    newPassword: string,
    loginSession: string
  ): Promise<LoginSuccessResult> {
    return getClient().loginSession({
      username,
      newPassword,
      loginSession
    });
  }

  export function logout(
    username: string,
    refreshToken: string
  ): Promise<Status> {
    return getClient().logout({
      username,
      refreshToken
    });
  }

  export function refreshSession(
    username: string,
    refreshToken: string
  ): Promise<LoginSuccessResult> {
    return getClient().logout({
      username,
      refreshToken
    });
  }

  export function passwordForgot(
    username: string
  ): Promise<CodeDeliveryResult> {
    return getClient().passwordForgot({ username });
  }

  export function passwordReset(
    username: string,
    passwordResetCode: string,
    newPassword: string
  ): Promise<Status> {
    return getClient().passwordReset({
      username,
      passwordResetCode,
      newPassword
    });
  }
}
