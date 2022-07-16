import * as functions from "firebase-functions";
import { confirmAppointment, deleteAppointment } from "./utils/eterminClient";
import { createPaymentLink, getOrder } from "./utils/squareClient";

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
export const helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info("Hello logs!", { structuredData: true }, request.body);

  response.send("Hello from Firebase!");
});

export const squareEvent = functions.https.onRequest(async (request, response) => {
  const { body } = request;

  if (body?.type === "payment.updated") {
    functions.logger.info(body);
    const payment = body?.["data"]?.["object"]?.["payment"];

    if (payment) {
      const { order_id: orderId, status } = payment;

      const order = await getOrder(orderId as string);
      const appointmentUid = order?.referenceId as string;

      switch (status) {
        case "COMPLETED":
          await confirmAppointment(appointmentUid);
          break;
        case "CANCELED":
          await deleteAppointment(appointmentUid);
          break;
        case "FAILED":
          await deleteAppointment(appointmentUid);
          break;
        default:
          functions.logger.info(order?.referenceId);
      }
    }
  }

  response.sendStatus(200);
});

export const getPaymentLink = functions.https.onRequest(async (request, response) => {
  const { appointmentUid } = request.query;

  const paymentLink = await createPaymentLink(appointmentUid as string);

  response.json({
    url: paymentLink?.url,
  });
});
