interface IPaymentState {
  packageId: string;
  amount: number;
  email: string;
  reference: string;
  accessCode: string;
  status: string;
  discountCode: string;
}

export type { IPaymentState };
