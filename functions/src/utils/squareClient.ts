import * as functions from "firebase-functions";
import { Client, Environment } from "square";

export const squareClient = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN,
  environment: Environment.Sandbox,
});

const { checkoutApi, locationsApi, ordersApi } = squareClient;

export const getMainLocation = async () => {
  try {
    const { result } = await locationsApi.retrieveLocation("main");

    if (result.errors) {
      functions.logger.error(result.errors.toString());
      return null;
    }

    if (!result.location) {
      return null;
    }

    return result.location;
  } catch (err) {
    functions.logger.error(err);
    return null;
  }
};

export const getOrder = async (orderId: string) => {
  const { result } = await ordersApi.retrieveOrder(orderId);
  return result.order;
};

export const createPaymentLink = async (referenceId: string) => {
  try {
    const mainLocation = await getMainLocation();

    if (!mainLocation?.id) {
      return null;
    }

    const { result } = await checkoutApi.createPaymentLink({
      order: {
        locationId: mainLocation.id,
        referenceId,
      },
    });

    if (result.errors) {
      functions.logger.error(result.errors.toString());
      return null;
    }

    if (!result.paymentLink) {
      return null;
    }

    return result.paymentLink;
  } catch (err) {
    functions.logger.error(err);
    return null;
  }
};
